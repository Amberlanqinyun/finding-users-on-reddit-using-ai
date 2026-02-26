# Finding Users on Reddit Using AI

A human-in-the-loop tool that monitors Reddit (and optionally X) for high-intent posts matching your ICP, scores them, and generates context-aware reply drafts — without auto-posting or auto-DMing.

## Overview

| | |
|---|---|
| **MVP target** | End of Sprint 3 |
| **Human-in-the-loop** | No auto-posting, no auto-DMs |
| **Connectors** | Reddit (P0), X (P0/P1, feature-flagged) |
| **Exports** | Notion, Google Sheets, In-app inbox |
| **Team** | Multi-tenant workspaces with RBAC |

## Stack

| Layer | Choice |
|---|---|
| Backend | Python 3.12 + FastAPI |
| Database | PostgreSQL 16 |
| Queue | Redis + Celery |
| LLM | Anthropic Claude (claude-sonnet-4-6 default) |
| Frontend | Next.js 14 (App Router) + Tailwind |
| Auth | Magic link (Resend) |
| Hosting | Railway / Fly.io |
| Observability | OpenTelemetry + Sentry |

## Sprint Plan

| Sprint | Theme | Goal |
|---|---|---|
| **Sprint 0** | Foundation | Repo, infra, auth, workspace model, observability |
| **Sprint 1** | Onboarding + Brief + Ingestion | URL/doc onboarding, brief editor, ingestion skeleton, storage, dedupe |
| **Sprint 2** | Scoring + Drafts + Digest + Exports | Intent scoring, draft generation, scheduling, Notion/Sheets |
| **Sprint 3** | Workflow + Analytics + Collaboration | Triage board, status pipeline, team roles, dashboards, basic abuse controls |

## Project Structure

```
.
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── core/     # Config, auth, feature flags
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   │   ├── ingestion/   # Connector framework
│   │   │   ├── scoring/     # Intent + opportunity scoring
│   │   │   ├── drafting/    # Draft generation engine
│   │   │   └── exports/     # Notion / Sheets sync
│   │   └── workers/  # Celery tasks
│   └── tests/
├── frontend/         # Next.js application
│   ├── app/          # App Router pages
│   ├── components/
│   └── lib/
├── docs/             # Architecture, runbooks, ADRs
│   ├── architecture/
│   ├── runbooks/
│   └── adr/
├── infra/            # Docker, CI/CD, IaC
│   ├── docker/
│   └── scripts/
└── .github/
    ├── ISSUE_TEMPLATE/
    └── workflows/
```

## Quick Start

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in secrets
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.local.example .env.local
npm run dev

# Workers
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

## Priority Legend

| Label | Meaning |
|---|---|
| `P0` | Required for MVP launch |
| `P1` | Next layer after MVP is stable |
| `P2` | Later |

## Definition of Done

Every ticket must satisfy:
- [ ] Feature-flagged where policy/API risk exists
- [ ] Telemetry events emitted
- [ ] Error states handled
- [ ] Unit tests for core logic, smoke tests for workflows
- [ ] Short internal README / runbook entry

## Instrumentation Events (minimum set)

```
workspace_created
brief_generated_from_url
brief_generated_from_doc
keyword_suggestion_approved
keyword_suggestion_rejected
mention_ingested
opportunity_scored
draft_generated
draft_copied
status_changed
export_sync_success
export_sync_failure
digest_sent
```

## Ruthless Scope Trim (2-sprint MVP)

Cut if speed is critical:
- Team roles → keep single-user
- X connector → ship Reddit only
- Dashboards → keep status tracking only
- Voice profile → keep tone presets only

## Links

- [Full Backlog](./docs/BACKLOG.md)
- [Architecture Decision Records](./docs/adr/)
- [Runbooks](./docs/runbooks/)
