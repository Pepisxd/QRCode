const mongoose = require("mongoose");
const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/QRCodes", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

const qrCodeShcema = new mongoose.Schema({
  createdAT: { type: Date, default: Date.now },
  data: String,
});

const QRCodeModel = mongoose.model("QRCode", qrCodeShcema);

app.post("/api/save-qr", async (req, res) => {
  const { qrCode } = req.body;

  const hash = crypto.createHash("md5").update(qrCode).digest("hex");

  const newQRCode = new QRCodeModel({ data: hash });

  try {
    const savedQRCode = await newQRCode.save();
    res.status(200).json({ success: true, savedQRCode });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
