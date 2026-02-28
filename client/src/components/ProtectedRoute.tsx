import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/authStore";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
