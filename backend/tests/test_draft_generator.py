"""Unit tests for salesiness heuristics (F1.2) — no LLM calls needed."""
import pytest

from app.services.drafting.draft_generator import score_salesiness


@pytest.mark.parametrize("text,expected_score_range,expected_warning_count", [
    # Clean reply — no banned phrases
    ("Have you tried setting a connection pool size? That fixed it for me.", (0.0, 0.1), 0),
    # One banned phrase
    ("You might want to check out our tool for this.", (0.1, 0.5), 1),
    # Multiple banned phrases — high salesiness
    ("Sign up for a free trial and click here to get a special offer!", (0.9, 1.0), 3),
])
def test_salesiness_score(text: str, expected_score_range: tuple, expected_warning_count: int) -> None:
    score, warnings = score_salesiness(text)
    lo, hi = expected_score_range
    assert lo <= score <= hi, f"Score {score} not in [{lo}, {hi}] for: {text!r}"
    assert len(warnings) >= expected_warning_count


def test_empty_text() -> None:
    score, warnings = score_salesiness("")
    assert score == 0.0
    assert warnings == []
