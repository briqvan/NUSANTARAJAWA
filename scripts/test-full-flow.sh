#!/bin/bash
# Comprehensive test: start server, run all agent-browser tests, kill server
cd /home/z/my-project

pkill -f 'next-server\|next dev' 2>/dev/null
sleep 2
rm -f .next/dev/lock

# Start server
node node_modules/.bin/next dev -p 3000 > /tmp/dev-test.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for ready
for i in $(seq 1 30); do
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && break
  sleep 1
done
sleep 2
echo "Server status: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/)"

# Clear old localStorage to start fresh
agent-browser close 2>/dev/null
agent-browser open http://localhost:3000/ 2>&1 | tail -1
agent-browser wait 4000 2>&1 | tail -1

# Clear localStorage to ensure fresh login
agent-browser eval "localStorage.clear(); 'cleared'" 2>&1 | tail -1
agent-browser reload 2>&1 | tail -1
agent-browser wait 4000 2>&1 | tail -1

echo "=== STEP 1: Login ==="
agent-browser snapshot -i 2>&1 | head -15

# Register a new user
agent-browser find role button click --name "Daftar" 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1

# Get fresh refs
EMAIL_REF=$(agent-browser snapshot -i 2>&1 | grep 'textbox "Email"' | head -1 | grep -o 'ref=e[0-9]*' | head -1)
PASS_REF=$(agent-browser snapshot -i 2>&1 | grep 'textbox "Kata Sandi"' | head -1 | grep -o 'ref=e[0-9]*' | head -1)
NAME_REF=$(agent-browser snapshot -i 2>&1 | grep 'textbox "Nama Pendekar"' | head -1 | grep -o 'ref=e[0-9]*' | head -1)
SUBMIT_REF=$(agent-browser snapshot -i 2>&1 | grep 'Daftar Menjadi Pendekar' | grep -o 'ref=e[0-9]*' | head -1)

echo "Refs: email=$EMAIL_REF pass=$PASS_REF name=$NAME_REF submit=$SUBMIT_REF"

agent-browser fill @$NAME_REF "Jayanegara" 2>&1 | tail -1
agent-browser fill @$EMAIL_REF "jaya@nusantara.test" 2>&1 | tail -1
agent-browser fill @$PASS_REF "keris123" 2>&1 | tail -1
agent-browser click @$SUBMIT_REF 2>&1 | tail -1
agent-browser wait 3000 2>&1 | tail -1

agent-browser screenshot /home/z/my-project/screenshots/d1-after-register.png 2>&1 | tail -1

echo "=== STEP 2: Character Creation - Gender ==="
agent-browser snapshot -i 2>&1 | grep -iE 'buat karakter|laki|perempuan|lanjut|kelamin' | head -8

# Select female
FEMALE_REF=$(agent-browser snapshot -i 2>&1 | grep 'Perempuan' | grep -o 'ref=e[0-9]*' | head -1)
echo "Female card ref: $FEMALE_REF"
agent-browser click @$FEMALE_REF 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1
agent-browser screenshot /home/z/my-project/screenshots/d2-gender-selected.png 2>&1 | tail -1

# Click Lanjut
LANJUT_REF=$(agent-browser snapshot -i 2>&1 | grep 'Lanjut' | grep -o 'ref=e[0-9]*' | head -1)
echo "Lanjut ref: $LANJUT_REF"
agent-browser click @$LANJUT_REF 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1

echo "=== STEP 3: Character Creation - Class ==="
agent-browser screenshot /home/z/my-project/screenshots/d3-step2-class.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | grep -iE 'ksatria|pendekar|dukun|pemanah' | head -8

# Select Dukun
DUKUN_REF=$(agent-browser snapshot -i 2>&1 | grep 'Dukun' | head -1 | grep -o 'ref=e[0-9]*' | head -1)
echo "Dukun ref: $DUKUN_REF"
agent-browser click @$DUKUN_REF 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1

# Click Lanjut
LANJUT_REF=$(agent-browser snapshot -i 2>&1 | grep 'Lanjut' | grep -o 'ref=e[0-9]*' | head -1)
agent-browser click @$LANJUT_REF 2>&1 | tail -1
agent-browser wait 1500 2>&1 | tail -1

echo "=== STEP 4: Character Creation - Name ==="
agent-browser screenshot /home/z/my-project/screenshots/d4-step3-name.png 2>&1 | tail -1

NAME_INPUT_REF=$(agent-browser snapshot -i 2>&1 | grep 'textbox "Nama Karakter"' | grep -o 'ref=e[0-9]*' | head -1)
echo "Name input ref: $NAME_INPUT_REF"
agent-browser fill @$NAME_INPUT_REF "Sri Wedana" 2>&1 | tail -1
agent-browser wait 500 2>&1 | tail -1

# Click Mulai Petualangan
START_REF=$(agent-browser snapshot -i 2>&1 | grep 'Mulai Petualangan' | grep -o 'ref=e[0-9]*' | head -1)
echo "Start ref: $START_REF"
agent-browser click @$START_REF 2>&1 | tail -1
agent-browser wait 4000 2>&1 | tail -1

echo "=== STEP 5: Game World ==="
agent-browser screenshot /home/z/my-project/screenshots/d5-game-world.png 2>&1 | tail -1
agent-browser snapshot -i 2>&1 | grep -iE 'dunia|jelajah|misal|buku|keluar|buat karakter|sri|dukun|pendekar|pahlawan' | head -10

echo ""
echo "=== CONSOLE ERRORS ==="
agent-browser console 2>&1 | grep -iE 'error|fail' | grep -v 'DevTools' | head -5

echo ""
echo "=== ALL TESTS COMPLETE ==="

# Kill server
kill $SERVER_PID 2>/dev/null
echo "Server killed"
