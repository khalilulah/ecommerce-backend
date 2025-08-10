import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./lib/db.js";
import authroute from "../ecommerce-backend/routes/auth.route.js";
import productRoute from "../ecommerce-backend/routes/product.route.js";
import cartRoute from "../ecommerce-backend/routes/cart.route.js";
import paymentRoute from "../ecommerce-backend/routes/payment.route.js";

dotenv.config();
// app.use(cors());

const app = express();
app.use(express.json());

app.use("/api/auth", authroute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/payment", paymentRoute);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);

  connectDb();
});
