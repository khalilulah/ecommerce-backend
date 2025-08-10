import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "enter a name"],
    },
    description: {
      type: String,
      required: [true, "enter a description"],
    },
    price: {
      type: Number,
      min: 0,
      required: [true, "enter a price"],
    },
    image: {
      type: String,
      required: [true, "enter an image"],
    },
    category: {
      type: String,
      required: [true, "enter a category"],
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
