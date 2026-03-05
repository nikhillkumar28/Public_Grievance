import { createContext, useContext, useMemo, useState } from "react";
import { loginApi, registerApi } from "../api/authApi";

const AuthContext = createContext(null);

const initialUser = (() => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
})();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);

  const saveAuth = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (payload) => {
    const data = await loginApi(payload);
    saveAuth(data);
    return data;
  };

  const register = async (payload) => {
    const data = await registerApi(payload);
    saveAuth(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
