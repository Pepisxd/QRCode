const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Importar las rutas
const qrRoutes = require("./routes/qrRoutes.cjs");
const userRoutes = require("./routes/userRoutes.cjs");

// Importar y configurar la conexión a la base de datos
require("./config/db.cjs");

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(bodyParser.json());

// Usar las rutas
app.use("/api", qrRoutes);
app.use("/api", userRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
