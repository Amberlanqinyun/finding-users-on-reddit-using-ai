"""
Celery application — ticket A3.1.

Tasks:
  - ingestion.run_reddit_query   (C2.1)
  - ingestion.run_x_query        (C3.1)
  - scoring.score_opportunity    (E1, E2)
  - drafting.generate_drafts     (F1)
  - exports.sync_notion          (G2)
  - exports.sync_sheets          (G3)
  - digests.send_digest          (E3.1)
"""
from celery import Celery
from celery.utils.log import get_task_logger

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "findingusers",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Retry policy defaults (ticket A3.1)
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_max_retries=3,
    # Dead letter queue via a dedicated queue
    task_routes={
        "app.workers.tasks.ingestion.*": {"queue": "ingestion"},
        "app.workers.tasks.scoring.*": {"queue": "scoring"},
        "app.workers.tasks.exports.*": {"queue": "exports"},
        "app.workers.tasks.digests.*": {"queue": "digests"},
    },
)

# Autodiscover tasks in workers/tasks/
celery_app.autodiscover_tasks(["app.workers.tasks"])
