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

    const user = await User.findById(req.user._id);

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("Product found:", product.name);
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    // FIX: Filter out invalid cart items and check for undefined products
    const validCartItems = user.cartItems.filter(
      (item) => item.product != null
    );

    const existingItem = validCartItems.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ product: productId, quantity: 1 });
      console.log("Added new item to cart");
    }
    user.cartItems = user.cartItems.filter((item) => item.product != null);
    await user.save();

    res.status(200).json(user.cartItems);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (productId) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId.toString()
      );
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

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== productId.toString()
        );

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

// ADD: New functions for increment/decrement
export const incrementQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const user = req.user;

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      existingItem.quantity += 1;
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const decrementQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const user = req.user;

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        // Remove item if quantity becomes 0
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== productId.toString()
        );
      }
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
