import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import QRGenerator from "./QRGenerator.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QRGenerator />
  </React.StrictMode>
);
