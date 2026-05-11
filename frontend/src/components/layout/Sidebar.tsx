import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, IconButton, useMediaQuery, useTheme, Avatar,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGaugeHigh, faCar, faUsers, faClipboardList,
  faClockRotateLeft, faChevronLeft, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED = 72;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { label: 'Dashboard', icon: faGaugeHigh, path: '/' },
    { label: 'Vehicles', icon: faCar, path: '/vehicles' },
    { label: 'Assignments', icon: faClipboardList, path: '/assignments' },
    ...(user?.role === 'admin' || user?.role === 'fleet_manager'
      ? [{ label: 'Users', icon: faUsers, path: '/users' }]
      : []),
    ...(user?.role === 'admin'
      ? [{ label: 'Audit Logs', icon: faClockRotateLeft, path: '/audit-logs' }]
      : []),
  ];

  const currentWidth = collapsed && !isMobile ? DRAWER_COLLAPSED : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0f172a' }}>
      {/* Logo area */}
      <Box sx={{
        p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        minHeight: 64,
      }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FontAwesomeIcon icon={faCar} style={{ color: '#fff', fontSize: 16 }} />
        </Box>
        {(!collapsed || isMobile) && (
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9', whiteSpace: 'nowrap' }}>
            FleetPro
          </Typography>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              onClick={() => { navigate(item.path); if (isMobile) onMobileClose(); }}
              sx={{
                borderRadius: 2, mb: 0.5, py: 1.2,
                px: collapsed && !isMobile ? 2.5 : 2,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                bgcolor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: isActive ? '#818cf8' : '#94a3b8',
                '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8' },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{
                minWidth: collapsed && !isMobile ? 0 : 40,
                color: 'inherit', justifyContent: 'center',
              }}>
                <FontAwesomeIcon icon={item.icon} style={{ fontSize: 18 }} />
              </ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* User section */}
      {(!collapsed || isMobile) && user && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(148,163,184,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              fontSize: '0.85rem', fontWeight: 700,
            }}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>
                {user.role?.replace('_', ' ')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Collapse toggle */}
      {!isMobile && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
          <IconButton onClick={onToggleCollapse} size="small" sx={{ color: '#64748b' }}>
            <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} style={{ fontSize: 12 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: '#0f172a', borderRight: '1px solid rgba(148,163,184,0.1)' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer — width on root reserves space in the flex layout */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: currentWidth,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          '& .MuiDrawer-paper': {
            width: currentWidth,
            bgcolor: '#0f172a',
            borderRight: '1px solid rgba(148,163,184,0.1)',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
export { DRAWER_WIDTH, DRAWER_COLLAPSED };
