import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
const router = Router();

router.post("/login", login);
// router.post("/logout", logout);
router.post("/signup", signup);

export default router;
