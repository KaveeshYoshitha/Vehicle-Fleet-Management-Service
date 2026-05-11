import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Button, TextField,
  MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, IconButton, Tooltip, Skeleton,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faUserPlus, faPenToSquare, faUserSlash, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import api from '../api/axios';
import type { User, UserRole } from '../types';
import { getRoleLabel, getRoleColor, formatDateTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'fleet_staff' as UserRole, phone: '', licenseNumber: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const openAddForm = () => {
    setEditingUser(null);
    setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'fleet_staff', phone: '', licenseNumber: '' });
    setFormOpen(true);
  };

  const openEditForm = (u: User) => {
    setEditingUser(u);
    setFormData({
      firstName: u.firstName, lastName: u.lastName, email: u.email,
      password: '', role: u.role, phone: u.phone || '', licenseNumber: u.licenseNumber || '',
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingUser.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'User updated successfully.', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
      } else {
        await api.post('/users', formData);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'User created successfully.', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
      }
      setFormOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Swal.fire({ icon: 'error', title: 'Error', text: axiosErr.response?.data?.message || 'Operation failed.', background: '#1e293b', color: '#f1f5f9' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    if (u.isActive) {
      const result = await Swal.fire({
        title: 'Deactivate User?',
        text: `Deactivate ${u.firstName} ${u.lastName}? They will not be able to log in.`,
        icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444',
        cancelButtonColor: '#475569', confirmButtonText: 'Yes, deactivate',
        background: '#1e293b', color: '#f1f5f9',
      });
      if (!result.isConfirmed) return;
      try {
        await api.delete(`/users/${u.id}`);
        Swal.fire({ icon: 'success', title: 'Deactivated!', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
        fetchUsers();
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        Swal.fire({ icon: 'error', title: 'Error', text: axiosErr.response?.data?.message || 'Failed.', background: '#1e293b', color: '#f1f5f9' });
      }
    } else {
      try {
        await api.put(`/users/${u.id}`, { isActive: true });
        Swal.fire({ icon: 'success', title: 'Activated!', background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1' });
        fetchUsers();
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        Swal.fire({ icon: 'error', title: 'Error', text: axiosErr.response?.data?.message || 'Failed.', background: '#1e293b', color: '#f1f5f9' });
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management</Typography>
        <Button variant="contained" startIcon={<FontAwesomeIcon icon={faUserPlus} />}
          onClick={openAddForm}
          sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' } }}>
          Add User
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search users..." value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 240 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><FontAwesomeIcon icon={faSearch} style={{ color: '#64748b', fontSize: 14 }} /></InputAdornment> } }}
        />
        <TextField size="small" select label="Role" value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All Roles</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="fleet_manager">Fleet Manager</MenuItem>
          <MenuItem value="fleet_staff">Fleet Staff</MenuItem>
        </TextField>
      </Box>

      <Card sx={{ bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148,163,184,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>No users found</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={getRoleLabel(u.role)} size="small"
                          sx={{ bgcolor: `${getRoleColor(u.role)}20`, color: getRoleColor(u.role), fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{u.phone || '—'}</TableCell>
                      <TableCell>
                        <Chip label={u.isActive ? 'Active' : 'Inactive'} size="small"
                          sx={{
                            bgcolor: u.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: u.isActive ? '#10b981' : '#ef4444',
                            fontWeight: 600,
                          }} />
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>{formatDateTime(u.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEditForm(u)} sx={{ color: '#64748b', '&:hover': { color: '#f59e0b' } }}>
                              <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          {currentUser?.id !== u.id && currentUser?.role === 'admin' && (
                            <Tooltip title={u.isActive ? 'Deactivate' : 'Activate'}>
                              <IconButton size="small" onClick={() => handleToggleActive(u)}
                                sx={{ color: '#64748b', '&:hover': { color: u.isActive ? '#ef4444' : '#10b981' } }}>
                                <FontAwesomeIcon icon={u.isActive ? faUserSlash : faUserCheck} style={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="First Name" value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Last Name" value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Email" type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                type="password" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Role" value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}>
                {currentUser?.role === 'admin' && <MenuItem value="admin">Admin</MenuItem>}
                <MenuItem value="fleet_manager">Fleet Manager</MenuItem>
                <MenuItem value="fleet_staff">Fleet Staff</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="License Number" value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setFormOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={formLoading}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {formLoading ? 'Saving...' : editingUser ? 'Update' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
