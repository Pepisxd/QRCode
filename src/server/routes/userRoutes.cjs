const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const UserModel = require("../models/User.cjs");

// Ruta para el registro de usuarios
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
  }

  const udgEmail = email.split("@")[1];
  if (udgEmail !== "alumnos.udg.mx") {
    return res.status(400).json({
      success: false,
      message: "Solo se aceptan correos electrónicos institucionales",
    });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "El usuario ya existe" });
    }

    // Crear el usuario
    const newUser = new UserModel({ username, password, email });
    await newUser.save();

    // Crear un token de verificación
    const token = jwt.sign({ userId: newUser._id }, "secretKey", {
      expiresIn: "1h",
    });

    // Configurar el transporte para el envío del correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "josealbertoorpp@gmail.com",
        pass: "cuzupvhhpjmtbgpj",
      },
    });

    const mailOptions = {
      from: "josealbertoorpp@gmail.com",
      to: email,
      subject: "Verifica tu cuenta",
      text: `Haz click en el siguiente enlace para verificar tu cuenta: http://localhost:3000/api/verify-email?token=${token}`,
    };

    // Enviar el correo de verificación
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Usuario registrado. Verifica tu correo electrónico para completar el registro." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ruta para la verificación del correo electrónico
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, "secretKey");
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: "Token inválido" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: "Correo verificado exitosamente" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Token inválido" });
  }
});

// Ruta para el inicio de sesión
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Faltan campos" });
  }

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: "Credenciales inválidas" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "Correo electrónico no verificado" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Credenciales inválidas" });
    }

    res.status(200).json({ success: true, token: user._id, userId: user._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
