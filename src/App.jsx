import "./styles/App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import QRGenerator from "./pages/QRGenerator";
import Login from "./pages/Login";
import Register from "./pages/Register";


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
