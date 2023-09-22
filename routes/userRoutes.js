import express from "express";
import {
  addToPlaylist,
  changePassword,
  deleteMyProfile,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlaylist,
  resetPassword,
  updateProfile,
  updateProfilePicture,
  updateRole,
} from "../controllers/userController.js";
import { authorizedAdmin, isAuthenticated } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";
const router = express.Router();
//To register new user
router.route("/register").post(singleUpload, register);

//login
router.route("/login").post(login);

//logout
router.route("/logout").get(logout);

//Get my profile and delete my profile
router.route("/me").get(isAuthenticated, getMyProfile).delete(isAuthenticated,deleteMyProfile)

//Change password
router.route("/changepassword").put(isAuthenticated, changePassword);

//Update Profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);
//Update Profile picture
router
  .route("/updateprofilepicture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);

//ForgotPassword
router.route("/forgetpassword").post(forgetPassword);

//resetPassword
router.route("/resetpassword/:token").put(resetPassword);

//Add to PlayList
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);

//Remove From PlayList
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);

//Admin routes
//Get All user
router.route("/admin/users").get(isAuthenticated, authorizedAdmin, getAllUsers);

//update role
router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizedAdmin, updateRole)
  .delete(isAuthenticated, authorizedAdmin, deleteUser);
export default router;
