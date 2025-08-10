import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "provide a token" });
    }

    // decode the token provided
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res.status(400).json({ message: "invalid token" });
    }

    const getUser = await User.findById(decode.userId).select("-password");

    req.user = getUser;

    next();
  } catch (error) {
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
