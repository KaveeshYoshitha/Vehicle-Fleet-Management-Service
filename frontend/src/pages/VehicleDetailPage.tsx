import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Chip, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, IconButton,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCar, faTruck, faVanShuttle, faBus, faMotorcycle, faCarSide, faCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../api/axios';
import type { Vehicle } from '../types';
import { getStatusColor, getStatusBgColor, getVehicleTypeLabel, formatCurrency, formatDateTime } from '../utils/helpers';

const vehicleTypeIcons: Record<string, typeof faCar> = {
  car: faCar, truck: faTruck, van: faVanShuttle, bus: faBus,
  motorcycle: faMotorcycle, suv: faCarSide, other: faCar,
};

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await api.get(`/vehicles/${id}`);
        setVehicle(res.data);
      } catch {
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4, mb: 3 }} />
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  if (!vehicle) return null;

  const activeAssignment = vehicle.assignments?.find(a => !a.returnedAt);

  return (
    <Box>
      {/* Back button */}
      <Button startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
        onClick={() => navigate('/vehicles')}
        sx={{ mb: 3, color: '#94a3b8', '&:hover': { color: '#f1f5f9' } }}>
        Back to Vehicles
      </Button>

      {/* Vehicle Info Card */}
      <Card sx={{ bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148,163,184,0.08)', mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box sx={{
                width: 72, height: 72, borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(99,102,241,0.2)',
              }}>
                <FontAwesomeIcon icon={vehicleTypeIcons[vehicle.type] || faCar} style={{ color: '#818cf8', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{vehicle.plateNumber}</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </Typography>
              </Box>
            </Box>
            <Chip label={vehicle.status} sx={{
              bgcolor: getStatusBgColor(vehicle.status),
              color: getStatusColor(vehicle.status),
              fontWeight: 700, fontSize: '0.85rem', px: 1, textTransform: 'capitalize',
            }} />
          </Box>

          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>Type</Typography>
              <Typography sx={{ fontWeight: 600 }}>{getVehicleTypeLabel(vehicle.type, vehicle.customType)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>Fuel Type</Typography>
              <Typography sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{vehicle.fuelType}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>Purchase Cost</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatCurrency(vehicle.purchaseCost)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>Added</Typography>
              <Typography sx={{ fontWeight: 600 }}>{formatDateTime(vehicle.createdAt)}</Typography>
            </Grid>
          </Grid>

          {vehicle.notes && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>Notes</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{vehicle.notes}</Typography>
            </Box>
          )}

          {activeAssignment && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Typography sx={{ fontWeight: 700, color: '#f59e0b', mb: 0.5 }}>Currently Assigned</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#fcd34d' }}>
                Driver: {activeAssignment.driverName} • Since: {formatDateTime(activeAssignment.assignedAt)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Assignment History */}
      <Card sx={{ bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148,163,184,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Assignment History ({vehicle.assignments?.length || 0} records)
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Assigned By</TableCell>
                  <TableCell>Assigned At</TableCell>
                  <TableCell>Returned At</TableCell>
                  <TableCell>Returned By</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!vehicle.assignments?.length ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                      No assignment history
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicle.assignments.map((a) => (
                    <TableRow key={a.id} sx={{
                      bgcolor: !a.returnedAt ? 'rgba(245,158,11,0.04)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' },
                    }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FontAwesomeIcon icon={faCircle}
                            style={{ fontSize: 8, color: a.returnedAt ? '#6b7280' : '#10b981' }} />
                          <Chip label={a.returnedAt ? 'Returned' : 'Active'}
                            size="small" sx={{
                              bgcolor: a.returnedAt ? 'rgba(107,114,128,0.15)' : 'rgba(16,185,129,0.15)',
                              color: a.returnedAt ? '#9ca3af' : '#10b981',
                              fontWeight: 600,
                            }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{a.driverName}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{a.assignedBy}</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{formatDateTime(a.assignedAt)}</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{formatDateTime(a.returnedAt)}</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>{a.returnedBy || '—'}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VehicleDetailPage;
