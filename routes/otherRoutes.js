import express from "express";
import { contact, courseRequest, getDashboardStats } from "../controllers/otherController.js";
import { authorizedAdmin, isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

//contact
router.route("/contact").post(contact);



//request
router.route("/courserequest").post(courseRequest);


//Get admin Dashboard stats
router.route("/admin/stats").get(isAuthenticated,authorizedAdmin,getDashboardStats)

export default router;