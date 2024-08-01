import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import QRGenerator from "./QRGenerator";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [userId, setUserId] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUserId={setUserId} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/qr" element={<QRGenerator userId={userId} />} />
        <Route
          path="/qr"
          element={
            userId ? <QRGenerator userId={userId} /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
