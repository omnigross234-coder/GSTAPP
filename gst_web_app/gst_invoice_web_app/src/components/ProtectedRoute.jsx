import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../utils/auth";

// Protects any route — redirects to login if not logged in
export function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Protects admin-only routes
export function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/invoice" replace />;
  }
  return children;
}