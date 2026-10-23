const path = require('path');
const fs = require('fs');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const User = require('../models/User');
const Notification = require('../models/Notification');

let isInitialized = false;
let messagingInstance = null;

function resolveServiceAccountFile() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const customPath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      : path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (fs.existsSync(customPath)) return customPath;
  }

  const configDir = path.join(__dirname, '..', 'config');
  const candidateNames = [
    'findmypoint-66dc1-firebase-adminsdk-fbsvc-d71f89a182.json',
    'findmypoint-66dc1-firebase-adminsdk-fbsvc-2da3e9d71f.json'
  ];

  for (const name of candidateNames) {
    const candidatePath = path.join(configDir, name);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  // Fallback: look for any file matching firebase-adminsdk in config directory
  if (fs.existsSync(configDir)) {
    const files = fs.readdirSync(configDir);
    const fbsvcFile = files.find(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));
    if (fbsvcFile) {
      return path.join(configDir, fbsvcFile);
    }
  }

  return null;
}

function initFirebase() {
  if (isInitialized && messagingInstance) return messagingInstance;

  try {
    const resolvedPath = resolveServiceAccountFile();

    if (resolvedPath && fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

      const apps = getApps();
      const app = apps.length > 0 ? apps[0] : initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id || 'findmypoint-66dc1'
      });

      messagingInstance = getMessaging(app);
      isInitialized = true;
      console.log(`🔥 [FIREBASE ADMIN] Initialized successfully using: ${path.basename(resolvedPath)} for project: ${serviceAccount.project_id}`);
    } else {
      console.warn(`⚠️ [FIREBASE ADMIN] Service account key file not found in config directory.`);
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
 * Helper to ensure image URLs are fully qualified absolute URLs
 * so FCM can fetch and render them across devices.
 */
const resolveFullImageUrl = (img) => {
  if (!img || typeof img !== 'string') return null;
  const trimmed = img.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }
  const baseUrl = (process.env.BACKEND_URL || 'https://findmypoint.app').replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Universal FCM message payload with image support and tag deduplication.
 * Ensures notifications display reliably on Android APK (system tray) and Web browsers.
 */
function buildFcmMessagePayload({ title, body, imageUrl = null, icon = '/logo.png', url = '/', data = {} }) {
  const fullImageUrl = resolveFullImageUrl(imageUrl);
  const notifId = `fmp-${Date.now()}`;

  const notificationPayload = {
    title: String(title || ''),
    body: String(body || ''),
  };
  if (fullImageUrl) {
    notificationPayload.imageUrl = fullImageUrl;
  }

  const stringData = {
    title: String(title || ''),
    body: String(body || ''),
    description: String(body || ''),
    url: url || '/',
    icon: icon || '/logo.png',
    tag: notifId,
    notificationId: notifId,
    ...(fullImageUrl ? { image: fullImageUrl, imageUrl: fullImageUrl } : {}),
    ...Object.fromEntries(
      Object.entries(data || {}).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
    ),
  };

  const webpush = {
    headers: {
      Urgency: 'high'
    },
    fcmOptions: {
      link: url || '/'
    },
    notification: {
      icon: icon || '/logo.png',
      badge: '/logo.png',
      tag: notifId, // Collapses duplicates by tag
      renotify: true,
      requireInteraction: false,
      ...(fullImageUrl ? { image: fullImageUrl } : {})
    }
  };

  const android = {
    priority: 'high',
    notification: {
      sound: 'default',
      channelId: 'default',
      tag: notifId,
      ...(fullImageUrl ? { imageUrl: fullImageUrl } : {})
    }
  };

  const apns = {
    payload: {
      aps: {
        'mutable-content': 1
      }
    },
    ...(fullImageUrl ? { fcm_options: { image: fullImageUrl } } : {})
  };

  return {
    notification: notificationPayload,
    data: stringData,
    webpush,
    android,
    apns,
  };
}

/**
 * Send push notification to a single FCM device token
 */
const sendToToken = async (fcmToken, { title, body, data = {}, icon = '/logo.png', url = '/', imageUrl = null }) => {
  if (!isInitialized || !fcmToken) {
    return { success: false, message: 'Firebase not configured or invalid token' };
  }

  const basePayload = buildFcmMessagePayload({ title, body, imageUrl, url, icon, data });
  const message = {
    token: fcmToken,
    ...basePayload
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

/**
 * Send multicast notification in batches of up to 500 tokens
 */
const sendMulticastBatch = async (tokens, payload) => {
  if (!isInitialized) return { success: false, message: 'Firebase not configured', totalSent: 0, successCount: 0, failureCount: 0, invalidTokens: [] };
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { success: true, message: 'No tokens provided', totalSent: 0, successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  const basePayload = buildFcmMessagePayload(payload);
  const CHUNK_SIZE = 500;
  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    const chunk = tokens.slice(i, i + CHUNK_SIZE);
    try {
      let batchResponse;
      if (typeof messagingInstance.sendEachForMulticast === 'function') {
        batchResponse = await messagingInstance.sendEachForMulticast({
          tokens: chunk,
          ...basePayload
        });
      } else if (typeof messagingInstance.sendMulticast === 'function') {
        batchResponse = await messagingInstance.sendMulticast({
          tokens: chunk,
          ...basePayload
        });
      } else {
        const responses = [];
        for (const t of chunk) {
          responses.push(await sendToToken(t, payload));
        }
        batchResponse = {
          responses,
          successCount: responses.filter(r => r.success).length,
          failureCount: responses.filter(r => !r.success).length
        };
      }

      successCount += batchResponse.successCount;
      failureCount += batchResponse.failureCount;

      if (batchResponse.responses && Array.isArray(batchResponse.responses)) {
        batchResponse.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errCode = resp.error.code;
            if (errCode === 'messaging/registration-token-not-registered' || errCode === 'messaging/invalid-argument') {
              invalidTokens.push(chunk[idx]);
            }
          }
        });
      }
    } catch (batchErr) {
      console.error(`❌ [FCM MULTICAST ERROR] Batch chunk ${i / CHUNK_SIZE}:`, batchErr.message);
      failureCount += chunk.length;
    }
  }

  return {
    success: true,
    totalSent: tokens.length,
    successCount,
    failureCount,
    invalidTokens
  };
};

