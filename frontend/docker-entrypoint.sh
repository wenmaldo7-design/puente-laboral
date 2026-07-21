#!/bin/sh
set -e

API_URL="${API_URL:-http://localhost:3000}"

cat > /usr/share/nginx/html/env.js <<EOF
window.__env = {
  apiUrl: '${API_URL}'
};
EOF

exec "$@"
