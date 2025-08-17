// import express from "express";
import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductByCategory,
  getProductById,
  getRecomendedProducts,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, adminRoute, createProduct);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category ", getProductByCategory);
router.get("/recomendations", getRecomendedProducts);
router.get("/", protect, adminRoute, getAllProducts);
router.patch("/:id", protect, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protect, adminRoute, deleteProduct);
router.get("/:id", protect, getProductById);
export default router;
