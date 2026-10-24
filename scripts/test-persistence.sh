#!/bin/bash
# Test persistence + mobile + delete character
cd /home/z/my-project

pkill -f 'next-server\|next dev' 2>/dev/null
sleep 2
rm -f .next/dev/lock

node node_modules/.bin/next dev -p 3000 > /tmp/dev-test.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

for i in $(seq 1 30); do
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && break
  sleep 1
done
sleep 2
echo "Server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"

# The localStorage from previous test should still have the user+character
agent-browser close 2>/dev/null
agent-browser open http://localhost:3000/ 2>&1 | tail -1
agent-browser wait 4000 2>&1 | tail -1

echo "=== Persistence Test: Reload should show Game World ==="
agent-browser snapshot -i 2>&1 | grep -iE 'dunia|sri|dukun|buat karakter|kelamin' | head -5
agent-browser screenshot /home/z/my-project/screenshots/e1-persistence.png 2>&1 | tail -1

echo ""
echo "=== Mobile Test (390px) ==="
agent-browser set viewport 390 844 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1
agent-browser screenshot --full /home/z/my-project/screenshots/e2-mobile-game.png 2>&1 | tail -1

# Check no horizontal scroll
agent-browser eval "JSON.stringify({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth})" 2>&1 | tail -1

echo ""
echo "=== Delete Character Test ==="
agent-browser set viewport 1280 1000 2>&1 | tail -1
agent-browser wait 1000 2>&1 | tail -1
agent-browser find role button click --name "Buat Karakter Baru" 2>&1 | tail -1
agent-browser wait 3000 2>&1 | tail -1
agent-browser screenshot /home/z/my-project/screenshots/e3-after-delete.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | grep -iE 'buat karakter|kelamin|laki|perempuan' | head -5

echo ""
echo "=== Console Errors ==="
agent-browser console 2>&1 | grep -iE 'error|fail' | grep -v 'DevTools' | head -5

echo ""
echo "=== DONE ==="
kill $SERVER_PID 2>/dev/null
