---
name: format
description: Run Prettier on the frontend to fix formatting. Use before committing or when format:check fails in CI.
allowed-tools: Bash
---

Run Prettier formatter on the entire frontend:

```bash
source ~/.nvm/nvm.sh && cd frontend && pnpm run format
```

Report how many files were reformatted. If zero files changed, confirm formatting is already clean.
