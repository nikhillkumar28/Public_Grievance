import { Navigate, useLocation } from "react-router-dom";

const decodeTokenPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export default function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const payload = decodeTokenPayload(token);
  if (!payload) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const tokenRole = payload.role;
  if (role && tokenRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
