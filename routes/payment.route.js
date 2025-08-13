import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createCheckoutSession,
  createCheckoutSuccess,
  createPaymentSheet,
} from "../controllers/payment.controller.js";

const router = Router();

// Start checkout
router.post("/create-checkout-session", protect, createCheckoutSession);

router.get("/checkout-success", protect, createCheckoutSuccess);
router.post("/payment-sheet", protect, createPaymentSheet);

export default router;
