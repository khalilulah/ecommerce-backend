// seedProducts.mjs
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

dotenv.config();

if (
  !process.env.CLOUDINARY_NAME ||
  !process.env.API_KEY ||
  !process.env.API_SECRET
) {
  console.warn(
    "⚠️  Missing Cloudinary credentials in .env. You must set CLOUDINARY_NAME, API_KEY, API_SECRET"
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// If you already have a Product model in your project, replace the line below with:
import Product from "../models/product.model.js";
// const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const products = [
  {
    name: "Classic White T-Shirt",
    description: "Soft cotton t-shirt in pure white.",
    price: 15.99,
    image:
      "https://i.pinimg.com/1200x/72/9a/09/729a09f3c448056788548e35f528973d.jpg",
    category: "Clothing",
    isFeatured: true,
  },
  {
    name: "Blue Denim Jeans",
    description: "Slim-fit jeans made from durable denim.",
    price: 45.5,
    image: "https://picsum.photos/seed/jeans1/800/600",
    category: "Clothing",
    isFeatured: false,
  },
  {
    name: "Black Leather Jacket",
    description: "Stylish biker jacket made from genuine leather.",
    price: 120.0,
    image:
      "https://i.pinimg.com/1200x/f2/b6/7b/f2b67b7347a51d5d6f39b442e04c7d4d.jpg",
    category: "Clothing",
    isFeatured: true,
  },
  {
    name: "Sports Hoodie",
    description: "Lightweight hoodie perfect for workouts.",
    price: 35.0,
    image:
      "https://i.pinimg.com/736x/81/fa/1a/81fa1ae5026d7f8dcb3a0dfb9d493fb6.jpg",
    category: "Clothing",
    isFeatured: false,
  },
  {
    name: "Formal Black Suit",
    description: "Two-piece formal suit for special occasions.",
    price: 199.99,
    image:
      "https://i.pinimg.com/736x/37/43/30/3743301cb750c760a363cbb89f3fd54c.jpg",
    category: "Clothing",
    isFeatured: true,
  },

  {
    name: "Wireless Earbuds",
    description: "Bluetooth earbuds with noise cancellation.",
    price: 59.99,
    image:
      "https://i.pinimg.com/1200x/32/d3/35/32d335068ac672d1efc5e05a806962d3.jpg",
    category: "Electronics",
    isFeatured: true,
  },
  {
    name: "Gaming Laptop",
    description: "High-performance laptop with RTX graphics.",
    price: 1499.99,
    image:
      "https://i.pinimg.com/736x/1d/9e/34/1d9e347684c6be3f86b7058fecb6b47e.jpg",
    category: "Electronics",
    isFeatured: false,
  },
  {
    name: "Smartphone Pro X",
    description: "Flagship smartphone with stunning camera.",
    price: 999.0,
    image:
      "https://i.pinimg.com/736x/55/1f/8f/551f8f64da4a1ccf949d4e97f4687541.jpg",
    category: "Electronics",
    isFeatured: true,
  },
  {
    name: "4K LED TV",
    description: "55-inch ultra HD LED television.",
    price: 699.99,
    image:
      "https://i.pinimg.com/736x/17/27/3e/17273e4e1078d1f500adcb63efd1163e.jpg",
    category: "Electronics",
    isFeatured: false,
  },
  {
    name: "Smartwatch Series 5",
    description: "Fitness tracking and notifications on your wrist.",
    price: 249.99,
    image:
      "https://i.pinimg.com/1200x/0b/44/0c/0b440ca1bee296393612fab487b6ee53.jpg",
    category: "Electronics",
    isFeatured: true,
  },

  {
    name: "Wooden Coffee Table",
    description: "Rustic coffee table made from oak wood.",
    price: 180.0,
    image:
      "https://i.pinimg.com/1200x/5f/b6/0a/5fb60ab915d964aeb347db8b74485bff.jpg",
    category: "Furniture",
    isFeatured: false,
  },
  {
    name: "Ergonomic Office Chair",
    description: "Adjustable mesh chair with lumbar support.",
    price: 220.5,
    image:
      "https://i.pinimg.com/736x/63/cb/c2/63cbc2f3012f817d07237c50e8df1fa2.jpg",
    category: "Furniture",
    isFeatured: true,
  },
  {
    name: "King Size Bed Frame",
    description: "Solid wood bed frame with storage drawers.",
    price: 499.99,
    image:
      "https://i.pinimg.com/1200x/2a/f7/69/2af769590351973c486303821f5c8507.jpg",
    category: "Furniture",
    isFeatured: true,
  },
  {
    name: "Bookshelf 5-Tier",
    description: "Space-saving vertical bookshelf.",
    price: 99.0,
    image:
      "https://i.pinimg.com/1200x/f4/94/f9/f494f9a170fa8308b3f3272f6be55b70.jpg",
    category: "Furniture",
    isFeatured: false,
  },
  {
    name: "Dining Set (Table + 4 Chairs)",
    description: "Modern dining table with matching chairs.",
    price: 350.0,
    image:
      "https://i.pinimg.com/1200x/23/f4/8f/23f48ffb027eb4848cf246e08129d819.jpg",
    category: "Furniture",
    isFeatured: true,
  },

  {
    name: "Running Shoes",
    description: "Breathable shoes for jogging and sports.",
    price: 65.0,
    image:
      "https://i.pinimg.com/1200x/2b/d2/bb/2bd2bb64931017472e31ab51a5e68638.jpg",
    category: "Sports",
    isFeatured: false,
  },
  {
    name: "Basketball",
    description: "Professional-size leather basketball.",
    price: 30.0,
    image:
      "https://i.pinimg.com/1200x/b7/b1/ee/b7b1eef388cc6e476d12c2644e7f2e5f.jpg",
    category: "Sports",
    isFeatured: true,
  },
  {
    name: "Yoga Mat",
    description: "Non-slip surface, perfect for home workouts.",
    price: 20.0,
    image:
      "https://i.pinimg.com/1200x/49/a7/53/49a753e6974fb775bab76564ca092b3b.jpg",
    category: "Sports",
    isFeatured: false,
  },
  {
    name: "Tennis Racket",
    description: "Lightweight and durable tennis racket.",
    price: 80.0,
    image:
      "https://i.pinimg.com/1200x/ad/b0/90/adb090ab5c25710a2702908e8c8c27ff.jpg",
    category: "Sports",
    isFeatured: true,
  },
  {
    name: "Cycling Helmet",
    description: "Safety helmet with adjustable straps.",
    price: 40.0,
    image:
      "https://i.pinimg.com/736x/84/ff/bc/84ffbc38c86f265e9fd516a573ef9131.jpg",
    category: "Sports",
    isFeatured: false,
  },
];

async function uploadImage(url) {
  try {
    // try direct upload from remote URL
    const res = await cloudinary.uploader.upload(url, { folder: "products" });
    return res;
  } catch (err) {
    // fallback: fetch the image and upload as data URI
    console.log(
      `Direct upload failed for ${url}. Trying fetch + base64 upload... (${err.message})`
    );
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const base64 = Buffer.from(response.data, "binary").toString("base64");
      const mime = response.headers["content-type"] || "image/jpeg";
      const dataUri = `data:${mime};base64,${base64}`;
      const res2 = await cloudinary.uploader.upload(dataUri, {
        folder: "products",
      });
      return res2;
    } catch (err2) {
      console.error("Fallback upload failed:", err2.message);
      return null;
    }
  }
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected.");

  if (process.env.CLEAR_EXISTING === "true") {
    console.log("Clearing existing products collection...");
    await Product.deleteMany({});
  }

  for (const p of products) {
    try {
      const exists = await Product.findOne({ name: p.name });
      if (exists) {
        console.log(`Skipping (already exists): ${p.name}`);
        continue;
      }

      let cloudResponse = null;
      if (p.image) {
        cloudResponse = await uploadImage(p.image);
        // small delay to be gentle on Cloudinary / avoid throttling
        await new Promise((r) => setTimeout(r, 300));
      }

      const created = await Product.create({
        name: p.name,
        description: p.description,
        price: p.price,
        image: cloudResponse.secure_url, // store the full Cloudinary response (same shape as your controller)
        category: p.category,
        isFeatured: p.isFeatured || false,
      });

      console.log("Created:", created.name);
    } catch (err) {
      console.error("Error creating product", p.name, err.message);
    }
  }

  await mongoose.disconnect();
  console.log("Seeding finished. Disconnected from MongoDB.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
