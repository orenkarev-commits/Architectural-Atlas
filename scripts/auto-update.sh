#!/bin/bash
# Auto-publish the Architectural Atlas to the `preview` OTA channel when its source
# has changed. Scheduled 5x/day by launchd (com.architecturalatlas.autoupdate).
# Publishes only on a real change, so it never spams duplicate updates.
set -u
REPO="/Users/orenkarev/Claude/architectural-atlas"
EAS="/Users/orenkarev/.local/node/bin/eas"
HASHFILE="$HOME/.architectural-atlas-autoupdate.hash"
LOG="$HOME/Library/Logs/atlas-autoupdate.log"
export PATH="/Users/orenkarev/.local/node/bin:/usr/bin:/bin:/usr/sbin:/sbin"

cd "$REPO" || { echo "$(date) ERROR: repo not found" >> "$LOG"; exit 1; }

# Fingerprint the shipped source (code/data) AND the image/plan assets, so a
# dropped or replaced image also triggers a publish. (An image still has to be
# wired into data/photos.ts to appear — a raw file alone is inert.)
NEW=$( { find data app lib components theme -type f \( -name '*.ts' -o -name '*.tsx' \) 2>/dev/null;
         find assets/images -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' \) 2>/dev/null; } \
       | sort | xargs shasum 2>/dev/null | shasum | awk '{print $1}')
OLD=$(cat "$HASHFILE" 2>/dev/null || echo "")

if [ "$NEW" = "$OLD" ]; then
  echo "$(date) no change — skip" >> "$LOG"
  exit 0
fi

MSG="Auto-sync $(date '+%Y-%m-%d %H:%M')"
echo "$(date) change detected — publishing: $MSG" >> "$LOG"
if "$EAS" update --branch preview -m "$MSG" --non-interactive >> "$LOG" 2>&1; then
  echo "$NEW" > "$HASHFILE"
  echo "$(date) published OK" >> "$LOG"
else
  echo "$(date) ERROR publishing (will retry next run)" >> "$LOG"
fi
