import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addToCart,
  decrementQuantity,
  getCartProducts,
  incrementQuantity,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", protect, getCartProducts);
router.delete("/:id", protect, removeAllFromCart);
router.patch("/:id", protect, updateQuantity);
router.post("/", protect, addToCart);
router.patch("/:id/increment", protect, incrementQuantity);
router.patch("/:id/decrement", protect, decrementQuantity);

export default router;
