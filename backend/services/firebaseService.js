const path = require('path');
const fs = require('fs');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const User = require('../models/User');

let isInitialized = false;
let messagingInstance = null;

function initFirebase() {
  if (isInitialized && messagingInstance) return messagingInstance;

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './config/findmypoint-66dc1-firebase-adminsdk-fbsvc-2da3e9d71f.json';
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(__dirname, '..', serviceAccountPath);

    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

      const apps = getApps();
      const app = apps.length > 0 ? apps[0] : initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id || 'findmypoint-66dc1'
      });

      messagingInstance = getMessaging(app);
      isInitialized = true;
      console.log(`🔥 [FIREBASE ADMIN] Initialized successfully for project: ${serviceAccount.project_id}`);
    } else {
      console.warn(`⚠️ [FIREBASE ADMIN] Service account key file not found at: ${resolvedPath}`);
    }
  } catch (error) {
    console.error(`❌ [FIREBASE ADMIN] Initialization failed:`, error.message);
  }

  return messagingInstance;
}

// Auto-initialize
initFirebase();

const isConfigured = () => isInitialized;

/**
 * Send push notification to a single FCM device token
 */
const sendToToken = async (fcmToken, { title, body, data = {}, icon = '/logo.png', url = '/' }) => {
  if (!isInitialized || !fcmToken) {
    return { success: false, message: 'Firebase not configured or invalid token' };
  }

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data: {
      url: url || '/',
      ...Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
      ),
    },
    webpush: {
      fcmOptions: {
        link: url || '/'
      },
      notification: {
        icon: icon || '/logo.png',
        badge: '/logo.png',
        requireInteraction: false
      }
    }
  };

  try {
    const response = await messagingInstance.send(message);
    return { success: true, messageId: response };
  } catch (err) {
    console.error(`❌ [FCM SEND ERROR] Token: ${fcmToken.slice(0, 10)}... Error:`, err.message);
    return { success: false, error: err.message, code: err.code };
  }
};

/**
 * Send push notification to all active tokens of a User
 * Automatically prunes unregistered or invalid tokens from DB
 */
const sendToUser = async (userId, payload) => {
  if (!isInitialized) return { success: false, message: 'Firebase not configured' };

  try {
    const user = await User.findById(userId);
    if (!user) return { success: false, message: 'User not found' };

    // Collect all unique tokens
    const tokenSet = new Set();
    if (user.fcmToken) tokenSet.add(user.fcmToken);
    if (user.webFcmToken) tokenSet.add(user.webFcmToken);
    if (user.apkFcmToken) tokenSet.add(user.apkFcmToken);
    if (Array.isArray(user.fcmTokens)) {
      user.fcmTokens.forEach(t => {
        if (t && t.token) tokenSet.add(t.token);
      });
    }

    const tokens = Array.from(tokenSet).filter(Boolean);
    if (tokens.length === 0) {
      return { success: false, message: 'No registered FCM tokens for this user' };
    }

    const results = [];
    const invalidTokens = [];

    for (const token of tokens) {
      const res = await sendToToken(token, payload);
      results.push(res);
      if (!res.success && (res.code === 'messaging/registration-token-not-registered' || res.code === 'messaging/invalid-argument')) {
        invalidTokens.push(token);
      }
    }

    // Clean up stale/invalid tokens from DB
    if (invalidTokens.length > 0) {
      user.fcmTokens = (user.fcmTokens || []).filter(t => !invalidTokens.includes(t.token));
      if (invalidTokens.includes(user.fcmToken)) {
        user.fcmToken = user.fcmTokens.length > 0 ? user.fcmTokens[user.fcmTokens.length - 1].token : null;
      }
      if (invalidTokens.includes(user.webFcmToken)) user.webFcmToken = null;
      if (invalidTokens.includes(user.apkFcmToken)) user.apkFcmToken = null;
      await user.save();
    }

    return {
      success: true,
      totalSent: tokens.length,
      successCount: results.filter(r => r.success).length,
      invalidPruned: invalidTokens.length
    };
  } catch (error) {
    console.error(`❌ [FCM SEND TO USER] Error:`, error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  initFirebase,
  isConfigured,
  sendToToken,
  sendToUser
};
