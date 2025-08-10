import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", protect, getCartProducts);
router.delete("/", protect, removeAllFromCart);
router.patch("/:id", protect, updateQuantity);
router.post("/", protect, addToCart);

export default router;
