#!/bin/bash
# Start the Next.js dev server directly (bypassing the tee pipe in package.json)
# to avoid SIGHUP issues when the parent shell exits.
cd /home/z/my-project
exec node node_modules/.bin/next dev -p 3000
