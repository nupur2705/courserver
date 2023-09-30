import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";



export const buySubscription = catchAsyncError(async(req,res,next)=>{
        const user = await User.findById(req.user._id);
        if(!user) return next(new ErrorHandler("User don't exist",404));
        user.subscription.status = "active";

        await user.save();
        res.status(200).json({message:"ßSubscribed",success:true,user})
}) 


export const cancelSubscription = catchAsyncError(async(req,res,next)=>{
        const user = await User.findById(req.user._id);
        if(!user) return next(new ErrorHandler("User don't exist",404));
        user.subscription.status = undefined;

            await user.save();
        res.status(200).json({message:"UnSubscribed",success:true,user})
}) 