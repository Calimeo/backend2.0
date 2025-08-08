import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  beds: [bedSchema],
});

export default mongoose.model("Room", roomSchema);
