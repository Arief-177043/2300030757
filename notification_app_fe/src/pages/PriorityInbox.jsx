import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, CircularProgress,
  Alert, Stack, LinearProgress, Tooltip, IconButton,
} from '@mui/material';
import { Star, Refresh, EmojiEvents, Info } from '@mui/icons-material';
import { getPriorityNotifications } from '../services/notifications';

const TYPE_COLORS = { Placement: '#1a56db', Result: '#059669', Event: '#d97706' };
const TYPE_WEIGHTS = { Placement: 30, Result: 20, Event: 10 };
const MAX_SCORE = 50;

const ScoreBadge = ({ score }) => {
  const pct = (score / MAX_SCORE) * 100;
  const color = score >= 40 ? '#059669' : score >= 30 ? '#1a56db' : '#d97706';
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
      <Box
        sx={{
          width: 52, height: 52, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          border: `3px solid ${color}`, bgcolor: `${color}10`,
        }}
      >
        <Typography variant="caption" fontWeight={800} color={color} fontSize={13}>
          {score}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" mt={0.5} fontSize={10}>
        score
      </Typography>
    </Box>
  );
};

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPriority = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPriorityNotifications();
      setNotifications(res.data.notifications || []);
    } catch {
      setError('Failed to load priority notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriority();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: '#f59e0b', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700} color="#1a1f36">
              Priority Inbox
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Top 10 notifications ranked by priority score
          </Typography>
        </Box>
        <IconButton onClick={fetchPriority} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>

      <Card sx={{ mb: 3, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
            <Info sx={{ color: '#d97706', fontSize: 18 }} />
            <Typography variant="body2" fontWeight={700} color="#92400e">
              Priority Score Formula
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
            {[
              { label: 'Placement', pts: 30, color: '#1a56db' },
              { label: 'Result', pts: 20, color: '#059669' },
              { label: 'Event', pts: 10, color: '#d97706' },
            ].map((t) => (
              <Chip
                key={t.label}
                label={`${t.label}: ${t.pts}pts`}
                size="small"
                sx={{ bgcolor: `${t.color}15`, color: t.color, fontWeight: 700 }}
              />
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              + Recency: &lt;1h=20, &lt;24h=15, &lt;7d=10, older=5
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <EmojiEvents sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
              No priority notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Notifications will appear here once available
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {notifications.map((n, index) => (
            <Card
              key={n.id || index}
              sx={{
                borderLeft: '4px solid',
                borderLeftColor: TYPE_COLORS[n.type] || '#6366f1',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateX(4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      bgcolor: index < 3 ? '#fef3c7' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" fontWeight={800} color={index < 3 ? '#d97706' : '#64748b'}>
                      #{index + 1}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={n.type}
                        size="small"
                        sx={{
                          bgcolor: `${TYPE_COLORS[n.type] || '#6366f1'}18`,
                          color: TYPE_COLORS[n.type] || '#6366f1',
                          fontWeight: 700,
                          height: 22,
                        }}
                      />
                      {n.source && (
                        <Chip
                          label={n.source === 'external' ? 'External' : 'Local'}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10 }}
                        />
                      )}
                      {!n.isRead && (
                        <Chip label="Unread" size="small" color="primary" sx={{ height: 20 }} />
                      )}
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="#1a1f36" sx={{ lineHeight: 1.6 }}>
                      {n.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Type weight: {TYPE_WEIGHTS[n.type] || 10}pts
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recency: {(n.priorityScore || 0) - (TYPE_WEIGHTS[n.type] || 10)}pts
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Priority Score</Typography>
                        <Typography variant="caption" fontWeight={700} color={TYPE_COLORS[n.type]}>
                          {n.priorityScore}/{MAX_SCORE}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={((n.priorityScore || 0) / MAX_SCORE) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#f1f5f9',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: TYPE_COLORS[n.type] || '#6366f1',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <ScoreBadge score={n.priorityScore || 0} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
