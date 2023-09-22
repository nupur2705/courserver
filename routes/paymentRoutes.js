import express from 'express'
import { isAuthenticated } from '../middleware/auth.js';
import { buySubscription, cancelSubscription } from '../controllers/paymentController.js';

const router = express.Router();


//subscribe
router.route("/subscribe").get(isAuthenticated,buySubscription);

//unsubscribe
router.route("/subscribe/cancel").get(isAuthenticated,cancelSubscription);

export default router;