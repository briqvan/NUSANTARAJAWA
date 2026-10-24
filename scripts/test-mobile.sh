#!/bin/bash
# Final test: mobile character creation + lint check
cd /home/z/my-project

pkill -f 'next-server\|next dev' 2>/dev/null
sleep 2
rm -f .next/dev/lock

node node_modules/.bin/next dev -p 3000 > /tmp/dev-test.log 2>&1 &
SERVER_PID=$!

for i in $(seq 1 30); do
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && break
  sleep 1
done
sleep 2
echo "Server: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"

agent-browser close 2>/dev/null
agent-browser open http://localhost:3000/ 2>&1 | tail -1
agent-browser wait 4000 2>&1 | tail -1
agent-browser eval "localStorage.clear(); 'cleared'" 2>&1 | tail -1
agent-browser reload 2>&1 | tail -1
agent-browser wait 3000 2>&1 | tail -1

# Login as guest (fastest)
agent-browser find role button click --name "Main sebagai Tamu" 2>&1 | tail -1
agent-browser wait 3000 2>&1 | tail -1

# Mobile view of character creation step 1
agent-browser set viewport 390 844 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1
agent-browser screenshot --full /home/z/my-project/screenshots/f1-mobile-char-create.png 2>&1 | tail -1

# Check no horizontal scroll
agent-browser eval "JSON.stringify({hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth})" 2>&1 | tail -1

# Select male and proceed to step 2
agent-browser find text "Laki-laki" click 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1
agent-browser find role button click --name "Lanjut" 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1
agent-browser screenshot --full /home/z/my-project/screenshots/f2-mobile-step2-class.png 2>&1 | tail -1
agent-browser eval "JSON.stringify({hscroll: document.documentElement.scrollWidth > document.documentElement.clientWidth})" 2>&1 | tail -1

# Select a class and go to step 3
agent-browser find text "Ksatria" click 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1
agent-browser find role button click --name "Lanjut" 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1
agent-browser screenshot --full /home/z/my-project/screenshots/f3-mobile-step3-name.png 2>&1 | tail -1

# Console errors
echo "=== CONSOLE ==="
agent-browser console 2>&1 | grep -iE 'error|fail' | grep -v 'DevTools' | head -5

echo "=== DONE ==="
kill $SERVER_PID 2>/dev/null
