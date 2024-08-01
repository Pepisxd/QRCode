const mongoose = require("mongoose");
const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const nodemailer = require("nodemailer");
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

const qrCodeSchema = new mongoose.Schema({
  createdAT: { type: Date, default: Date.now },
  data: String,
  userId: String,
  used: { type: Boolean, default: false },
});

const QRCodeModel = mongoose.model("QRCode", qrCodeSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  status: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;

app.post("/api/save-qr", async (req, res) => {
  const { qrCode, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "Missing userId" });
  }

  const hash = crypto.createHash("md5").update(qrCode).digest("hex");

  const newQRCode = new QRCodeModel({ data: hash, userId });

  try {
    const savedQRCode = await newQRCode.save();
    res.status(200).json({ success: true, savedQRCode });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/validate-qr", async (req, res) => {
  const { qrCode, userId } = req.body;

  const hash = crypto.createHash("md5").update(qrCode).digest("hex");

  try {
    const qr = await QRCodeModel.findOne({ data: hash });

    if (!qr) {
      return res
        .status(404)
        .json({ success: false, message: "QR Code not found" });
    }

    if (qr.used) {
      return res
        .status(400)
        .json({ success: false, message: "QR Code already used" });
    }

    if (qr.userId !== userId) {
      return res
        .status(400)
        .json({ success: false, message: "QR Code not for this user" });
    }

    qr.used = true;
    await qr.save();

    res.status(200).json({ success: true, qr });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/scan-qr", async (req, res) => {
  const { qrCode, userId } = req.body;

  const hash = crypto.createHash("md5").update(qrCode).digest("hex");

  try {
    const qr = await QRCodeModel.findOne({ data: hash });

    if (!qr) {
      return res
        .status(404)
        .json({ success: false, message: "QR Code not found" });
    }

    if (qr.used) {
      return res
        .status(400)
        .json({ success: false, message: "QR Code already used" });
    }

    if (qr.userId !== userId) {
      return res
        .status(400)
        .json({ success: false, message: "QR Code not for this user" });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const action = user.status ? "exit" : "entry"; // Determina la acción
    user.status = !user.status;
    await user.save();

    qr.used = true;
    qr.action = action; // Guarda la acción
    await qr.save();

    res.status(200).json({
      success: true,
      message: action === "entry" ? "User entered" : "User exited",
      userStatus: user.status ? "inside" : "outside",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/register", async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Todos los campos son obligatorios" });
  }

  const udgEmail = email.split("@")[1];
  if (udgEmail !== "alumnos.udg.mx") {
    return res.status(400).json({
      success: false,
      message: "Solo se aceptan correos electrónicos institucionales",
    });
  }

  try {
    // Verifica si el usuario ya existe
    console.log("Verificando si el usuario ya existe...");
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "El usuario ya existe" });
    }

    //Crear el usuario
    console.log("Creando el usuario...");
    const newUser = new UserModel({ username, password });
    await newUser.save();

    //Crear un token de verificación
    console.log("Creando token de verificación...");
    const token = jwt.sign({ userId: newUser._id }, "secretKey", {
      expiresIn: "1h",
    });

    //Enviar correo de verificación
    console.log("Generando nodemailer...");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "josealbertoorpp@gmail.com",
        pass: "cuzupvhhpjmtbgpj",
      },
    });

    const mailOptions = {
      // Configuración del correo
      from: "josealbertoorpp@gmail.com ",
      to: email,
      subject: "Verifica tu cuenta",
      text: `Haz click en el siguiente enlace para verificar tu cuenta: http://localhost:3000/api/verify-email?token=${token}`,
    };

    console.log("Enviando correo de verificación...");
    await transporter.sendMail(mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ success: true, message: "User registered" });
  } catch (err) {
    console.log("Error en la ruta de registro:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token inválido" });
    }

    user.isVerified = true;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Correo verificado exitosamente" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Token inválido" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({ success: true, token: user._id, userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/user-status/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      status: user.status ? "inside" : "outside",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
