import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getCartProducts = async (req, res) => {
  try {
    //get the id of each product in the cartItems
    const productIds = req.user.cartItems.map((item) => item.product);

    //find the product in the "Product" database using the id gotten above
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // add the quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.product.toString() === product._id.toString()
      );
      return { ...product, quantity: item?.quantity || 1 };
    });

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log("=== ADD TO CART DEBUG ===");
    console.log("Product ID received:", productId);
    console.log("User ID:", req.user._id);
    const user = await User.findById(req.user._id);

    if (!productId) {
      console.log("ERROR: No product ID provided");
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("ERROR: Product not found for ID:", productId);
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("Product found:", product.name);
    if (!user) {
      console.log("ERROR: User not found");
      return res.status(401).json({ message: "user not found" });
    }
    console.log("User found:", user.name);
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      existingItem.quantity += 1;
      console.log("Updated existing item quantity to:", existingItem.quantity);
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
      console.log("Added new item to cart");
    }

    await user.save();
    console.log("User saved successfully");

    res.status(200).json(user.cartItems);
  } catch (error) {
    console.error("=== ADD TO CART ERROR ===");
    console.error("Full error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (productId) {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    } else {
      return user.cartItems;
    }

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => (item.id = productId));
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id != productId);

        await user.save();
        return res.status(200).json(user.cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
