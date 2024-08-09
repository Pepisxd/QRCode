import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ setUserId }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setUserId(userId);
      navigate("/qr");
    }
  }, [navigate, setUserId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Login failed");
        return;
      }

      if (result.success) {
        localStorage.setItem("userToken", result.token);
        localStorage.setItem("userId", result.userId);
        setUserId(result.userId);
        navigate("/qr");
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage("Login error");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={10}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <Link to="/register">No tienes cuenta? Registrate aqui</Link>
    </div>
  );
};

export default Login;