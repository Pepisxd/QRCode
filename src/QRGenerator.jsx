import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";

const QRGenerator = () => {
  const [qrCode, setQrCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [userStatus, setUserStatus] = useState("outside");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!userId) {
        console.error("User ID is not defined");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/user-status/${userId}`
        );
        const result = await response.json();
        if (result.success) {
          setUserStatus(result.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchUserStatus();
  }, [userId]);

  const generateQRCode = async () => {
    const token = Math.random().toString(36).substring(2);
    const timeStamp = new Date().toISOString();
    const action = userStatus === "inside" ? "exit" : "entry";
    const qrData = JSON.stringify({
      userId,
      token,
      timeStamp,
      action,
    });

    setQrCode(qrData);

    try {
      const response = await fetch("http://localhost:3000/api/save-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: qrData, userId, action }),
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
      setScanResult("");
    }, 20000);
  };

  const scanQRCode = async () => {
    if (!qrCode) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/scan-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode, userId }),
      });

      const result = await response.json();

      if (result.success) {
        setScanResult(result.message);
        setUserStatus(result.userStatus);
      } else {
        setScanResult(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setScanResult("Error scanning QR Code");
    }
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

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <div>
      <h3>User is currently: {userStatus}</h3>
      <div>
        <div>{qrCode && <QRCode value={qrCode} />}</div>
        <button onClick={generateQRCode} disabled={cooldownActive}>
          {cooldownActive
            ? `Espera ${seconds} segundos para generar otro código`
            : "Generar Código QR"}
        </button>
      </div>

      <div>
        <button onClick={scanQRCode} disabled={!qrCode}>
          Escanear Código QR
        </button>
        {scanResult && <p>{scanResult}</p>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default QRGenerator;
