#!/usr/bin/env bash
set -euo pipefail

COMPROMISED=compromised.txt

pnpm list --parseable --depth Infinity \
  | sed -En 's#.*node_modules/(\.pnpm/[^/]+/node_modules/)?((@[^/]+/[^/]+)|[^/]+)$#\2#p' \
  | sort -u \
  > installed.txt

echo "Checking for compromised packages…"
if grep -Fx -f "$COMPROMISED" installed.txt; then
  echo "☠️  One or more compromised packages found."
  rm -rf installed.txt
  exit 1
else
  echo "✅  No compromised packages in your tree."
  rm -rf installed.txt
fi