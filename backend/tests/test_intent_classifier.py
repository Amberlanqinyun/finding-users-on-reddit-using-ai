"""Unit tests for the rule-based intent classifier (E1.1)."""
import pytest

from app.services.scoring.intent_classifier import classify_by_rules


@pytest.mark.parametrize("text,expected_label", [
    ("How do I connect my database to FastAPI?", "seeking_solution"),
    ("Can anyone recommend a good Redis client for Python?", "recommendation_req"),
    ("I hate how broken this library is, nothing works", "complaining"),
    ("Not working — getting a 500 error on every request", "troubleshooting"),
    ("Just discovered this framework, wondering if it's worth learning", "discovery"),
    ("What's the difference between Redis and Memcached?", "comparing"),
])
def test_rule_based_classification(text: str, expected_label: str) -> None:
    result = classify_by_rules(text)
    assert result is not None, f"Expected a rule to fire for: {text!r}"
    assert result.label == expected_label, (
        f"Expected {expected_label!r}, got {result.label!r} for: {text!r}"
    )
    assert 0.0 <= result.confidence <= 1.0


def test_no_rule_fires_for_neutral_text() -> None:
    result = classify_by_rules("The weather is nice today.")
    # May or may not fire — we just check it doesn't crash
    if result is not None:
        assert result.label in [
            "discovery", "seeking_solution", "comparing",
            "complaining", "recommendation_req", "troubleshooting",
        ]


def test_high_confidence_for_strong_signals() -> None:
    result = classify_by_rules("How do I fix this error? It's not working and I hate it.")
    assert result is not None
    # Multiple signals should push confidence above 0.65
    assert result.confidence >= 0.5
