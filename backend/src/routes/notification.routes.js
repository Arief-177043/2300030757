const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const {
  getNotifications,
  getUnreadNotifications,
  createNotification,
  markAsRead,
  getPriorityInbox,
} = require('../controllers/notification.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread', getUnreadNotifications);
router.get('/priority', getPriorityInbox);

router.post(
  '/',
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('type').isIn(['Placement', 'Result', 'Event']).withMessage('Invalid notification type'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  createNotification
);

router.patch('/:id/read', markAsRead);

module.exports = router;
