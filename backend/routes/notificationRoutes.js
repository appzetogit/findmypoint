const express = require('express');
const router = express.Router();
const {
  sendNotification,
  getNotificationHistory,
  deleteNotificationHistory
} = require('../controllers/notificationController');
const { adminProtect } = require('../middleware/adminAuthMiddleware');

// All notification routes are protected with admin credentials
router.post('/send', adminProtect, sendNotification);
router.get('/history', adminProtect, getNotificationHistory);
router.delete('/history/:id', adminProtect, deleteNotificationHistory);

module.exports = router;
