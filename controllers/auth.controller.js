import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

export const signup = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    //check if user already exist
    const existingUser = await User.findOne({ email });

    //make sure no field return a falsy value
    if (!username || !email || !password) {
      return res.status(400).json({ message: "fill all fields" });
    }

    // handles already exixting user
    if (existingUser) {
      return res.status(400).json({ message: "user already exist" });
    }

    //create new user
    const newUser = await User.create({ username, email, password, role });

    // create token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    if (!token) {
      return res.status(400).json({ message: "invalid token" });
    }

    res
      .status(201)
      .json({ token, newUser, message: "new user created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // make sure no input returns a falsy value
    if (!email || !password) {
      return res.status(400).json({ message: "fill all fields" });
    }

    const user = await User.findOne({ email });

    //if there is no user with the given email
    if (!user) {
      return res.status(400).json({ message: "not a valid user" });
    }

    // compare the incomming password with the password in the database
    const validPassword = await bcrypt.compare(password, user.password);

    // if password is invalid
    if (!validPassword) {
      return res.status(401).json({ message: "invalid password" });
    }

    // create a token with the user's id
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    //return this messaga
    res.status(200).json({
      success: true,
      message: "successful login",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// export const logout = async (req, res) => {
//   res.send("logout");
// };
