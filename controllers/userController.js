import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import {Course} from '../models/Course.js'
import crypto from "crypto";
import getDateUri from '../utils/dataUri.js'
import cloudinary from 'cloudinary'
import { Stats } from "../models/Stats.js";




export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const file = req.file;

  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please enter fields", 400));
  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User Already Exist", 409));

  const fileuri = getDateUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileuri.content);


  //upload file on cloudinary
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  sendToken(res, user, "Register Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("User doesn't exist", 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHandler("Incorrect email or password", 401));

  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
        httpOnly:true,
        secure:true,
        sameSite:"none"
    })
    .json({
      success: true,
      message: "Logged out Successfully",
    });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please enter all fields", 400));
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  //cloudnary TODO
  const file = req.file;
  const fileuri = getDateUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileuri.content);
  const user = await User.findById(req.user._id);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id:mycloud.public_id,
    url:mycloud.secure_url
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Picture Successfully",
  });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 400));

  const resetToken = await user.getResetToken();
  await user.save();
  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `Click on the link to reset your password ${url}. If your have not requested than please ignore`;

  //Send token via email
  await sendEmail(user.email, "CoursesBundler Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset token has been send to ${user.email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is invslid or has been expired"));

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });

  if (itemExist) return next(new ErrorHandler("Item Already Exist", 409));

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });
  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to playlist",
  });
})



export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.query.id);

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

  const newPlaylist = user.playlist.filter(({course})=>{
    return course==course.id;
  })

  user.playlist = newPlaylist;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Remove from playlist",
  });
})

//Admin Controllers

export const getAllUsers  = catchAsyncError(async (req, res, next) => {

  const user = await User.find({});

  res.status(200).json({
    success: true,
    user
  });
})

export const updateRole = catchAsyncError(async(req,res,next) => {
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler("User don't Exist",404))
    user.role = user.role.toString() === "admin".toString()?"user":"admin";
    await user.save();
    res.status(200).json({
      success: true,
      message:"Role Updated"
    });
})

export const deleteUser = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler("User don't Exist",404))
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  //cancel Subscription
    user.remove();
    return res.status(200).json({
      message:"User deleted",
      success:true
    })
})


export const deleteMyProfile = catchAsyncError(async(req,res,next)=>{
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  //cancel subscription
  user.remove();
  res.status(200).cookie("token",null,{
    expires:new Date(Date.now()),
  }).json({
    message:"Profile Deleted Sucessfully",
    success:true
  })

})


User.watch().on("change",async()=>{
  const stats = await Stats.find().sort({createdAt:"desc"}).limit(1);
  const subscription = await User.find({"subscription.status":"active"});

  stats[0].subscription = subscription.length;
  stats[0].users = await User.countDocuments();
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
})


