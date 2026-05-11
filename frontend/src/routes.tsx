import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import UsersPage from "./pages/UsersPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AuditLogPage from "./pages/AuditLogPage";
import ProfilePage from "./pages/ProfilePage";

const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#0f172a",
        }}
      >
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role))
    return <Navigate to="/" replace />;

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: "#0f172a",
        }}
      >
        <CircularProgress sx={{ color: "#6366f1" }} />
      </Box>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={["admin", "fleet_manager"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AuditLogPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
