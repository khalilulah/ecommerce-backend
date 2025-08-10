import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createCheckoutSession,
  createCheckoutSuccess,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/create-checkout-success", protect, createCheckoutSuccess);

export default router;
