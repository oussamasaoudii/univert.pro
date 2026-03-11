#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-}"

if [[ -z "$BASE_URL" ]]; then
  echo "usage: $0 https://your-domain.example"
  exit 1
fi

headers() {
  curl -ksS -o /dev/null -D - "$@"
}

status() {
  curl -ksS -o /dev/null -w "%{http_code}" "$1"
}

echo "== Target =="
echo "$BASE_URL"
echo

echo "== Sensitive file exposure =="
for path in \
  "/.env" \
  "/.env.local" \
  "/.env.production" \
  "/.env.bak" \
  "/.git/config" \
  "/.git/HEAD" \
  "/.svn/entries" \
  "/.hg/requires" \
  "/package.json" \
  "/next.config.mjs" \
  "/phpinfo" \
  "/phpinfo.php" \
  "/info.php" \
  "/server-status" \
  "/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php" \
  "/wp-login.php" \
  "/xmlrpc.php" \
  "/actuator/env" \
  "/api/.env"
do
  printf "%-30s %s\n" "$path" "$(status "${BASE_URL}${path}")"
done
echo

echo "== Security headers =="
headers "${BASE_URL}/" | grep -Ei \
'^(strict-transport-security|content-security-policy|x-content-type-options|x-frame-options|referrer-policy|permissions-policy|cache-control|server|x-powered-by|set-cookie):' || true
echo

echo "== Admin/internal unauthenticated access =="
for path in \
  "/api/admin/users" \
  "/api/admin/overview" \
  "/api/queue/worker" \
  "/api/queue/maintenance" \
  "/api/monitoring/worker"
do
  printf "%-30s %s\n" "$path" "$(status "${BASE_URL}${path}")"
done
echo

echo "== CORS probe =="
headers "${BASE_URL}/api/health" -H "Origin: https://evil.example" 2>/dev/null | grep -Ei \
'^(access-control-allow-origin|access-control-allow-credentials|vary):' || true
echo

echo "== Cache headers on sensitive routes =="
for path in "/admin/mfa" "/api/admin/overview"; do
  echo "-- ${path}"
  headers "${BASE_URL}${path}" | grep -Ei '^(cache-control|pragma|expires):' || true
done
echo

echo "== Cookie flags =="
headers "${BASE_URL}/" | grep -Ei '^set-cookie:' || true
echo

echo "== Malformed JSON probe =="
curl -ksS -i -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  --data '{"email":"test@example.com","password":' | sed -n '1,12p'
echo

echo "== Invalid schema probe =="
curl -ksS -i -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  --data '{"email":123,"password":["x"],"extra":"bad"}' | sed -n '1,12p'
echo

echo "== Login rate-limit probe =="
for i in $(seq 1 12); do
  code="$(curl -ksS -o /dev/null -w "%{http_code}" \
    -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    --data '{"email":"test@example.com","password":"wrong-password"}')"
  printf "attempt=%02d status=%s\n" "$i" "$code"
done
