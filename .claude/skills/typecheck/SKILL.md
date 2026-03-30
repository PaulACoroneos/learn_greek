---
name: typecheck
description: Run TypeScript type checking on the frontend. Use after any TypeScript changes.
allowed-tools: Bash
---

Run TypeScript type checking on the frontend:

```bash
source ~/.nvm/nvm.sh && cd frontend && pnpm run typecheck
```

Report all type errors with file, line, and a brief explanation of each issue.
