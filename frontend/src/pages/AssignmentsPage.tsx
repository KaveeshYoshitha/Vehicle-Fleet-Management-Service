import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Button, TextField,
  MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Skeleton,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import api from '../api/axios';
import type { Assignment, Vehicle, Driver } from '../types';
import { formatDateTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignData, setAssignData] = useState({ vehicleId: '', driverId: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const [assignRes, vehicleRes, driverRes] = await Promise.all([
        api.get('/assignments', { params }),
        api.get('/vehicles'),
        api.get('/users/drivers'),
      ]);
      setAssignments(assignRes.data);
      setVehicles(vehicleRes.data);
      setDrivers(driverRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const availableVehicles = vehicles.filter(v => v.status === 'available');

  const handleAssign = async () => {
    if (!assignData.vehicleId || !assignData.driverId) {
      Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Please select a vehicle and a driver.', background: '#1e293b', color: '#f1f5f9' });
      return;
    }
    setFormLoading(true);
    try {
      await api.post('/assignments', {
        vehicleId: parseInt(assignData.vehicleId),
        driverId: parseInt(assignData.driverId),
        notes: assignData.notes || null,
      });
      Swal.fire({ icon: 'success', title: 'Assigned!', text: 'Vehicle assigned successfully.', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
      setAssignOpen(false);
      setAssignData({ vehicleId: '', driverId: '', notes: '' });
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Error', text: axiosErr.response?.data?.message || 'Assignment failed.', background: '#1e293b', color: '#f1f5f9' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async (a: Assignment) => {
    const result = await Swal.fire({
      title: 'Return Vehicle?',
      text: `Return ${a.vehiclePlate} from ${a.driverName}?`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#10b981', cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, return it', background: '#1e293b', color: '#f1f5f9',
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/assignments/${a.id}/return`);
      Swal.fire({ icon: 'success', title: 'Returned!', text: 'Vehicle returned successfully.', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Error', text: axiosErr.response?.data?.message || 'Return failed.', background: '#1e293b', color: '#f1f5f9' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Assignments</Typography>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => setAssignOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } }}>
          Assign Vehicle
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" select label="Status" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="returned">Returned</MenuItem>
        </TextField>
      </Box>

      <Card sx={{ bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148,163,184,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Assigned By</TableCell>
                  <TableCell>Assigned At</TableCell>
                  <TableCell>Returned At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                      No assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((a) => (
                    <TableRow key={a.id} sx={{
                      bgcolor: !a.returnedAt ? 'rgba(245,158,11,0.04)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' },
                    }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.vehiclePlate}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{a.vehicleName}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{a.driverName}</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{a.assignedBy}</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{formatDateTime(a.assignedAt)}</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{formatDateTime(a.returnedAt)}</TableCell>
                      <TableCell>
                        <Chip label={a.returnedAt ? 'Returned' : 'Active'} size="small"
                          sx={{
                            bgcolor: a.returnedAt ? 'rgba(107,114,128,0.15)' : 'rgba(16,185,129,0.15)',
                            color: a.returnedAt ? '#9ca3af' : '#10b981', fontWeight: 600,
                          }} />
                      </TableCell>
                      <TableCell align="right">
                        {!a.returnedAt && (
                          <Button size="small" variant="outlined" startIcon={<FontAwesomeIcon icon={faRotateLeft} style={{ fontSize: 12 }} />}
                            onClick={() => handleReturn(a)}
                            sx={{ borderColor: '#10b981', color: '#10b981', '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16,185,129,0.1)' }, textTransform: 'none', fontSize: '0.8rem' }}>
                            Return
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Vehicle</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField fullWidth select label="Vehicle" value={assignData.vehicleId}
                onChange={e => setAssignData({ ...assignData, vehicleId: e.target.value })} required>
                {availableVehicles.length === 0 ? (
                  <MenuItem disabled>No available vehicles</MenuItem>
                ) : (
                  availableVehicles.map(v => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.plateNumber} — {v.make} {v.model}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField fullWidth select label="Driver" value={assignData.driverId}
                onChange={e => setAssignData({ ...assignData, driverId: e.target.value })} required>
                {drivers.length === 0 ? (
                  <MenuItem disabled>No drivers available</MenuItem>
                ) : (
                  drivers.map(d => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.firstName} {d.lastName} {d.licenseNumber ? `(${d.licenseNumber})` : ''}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Notes" multiline rows={3} value={assignData.notes}
                onChange={e => setAssignData({ ...assignData, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setAssignOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={formLoading}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {formLoading ? 'Assigning...' : 'Assign Vehicle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentsPage;
