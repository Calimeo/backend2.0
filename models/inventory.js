// models/Inventory.js
import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["medicine", "supply"],
      required: true,
    },
    subtype: {
      type: String,
      enum: ["sirop", "comprimé", "gélule", "pommade", "injectable", "autre"],
      required: function () {
        return this.type === "medicine";
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    expirationDate: Date,
    image: {
      public_id: String,
      url: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);
