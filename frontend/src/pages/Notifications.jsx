import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Button, TextField, Select,
  MenuItem, FormControl, InputLabel, Pagination, CircularProgress,
  Alert, IconButton, Tooltip, InputAdornment, Stack, Divider,
} from '@mui/material';
import {
  Search, MarkEmailRead, FilterList, Refresh, Notifications as NotifIcon,
} from '@mui/icons-material';
import { getNotifications, markAsRead } from '../services/notifications';

const TYPE_COLORS = { Placement: '#1a56db', Result: '#059669', Event: '#d97706' };
const TYPE_BG = { Placement: '#eff6ff', Result: '#f0fdf4', Event: '#fffbeb' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [page, setPage] = useState(1);
  const [markingId, setMarkingId] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (typeFilter) params.type = typeFilter;
      if (readFilter !== '') params.isRead = readFilter;
      if (search) params.search = search;

      const res = await getNotifications(params);
      setNotifications(res.data.notifications);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, readFilter, search]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleMarkRead = async (id) => {
    setMarkingId(id);
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      setError('Failed to mark notification as read.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#1a1f36">
          All Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {pagination.total} total notifications
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} flexWrap="wrap">
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              <TextField
                size="small"
                placeholder="Search notifications..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ minWidth: 200, flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" size="small">Search</Button>
            </Box>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={handleFilterChange(setTypeFilter)}>
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Placement">Placement</MenuItem>
                <MenuItem value="Result">Result</MenuItem>
                <MenuItem value="Event">Event</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Status</InputLabel>
              <Select value={readFilter} label="Status" onChange={handleFilterChange(setReadFilter)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="false">Unread</MenuItem>
                <MenuItem value="true">Read</MenuItem>
              </Select>
            </FormControl>

            <Tooltip title="Refresh">
              <IconButton onClick={fetchNotifications} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
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
            <NotifIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600}>
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Try adjusting your filters
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <Card
              key={n.id}
              sx={{
                borderLeft: '4px solid',
                borderLeftColor: n.isRead ? '#e2e8f0' : TYPE_COLORS[n.type],
                bgcolor: n.isRead ? 'white' : TYPE_BG[n.type],
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={n.type}
                        size="small"
                        sx={{
                          bgcolor: `${TYPE_COLORS[n.type]}20`,
                          color: TYPE_COLORS[n.type],
                          fontWeight: 700,
                          height: 22,
                        }}
                      />
                      {!n.isRead && (
                        <Box
                          sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: TYPE_COLORS[n.type],
                          }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" ml="auto">
                        {new Date(n.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="#1a1f36"
                      fontWeight={n.isRead ? 400 : 600}
                      sx={{ lineHeight: 1.6 }}
                    >
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                      Student ID: {n.studentId}
                    </Typography>
                  </Box>
                  {!n.isRead && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => handleMarkRead(n.id)}
                        disabled={markingId === n.id}
                        sx={{ color: TYPE_COLORS[n.type], flexShrink: 0 }}
                      >
                        {markingId === n.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <MarkEmailRead fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
