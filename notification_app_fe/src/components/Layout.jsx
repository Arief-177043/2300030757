import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Divider, Badge,
  useMediaQuery, useTheme, Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, Notifications as NotificationsIcon,
  StarOutlined as PriorityIcon, Logout as LogoutIcon, School as SchoolIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 256;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
  { label: 'Priority Inbox', path: '/priority', icon: <PriorityIcon /> },
];

export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1f36', color: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SchoolIcon sx={{ color: '#60a5fa', fontSize: 28 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="white" lineHeight={1.2}>
            AffordMed
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            Campus Hiring
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ p: 2, mt: 1 }}>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#1a56db', fontSize: 14, fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} color="white" noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }} noWrap>
              ID: {user?.studentId}
            </Typography>
          </Box>
        </Box>
      </Box>
      <List sx={{ px: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'rgba(26,86,219,0.9)' : 'transparent',
                  '&:hover': { bgcolor: active ? 'rgba(26,86,219,0.9)' : 'rgba(255,255,255,0.06)' },
                  py: 1.2,
                }}
              >
                <ListItemIcon sx={{ color: active ? 'white' : '#94a3b8', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? 'white' : '#cbd5e1' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(220,38,38,0.15)' } }}>
          <ListItemIcon sx={{ color: '#f87171', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: '#f87171', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && (
        <AppBar position="fixed" sx={{ bgcolor: '#1a1f36', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
          <Toolbar>
            <IconButton color="inherit" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <SchoolIcon sx={{ color: '#60a5fa', mr: 1 }} />
            <Typography variant="h6" fontWeight={700}>AffordMed</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: '#f0f4f8',
          mt: isMobile ? 8 : 0,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
