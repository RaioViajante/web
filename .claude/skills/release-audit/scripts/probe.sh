#!/usr/bin/env bash
# Read-only production probe: one GET/HEAD per URL, no retries, no loops.
# Usage: probe.sh [root|dump|docs|lab ...]   (default: all four)
# Docs and Lab use trailing slashes, so /pt may show a 3xx there: not a failure.
# Prints status, content-type and a few security headers. Judge the output
# against docs/security-headers.md and docs/seo.md; this script asserts nothing.
set -u
host_of() {
  case "$1" in
    root) echo raioviajante.com ;; dump) echo dump.raioviajante.com ;;
    docs) echo docs.raioviajante.com ;; lab) echo lab.raioviajante.com ;;
  esac
}
sites=("$@"); [ ${#sites[@]} -eq 0 ] && sites=(root dump docs lab)
for s in "${sites[@]}"; do
  h=$(host_of "$s"); [ -z "$h" ] && { echo "unknown site: $s" >&2; continue; }
  paths=(/ /pt /sitemap.xml /robots.txt /search-index.json /pt/search-index.json
         /.well-known/security.txt /llms.txt /this-page-should-not-exist)
  [ "$s" = dump ] && paths+=(/rss.xml /pt/rss.xml)
  echo "== $s ($h)"
  for p in "${paths[@]}"; do
    out=$(curl -sS -o /dev/null -D - --max-time 20 "https://$h$p" 2>&1) || { echo "$p  curl-error"; continue; }
    code=$(printf '%s' "$out" | head -1 | tr -d '\r')
    ct=$(printf '%s' "$out" | grep -i '^content-type:' | tr -d '\r' | head -1)
    echo "$p  $code  $ct"
  done
  curl -sS -o /dev/null -D - --max-time 20 "https://$h/" | tr -d '\r' \
    | grep -iE '^(strict-transport-security|content-security-policy|x-content-type-options|referrer-policy|permissions-policy|cross-origin-opener-policy|x-vercel-id|x-vercel-cache|age|cache-control|x-robots-tag):' \
    | cut -c1-140
done
