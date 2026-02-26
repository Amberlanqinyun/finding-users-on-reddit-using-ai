# Data Model Overview

## Entity Relationship Summary

```
Workspace (multi-tenant root)
  ├── WorkspaceMember (User × Role)
  ├── AuditLog
  ├── ProductBrief (+ BriefVersion history)
  ├── ConnectorConfig (Reddit | X)
  ├── KeywordSet (+ KeywordSuggestion)
  ├── SourceItem (normalized post/comment)
  │     └── Opportunity (scored, workflow status)
  │           ├── Draft (+ DraftVariant ×2–3)
  │           └── OpportunityActivity (audit trail)
  └── ExportIntegration (Notion | Sheets)
        └── ExportRecord (stable ID per opportunity)
```

## Key Design Decisions

### Deduplication (C1.2)
`SourceItem` is deduplicated by `(canonical_url, content_hash)`.
`content_hash` = sha256 of normalized (stripped, lowercased) body text.
This handles cross-connector duplicates (same post seen via different queries).

### Feature Flags (A3.3)
Stored as a `JSONB` column on `Workspace.feature_flags`.
The `app.core.feature_flags` module resolves effective flags with workspace-level overrides taking precedence over defaults.
Risky features (X connector, DM drafts) default to OFF.

### Status Pipeline (H1.1)
`Opportunity.status` follows a linear pipeline:
```
New → Reviewed → Drafted → Posted → Replied → Follow-up → Won | Lost
```
Every transition is recorded in `OpportunityActivity`.

### Draft Safety (F1, F2)
- `Draft.is_dm = False` by default.
- DM drafts require `dm_invitation_confirmed = True` (explicit checkbox, F2.1).
- No connector ever sends messages — copy-only.
- `DraftVariant.copied_at` is set when user copies, emitting `draft_copied` telemetry.

### Export Idempotency (G2.2, G3.2)
`ExportRecord` stores a stable `external_id` (Notion page ID or Sheets row ID).
Sync jobs update existing records rather than creating duplicates.
