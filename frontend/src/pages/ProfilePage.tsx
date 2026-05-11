import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Avatar, Chip, Divider,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faEnvelope, faPhone, faIdCard, faCalendarDays, faPenToSquare, faKey } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getRoleLabel, getRoleColor, formatDateTime } from '../utils/helpers';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        licenseNumber: user.licenseNumber || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${user?.id}`, formData);
      // Refresh user data
      const res = await api.get('/auth/me');
      localStorage.setItem('fleet_user', JSON.stringify(res.data));
      window.location.reload();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error', title: 'Error',
        text: axiosErr.response?.data?.message || 'Failed to update profile.',
        background: '#1e293b', color: '#f1f5f9',
      });
    } finally {
      setLoading(false);
      setEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: 'warning', title: 'Mismatch',
        text: 'New password and confirmation do not match.',
        background: '#1e293b', color: '#f1f5f9',
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: 'warning', title: 'Too Short',
        text: 'Password must be at least 6 characters.',
        background: '#1e293b', color: '#f1f5f9',
      });
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/${user?.id}`, { password: passwordData.newPassword });
      Swal.fire({
        icon: 'success', title: 'Password Changed!',
        text: 'Your password has been updated successfully.',
        background: '#1e293b', color: '#f1f5f9', confirmButtonColor: '#6366f1',
      });
      setChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error', title: 'Error',
        text: axiosErr.response?.data?.message || 'Failed to change password.',
        background: '#1e293b', color: '#f1f5f9',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelHandler = () => {
    setChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });


  }

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Profile Header */}
      <Card sx={{
        bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148,163,184,0.08)', mb: 3, overflow: 'visible',
      }}>
        {/* Gradient banner */}
        <Box sx={{
          height: 120, borderRadius: '16px 16px 0 0',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          position: 'relative',
        }} />

        <CardContent sx={{ pt: 0, px: 4, pb: 4, position: 'relative' }}>
          {/* Avatar */}
          <Avatar sx={{
            width: 88, height: 88,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            fontSize: '1.8rem', fontWeight: 800,
            border: '4px solid #1e293b',
            position: 'relative', top: -44, mb: -4,
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
          }}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Avatar>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f1f5f9' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mt: 0.5 }}>
                {user.email}
              </Typography>
              <Chip
                label={getRoleLabel(user.role)}
                size="small"
                sx={{
                  mt: 1.5,
                  bgcolor: `${getRoleColor(user.role)}20`,
                  color: getRoleColor(user.role),
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              />
            </Box>
            {!editing && (
              <Button
                variant="outlined"
                startIcon={<FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 14 }} />}
                onClick={() => setEditing(true)}
                sx={{
                  borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8',
                  '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.1)' },
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Profile Details / Edit Form */}
      <Card sx={{
        bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148,163,184,0.08)', mb: 3,
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            {editing ? 'Edit Profile' : 'Profile Details'}
          </Typography>

          {editing ? (
            <>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="First Name" value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Last Name" value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Phone" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="License Number" value={formData.licenseNumber}
                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={() => setEditing(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
                <Button variant="contained" onClick={handleUpdateProfile} disabled={loading}
                  sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </>
          ) : (
            <Grid container spacing={3}>
              {[
                { icon: faEnvelope, label: 'Email', value: user.email },
                { icon: faShieldHalved, label: 'Role', value: getRoleLabel(user.role) },
                { icon: faPhone, label: 'Phone', value: user.phone || '—' },
                { icon: faIdCard, label: 'License Number', value: user.licenseNumber || '—' },
                { icon: faCalendarDays, label: 'Member Since', value: formatDateTime(user.createdAt) },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2,
                      bgcolor: 'rgba(99,102,241,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <FontAwesomeIcon icon={item.icon} style={{ color: '#818cf8', fontSize: 16 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card sx={{
        bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148,163,184,0.08)',
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: changingPassword ? 3 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2,
                bgcolor: 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FontAwesomeIcon icon={faKey} style={{ color: '#ef4444', fontSize: 16 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Change Password</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Update your account password</Typography>
              </Box>
            </Box>
            {!changingPassword && (
              <Button variant="outlined" onClick={() => setChangingPassword(true)}
                sx={{
                  borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444',
                  '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' },
                }}>
                Change
              </Button>
            )}
          </Box>

          {changingPassword && (
            <>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <TextField fullWidth label="New Password" type="password" value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label="Confirm New Password" type="password" value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
                <Button onClick={() => cancelHandler()} sx={{ color: '#94a3b8' }}>Cancel</Button>
                <Button variant="contained" onClick={handleChangePassword} disabled={loading}
                  sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
