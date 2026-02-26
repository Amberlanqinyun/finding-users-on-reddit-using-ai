"""FastAPI application entry point."""
import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration

from app.core.config import get_settings

settings = get_settings()

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.environment,
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.2,
    )

app = FastAPI(
    title="FindingUsers API",
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers — uncomment as each epic is implemented
# ---------------------------------------------------------------------------
# from app.api import auth, workspaces, briefs, keywords, opportunities, drafts, exports
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
# app.include_router(workspaces.router, prefix="/api/v1/workspaces", tags=["workspaces"])
# app.include_router(briefs.router, prefix="/api/v1/briefs", tags=["briefs"])
# app.include_router(keywords.router, prefix="/api/v1/keywords", tags=["keywords"])
# app.include_router(opportunities.router, prefix="/api/v1/opportunities", tags=["opportunities"])
# app.include_router(drafts.router, prefix="/api/v1/drafts", tags=["drafts"])
# app.include_router(exports.router, prefix="/api/v1/exports", tags=["exports"])


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "version": "0.1.0"}
