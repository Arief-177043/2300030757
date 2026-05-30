const axios = require('axios');
const prisma = require('../utils/prisma');

const TYPE_WEIGHTS = { Placement: 30, Result: 20, Event: 10 };
const EXTERNAL_TOKEN = process.env.EVALUATION_SERVICE_TOKEN;
const EXTERNAL_URL = process.env.EVALUATION_SERVICE_URL || 'http://4.224.186.213/evaluation-service/notifications';

const getRecencyScore = (createdAt) => {
  const diffHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return 20;
  if (diffHours < 24) return 15;
  if (diffHours < 168) return 10;
  return 5;
};

const computePriority = (n) => (TYPE_WEIGHTS[n.type] || 10) + getRecencyScore(n.createdAt);

const getPriorityNotifications = async (studentId) => {
  let externalNotifications = [];
  try {
    const response = await axios.get(EXTERNAL_URL, {
      timeout: 5000,
      headers: { Authorization: `Bearer ${EXTERNAL_TOKEN}` },
      params: { limit: 50, page: 1 },
    });
    const data = response.data;
    const list = Array.isArray(data) ? data : data.notifications || [];
    externalNotifications = list.map((n) => ({
      id: n.id || String(Math.random()),
      studentId: n.studentId || studentId,
      type: ['Placement', 'Result', 'Event'].includes(n.type) ? n.type : 'Event',
      message: n.message || n.Message || '',
      isRead: n.isRead || false,
      createdAt: n.createdAt || n.Timestamp || new Date().toISOString(),
      source: 'external',
    }));
  } catch (err) {
    console.error('External service error:', err.message);
    externalNotifications = [];
  }

  const localNotifications = await prisma.notification.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const combined = [
    ...localNotifications.map((n) => ({ ...n, source: 'local' })),
    ...externalNotifications,
  ];

  const scored = combined
    .map((n) => ({ ...n, priorityScore: computePriority(n) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return { notifications: scored.slice(0, 10) };
};

module.exports = { getPriorityNotifications };