---
name: test
description: Run tests. Pass a file path or test name to run a single test (preferred). With no arguments runs all tests.
argument-hint: [test-file-or-pattern]
allowed-tools: Bash
---

Run tests on the frontend. Prefer running a single test file over the full suite.

If `$ARGUMENTS` is provided, run that specific test:
```bash
source ~/.nvm/nvm.sh && cd frontend && pnpm run test $ARGUMENTS
```

If no arguments, run the full suite:
```bash
source ~/.nvm/nvm.sh && cd frontend && pnpm run test
```

For the backend (if a `.py` test file is specified):
```bash
cd backend && uv run pytest $ARGUMENTS -v
```

Report pass/fail counts and any failing test details.
