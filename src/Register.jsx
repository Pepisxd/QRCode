import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password || !email) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
      });

      const result = await response.json();
      setLoading(false);

      if (result.success) {
        navigate("/");
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Register error:", err);
      setLoading(false);
      setError("Error during registration");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <div>
        <div>
          <label htmlFor="username">Codigo:</label>
          <input
            type="text"
            id="username"
            placeholder="Codigo"
            value={username}
            maxLength={9}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            value={password}
            maxLength={10}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Correo:</label>
          <input
            type="email"
            id="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div>
        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Registrando..." : "Register"}
        </button>
        {error && <p>{error}</p>}
      </div>
      <Link to="/">Ya tienes tu cuenta? Inicia Sesión aqui</Link>
    </div>
  );
};

export default Register;
