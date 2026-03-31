---
name: backend-lint
description: Run Ruff linter and formatter check on the backend Python code.
argument-hint: [path-or-file]
allowed-tools: Bash
---

Run Ruff lint on the backend. If `$ARGUMENTS` is provided, check only that path:

```bash
cd backend && uv run ruff check ${ARGUMENTS:-.} && uv run ruff format --check ${ARGUMENTS:-.}
```

Report any lint errors or formatting violations. For auto-fixable issues, offer to run:
```bash
cd backend && uv run ruff check --fix ${ARGUMENTS:-.} && uv run ruff format ${ARGUMENTS:-.}
```
