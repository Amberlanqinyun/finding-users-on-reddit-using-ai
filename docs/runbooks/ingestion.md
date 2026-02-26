# Runbook: Ingestion

## Overview
The ingestion system fetches posts/comments from Reddit (and optionally X) using saved `KeywordSet` configurations and stores normalized `SourceItem` records.

## Jobs

### `ingestion.run_reddit_query`
- **Trigger:** Scheduled (configurable per workspace, default: every 4 hours)
- **Queue:** `ingestion`
- **Inputs:** `workspace_id`, `keyword_set_id`
- **Steps:**
  1. Load `KeywordSet` + `ConnectorConfig` for Reddit
  2. Check feature flag `reddit_connector` is enabled
  3. Check daily request budget (`ConnectorConfig.requests_today < daily_request_cap`)
  4. Instantiate `RedditConnector`, call `fetch(query)`
  5. For each `SourcePost`: deduplicate by `(canonical_url, content_hash)`, upsert `SourceItem`
  6. Emit `mention_ingested` telemetry event
  7. Update `ConnectorConfig.last_run_at`, `next_run_at`
- **Retries:** 3 × exponential backoff (A3.1)
- **Dead letter:** `ingestion.dlq` queue

## Coverage Indicator (C2.2)
The UI reads `ConnectorConfig.last_run_at` and `next_run_at` to show a "last fetched X ago / next fetch in Y" badge.

## Alerts
| Condition | Action |
|---|---|
| Job fails 3× in a row | Page on-call, disable connector for workspace |
| `requests_today >= daily_request_cap` | Emit `ingestion_budget_hit` event, skip run |
| Reddit API returns 429 | Backoff 2^n seconds, up to 3 retries |
