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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    const query = { isFeatured: true };
    if (category && category !== "All") {
      query.category = category;
    }
    // Get total count of featured products for pagination
    const totalCount = await Product.countDocuments(query);

    // .lean() returns a plain javascript object instead of a mongodb document
    const featuredProducts = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (totalCount === 0) {
      return res.status(404).json({
        message: "No featured products found",
        currentPage: page,
        totalCount,
        totalPages: 0,
        featuredProducts: [],
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      currentPage: page,
      totalPages,
      featuredProducts,
      message: "success",
    });
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
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res
        .status(401)
        .json({ message: "unable to delete, product not found" });
    }
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
