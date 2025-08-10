import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, isFeatured } = req.body;

    if (!name || !description || !price || !category) {
      res.status(401).json({ message: "fill all fields" });
    }

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse,
      category,
      isFeatured,
    });

    res.status(201).json({ product, message: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const product = await Product.find({});
    res.status(200).json({ product, message: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // .lean() returns a plain javascript object instead of a mongodb document
    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      res.status(404).json({ message: "featured product not found" });
    }

    res.status(200).json({ featuredProducts, message: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecomendedProducts = async (req, res) => {
  try {
    const product = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          namw: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getProductByCategory = async (req, res) => {
  try {
    const productCategory = req.params.category;

    // const {productCategory} = req.params

    const products = await Product.find(productCategory);
    if (!products) {
      return res.status(404).json({ message: "products not found" });
    }
    res
      .status(200)
      .json({ products, message: "these are the products in this category" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (product) {
      product.isFeatured = !product.isFeatured;

      const updatedProduct = await product.save();
      res.status(201).json({ updatedProduct, message: "product is updated" });
    } else {
      res.status(404).json({ updatedProduct, message: "product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    //delete image from clousinary

    if (product.image) {
      try {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (deleteError) {
        console.error("Cloudinary delete error:", deleteError);
      }
    }
    const deletedBook = await Book.findByIdAndDelete(productId);
    if (!deletedBook) {
      return res
        .status(401)
        .json({ message: "unable to delete, book not found" });
    }
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
