# ADR 001: Connector Interface Design

**Status:** Accepted
**Date:** 2026-02-26
**Ticket:** C1.1

## Context
We need to add Reddit on day 1 and potentially X later. The two APIs have different auth models, rate limits, result shapes, and policy constraints.

## Decision
Define an abstract `BaseConnector` with a single async generator method `fetch(query) → AsyncIterator[SourcePost]`. All platform-specific logic lives inside the connector. The rest of the application only speaks `SourcePost`.

## Consequences
- Adding a new platform = implement `BaseConnector` + register in the connector registry. Zero changes to scoring or drafting.
- Feature flags control which connectors are active per workspace (A3.3).
- Connectors are stateless — credentials and schedule live in `ConnectorConfig` (DB).

## Rejected Alternatives
- **Webhook-based ingestion:** Reddit's push API (PushShift) was shut down. Pull is the only viable approach.
- **Shared ORM model per platform:** Too much coupling, schema migrations on every new platform.
