"""
Connector interface — standard contract all platform connectors must implement.

Ticket C1.1: defines SourcePost, SourceComment, AuthorHandle, ThreadContext
and the abstract BaseConnector that Reddit/X connectors implement.
"""
from __future__ import annotations

import hashlib
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import AsyncIterator


@dataclass
class AuthorHandle:
    handle: str
    platform: str
    profile_url: str | None = None


@dataclass
class ThreadContext:
    """Parent post context when ingesting a comment."""
    external_id: str
    title: str | None
    url: str
    author: AuthorHandle | None
    body: str


@dataclass
class SourcePost:
    """Normalized representation of any platform post."""
    platform: str
    external_id: str
    canonical_url: str
    title: str | None
    body: str
    author: AuthorHandle | None
    posted_at: datetime | None
    # Reddit specific
    subreddit: str | None = None
    # Raw platform payload for metadata storage
    raw: dict = field(default_factory=dict)
    # Thread context (populated for comments)
    thread: ThreadContext | None = None
    item_type: str = "post"  # "post" | "comment"

    @property
    def content_hash(self) -> str:
        """sha256 of normalized body for deduplication (C1.2)."""
        normalized = (self.body or "").strip().lower()
        return hashlib.sha256(normalized.encode()).hexdigest()


@dataclass
class ConnectorQuery:
    """Query parameters passed to a connector run."""
    keywords: list[str]
    exclude_keywords: list[str] = field(default_factory=list)
    subreddits: list[str] = field(default_factory=list)  # Reddit only
    since: datetime | None = None
    limit: int = 100


class BaseConnector(ABC):
    """
    Abstract connector. Implement this for each platform.

    Usage:
        async for post in connector.fetch(query):
            await ingest_post(post, workspace_id=...)
    """

    platform: str  # must be set by subclass

    @abstractmethod
    async def fetch(self, query: ConnectorQuery) -> AsyncIterator[SourcePost]:
        """Yield normalized SourcePost objects matching the query."""
        ...

    @abstractmethod
    async def health_check(self) -> bool:
        """Return True if the connector can reach the platform API."""
        ...
