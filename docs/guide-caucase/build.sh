#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Building Guide Caucase PDF..."
/opt/homebrew/bin/weasyprint guide.html ../../public/guide-caucase.pdf
echo "Built : ../../public/guide-caucase.pdf"
du -h ../../public/guide-caucase.pdf
python3 -c "
data = open('../../public/guide-caucase.pdf','rb').read()
pages = data.count(b'/Type /Page') - data.count(b'/Type /Pages')
print(f'Pages : {pages}')
"
