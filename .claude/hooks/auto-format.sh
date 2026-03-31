#!/bin/bash
# PostToolUse hook: auto-run Prettier on frontend files after Claude edits them.
# Receives tool use JSON on stdin.

input=$(cat)
file_path=$(echo "$input" | python3 -c "
import json, sys
d = json.load(sys.stdin)
print(d.get('tool_input', {}).get('file_path', ''))
" 2>/dev/null)

[[ -z "$file_path" ]] && exit 0

# Only format files inside the frontend directory
[[ "$file_path" != */frontend/* ]] && exit 0

# Only format Prettier-supported file types
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.html) ;;
  *) exit 0 ;;
esac

# Run Prettier on the specific file
source ~/.nvm/nvm.sh 2>/dev/null
cd /home/paul/repos/learn_greek/frontend
pnpm exec prettier --write "$file_path" --log-level warn 2>/dev/null

exit 0
