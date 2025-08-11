import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  console.log("=== PROTECT MIDDLEWARE START ===");
  console.log("Authorization header:", req.headers.authorization);
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Extracted token:", token ? "Present" : "Missing");
    if (!token) {
      console.log("ERROR: No token provided");
      return res.status(400).json({ message: "provide a token" });
    }

    console.log("Verifying token...");
    // decode the token provided
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Token decoded successfully, userId:", decode.userId);
    if (!decode) {
      console.log("ERROR: Token decode failed");
      return res.status(400).json({ message: "invalid token" });
    }

    console.log("Finding user with ID:", decode.userId);
    const getUser = await User.findById(decode.userId).select("-password");
    console.log("User found:", getUser ? "Yes" : "No");

    if (!getUser) {
      console.log("ERROR: User not found in database");
      return res.status(404).json({ message: "User not found" });
    }
    req.user = getUser;
    console.log("=== PROTECT MIDDLEWARE SUCCESS ===");
    next();
  } catch (error) {
    console.error("=== PROTECT MIDDLEWARE ERROR ===");
    console.error("Error:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied- Admin only" });
  }
};
