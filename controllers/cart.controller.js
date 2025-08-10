import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const product = await Product.find({ id: { $in: req.user.cartItems } });

    // add the quantity for each product
    const cartItems = product.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.status(201).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();

    res.status(200).json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
