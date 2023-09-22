import express from "express";
import {
  addLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
} from "../controllers/courseController.js";
import singleUpload from "../middleware/multer.js";
import { authorizeSubscribers, authorizedAdmin, isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

// get all course without lecture
router.route("/courses").get(getAllCourses);

//create new course  -> >  only admin
router
  .route("/createcourse")
  .post(isAuthenticated, authorizedAdmin, singleUpload, createCourse);

//Add lecture , Delete Course , Get Course Details
router
  .route("/course/:id")
  .get(isAuthenticated,authorizeSubscribers,getCourseLectures)
  .post(isAuthenticated,authorizedAdmin,singleUpload, addLecture)
  .delete(isAuthenticated,authorizedAdmin,deleteCourse)

// Delete lecture
router.route("/lecture").delete(isAuthenticated,authorizedAdmin,deleteLecture)

export default router;
