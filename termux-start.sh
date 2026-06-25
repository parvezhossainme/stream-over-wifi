#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PORT="${PORT:-3000}"

clear
echo "╔══════════════════════════════════════════╗"
echo "║        Stream on WiFi — Termux          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check node
if ! command -v node &>/dev/null; then
  echo "→ Installing Node.js..."
  pkg upgrade -y
  pkg install nodejs -y
fi
echo "✓ Node.js $(node -v)"

# Install deps if missing
if [ ! -d "node_modules" ]; then
  echo "→ Installing dependencies..."
  npm install
  echo "✓ Dependencies installed"
fi

# Build if needed
if [ ! -f ".next/BUILD_ID" ]; then
  echo "→ Building project (this may take a minute)..."
  npm run build
  if [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ Build failed. Run 'npm run build' manually to see errors."
    exit 1
  fi
  echo "✓ Build complete"
fi

# Acquire Termux wakelock
if command -v termux-wake-lock &>/dev/null; then
  termux-wake-lock
  echo "✓ Wakelock acquired (phone won't sleep)"
fi

# Show connection info
echo ""
echo "  Server starting on port $PORT..."
echo "  ─────────────────────────────────────"
echo "  Open in browser: http://<this-phone-ip>:$PORT"
echo ""

cleanup() {
  echo ""
  echo "  Shutting down..."
  command -v termux-wake-unlock &>/dev/null && termux-wake-unlock 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

NODE_ENV=production node server.js
