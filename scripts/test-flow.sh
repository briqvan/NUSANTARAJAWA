#!/bin/bash
# Test script: starts dev server, runs agent-browser tests, then kills server
# All in one process to avoid background process cleanup issues

cd /home/z/my-project

# Kill any existing server
pkill -f 'next-server' 2>/dev/null
pkill -f 'next dev' 2>/dev/null
sleep 2
rm -f .next/dev/lock

# Start dev server in background within this shell
node node_modules/.bin/next dev -p 3000 > /tmp/dev-test.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
echo "Waiting for server..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null | grep -q 200; then
    echo "Server ready after ${i}s"
    break
  fi
  sleep 1
done

# Check server is up
STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null)
echo "Server status: $STATUS"

if [ "$STATUS" != "200" ]; then
  echo "FAILED: Server not ready"
  cat /tmp/dev-test.log | tail -20
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

# Run agent-browser tests
echo "=== Opening browser ==="
agent-browser open http://localhost:3000/ 2>&1 | tail -2
agent-browser wait 4000 2>&1 | tail -1

echo "=== Snapshot ==="
agent-browser snapshot -i 2>&1 | head -20

echo "=== Done with tests ==="

# Keep server running for a bit more tests
# Don't kill immediately - let caller decide
echo "SERVER_PID=$SERVER_PID"
echo $SERVER_PID > /tmp/dev-server-pid.txt

# Keep the script alive to keep the server running
# The caller can kill it later
echo "Server still running. Keeping script alive..."
wait $SERVER_PID
