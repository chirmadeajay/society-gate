import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return token
    ? <Dashboard token={token} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
