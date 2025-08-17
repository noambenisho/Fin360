import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { setAuthToken } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired
          logout();
        } else {
          setUser({ id: decoded.id, role: decoded.role });
          setAuthToken(token);
        }
      } catch (e) {
        console.error("Invalid token", e);
        logout();
      }
    }
  }, []);

  const login = (token, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    setAuthToken(token);
    try {
      const decoded = jwtDecode(token);
      setUser({ id: decoded.id, role: decoded.role });
    } catch (e) {
      console.error("Invalid token", e);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    // Clear any other user-related data from storage
    localStorage.removeItem("userData");
    sessionStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
