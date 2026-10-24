#!/bin/bash
# Simplified test: start server, run tests with semantic finders, kill server
cd /home/z/my-project

pkill -f 'next-server\|next dev' 2>/dev/null
sleep 2
rm -f .next/dev/lock

# Start server
node node_modules/.bin/next dev -p 3000 > /tmp/dev-test.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

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
agent-browser wait 4000 2>&1 | tail -1

echo "=== Register ==="
agent-browser find role button click --name "Daftar" 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1
agent-browser find label "Nama Pendekar" fill "Jayanegara" 2>&1 | tail -1
agent-browser find label "Email" fill "jaya@nusantara.test" 2>&1 | tail -1
agent-browser find label "Kata Sandi" fill "keris123" 2>&1 | tail -1
agent-browser find role button click --name "Daftar Menjadi Pendekar" 2>&1 | tail -1
agent-browser wait 3000 2>&1 | tail -1
agent-browser screenshot /home/z/my-project/screenshots/d1-char-step1.png 2>&1 | tail -1

echo "=== Step 1: Select Gender ==="
agent-browser find text "Perempuan" click 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1
agent-browser screenshot /home/z/my-project/screenshots/d2-gender-selected.png 2>&1 | tail -1
agent-browser find role button click --name "Lanjut" 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1

echo "=== Step 2: Select Class ==="
agent-browser screenshot /home/z/my-project/screenshots/d3-step2-class.png 2>&1 | tail -1
agent-browser find text "Dukun" click 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1
agent-browser find role button click --name "Lanjut" 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1

echo "=== Step 3: Enter Name ==="
agent-browser screenshot /home/z/my-project/screenshots/d4-step3-name.png 2>&1 | tail -1
agent-browser find label "Nama Karakter" fill "Sri Wedana" 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1
agent-browser find role button click --name "Mulai Petualangan" 2>&1 | tail -1
agent-browser wait 4000 2>&1 | tail -1

echo "=== Step 4: Game World ==="
agent-browser screenshot /home/z/my-project/screenshots/d5-game-world.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | head -20

echo ""
echo "=== CONSOLE ==="
agent-browser console 2>&1 | grep -iE 'error|fail' | grep -v 'DevTools' | head -5

echo ""
echo "=== DONE ==="
kill $SERVER_PID 2>/dev/null
