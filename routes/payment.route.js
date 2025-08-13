import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createCheckoutSession,
  paymentSuccessRedirect,
  verifyCheckoutSuccess,
} from "../controllers/payment.controller.js";

const router = Router();

// Start checkout
router.post("/create-checkout-session", protect, createCheckoutSession);

// Stripe success redirect → app
router.get("/payment-success", paymentSuccessRedirect);

// App calls this to verify payment
router.get("/verify-checkout-success", protect, verifyCheckoutSuccess);

export default router;
