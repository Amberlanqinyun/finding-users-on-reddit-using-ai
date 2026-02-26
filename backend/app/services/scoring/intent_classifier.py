"""
Intent classifier — ticket E1.1.

Two-stage: rule-based fast path → LLM fallback for ambiguous cases.

Labels:
  discovery            - user is exploring a problem space
  seeking_solution     - user needs a specific fix right now
  comparing            - user is evaluating options
  complaining          - user venting, low conversion probability
  recommendation_req   - user asking "what do you use for X"
  troubleshooting      - user debugging a concrete issue
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass

import anthropic

from app.core.config import get_settings

logger = logging.getLogger(__name__)

INTENT_LABELS = [
    "discovery",
    "seeking_solution",
    "comparing",
    "complaining",
    "recommendation_req",
    "troubleshooting",
]

# Simple keyword heuristics for the fast path
_RULE_PATTERNS: list[tuple[str, str]] = [
    (r"\b(how do i|how to|i need to|help me)\b", "seeking_solution"),
    (r"\b(recommend|suggest|what do you use|which is better|vs\.?|versus|alternative)\b", "recommendation_req"),
    (r"\b(compare|comparison|pros and cons|difference between)\b", "comparing"),
    (r"\b(not working|broken|bug|error|exception|crash|fails?|issue)\b", "troubleshooting"),
    (r"\b(hate|frustrated|sick of|annoyed|worst|terrible|awful)\b", "complaining"),
    (r"\b(wondering|curious|thinking about|heard about|just discovered)\b", "discovery"),
]

_COMPILED = [(re.compile(p, re.IGNORECASE), label) for p, label in _RULE_PATTERNS]


@dataclass
class IntentResult:
    label: str
    confidence: float  # 0.0–1.0
    method: str  # "rule" | "llm"


def classify_by_rules(text: str) -> IntentResult | None:
    """
    Returns a result if a rule fires with high confidence,
    otherwise returns None (triggering LLM fallback).
    """
    counts: dict[str, int] = {}
    for pattern, label in _COMPILED:
        if pattern.search(text):
            counts[label] = counts.get(label, 0) + 1

    if not counts:
        return None

    best_label = max(counts, key=counts.__getitem__)
    # Rule confidence: more pattern matches → higher confidence
    confidence = min(0.5 + counts[best_label] * 0.15, 0.85)
    return IntentResult(label=best_label, confidence=confidence, method="rule")


async def classify_by_llm(text: str) -> IntentResult:
    """
    LLM fallback using Claude. Only called when rules are inconclusive.
    """
    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    labels_str = ", ".join(INTENT_LABELS)
    prompt = (
        f"Classify the intent of the following social media post into exactly one of: {labels_str}.\n"
        "Respond with JSON: {{\"label\": \"<label>\", \"confidence\": <0.0-1.0>}}\n\n"
        f"Post:\n{text[:1500]}"
    )

    try:
        message = await client.messages.create(
            model=settings.default_model,
            max_tokens=64,
            messages=[{"role": "user", "content": prompt}],
        )
        import json
        result = json.loads(message.content[0].text)
        return IntentResult(
            label=result.get("label", "discovery"),
            confidence=float(result.get("confidence", 0.6)),
            method="llm",
        )
    except Exception as exc:
        logger.warning("LLM intent classification failed: %s", exc)
        return IntentResult(label="discovery", confidence=0.3, method="llm")


async def classify_intent(text: str) -> IntentResult:
    """Entry point: rule fast-path, LLM fallback."""
    result = classify_by_rules(text)
    if result and result.confidence >= 0.65:
        return result
    return await classify_by_llm(text)
