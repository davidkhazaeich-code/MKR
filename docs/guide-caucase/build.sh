#!/bin/bash
set -euo pipefail

LOCALE="${1:-fr}"

case "$LOCALE" in
  fr)
    SRC="docs/guide-caucase/guide.html"
    DEST="public/guide-caucase.pdf"
    ;;
  en)
    SRC="docs/guide-caucase/guide.en.html"
    DEST="public/caucasus-guide.pdf"
    ;;
  all)
    bash "$0" fr
    bash "$0" en
    exit 0
    ;;
  *)
    echo "Usage: $0 [fr|en|all]"
    exit 1
    ;;
esac

echo "Building $LOCALE PDF: $SRC -> $DEST"
/opt/homebrew/bin/weasyprint "$SRC" "$DEST"
echo "Done: $DEST ($(du -h "$DEST" | cut -f1))"
