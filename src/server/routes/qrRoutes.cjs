const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const QRCodeModel = require("../models/QRCode.cjs");
const UserModel = require("../models/User.cjs");

router.post("/save-qr", async (req, res) => {
  const { qrCode, userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ success: false, message: "Missing userId or action" });
  }

  const hash = crypto.createHash("md5").update(qrCode).digest("hex");

  const newQRCode = new QRCodeModel({ data: hash, userId, action });

  try {
    const savedQRCode = await newQRCode.save();
    res.status(200).json({ success: true, savedQRCode });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/validate-qr", async (req, res) => {
  const { qrCode, userId } = req.body;

  const hash = crypto.createHash("md5").update(qrCode).digest("hex");

  try {
    const qr = await QRCodeModel.findOne({ data: hash });

    if (!qr) {
      return res.status(404).json({ success: false, message: "QR Code not found" });
    }

    if (qr.used) {
      return res.status(400).json({ success: false, message: "QR Code already used" });
    }

    if (qr.userId !== userId) {
      return res.status(400).json({ success: false, message: "QR Code not for this user" });
    }

    qr.used = true;
    await qr.save();

    res.status(200).json({ success: true, qr });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/scan-qr", async (req, res) => {
  const { qrCode, userId } = req.body;

  const hash = crypto.createHash("md5").update(qrCode).digest("hex");

  try {
    const qr = await QRCodeModel.findOne({ data: hash });

    if (!qr) {
      return res.status(404).json({ success: false, message: "QR Code not found" });
    }

    if (qr.used) {
      return res.status(400).json({ success: false, message: "QR Code already used" });
    }

    if (qr.userId !== userId) {
      return res.status(400).json({ success: false, message: "QR Code not for this user" });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const action = qr.action;
    user.isInside = action === "entry" ? true : false;
    await user.save();

    qr.used = true;
    await qr.save();

    res.status(200).json({
      success: true,
      message: action === "entry" ? "User entered" : "User exited",
      userStatus: user.isInside ? "inside" : "outside",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
