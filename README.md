# 🇬🇷 Learn Greek

A personal Greek language learning web app with interactive word bubbles, free-typing practice, conversation simulation, reading mode, and flashcard review.

## Project Structure

```
learn_greek/
├── frontend/          # React + Vite + TypeScript + TailwindCSS
└── backend/           # Python FastAPI + SQLAlchemy + PostgreSQL
```

## Frontend

Built with **React 19**, **Vite**, **TypeScript**, **TailwindCSS v4**, and **React Router v7**.

### Setup

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:5173/learn_greek/
```

### Scripts

| Command              | Description                   |
|----------------------|-------------------------------|
| `pnpm dev`           | Start dev server              |
| `pnpm build`         | Production build              |
| `pnpm test`          | Run Vitest unit tests         |
| `pnpm lint`          | ESLint                        |
| `pnpm format`        | Prettier                      |

### Features

- **Word Bubbles** — tap/click word tiles to build the correct Greek phrase
- **Free Typing** — type Greek translations with hint support
- **Conversation** — simulated back-and-forth Greek dialogues with feedback
- **Reading Mode** — click unknown words in a passage to save them as flashcards
- **Flashcards** — flip-card review of all saved words; `localStorage` persisted

## Backend

Built with **FastAPI**, **SQLAlchemy 2 (async)**, **PostgreSQL** (via asyncpg), managed with **uv** and linted with **ruff**.

### Setup

```bash
cd backend
uv sync --all-groups

# Copy and edit environment variables
cp .env.example .env

# Run the server
uv run uvicorn main:app --reload
```

### Environment Variables (`.env`)

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/learn_greek
DEBUG=false
CORS_ORIGINS=["http://localhost:5173"]
```

### API Endpoints

| Method | Path                                | Description              |
|--------|-------------------------------------|--------------------------|
| GET    | `/health`                           | Health check             |
| GET    | `/api/v1/flashcards/`               | List all flashcards      |
| POST   | `/api/v1/flashcards/`               | Create a flashcard       |
| GET    | `/api/v1/flashcards/{id}`           | Get a flashcard          |
| PATCH  | `/api/v1/flashcards/{id}`           | Update a flashcard       |
| POST   | `/api/v1/flashcards/{id}/review`    | Mark flashcard reviewed  |
| DELETE | `/api/v1/flashcards/{id}`           | Delete a flashcard       |
| GET    | `/api/v1/sessions/`                 | List practice sessions   |
| POST   | `/api/v1/sessions/`                 | Create a session         |
| GET    | `/api/v1/sessions/{id}`             | Get a session            |
| PATCH  | `/api/v1/sessions/{id}`             | Complete a session       |
| POST   | `/api/v1/sessions/{id}/answers`     | Record an answer         |

Interactive API docs available at `http://localhost:8000/docs`.

### Running Tests

```bash
cd backend
uv run pytest tests/ -v
```

## Deployment

- **Frontend** → GitHub Pages via `deploy-frontend.yml` workflow on push to `main`
- **Backend CI** → lint + tests on every push/PR via `backend-ci.yml`
- **Frontend CI** → format check + lint + tests + build on every push/PR via `frontend-ci.yml`
