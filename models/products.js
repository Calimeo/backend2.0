// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    image: {
      public_id: String,
      url: String,
    },
    category: {
      type: String,
      enum: ["medicament", "supply", "equipment"],
      required: true,
    },
    expiryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
