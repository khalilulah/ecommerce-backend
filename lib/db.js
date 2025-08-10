import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`database connected`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
