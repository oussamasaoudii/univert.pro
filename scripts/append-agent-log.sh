#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: bash scripts/append-agent-log.sh <actor> <summary> [file1 file2 ...]" >&2
  exit 1
fi

actor="$1"
summary="$2"
shift 2

mkdir -p ai-change-logs

site_slug_file="ai-change-logs/PROJECT-SLUG.txt"
if [ -f "$site_slug_file" ]; then
  site_slug="$(tr -d '\r' < "$site_slug_file" | head -n 1 | tr '[:upper:]' '[:lower:]')"
else
  site_slug="$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g; s/--*/-/g; s/^-//; s/-$//')"
fi

if [ -z "$site_slug" ]; then
  echo "Could not determine site slug." >&2
  exit 1
fi

log_file="ai-change-logs/${site_slug}-worklog.txt"

if [ ! -f "$log_file" ]; then
  cat > "$log_file" <<EOF
Site: ${site_slug}
Repository:
Primary domain:
Created: $(date -u +"%Y-%m-%d")
EOF
fi

{
  echo ""
  echo "[$(date -u +"%Y-%m-%d %H:%M UTC")]"
  echo "Actor: ${actor}"
  echo "Summary:"
  echo "- ${summary}"
  if [ "$#" -gt 0 ]; then
    echo "Files:"
    for file in "$@"; do
      echo "- ${file}"
    done
  fi
} >> "$log_file"