/**
 * Remove invalid/unregistered tokens from all User records in DB
 */
const pruneInvalidTokensFromDB = async (invalidTokens) => {
  if (!Array.isArray(invalidTokens) || invalidTokens.length === 0) return;

  try {
    const setOfInvalid = new Set(invalidTokens);

    const affectedUsers = await User.find({
      $or: [
        { fcmToken: { $in: invalidTokens } },
        { webFcmToken: { $in: invalidTokens } },
        { apkFcmToken: { $in: invalidTokens } },
        { 'fcmTokens.token': { $in: invalidTokens } }
      ]
    });

    for (const user of affectedUsers) {
      let changed = false;
      if (user.fcmToken && setOfInvalid.has(user.fcmToken)) {
        user.fcmToken = null;
        changed = true;
      }
      if (user.webFcmToken && setOfInvalid.has(user.webFcmToken)) {
        user.webFcmToken = null;
        changed = true;
      }
      if (user.apkFcmToken && setOfInvalid.has(user.apkFcmToken)) {
        user.apkFcmToken = null;
        changed = true;
      }
      if (Array.isArray(user.fcmTokens) && user.fcmTokens.length > 0) {
        const initialLen = user.fcmTokens.length;
        user.fcmTokens = user.fcmTokens.filter(t => !setOfInvalid.has(t.token));
        if (user.fcmTokens.length !== initialLen) {
          changed = true;
          if (!user.fcmToken && user.fcmTokens.length > 0) {
            user.fcmToken = user.fcmTokens[user.fcmTokens.length - 1].token;
          }
        }
      }
      if (changed) {
        await user.save();
      }
    }
    console.log(`🧹 [FCM CLEANUP] Pruned ${invalidTokens.length} dead tokens across ${affectedUsers.length} users.`);
  } catch (cleanErr) {
    console.error(`⚠️ [FCM CLEANUP ERROR]:`, cleanErr.message);
  }
};

/**
 * Broadcast notification to ALL registered users and save record (auto-expires in 3 days)
 */
const broadcastNotification = async ({
  title,
  body,
  imageUrl = null,
  clickUrl = '/',
  adminUser = null
}) => {
  if (!isInitialized) {
    return { success: false, message: 'Firebase Admin not initialized. Check service account config.' };
  }

  try {
    const matchedUsers = await User.find({
      $or: [
        { fcmToken: { $ne: null } },
        { webFcmToken: { $ne: null } },
        { apkFcmToken: { $ne: null } },
        { 'fcmTokens.0': { $exists: true } }
      ]
    }).select('fcmToken webFcmToken apkFcmToken fcmTokens');

    const tokenSet = new Set();
    matchedUsers.forEach(u => {
      if (u.fcmToken) tokenSet.add(u.fcmToken);
      if (u.webFcmToken) tokenSet.add(u.webFcmToken);
      if (u.apkFcmToken) tokenSet.add(u.apkFcmToken);
      if (Array.isArray(u.fcmTokens)) {
        u.fcmTokens.forEach(t => {
          if (t?.token) tokenSet.add(t.token);
        });
      }
    });

    const tokens = Array.from(tokenSet).filter(Boolean);

    if (tokens.length === 0) {
      const notif = await Notification.create({
        title,
        body,
        imageUrl: resolveFullImageUrl(imageUrl) || imageUrl,
        clickUrl: clickUrl || '/',
        recipientCount: 0,
        successCount: 0,
        failureCount: 0,
        status: 'failed',
        sentBy: adminUser?.username || 'Admin'
      });

      return {
        success: false,
        message: 'No registered push tokens found in the database.',
        notification: notif
      };
    }

    // Send multicast
    const sendResult = await sendMulticastBatch(tokens, {
      title,
      body,
      imageUrl,
      url: clickUrl || '/'
    });

    // Prune invalid tokens asynchronously
    if (sendResult.invalidTokens && sendResult.invalidTokens.length > 0) {
      pruneInvalidTokensFromDB(sendResult.invalidTokens).catch(err => {
        console.error('Error background pruning tokens:', err);
      });
    }

    const status = sendResult.failureCount === 0
      ? 'sent'
      : (sendResult.successCount > 0 ? 'partially_sent' : 'failed');

    const notificationRecord = await Notification.create({
      title,
      body,
      imageUrl: resolveFullImageUrl(imageUrl) || imageUrl,
      clickUrl: clickUrl || '/',
      recipientCount: tokens.length,
      successCount: sendResult.successCount,
      failureCount: sendResult.failureCount,
      status,
      sentBy: adminUser?.username || 'Admin'
    });

    return {
      success: true,
      message: `Notification sent successfully to ${sendResult.successCount} of ${tokens.length} devices.`,
      notification: notificationRecord,
      totalSent: tokens.length,
      successCount: sendResult.successCount,
      failureCount: sendResult.failureCount
    };
  } catch (error) {
    console.error(`❌ [FCM BROADCAST ERROR]:`, error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  initFirebase,
  isConfigured,
  resolveFullImageUrl,
  sendToToken,
  sendToUser,
  sendMulticastBatch,
  broadcastNotification
};
