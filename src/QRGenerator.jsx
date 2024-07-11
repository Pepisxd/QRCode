import { set } from "mongoose";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { v4 as uuidv4 } from "uuid";

const QRGenerator = () => {
  const [qrCode, setQrCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);

  const generateQRCode = async () => {
    const userId = uuidv4(); // Identificador de usuario (cambiar por el de la DB)
    const token = Math.random().toString(36).substring(2); // Token de usuario (cambiar por JWT)
    const timeStamp = new Date().toISOString(); // Fecha y hora de creación del QR
    const validationString = "Este string fue hecho de prueba"; // Cadena de validación

    const qrData = JSON.stringify({
      userId,
      token,
      timeStamp,
      validationString,
    });

    setQrCode(qrData);

    try {
      const response = await fetch("http://localhost:3000/api/save-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode: qrData }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("QR guardado en la base de datos", result.savedQRCode);
      } else {
        console.error("Error al guardar el QR", result.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }

    setCooldownActive(true);
    setSeconds(20);

    setTimeout(() => {
      setQrCode("");
    }, 20000);
  };

  useEffect(() => {
    let interval = null;

    if (cooldownActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    }

    if (seconds === 0 && cooldownActive) {
      setCooldownActive(false);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [cooldownActive, seconds]);

  return (
    <div>
      {qrCode && <QRCode value={qrCode} />}
      <button onClick={generateQRCode} disabled={cooldownActive}>
        {cooldownActive
          ? `Espera ${seconds} segundos para generar otro codigo`
          : "Generar Código QR"}
      </button>
    </div>
  );
};

export default QRGenerator;
