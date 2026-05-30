const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { getPriorityNotifications } = require('../services/priority.service');

const getNotifications = async (req, res, next) => {
  try {
    const { studentId } = req.user;
    const {
      page = 1,
      limit = 10,
      type,
      isRead,
      search,
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { studentId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (search) where.message = { contains: search, mode: 'insensitive' };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getUnreadNotifications = async (req, res, next) => {
  try {
    const { studentId } = req.user;
    const { page = 1, limit = 10, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { studentId, isRead: false };
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { studentId, type, message } = req.body;

    const user = await prisma.user.findUnique({ where: { studentId } });
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const notification = await prisma.notification.create({
      data: { studentId, type, message },
    });

    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentId } = req.user;

    const notification = await prisma.notification.findFirst({
      where: { id, studentId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const getPriorityInbox = async (req, res, next) => {
  try {
    const { studentId } = req.user;
    const result = await getPriorityNotifications(studentId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  createNotification,
  markAsRead,
  getPriorityInbox,
};
