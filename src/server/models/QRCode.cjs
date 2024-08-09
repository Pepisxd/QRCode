const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
  createdAT: { type: Date, default: Date.now },
  data: String,
  userId: String,
  used: { type: Boolean, default: false },
  action: { type: String, enum: ["entry", "exit"], required: true },
});

module.exports = mongoose.model("QRCode", qrCodeSchema);
