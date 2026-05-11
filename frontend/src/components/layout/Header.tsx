import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

const Header = ({ onMenuToggle, title }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          onClick={onMenuToggle}
          sx={{ display: { md: 'none' }, color: '#94a3b8' }}
        >
          <FontAwesomeIcon icon={faBars} />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontSize: '1.1rem' }}>
          {title || 'Dashboard'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              fontSize: '0.85rem', fontWeight: 700,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1.5, bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)',
                  minWidth: 200,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)' }} />
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ gap: 1.5, py: 1 }}>
              <FontAwesomeIcon icon={faUser} style={{ fontSize: 14, color: '#94a3b8' }} />
              <Typography sx={{ fontSize: '0.85rem' }}>Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1, color: '#ef4444' }}>
              <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: '0.85rem' }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
