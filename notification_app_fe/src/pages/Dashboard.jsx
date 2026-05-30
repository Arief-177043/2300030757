import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Alert, Chip, Avatar, Button,
} from '@mui/material';
import {
  Notifications as NotifIcon, MarkEmailRead, Work, Assessment,
  Event, TrendingUp, ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, getUnreadNotifications } from '../services/notifications';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="#1a1f36">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}18`, width: 48, height: 48 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, unreadRes, placementRes, resultRes, eventRes] = await Promise.all([
          getNotifications({ limit: 1 }),
          getUnreadNotifications({ limit: 1 }),
          getNotifications({ type: 'Placement', limit: 1 }),
          getNotifications({ type: 'Result', limit: 1 }),
          getNotifications({ type: 'Event', limit: 1 }),
        ]);
        setStats({
          total: allRes.data.pagination.total,
          unread: unreadRes.data.pagination.total,
          placement: placementRes.data.pagination.total,
          result: resultRes.data.pagination.total,
          event: eventRes.data.pagination.total,
        });

        const recentRes = await getNotifications({ limit: 5, sortOrder: 'desc' });
        setRecent(recentRes.data.notifications);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const typeColor = { Placement: '#1a56db', Result: '#059669', Event: '#d97706' };
  const typeIcon = { Placement: '💼', Result: '📊', Event: '🎯' };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} color="#1a1f36">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Student ID: {user?.studentId} · Here&apos;s your notification overview
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {stats && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={6} md={4} lg={2.4}>
            <StatCard title="Total" value={stats.total} icon={<NotifIcon />} color="#6366f1" />
          </Grid>
          <Grid item xs={6} md={4} lg={2.4}>
            <StatCard title="Unread" value={stats.unread} icon={<MarkEmailRead />} color="#ef4444" subtitle="Needs attention" />
          </Grid>
          <Grid item xs={4} md={4} lg={2.4}>
            <StatCard title="Placements" value={stats.placement} icon={<Work />} color="#1a56db" />
          </Grid>
          <Grid item xs={4} md={6} lg={2.4}>
            <StatCard title="Results" value={stats.result} icon={<Assessment />} color="#059669" />
          </Grid>
          <Grid item xs={4} md={6} lg={2.4}>
            <StatCard title="Events" value={stats.event} icon={<Event />} color="#d97706" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" fontWeight={700} color="#1a1f36">
                  Recent Notifications
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/notifications')}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  View All
                </Button>
              </Box>

              {recent.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <NotifIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">No notifications yet</Typography>
                </Box>
              ) : (
                recent.map((n, i) => (
                  <Box
                    key={n.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: n.isRead ? 'transparent' : '#eff6ff',
                      border: '1px solid',
                      borderColor: n.isRead ? '#f1f5f9' : '#bfdbfe',
                    }}
                  >
                    <Box sx={{ fontSize: 20, mt: 0.2 }}>{typeIcon[n.type]}</Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                          label={n.type}
                          size="small"
                          sx={{
                            bgcolor: `${typeColor[n.type]}18`,
                            color: typeColor[n.type],
                            height: 20,
                          }}
                        />
                        {!n.isRead && (
                          <Chip label="New" size="small" color="primary" sx={{ height: 20 }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="#1a1f36" fontWeight={n.isRead ? 400 : 600}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <TrendingUp sx={{ color: '#7c3aed' }} />
                <Typography variant="h6" fontWeight={700} color="#1a1f36">
                  Quick Actions
                </Typography>
              </Box>
              {[
                { label: 'View All Notifications', path: '/notifications', color: '#1a56db' },
                { label: 'Priority Inbox', path: '/priority', color: '#7c3aed' },
              ].map((item) => (
                <Button
                  key={item.path}
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(item.path)}
                  endIcon={<ArrowForward />}
                  sx={{ mb: 1.5, justifyContent: 'space-between', borderColor: item.color, color: item.color, '&:hover': { bgcolor: `${item.color}08` } }}
                >
                  {item.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {stats && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#1a1f36" mb={2}>
                  Notification Mix
                </Typography>
                {[
                  { label: 'Placements', count: stats.placement, color: '#1a56db', total: stats.total },
                  { label: 'Results', count: stats.result, color: '#059669', total: stats.total },
                  { label: 'Events', count: stats.event, color: '#d97706', total: stats.total },
                ].map((item) => (
                  <Box key={item.label} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.count}</Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          height: '100%',
                          width: item.total ? `${(item.count / item.total) * 100}%` : '0%',
                          bgcolor: item.color,
                          borderRadius: 3,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
