# ADR 002: Human-in-the-loop Only — No Auto-posting

**Status:** Accepted
**Date:** 2026-02-26

## Context
Reddit and X actively enforce against automated posting and spam. Users who auto-post get banned. The core value prop is *quality* replies, not volume.

## Decision
The system **never** sends messages or posts comments on behalf of users.

- `DraftVariant` records are copy-only. No posting API calls exist in the codebase.
- DM drafts (`F2`) require: (a) feature flag `dm_drafts` enabled, (b) checkbox "user was invited to DM" confirmed, (c) an extra click to copy.
- `draft_copied` telemetry is emitted so we can track adoption without removing friction.

## Consequences
- Reduces platform ban risk significantly.
- Users own the action — we cannot be blamed for what they post.
- Limits automation appeal but aligns with positioning ("thoughtful outreach, not spam").

## Rejected Alternatives
- **Auto-post with rate limits:** Too high risk of platform enforcement. Not worth it for MVP.
- **Browser extension to inject drafts:** Interesting P2 idea, but out of scope for MVP.
