import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createCheckoutSession,
  createCheckoutSuccess,
} from "../controllers/payment.controller.js";

const router = Router();

router.post(
  "/create-checkout-session",
  (req, res, next) => {
    console.log("Route hit before middleware");
    console.log("Authorization header:", req.headers.authorization);
    next();
  },
  protect,
  (req, res, next) => {
    console.log(
      "After protect middleware - user:",
      req.user ? "exists" : "missing"
    );
    next();
  },
  createCheckoutSession
);

router.post("/create-checkout-success", protect, createCheckoutSuccess);

export default router;
