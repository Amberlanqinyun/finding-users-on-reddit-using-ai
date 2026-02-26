"""Unit tests for SourcePost deduplication logic (C1.2)."""
from app.services.ingestion.connector_interface import SourcePost


def make_post(body: str, platform: str = "reddit") -> SourcePost:
    return SourcePost(
        platform=platform,
        external_id="abc123",
        canonical_url="https://reddit.com/r/test/comments/abc123",
        title="Test post",
        body=body,
        author=None,
        posted_at=None,
    )


def test_content_hash_is_stable() -> None:
    post = make_post("Hello, world!")
    assert post.content_hash == make_post("Hello, world!").content_hash


def test_content_hash_is_case_insensitive() -> None:
    assert make_post("Hello World").content_hash == make_post("hello world").content_hash


def test_content_hash_differs_for_different_bodies() -> None:
    assert make_post("Post A body").content_hash != make_post("Post B body").content_hash


def test_content_hash_strips_whitespace() -> None:
    assert make_post("  hello  ").content_hash == make_post("hello").content_hash
