import api from './api';

export const getNotifications = (params) => api.get('/notifications', { params });

export const getUnreadNotifications = (params) => api.get('/notifications/unread', { params });

export const createNotification = (data) => api.post('/notifications', data);

export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);

export const getPriorityNotifications = () => api.get('/notifications/priority');
