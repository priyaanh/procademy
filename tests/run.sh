#!/bin/bash
# Runs every check: the page loads without console errors, the browser suite passes, the content passes,
# and it rebuilds procademy-offline.html (the one-file build) and checks it with no internet.
#   ./tests/run.sh            everything
#   SEEDS=1500 ./tests/run.sh more seeds per skill in the content check
#   ./tests/run.sh --live-tutor  also ask the real cloud tutor, then check unlimited mode on this device (downloads ~350 MB once)
# Set CHROME to point at another browser binary if needed. Exits non-zero if anything fails.
set -u
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME (set CHROME=/path/to/chrome)"; exit 2; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
# NB: never pass --user-data-dir here, it makes headless Chrome hang on macOS.
FLAGS=(--headless=new --disable-gpu --no-first-run --hide-scrollbars --allow-file-access-from-files --enable-logging=stderr --v=0 --window-size=1300,1500)
fail=0

echo "▶ index.html loads without console errors"
for route in "" "#/courses" "#/course/math-7" "#/progress" "#/settings"; do
  "$CHROME" "${FLAGS[@]}" --virtual-time-budget=4000 --dump-dom "file://$ROOT/index.html$route" >"$TMP/dom.html" 2>"$TMP/page.err"
  errs=$(grep "CONSOLE" "$TMP/page.err" | grep -iE "error|uncaught|not defined|undefined|failed|refused|content security policy" | grep -v favicon)
  if [ -n "$errs" ]; then fail=1; echo "  ✗ index.html$route"; echo "$errs" | sed 's/^\[[^]]*\] /    /' | head -5
  elif ! grep -q 'class="card' "$TMP/dom.html"; then fail=1; echo "  ✗ index.html$route rendered nothing"
  else echo "  ✓ index.html$route"; fi
done

echo "▶ security policy (index.html)"
csp=$(grep -o 'http-equiv="Content-Security-Policy" content="[^"]*"' index.html)
if [ -z "$csp" ]; then fail=1; echo "  ✗ index.html has no Content-Security-Policy"
elif echo "$csp" | grep -qE "script-src[^;]*'(unsafe-inline|unsafe-eval)'"; then fail=1; echo "  ✗ the policy lets inline scripts or eval run"
elif grep -qE "<script>|<script [^>]*>[^<]" index.html; then fail=1; echo "  ✗ index.html has an inline script"
elif grep -qE " on[a-z]+=\"" index.html; then fail=1; echo "  ✗ index.html has an inline event handler"
elif ! echo "$csp" | grep -qE "frame-src ('none'|https://[a-z0-9-]+\.firebaseapp\.com)(;|\"|$)"; then fail=1; echo "  ✗ frames are allowed from more than the sign-in helper"
else echo "  ✓ scripts only from this site and pinned libraries; no inline scripts, eval or plug-ins; frames only for sign-in"; fi

echo "▶ browser suite (tests/suite.html)"
CHROME="$CHROME" node tests/cdp.js "file://$ROOT/tests/suite.html" 180000 "RESULTS" >"$TMP/suite.out" 2>&1
summary=$(grep -oE "RESULTS [0-9]+ failed of [0-9]+" "$TMP/suite.out" | tail -1)
bad=$(grep -E "^(FAIL|EXCEPTION)" "$TMP/suite.out")
if [ -n "$bad" ]; then fail=1; echo "  ${summary:-no summary}"; echo "$bad" | sed 's/^/    /' | head -40
elif [ -z "$summary" ]; then fail=1; echo "  ✗ the suite did not finish"; tail -5 "$TMP/suite.out" | sed 's/^/    /'
else echo "  ✓ ${summary#RESULTS 0 failed of } checks passed"; fi

