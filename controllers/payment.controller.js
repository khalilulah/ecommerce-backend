import { stripe } from "../lib/stripe.js";
import dotenv from "dotenv";
import Order from "../models/order.model.js";

dotenv.config();

export const createCheckoutSession = async (req, res) => {
  try {
    console.log("Route hit - createCheckoutSession"); // ADD THIS
    console.log("Request body:", req.body); // ADD THIS
    console.log("User:", req.user ? "User exists" : "No user"); // ADD THIS
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      console.log("Empty products array"); // ADD THIS
      return res.status(400).json({ message: "empty product array" });
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // because stripes calculates in cents
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity,
      };
    });
    console.log(
      "Stripe key exists:",
      process.env.STRIPE_SECRET_KEY ? "Yes" : "No"
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: req.user._id.toString(),
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCheckoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // create a new Order
    if (session.payment_status === "paid") {
      const products = JSON.parse(session.metadata.products);
      newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });
      await newOrder.save();
      res.status(200).json({
        success: true,
        message: "Payment successful, order created.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
