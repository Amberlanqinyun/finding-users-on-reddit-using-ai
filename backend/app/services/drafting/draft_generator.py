"""
Draft generator — ticket F1.1.

Produces 2–3 reply variants per opportunity.

Structure enforced per variant:
  1. Reflect the specific pain from the post
  2. Ask one clarifying question
  3. 1–2 practical steps (no product pitch yet)
  4. Soft mention (optional, configurable)

Salesiness heuristics are applied post-generation (F1.2).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import anthropic

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Tone preset → instruction snippet
TONE_PRESETS = {
    "casual_friendly": "Write in a warm, conversational tone. Use plain language, short sentences.",
    "professional": "Write in a clear, professional tone. No slang.",
    "technical": "Write with technical precision. Assume the reader is technically literate.",
    "empathetic": "Lead with empathy. Acknowledge the difficulty before offering help.",
    "direct": "Be direct and concise. Skip pleasantries. Get to the point immediately.",
}

# Phrases that trigger salesiness warnings
BANNED_PHRASES = [
    "check out",
    "click here",
    "sign up",
    "free trial",
    "limited time",
    "buy now",
    "our product",
    "we offer",
    "special offer",
    "discount",
]


@dataclass
class DraftVariant:
    body: str
    tone: str
    salesiness_score: float  # 0.0 (clean) – 1.0 (very salesy)
    warnings: list[str]


@dataclass
class DraftResult:
    variants: list[DraftVariant]
    post_excerpt: str  # specific detail referenced


def score_salesiness(text: str) -> tuple[float, list[str]]:
    """
    Simple heuristic: count banned phrases.
    Returns (score, list_of_warnings).
    """
    text_lower = text.lower()
    hits = [phrase for phrase in BANNED_PHRASES if phrase in text_lower]
    score = min(len(hits) / 3.0, 1.0)
    warnings = [f'Phrase detected: "{phrase}"' for phrase in hits]
    return score, warnings


async def generate_drafts(
    post_title: str,
    post_body: str,
    tone: str = "empathetic",
    num_variants: int = 3,
    brief_context: str = "",
    taboo_phrases: list[str] | None = None,
) -> DraftResult:
    """
    Generate reply drafts for a post.

    Args:
        post_title: Title of the source post.
        post_body: Body text of the source post.
        tone: One of TONE_PRESETS keys.
        num_variants: Number of variants to generate (2–3).
        brief_context: Product Brief summary to inform the reply angle.
        taboo_phrases: Additional phrases the user has banned.
    """
    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    tone_instruction = TONE_PRESETS.get(tone, TONE_PRESETS["empathetic"])
    all_banned = BANNED_PHRASES + (taboo_phrases or [])
    banned_str = ", ".join(f'"{p}"' for p in all_banned)

    prompt = f"""You are helping a founder craft genuine, helpful Reddit replies.

PRODUCT CONTEXT (use to inform angle, not to pitch):
{brief_context or "No product context provided."}

REPLY RULES:
- {tone_instruction}
- You MUST reference one specific detail from the post (quote or paraphrase it).
- Structure: reflect pain → one clarifying question → 1–2 practical steps → optional soft mention.
- NEVER use these phrases: {banned_str}
- Do NOT auto-promote. The reply must stand alone as genuinely useful.
- Max 200 words per variant.

POST TITLE: {post_title}
POST BODY:
{post_body[:1000]}

Generate {num_variants} distinct reply variants. Return as a JSON array:
[{{"variant": 1, "body": "..."}}, ...]
Only return the JSON array, no other text."""

    try:
        message = await client.messages.create(
            model=settings.default_model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        import json
        raw = json.loads(message.content[0].text)

        variants = []
        for item in raw[:num_variants]:
            body = item.get("body", "")
            salesiness_score, warnings = score_salesiness(body)
            variants.append(DraftVariant(
                body=body,
                tone=tone,
                salesiness_score=salesiness_score,
                warnings=warnings,
            ))

        # Extract the specific detail referenced (simple heuristic: first sentence)
        excerpt = ". ".join(post_body.split(".")[:2]).strip() if post_body else post_title

        return DraftResult(variants=variants, post_excerpt=excerpt)

    except Exception as exc:
        logger.error("Draft generation failed: %s", exc)
        raise
