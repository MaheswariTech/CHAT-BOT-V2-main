#!/bin/bash

echo "===================================================="
echo "     MIET AI HELPDESK SYSTEM - BOOT LOADER"
echo "===================================================="

# 1. PORT CLEANUP (8000 & 5173)
echo "[*] Checking for existing processes on ports 8000 and 5173..."
fuser -k 8000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# 2. BACKEND VALIDATION
echo "[*] Initializing Backend..."
if [ ! -d "backend/venv" ]; then
    echo "[!] Backend virtual environment not found. Creating..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# 3. FRONTEND VALIDATION
echo "[*] Initializing Frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo "[!] Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    cd ..
fi

# 4. LAUNCH SYSTEM
echo "----------------------------------------------------"
echo "[SUCCESS] Launching servers..."
echo "----------------------------------------------------"

# Function to stop everything on exit
cleanup() {
    echo ""
    echo "[*] Stopping servers..."
    kill $(jobs -p)
    exit
}
trap cleanup SIGINT SIGTERM

# Start Backend
cd backend && source venv/bin/activate && python3 main.py &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo "[INFO] Backend (PID $BACKEND_PID) at: http://localhost:8000"
echo "[INFO] Frontend (PID $FRONTEND_PID) at: http://localhost:5173"
echo "----------------------------------------------------"
echo "Press Ctrl+C to stop both servers."

wait
