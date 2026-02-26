"""
Reddit connector — feature-flagged, implements BaseConnector.

Ticket C2.1: keyword/subreddit query runner
Ticket C2.2: rate limit + backoff handling

Requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in env.
Uses asyncpraw under the hood.
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from typing import AsyncIterator

import asyncpraw
import asyncpraw.exceptions

from app.core.config import get_settings
from .connector_interface import AuthorHandle, BaseConnector, ConnectorQuery, SourcePost

logger = logging.getLogger(__name__)

# Reddit API rate limit: 100 requests / 10 min (OAuth)
_RATE_LIMIT_SLEEP = 1.0  # seconds between requests (conservative)
_MAX_RETRIES = 3
_BACKOFF_BASE = 2.0


class RedditConnector(BaseConnector):
    platform = "reddit"

    def __init__(self) -> None:
        settings = get_settings()
        self._client_id = settings.reddit_client_id
        self._client_secret = settings.reddit_client_secret
        self._user_agent = settings.reddit_user_agent

    def _make_reddit(self) -> asyncpraw.Reddit:
        return asyncpraw.Reddit(
            client_id=self._client_id,
            client_secret=self._client_secret,
            user_agent=self._user_agent,
        )

    async def health_check(self) -> bool:
        try:
            async with self._make_reddit() as reddit:
                await reddit.subreddit("reddit")
                return True
        except Exception as exc:
            logger.warning("Reddit health check failed: %s", exc)
            return False

    async def fetch(self, query: ConnectorQuery) -> AsyncIterator[SourcePost]:
        """
        Search each subreddit (or all of Reddit via r/all) for the given keywords.
        Applies exclude_keywords as a post-filter.
        """
        async with self._make_reddit() as reddit:
            search_targets = query.subreddits if query.subreddits else ["all"]
            search_string = " OR ".join(f'"{kw}"' for kw in query.keywords)

            for subreddit_name in search_targets:
                subreddit = await reddit.subreddit(subreddit_name)

                retries = 0
                while retries <= _MAX_RETRIES:
                    try:
                        async for submission in subreddit.search(
                            search_string,
                            sort="new",
                            limit=query.limit,
                        ):
                            post = self._submission_to_source_post(submission, subreddit_name)
                            if post and not self._is_excluded(post, query.exclude_keywords):
                                yield post
                            await asyncio.sleep(_RATE_LIMIT_SLEEP)
                        break
                    except asyncpraw.exceptions.RedditAPIException as exc:
                        if exc.error_type == "RATELIMIT":
                            wait = _BACKOFF_BASE ** retries
                            logger.warning("Reddit rate limit hit, backing off %ss", wait)
                            await asyncio.sleep(wait)
                            retries += 1
                        else:
                            logger.error("Reddit API error: %s", exc)
                            break

    def _submission_to_source_post(self, submission: object, subreddit_name: str) -> SourcePost | None:
        try:
            body = submission.selftext or submission.url or ""
            return SourcePost(
                platform=self.platform,
                external_id=submission.id,
                canonical_url=f"https://reddit.com{submission.permalink}",
                title=submission.title,
                body=body,
                author=AuthorHandle(
                    handle=str(submission.author) if submission.author else "[deleted]",
                    platform=self.platform,
                    profile_url=f"https://reddit.com/u/{submission.author}" if submission.author else None,
                ),
                posted_at=datetime.utcfromtimestamp(submission.created_utc),
                subreddit=subreddit_name,
                raw={
                    "score": submission.score,
                    "num_comments": submission.num_comments,
                    "upvote_ratio": submission.upvote_ratio,
                    "is_self": submission.is_self,
                },
                item_type="post",
            )
        except Exception as exc:
            logger.warning("Failed to parse submission %s: %s", getattr(submission, "id", "?"), exc)
            return None

    @staticmethod
    def _is_excluded(post: SourcePost, exclude_keywords: list[str]) -> bool:
        if not exclude_keywords:
            return False
        text = f"{post.title or ''} {post.body}".lower()
        return any(kw.lower() in text for kw in exclude_keywords)
