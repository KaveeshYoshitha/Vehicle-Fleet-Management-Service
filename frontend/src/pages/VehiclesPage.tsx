import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button, TextField,
  MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Skeleton, IconButton, Tooltip,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faSearch, faCar, faTruck, faVanShuttle, faBus,
  faMotorcycle, faCarSide, faGasPump, faEye, faPenToSquare, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import api from '../api/axios';
import type { Vehicle, VehicleType, VehicleStatus } from '../types';
import { getStatusColor, getStatusBgColor, getVehicleTypeLabel, formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const vehicleTypeIcons: Record<string, typeof faCar> = {
  car: faCar, truck: faTruck, van: faVanShuttle, bus: faBus,
  motorcycle: faMotorcycle, suv: faCarSide, other: faCar,
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: '', make: '', model: '', year: new Date().getFullYear(),
    type: 'car' as VehicleType, customType: '', fuelType: 'petrol',
    purchaseCost: '', notes: '', status: 'available' as VehicleStatus,
  });
  const [formLoading, setFormLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user?.role === 'admin' || user?.role === 'fleet_manager';

  const fetchVehicles = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/vehicles', { params });
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [search, typeFilter, statusFilter]);

  const openAddForm = () => {
    setEditingVehicle(null);
    setFormData({
      plateNumber: '', make: '', model: '', year: new Date().getFullYear(),
      type: 'car', customType: '', fuelType: 'petrol', purchaseCost: '', notes: '', status: 'available',
    });
    setFormOpen(true);
  };

  const openEditForm = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      plateNumber: v.plateNumber, make: v.make, model: v.model, year: v.year,
      type: v.type, customType: v.customType || '', fuelType: v.fuelType,
      purchaseCost: v.purchaseCost?.toString() || '', notes: v.notes || '', status: v.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null,
      };
      if (editingVehicle) {
        await api.put(`/vehicles/${editingVehicle.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Vehicle updated successfully.', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
      } else {
        await api.post('/vehicles', payload);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Vehicle added successfully.', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
      }
      setFormOpen(false);
      fetchVehicles();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Error', text: axiosErr.response?.data?.message || 'Operation failed.', background: '#1e293b', color: '#f1f5f9' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (v: Vehicle) => {
    const result = await Swal.fire({
      title: 'Retire Vehicle?',
      text: `Are you sure you want to retire ${v.plateNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, retire it!',
      background: '#1e293b',
      color: '#f1f5f9',
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/vehicles/${v.id}`);
        Swal.fire({ icon: 'success', title: 'Retired!', text: 'Vehicle has been retired.', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
        fetchVehicles();
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        Swal.fire({ icon: 'error', title: 'Error', text: axiosErr.response?.data?.message || 'Failed to retire vehicle.', background: '#1e293b', color: '#f1f5f9' });
      }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Vehicle Fleet</Typography>
        {canManage && (
          <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={openAddForm}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } }}>
            Add Vehicle
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search vehicles..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><FontAwesomeIcon icon={faSearch} style={{ color: '#64748b', fontSize: 14 }} /></InputAdornment> } }}
        />
        <TextField size="small" select label="Type" value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All Types</MenuItem>
          {['van', 'truck', 'car', 'bus', 'motorcycle', 'suv', 'other'].map(t => (
            <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
          ))}
        </TextField>
        <TextField size="small" select label="Status" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="">All Status</MenuItem>
          {['available', 'assigned', 'maintenance', 'retired'].map(s => (
            <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Vehicle Grid */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
            </Grid>
          ))
        ) : vehicles.length === 0 ? (
          <Grid size={12}>
            <Box sx={{ textAlign: 'center', py: 8, color: '#64748b' }}>
              <FontAwesomeIcon icon={faCar} style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
              <Typography variant="h6">No vehicles found</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>Try adjusting your filters</Typography>
            </Box>
          </Grid>
        ) : (
          vehicles.map((v) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={v.id}>
              <Card sx={{
                bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148,163,184,0.08)',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'rgba(99,102,241,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
              }} onClick={() => navigate(`/vehicles/${v.id}`)}>
                <CardContent sx={{ p: 3 }}>
                  {/* Top row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 40, height: 40, borderRadius: 2,
                        bgcolor: 'rgba(99,102,241,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FontAwesomeIcon icon={vehicleTypeIcons[v.type] || faCar} style={{ color: '#818cf8', fontSize: 16 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.plateNumber}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{v.make} {v.model}</Typography>
                      </Box>
                    </Box>
                    <Chip label={v.status} size="small"
                      sx={{ bgcolor: getStatusBgColor(v.status), color: getStatusColor(v.status), fontWeight: 700, textTransform: 'capitalize' }} />
                  </Box>

                  {/* Details */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={getVehicleTypeLabel(v.type, v.customType)} size="small" variant="outlined" sx={{ borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8', fontSize: '0.75rem' }} />
                    <Chip label={v.year} size="small" variant="outlined" sx={{ borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8', fontSize: '0.75rem' }} />
                    <Chip icon={<FontAwesomeIcon icon={faGasPump} style={{ fontSize: 10, color: '#94a3b8' }} />}
                      label={v.fuelType} size="small" variant="outlined"
                      sx={{ borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'capitalize' }} />
                  </Box>

                  {/* Purchase cost */}
                  {v.purchaseCost && (
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 1 }}>
                      Cost: {formatCurrency(v.purchaseCost)}
                    </Typography>
                  )}

                  {/* Current assignment */}
                  {v.currentAssignment && (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                        Assigned to: {v.currentAssignment.driverName}
                      </Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => navigate(`/vehicles/${v.id}`)} sx={{ color: '#64748b', '&:hover': { color: '#818cf8' } }}>
                        <FontAwesomeIcon icon={faEye} style={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    {canManage && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEditForm(v)} sx={{ color: '#64748b', '&:hover': { color: '#f59e0b' } }}>
                            <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Retire">
                          <IconButton size="small" onClick={() => handleDelete(v)} sx={{ color: '#64748b', '&:hover': { color: '#ef4444' } }}
                            disabled={v.status === 'retired'}>
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Plate Number" value={formData.plateNumber}
                onChange={e => setFormData({ ...formData, plateNumber: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Year" type="number" value={formData.year}
                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Make" value={formData.make}
                onChange={e => setFormData({ ...formData, make: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Model" value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Type" value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as VehicleType })}>
                {['van', 'truck', 'car', 'bus', 'motorcycle', 'suv', 'other'].map(t => (
                  <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {formData.type === 'other' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Custom Type" value={formData.customType}
                  onChange={e => setFormData({ ...formData, customType: e.target.value })} required />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Fuel Type" value={formData.fuelType}
                onChange={e => setFormData({ ...formData, fuelType: e.target.value })}>
                {['petrol', 'diesel', 'electric', 'hybrid'].map(f => (
                  <MenuItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Purchase Cost" type="number" value={formData.purchaseCost}
                onChange={e => setFormData({ ...formData, purchaseCost: e.target.value })} />
            </Grid>
            {editingVehicle && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Status" value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as VehicleStatus })}>
                  {['available', 'assigned', 'maintenance', 'retired'].map(s => (
                    <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid size={12}>
              <TextField fullWidth label="Notes" multiline rows={3} value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setFormOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={formLoading}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {formLoading ? 'Saving...' : editingVehicle ? 'Update' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesPage;
