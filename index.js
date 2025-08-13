import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDb } from "./lib/db.js";
import authroute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import paymentRoute from "./routes/payment.route.js";

dotenv.config();
// app.use(cors());

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authroute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/payment", paymentRoute);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);

  connectDb();
});
