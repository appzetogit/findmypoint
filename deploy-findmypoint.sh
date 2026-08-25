#!/bin/bash

# Exit on any error
set -e

PROJECT="/var/www/html/findmypoint"
FRONTEND="$PROJECT/frontend"
BACKEND="$PROJECT/backend"
WEBROOT="/var/www/findmypoint"

echo "=========================================="
echo "🚀 FindMyPoint Deployment Started"
echo "=========================================="

# ==========================================
# 0. GIT PULL / SYNC LATEST CODE
# ==========================================
echo ""
echo "📥 Pulling latest code from GitHub..."
cd "$PROJECT"

# Fetch latest branch changes and hard reset to match remote (handles force pushes cleanly)
git fetch origin main
git reset --hard origin/main

echo "✅ Latest code pulled successfully!"

# ==========================================
# 1. FRONTEND BUILD & DEPLOY
# ==========================================
echo ""
echo "📦 Deploying Frontend..."
cd "$FRONTEND"

echo "→ Installing frontend dependencies..."
npm install

echo "→ Building frontend..."
npm run build

echo "→ Publishing frontend files to $WEBROOT..."
mkdir -p "$WEBROOT"
rm -rf "$WEBROOT"/*
cp -r dist/* "$WEBROOT/"

# Ensure correct permissions for Nginx
if id "www-data" &>/dev/null; then
    chown -R www-data:www-data "$WEBROOT"
fi

echo "✅ Frontend deployed successfully"

# ==========================================
# 2. BACKEND RESTART
# ==========================================
echo ""
echo "🔧 Deploying Backend..."
cd "$BACKEND"

echo "→ Installing backend dependencies..."
npm install

echo "→ Restarting backend with PM2..."
if pm2 describe findmypoint-api > /dev/null 2>&1; then
    pm2 restart findmypoint-api --update-env
else
    pm2 start server.js --name findmypoint-api
fi

pm2 save
echo "✅ Backend deployed successfully"

# Ensure sitemap.xml and robots.txt are directly available in WEBROOT
echo "→ Generating sitemap.xml and robots.txt into $WEBROOT..."
sleep 2
curl -s http://127.0.0.1:5000/sitemap.xml > "$WEBROOT/sitemap.xml" || true
curl -s http://127.0.0.1:5000/robots.txt > "$WEBROOT/robots.txt" || true
if id "www-data" &>/dev/null; then
    chown -R www-data:www-data "$WEBROOT"
fi

# ==========================================
# 3. NGINX
# ==========================================
echo ""
echo "🌐 Checking Nginx configuration..."
nginx -t
systemctl reload nginx

echo "✅ Nginx reloaded successfully"

# ==========================================
# 4. STATUS SUMMARY
# ==========================================
echo ""
echo "=========================================="
echo "📊 PM2 STATUS"
echo "=========================================="
pm2 status

echo ""
echo "=========================================="
echo "✅ FindMyPoint Deployment Finished!"
echo "🌍 https://findmypoint.app"
echo "=========================================="
