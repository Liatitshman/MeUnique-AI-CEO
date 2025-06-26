#!/bin/bash

# Kill all Node.js processes on common development ports
echo "🔍 Checking for processes on ports 3000-3005..."

for port in {3000..3005}; do
    pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        echo "❌ Killing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
done

echo "✅ All ports cleared!"
echo "🚀 You can now run: npm run dev" 