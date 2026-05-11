import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, MenuItem,
  Skeleton,
} from '@mui/material';
import api from '../api/axios';
import type { AuditLog } from '../types';
import { formatDateTime } from '../utils/helpers';

const actionColors: Record<string, string> = {
  USER_CREATED: '#10b981', USER_UPDATED: '#3b82f6', USER_DEACTIVATED: '#ef4444',
  USER_LOGIN: '#8b5cf6', VEHICLE_CREATED: '#10b981', VEHICLE_UPDATED: '#3b82f6',
  VEHICLE_RETIRED: '#ef4444', ASSIGNMENT_CREATED: '#f59e0b', ASSIGNMENT_RETURNED: '#10b981',
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    try {
      const params: Record<string, string> = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity_type = entityFilter;
      const res = await api.get('/audit-logs', { params });
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [actionFilter, entityFilter]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Audit Logs</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mt: 0.5 }}>
          Complete history of all system actions
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField size="small" select label="Action" value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">All Actions</MenuItem>
          {['USER_CREATED', 'USER_UPDATED', 'USER_DEACTIVATED', 'USER_LOGIN',
            'VEHICLE_CREATED', 'VEHICLE_UPDATED', 'VEHICLE_RETIRED',
            'ASSIGNMENT_CREATED', 'ASSIGNMENT_RETURNED'].map(a => (
              <MenuItem key={a} value={a}>{a.replace(/_/g, ' ')}</MenuItem>
            ))}
        </TextField>
        <TextField size="small" select label="Entity" value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All Entities</MenuItem>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="vehicle">Vehicle</MenuItem>
          <MenuItem value="assignment">Assignment</MenuItem>
        </TextField>
      </Box>

      <Card sx={{ bgcolor: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(148,163,184,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(99,102,241,0.05)' } }}>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.userName}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{log.userEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={log.action.replace(/_/g, ' ')} size="small"
                          sx={{
                            bgcolor: `${actionColors[log.action] || '#6b7280'}20`,
                            color: actionColors[log.action] || '#6b7280',
                            fontWeight: 700, fontSize: '0.7rem',
                          }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={`${log.entityType} #${log.entityId}`} size="small" variant="outlined"
                          sx={{ borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, color: '#64748b', fontSize: '0.8rem' }}>
                        {log.details ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {Object.entries(log.details as Record<string, unknown>).map(([key, value]) => (
                              <Typography key={key} sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                <Box component="span" sx={{ color: '#64748b', textTransform: 'capitalize' }}>
                                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}:
                                </Box>{' '}
                                {typeof value === 'object' ? Object.values(value as Record<string, unknown>).join(', ') : String(value)}
                              </Typography>
                            ))}
                          </Box>
                        ) : '—'}
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

export default AuditLogPage;
