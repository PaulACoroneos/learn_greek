#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$ROOT/frontend"
BACKEND="$ROOT/backend"

# ── colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[dev]${NC} $*"; }
warn()  { echo -e "${YELLOW}[dev]${NC} $*"; }
error() { echo -e "${RED}[dev]${NC} $*" >&2; }

# ── tool checks ──────────────────────────────────────────────────────────────
check_tools() {
  # nvm / node
  if ! command -v node &>/dev/null; then
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
      # shellcheck source=/dev/null
      source "$HOME/.nvm/nvm.sh"
      nvm use --lts --silent 2>/dev/null || nvm install --lts --silent
    else
      error "node not found and nvm not installed. Install nvm: https://github.com/nvm-sh/nvm"
      exit 1
    fi
  fi

  # pnpm
  if ! command -v pnpm &>/dev/null; then
    warn "pnpm not found, installing via corepack..."
    corepack enable
    PNPM_SPEC=""
    if [ -f "$FRONTEND/package.json" ]; then
      PACKAGE_MANAGER_FIELD="$(
        cd "$FRONTEND" && node -p "require('./package.json').packageManager || ''" 2>/dev/null || echo ""
      )"
      PNPM_SPEC="$(printf '%s\n' "$PACKAGE_MANAGER_FIELD" | sed -n 's/^pnpm@//p')"
    fi
    if [ -n "$PNPM_SPEC" ]; then
      info "Installing pnpm@$PNPM_SPEC as specified in frontend/package.json..."
      corepack prepare "pnpm@$PNPM_SPEC" --activate
    else
      warn "No pnpm version pinned in frontend/package.json; installing Corepack-managed pnpm."
      corepack prepare pnpm --activate
    fi
  fi

  # uv
  if ! command -v uv &>/dev/null; then
    warn "uv not found, installing..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    # shellcheck source=/dev/null
    source "$HOME/.local/bin/env" 2>/dev/null || export PATH="$HOME/.local/bin:$PATH"
  fi
}

# ── env setup ─────────────────────────────────────────────────────────────────
check_env() {
  # Backend: no .env needed (has sensible defaults), but warn about DB
  if [ ! -f "$BACKEND/.env" ]; then
    warn "backend/.env not found — using defaults (postgres://postgres:postgres@localhost:5432/learn_greek)"
    warn "Create $BACKEND/.env to override."
  fi

  # Frontend: needs ANTHROPIC_API_KEY for AI features
  if [ ! -f "$FRONTEND/.env" ]; then
    warn "frontend/.env not found — AI features (Reading Mode, Conversation) will not work."
    warn "Create $FRONTEND/.env with: ANTHROPIC_API_KEY=sk-..."
  elif ! grep -q "ANTHROPIC_API_KEY" "$FRONTEND/.env"; then
    warn "ANTHROPIC_API_KEY not set in frontend/.env — AI features will not work."
  fi
}

# ── install deps ──────────────────────────────────────────────────────────────
install_deps() {
  info "Installing frontend dependencies..."
  (cd "$FRONTEND" && pnpm install --frozen-lockfile)

  info "Installing backend dependencies..."
  (cd "$BACKEND" && uv sync --all-groups)
}

# ── postgres ──────────────────────────────────────────────────────────────────
POSTGRES_STARTED=false

start_postgres() {
  if ! command -v systemctl &>/dev/null; then
    warn "systemctl not found — skipping automatic PostgreSQL startup."
    warn "Ensure PostgreSQL is running (e.g. via Docker, Postgres.app, or your system service manager)."
    return
  fi
  if systemctl is-active --quiet postgresql; then
    info "PostgreSQL already running."
  else
    info "Starting PostgreSQL..."
    sudo systemctl start postgresql
    POSTGRES_STARTED=true
  fi
}

stop_postgres() {
  if [ "$POSTGRES_STARTED" = true ]; then
    info "Stopping PostgreSQL..."
    sudo systemctl stop postgresql
  fi
}

# ── run ───────────────────────────────────────────────────────────────────────
run_services() {
  start_postgres

  info "Starting backend on http://localhost:8000 ..."
  (cd "$BACKEND" && uv run uvicorn main:app --reload --port 8000) &
  BACKEND_PID=$!

  info "Starting frontend on http://localhost:3000 ..."
  (cd "$FRONTEND" && pnpm dev) &
  FRONTEND_PID=$!

  # ── cleanup on exit ──────────────────────────────────────────────────────
  trap 'status=$?; info "Shutting down..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; stop_postgres; exit $status' INT TERM EXIT HUP ERR

  wait $BACKEND_PID $FRONTEND_PID
}

# ── main ──────────────────────────────────────────────────────────────────────
check_tools
check_env
install_deps
run_services
