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
    let totalAmount = 0;

    if (productId) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId.toString()
      );
    } else {
      // If no productId provided, clear entire cart
      user.cartItems = [];
    }

    await user.save();

    // Calculate total amount for remaining items in cart
    for (let cartItem of user.cartItems) {
      const itemProduct = await Product.findById(cartItem.product);
      if (itemProduct) {
        totalAmount += Math.round(itemProduct.price * cartItem.quantity);
      }
    }

    res.status(200).json({
      cartItems: user.cartItems,
      totalAmount: totalAmount,
    });
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
    let singleTotalAmount = 0;
    let totalAmount = 0;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      existingItem.quantity += 1;
      await user.save();

      // Calculate the total amount for this specific product
      const amount = Math.round(product.price);
      singleTotalAmount = amount * existingItem.quantity; // Use existingItem.quantity, not product.quantity

      // Calculate total for all products in cart
      for (let cartItem of user.cartItems) {
        const itemProduct = await Product.findById(cartItem.product);
        if (itemProduct) {
          totalAmount += Math.round(itemProduct.price * cartItem.quantity);
        }
      }

      res.status(200).json({
        cartItems: user.cartItems,
        singleTotalAmount: singleTotalAmount,
        totalAmount: totalAmount,
      });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const decrementQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const user = req.user;
    let singleTotalAmount = 0;
    let totalAmount = 0;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItem) {
      let currentQuantity = 0; // Track the current quantity

      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
        currentQuantity = existingItem.quantity;
      } else {
        // Remove item if quantity becomes 0
        user.cartItems = user.cartItems.filter(
          (item) => item.product.toString() !== productId.toString()
        );
        currentQuantity = 0; // Item was removed, so quantity is 0
      }

      await user.save();

      // Calculate the total amount for this specific product
      const amount = Math.round(product.price);
      singleTotalAmount = amount * currentQuantity; // Use currentQuantity instead

      // Calculate total for all products in cart
      for (let cartItem of user.cartItems) {
        const itemProduct = await Product.findById(cartItem.product);
        if (itemProduct) {
          totalAmount += Math.round(itemProduct.price * cartItem.quantity);
        }
      }

      res.status(200).json({
        cartItems: user.cartItems,
        singleTotalAmount: singleTotalAmount,
        totalAmount: totalAmount,
      });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cartItems = [];
    await user.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cartItems: user.cartItems,
      totalAmount: 0, // Added for consistency with other cart functions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
