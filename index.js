import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Stripe from "stripe";
import { connectDb } from "./lib/db.js";
import authroute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import paymentRoute from "./routes/payment.route.js";

dotenv.config();
// app.use(cors());

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

app.get("/payment-success", (req, res) => {
  const sessionId = encodeURIComponent(req.query.session_id);
  res.redirect(`ecommercefrontend://purchase-success?session_id=${sessionId}`);
});

app.get("/payment-cancel", (req, res) => {
  res.redirect(`ecommercefrontend://purchase-cancel`);
});

app.get("/api/payment/verify", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );
    res.json({ paid: session.payment_status === "paid", session });
  } catch (error) {
    res.status(400).json({ message: "Invalid session ID", error });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);

  connectDb();
});
