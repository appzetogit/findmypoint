const Notification = require('../models/Notification');
const firebaseService = require('../services/firebaseService');

/**
 * @desc    Send push notification to all users (auto-expires in 3 days)
 * @route   POST /api/notifications/send
 * @access  Private (Admin)
 */
const sendNotification = async (req, res) => {
  try {
    const { title, body, description, imageUrl } = req.body;
    const effectiveBody = (body || description || '').trim();

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Notification title is required.' });
    }

    if (!effectiveBody) {
      return res.status(400).json({ success: false, message: 'Notification description is required.' });
    }

    const adminUser = req.admin || { username: 'Admin' };

    const result = await firebaseService.broadcastNotification({
      title: title.trim(),
      body: effectiveBody,
      imageUrl: imageUrl ? imageUrl.trim() : null,
      clickUrl: '/',
      adminUser
    });

    if (!result.success && result.recipientCount === 0) {
      return res.status(200).json({
        success: false,
        message: result.message || 'No registered devices found.',
        notification: result.notification
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ [SEND NOTIFICATION CONTROLLER ERROR]:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error sending notification' });
  }
};

/**
 * @desc    Get sent notifications history with pagination
 * @route   GET /api/notifications/history
 * @access  Private (Admin)
 */
const getNotificationHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
    const search = req.query.search ? req.query.search.trim() : '';

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ [GET NOTIFICATION HISTORY ERROR]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete notification record from history
 * @route   DELETE /api/notifications/history/:id
 * @access  Private (Admin)
 */
const deleteNotificationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification record not found' });
    }

    res.status(200).json({ success: true, message: 'Notification record deleted successfully' });
  } catch (error) {
    console.error('❌ [DELETE NOTIFICATION HISTORY ERROR]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendNotification,
  getNotificationHistory,
  deleteNotificationHistory
};
