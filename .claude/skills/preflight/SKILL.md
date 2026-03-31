---
name: preflight
description: Run all CI checks before opening a PR — format:check, lint, typecheck, and tests for both frontend and backend.
allowed-tools: Bash
---

Run the full preflight check suite to catch anything CI would catch.

**Frontend checks:**
```bash
source ~/.nvm/nvm.sh && cd frontend && pnpm run format:check && pnpm run lint && pnpm run typecheck && pnpm run test
```

**Backend checks:**
```bash
cd backend && uv run ruff check . && uv run ruff format --check . && uv run pytest tests/ -v --tb=short
```

Run frontend checks first, then backend. Report a clear pass/fail for each step. If any step fails, stop and report the error — do not continue to the next step. Fix failures before proceeding with the PR.
