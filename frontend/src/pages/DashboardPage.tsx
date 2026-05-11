import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCar,
  faTruckFast,
  faUsers,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import api from "../api/axios";
import type { DashboardStats, Assignment } from "../types";
import { formatDateTime } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      console.log("Current user", user);
      try {
        const [statsRes, assignRes] = await Promise.all([
          api.get("/vehicles/stats"),
          api.get("/assignments?limit=5"),
        ]);
        setStats(statsRes.data);
        setRecentAssignments(assignRes.data.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Vehicles",
      value: stats?.totalVehicles ?? 0,
      icon: faCar,
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      shadow: "rgba(99,102,241,0.3)",
    },
    {
      label: "Available",
      value: stats?.byStatus?.available ?? 0,
      icon: faTruckFast,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      shadow: "rgba(16,185,129,0.3)",
    },
    {
      label: "Active Assignments",
      value: stats?.activeAssignments ?? 0,
      icon: faClipboardCheck,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      shadow: "rgba(245,158,11,0.3)",
    },
    {
      label: "Total Drivers",
      value: stats?.totalDrivers ?? 0,
      icon: faUsers,
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
      shadow: "rgba(59,130,246,0.3)",
    },
  ];

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#f1f5f9", mb: 0.5 }}
        >
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
          Here's what's happening with your fleet today.
        </Typography>
      </Box>

      {user?.role !== "fleet_staff" && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
                {loading ? (
                  <Skeleton
                    variant="rounded"
                    height={140}
                    sx={{ borderRadius: 4 }}
                  />
                ) : (
                  <Card
                    sx={{
                      bgcolor: "rgba(30,41,59,0.6)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(148,163,184,0.08)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 40px ${card.shadow}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              color: "#94a3b8",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {card.label}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 800, mt: 0.5, color: "#f1f5f9" }}
                          >
                            {card.value}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            background: card.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 4px 16px ${card.shadow}`,
                          }}
                        >
                          <FontAwesomeIcon
                            icon={card.icon}
                            style={{ color: "#fff", fontSize: 18 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            ))}
          </Grid>

          {/* Additional stats row */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: "rgba(30,41,59,0.6)",
                    border: "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Assigned
                      </Typography>
                      <Chip
                        label={stats.byStatus?.assigned ?? 0}
                        size="small"
                        sx={{
                          bgcolor: "rgba(245,158,11,0.15)",
                          color: "#f59e0b",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: "rgba(30,41,59,0.6)",
                    border: "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Maintenance
                      </Typography>
                      <Chip
                        label={stats.byStatus?.maintenance ?? 0}
                        size="small"
                        sx={{
                          bgcolor: "rgba(239,68,68,0.15)",
                          color: "#ef4444",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: "rgba(30,41,59,0.6)",
                    border: "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Retired
                      </Typography>
                      <Chip
                        label={stats.byStatus?.retired ?? 0}
                        size="small"
                        sx={{
                          bgcolor: "rgba(107,114,128,0.15)",
                          color: "#6b7280",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  sx={{
                    bgcolor: "rgba(30,41,59,0.6)",
                    border: "1px solid rgba(148,163,184,0.08)",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Total Users
                      </Typography>
                      <Chip
                        label={stats.totalUsers}
                        size="small"
                        sx={{
                          bgcolor: "rgba(99,102,241,0.15)",
                          color: "#818cf8",
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Recent Assignments */}
          <Card
            sx={{
              bgcolor: "rgba(30,41,59,0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(148,163,184,0.08)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Recent Assignments
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ bgcolor: "transparent" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Driver</TableCell>
                      <TableCell>Assigned</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 4 }).map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : recentAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{ textAlign: "center", py: 4, color: "#64748b" }}
                        >
                          No assignments yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentAssignments.map((a) => (
                        <TableRow
                          key={a.id}
                          sx={{
                            "&:hover": { bgcolor: "rgba(99,102,241,0.05)" },
                          }}
                        >
                          <TableCell>
                            <Typography
                              sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                            >
                              {a.vehiclePlate}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "0.75rem", color: "#64748b" }}
                            >
                              {a.vehicleName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem" }}>
                            {a.driverName}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: "0.85rem", color: "#94a3b8" }}
                          >
                            {formatDateTime(a.assignedAt)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={a.returnedAt ? "Returned" : "Active"}
                              size="small"
                              sx={{
                                bgcolor: a.returnedAt
                                  ? "rgba(107,114,128,0.15)"
                                  : "rgba(16,185,129,0.15)",
                                color: a.returnedAt ? "#9ca3af" : "#10b981",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
