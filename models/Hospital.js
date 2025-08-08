const mongoose = require("mongoose");

const hopitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  email: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Hopital", hopitalSchema);
