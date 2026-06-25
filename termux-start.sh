#!/data/data/com.termux/files/usr/bin/bash
# Stream on WiFi — Termux startup script
# Run this script to start the server
# You can also set this up with Termux:Boot for auto-start on phone boot

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

PORT="${PORT:-3000}"

# Show a banner
clear
echo "╔══════════════════════════════════════════╗"
echo "║        Stream on WiFi — Termux          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Installing..."
  pkg upgrade -y
  pkg install nodejs -y
fi

echo "✓ Node.js $(node -v)"

# Install deps if missing
if [ ! -d "node_modules" ]; then
  echo "→ Installing dependencies..."
  npm install --loglevel=error
  echo "✓ Dependencies installed"
fi

# Build if needed
if [ ! -d ".next" ]; then
  echo "→ Building project (first time)..."
  npm run build
  echo "✓ Build complete"
fi

# Acquire Termux wakelock (keeps CPU awake)
if command -v termux-wake-lock &>/dev/null; then
  termux-wake-lock
  WAKE_LOCKED=1
  echo "✓ Wakelock acquired"
fi

# Show connection info
HOST_IP=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
echo ""
echo "  Starting server on port $PORT..."
echo "  ─────────────────────────────────────"
echo "  Open in browser: http://${HOST_IP:-192.168.x.x}:$PORT"
echo ""

# Start server and handle cleanup on exit
cleanup() {
  echo ""
  echo "  Shutting down..."
  if [ "$WAKE_LOCKED" = "1" ]; then
    termux-wake-unlock 2>/dev/null
    echo "  Wakelock released"
  fi
  exit 0
}
trap cleanup SIGINT SIGTERM

NODE_ENV=production node server.js
