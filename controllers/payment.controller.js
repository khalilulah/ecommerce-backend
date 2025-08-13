import { stripe } from "../lib/stripe.js";
import dotenv from "dotenv";
import Order from "../models/order.model.js";

dotenv.config();

// Create checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "empty product array" });
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // cents
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
        quantity: product.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.BACKEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BACKEND_URL}/payment-cancel`,
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

    res.status(200).json({
      id: session.id,
      totalAmount: totalAmount / 100,
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Success redirect endpoint
export const paymentSuccessRedirect = async (req, res) => {
  const sessionId = encodeURIComponent(req.query.session_id);
  return res.redirect(`myapp://purchase-success?session_id=${sessionId}`);
};

// Verify payment from app
export const verifyCheckoutSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res
        .status(400)
        .json({ success: false, message: "session_id is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      const products = JSON.parse(session.metadata.products);

      const existingOrder = await Order.findOne({
        stripeSessionId: session_id,
      });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Order already exists.",
          orderId: existingOrder._id,
          paid: true,
        });
      }

      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: session_id,
      });

      await newOrder.save();

      return res.status(200).json({
        success: true,
        message: "Payment successful, order created.",
        orderId: newOrder._id,
        paid: true,
      });
    }

    res
      .status(200)
      .json({ success: false, message: "Payment not completed.", paid: false });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