echo "▶ every page at phone width (tests/sweep.html)"
WINDOW=390,844 CHROME="$CHROME" node tests/cdp.js "file://$ROOT/tests/sweep.html" 600000 "RESULTS" >"$TMP/sweep.out" 2>&1
sw=$(grep -oE "RESULTS [0-9]+ failed of [0-9]+" "$TMP/sweep.out" | tail -1)
if [ -z "$sw" ]; then fail=1; echo "  ✗ the sweep did not finish"; tail -5 "$TMP/sweep.out" | sed 's/^/    /'
elif [ "$(echo "$sw" | awk '{print $2}')" != "0" ]; then fail=1; echo "  ✗ ${sw#RESULTS }"; grep -E "^  (error|text|wide):" "$TMP/sweep.out" | head -12 | sed 's/^/  /'
else echo "  ✓ $(echo "$sw" | awk '{print $5}') pages: no script errors, no leaked text, nothing wider than the screen"; fi

echo "▶ content (node tests/content.js)"
if out=$(node tests/content.js 2>&1); then echo "  ✓ $(echo "$out" | tail -1)"; else fail=1; echo "$out" | tail -25 | sed 's/^/    /'; fi

echo "▶ CPM books (node tests/cpm.js)"
if out=$(node tests/cpm.js 2>&1); then echo "$out" | grep -E "^[a-z0-9]+: " | sed 's/^/  /'; echo "  ✓ $(echo "$out" | tail -1)"; else fail=1; echo "$out" | tail -25 | sed 's/^/    /'; fi

echo "▶ offline (tools/build-offline.js, then tests/offline.js)"
if out=$(node tools/build-offline.js 2>&1); then echo "  ✓ built $out"; else fail=1; echo "$out" | sed 's/^/    /'; fi
if out=$(CHROME="$CHROME" node tests/offline.js 2>&1); then echo "  ✓ $(echo "$out" | grep -oE 'RESULTS .*' | sed 's/RESULTS 0 failed of //') checks: the one-file build works from disk with the network cut off, and the website still opens once its server is gone"
else fail=1; echo "$out" | grep -E "FAIL|RESULTS" | sed 's/^/    /' | head -12; fi

if [ "${1:-}" = "--live-tutor" ]; then
  echo "▶ live tutor (the free cloud tutor and unlimited mode; needs the internet and WebGPU)"
  PORT=8795; while lsof -i :$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 & SERVER_PID=$!
  for _ in $(seq 1 50); do curl -sf "http://127.0.0.1:$PORT/lib/tutor.js" >/dev/null && break; done
  EXTRA_FLAGS="--enable-unsafe-webgpu" CHROME="$CHROME" node tests/cdp.js "http://127.0.0.1:$PORT/tests/tutor-live.html?unlimited" 900000 "RESULTS" >"$TMP/tutor.out" 2>&1
  if grep -q "RESULTS 0 failed" "$TMP/tutor.out"; then echo "  ✓ $(grep -oE 'RESULTS .*' "$TMP/tutor.out" | sed 's/RESULTS 0 failed of //') checks passed"; else fail=1; grep -E "FAIL|RESULTS" "$TMP/tutor.out" | sed 's/^/    /' | head -10; fi
  echo "▶ live extras (the real site with its security policy: reading a photo and a PDF, a picture, the tutor drawing)"
  EXTRA_FLAGS="--enable-unsafe-webgpu" CHROME="$CHROME" node tests/cdp.js "http://127.0.0.1:$PORT/tests/live-extras.html" 600000 "RESULTS" >"$TMP/extras.out" 2>&1
  kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null
  if grep -q "RESULTS 0 failed" "$TMP/extras.out"; then echo "  ✓ $(grep -oE 'RESULTS .*' "$TMP/extras.out" | sed 's/RESULTS 0 failed of //') checks passed"; grep -E "^PASS (files|pictures|tutor)" "$TMP/extras.out" | sed 's/^PASS /    /' | cut -c1-150; else fail=1; grep -E "FAIL|RESULTS|CSP" "$TMP/extras.out" | sed 's/^/    /' | head -12; fi
fi

[ $fail -eq 0 ] && echo "✅ everything passed" || echo "❌ something failed"
exit $fail
