---
name: lint
description: Run ESLint on the frontend. Use when checking for lint errors or after making code changes.
allowed-tools: Bash
---

Run ESLint on the frontend:

```bash
source ~/.nvm/nvm.sh && cd frontend && pnpm run lint
```

Report any errors or warnings. If there are fixable issues, suggest running `/lint-fix` or offer to fix them.
