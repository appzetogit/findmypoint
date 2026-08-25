#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Deploying FindmyPoint on VPS..."
echo "=========================================="

# Auto-detect project directory
if [ -d "/var/www/html/findmypoint" ]; then
  APP_DIR="/var/www/html/findmypoint"
elif [ -d "/var/www/findmypoint-repo" ]; then
  APP_DIR="/var/www/findmypoint-repo"
else
  APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

echo "📂 Working Directory: $APP_DIR"
cd "$APP_DIR"

# 1. Fetch and hard reset to remote main (Fixes force push & local conflicts)
echo "📥 Syncing latest changes from GitHub (main)..."
git fetch --all --prune
git reset --hard origin/main

# 2. Backend update & PM2 restart
echo "⚙️ Setting up Backend..."
cd "$APP_DIR/backend"
npm install --include=optional sharp || npm install

echo "🔄 Restarting Backend Service (PM2)..."
if pm2 list | grep -q "findmypoint-api"; then
  pm2 restart findmypoint-api --update-env
else
  pm2 restart all 2>/dev/null || pm2 start server.js --name "findmypoint-api"
fi

# 3. Frontend Build
echo "🎨 Building Frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# 4. Deploy build to Nginx Web Root (/var/www/findmypoint)
WEB_ROOT="/var/www/findmypoint"
echo "📦 Deploying Frontend to $WEB_ROOT..."
mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT:?}"/*
cp -r "$APP_DIR/frontend/dist"/* "$WEB_ROOT"/

# Generate dynamic sitemap.xml and robots.txt into WEB_ROOT for direct Nginx serving
echo "🗺️ Updating sitemap.xml and robots.txt in $WEB_ROOT..."
sleep 2
curl -s http://127.0.0.1:5000/sitemap.xml > "$WEB_ROOT/sitemap.xml" 2>/dev/null || true
curl -s http://127.0.0.1:5000/robots.txt > "$WEB_ROOT/robots.txt" 2>/dev/null || true

# Fix permissions
chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || true
chmod -R 755 "$WEB_ROOT" 2>/dev/null || true

# 5. Reload Nginx
echo "🌐 Reloading Nginx..."
if nginx -t > /dev/null 2>&1; then
  nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true
fi

echo "=========================================="
echo "🎉 FindmyPoint Deployment Finished Successfully!"
echo "🌍 https://findmypoint.app"
echo "=========================================="
pm2 status findmypoint-api 2>/dev/null || pm2 status
