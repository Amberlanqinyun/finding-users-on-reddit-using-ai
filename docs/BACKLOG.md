# MVP Backlog

> **Assumptions:** MVP focuses on human-in-the-loop (no auto-posting, no auto-DMs), with Reddit + X connectors behind feature flags depending on API access.

## Priority Legend

| Label | Meaning |
|---|---|
| `P0` | Required for MVP launch |
| `P1` | Next layer after MVP is stable |
| `P2` | Later |

## Sprint Plan

| Sprint | Theme | Epics |
|---|---|---|
| **Sprint 0** | Foundation | A1, A2, A3 |
| **Sprint 1** | Onboarding + Brief + Ingestion MVP | B1, B2, B3, C1, C2 |
| **Sprint 2** | Scoring + Drafts + Digest + Exports | C3, D1, D2, E1, E2, E3, F1, F3, G1, G2, G3 |
| **Sprint 3** | Workflow + Analytics + Collaboration | H1, H2, I1 |

---

## EPIC A: Foundation and Platform (Sprint 0–1)

### A1. Multi-tenant Workspace + RBAC `P0`

**User story:** As a team, we need workspaces with roles so we can collaborate safely.

#### A1.1 Workspace model + membership
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Create workspace
  - Invite user by email
  - List members with roles: Owner / Admin / Member / Viewer
  - Remove member

#### A1.2 Role-based permissions
- **Owner:** BE/FE | **Estimate:** M
- **Acceptance criteria:**
  - Only Owner/Admin can edit Product Brief + connectors + exports
  - Member can triage + draft
  - Viewer read-only

#### A1.3 Audit log (core actions)
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - Log: brief edits, connector changes, export sync, member changes

---

### A2. Auth + Organization Settings `P0`

#### A2.1 Auth (email magic link or OAuth)
- **Owner:** BE/FE | **Estimate:** M
- **Acceptance criteria:**
  - Sign up, sign in, sign out
  - Passwordless session persistence

#### A2.2 Workspace settings page
- **Owner:** FE | **Estimate:** S
- **Acceptance criteria:**
  - Rename workspace
  - View plan limits placeholders (no billing yet)

---

### A3. Observability + Job Runner `P0`

#### A3.1 Background job framework
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Schedule jobs
  - Retry with backoff
  - Dead letter queue

#### A3.2 Logging + metrics
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - Ingestion success/fail counts
  - Draft generation latency + errors

#### A3.3 Feature flags
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - Toggle connectors per workspace (Reddit/X)
  - Toggle DM drafts (off by default)

---

## EPIC B: Onboarding and Product Brief (Sprint 1)

### B1. Website URL Onboarding `P0`

**User story:** As a founder, I paste my website and get a draft positioning brief without writing docs.

#### B1.1 URL fetcher + page selection
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Fetch homepage + 3–8 relevant pages (About, Pricing, Use cases)
  - Error handling: blocked / timeout / invalid URL

#### B1.2 Brief extraction (LLM pipeline)
- **Owner:** BE/ML | **Estimate:** M
- **Acceptance criteria:**
  - Generate: ICP hypotheses, pains, value props, "what not to say"
  - Provide confidence tags per section

#### B1.3 "3-step yes/adjust" wizard
- **Owner:** FE | **Estimate:** M
- **Acceptance criteria:**
  - Step 1: choose primary persona
  - Step 2: confirm top pains
  - Step 3: confirm tone + CTA ladder rules

---

### B2. Persona Doc Upload Onboarding `P0`

**User story:** As a user with a persona doc, I upload it and the tool turns it into a structured brief.

#### B2.1 File upload (PDF/DOCX/TXT/MD)
- **Owner:** FE/BE | **Estimate:** M
- **Acceptance criteria:**
  - Upload + store file
  - Show parsing status

#### B2.2 Structured brief generator
- **Owner:** BE/ML | **Estimate:** M
- **Acceptance criteria:**
  - Extract required fields: persona, pains, goals, examples/demographics, taboo phrases
  - Validation highlights missing fields

#### B2.3 Brief editor
- **Owner:** FE | **Estimate:** M
- **Acceptance criteria:**
  - Editable sections with version history (at least "last saved")
  - Save + publish states (Draft vs Active)

---

### B3. Tone, Voice, Guardrails `P0`

**User story:** As a user, I want drafts in my style with controls to avoid sounding salesy.

#### B3.1 Tone presets + custom tone
- **Owner:** FE/BE | **Estimate:** S
- **Acceptance criteria:**
  - Presets: Casual-friendly, Professional, Technical, Empathetic, Direct
  - Custom slider for "formality"

#### B3.2 Voice profile (sample replies + taboos)
- **Owner:** FE/BE | **Estimate:** M
- **Acceptance criteria:**
  - User adds 3–10 example replies
  - System extracts style notes + banned phrases list

---

## EPIC C: Source Ingestion and Normalization (Sprint 1–2)

### C1. Connector Framework `P0`

**User story:** As PM/engineering, we need a standard connector interface so we can add platforms safely.

#### C1.1 Connector interface + schemas
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Standard objects: `SourcePost`, `SourceComment`, `AuthorHandle`, `URL`, `Timestamp`, `Text`, `ThreadContext`

#### C1.2 Normalization + dedupe
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Deduplicate by canonical URL + content hash
  - Store thread relationships (post → comments)

---

### C2. Reddit Ingestion `P0` *(feature-flagged)*

**User story:** As a user, I can monitor relevant subreddits/keywords and receive matching items.

#### C2.1 Query runner (keywords/subreddits)
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Run saved queries on schedule
  - Store matching posts/comments

#### C2.2 Rate limit + backoff handling
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - No job storms
  - Transparent "coverage" indicator (last run, next run)

---

### C3. X Ingestion `P0/P1` *(feature-flagged, depending on API access)*

#### C3.1 Query runner (keywords/boolean)
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Pull matching posts
  - Store thread context if available

#### C3.2 Budget caps per workspace
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - Hard daily/monthly cap, auto-throttle when hit

---

## EPIC D: Keywords, Query Building, and Filtering (Sprint 2)

### D1. Manual Keyword Sets `P0`

**User story:** As a user, I can add keywords and exclusions to control what I see.

#### D1.1 Keyword set editor
- **Owner:** FE | **Estimate:** M
- **Acceptance criteria:**
  - Include/exclude, phrase match
  - Multi-language allowed

#### D1.2 "Never show again" rules
- **Owner:** FE/BE | **Estimate:** S
- **Acceptance criteria:**
  - Hide item, add rule based on keyword/author/subreddit

---

### D2. AI Keyword Suggestions `P0`

**User story:** As a user, AI suggests better keywords and I approve/reject quickly.

#### D2.1 Keyword suggestion generator
- **Owner:** BE/ML | **Estimate:** M
- **Acceptance criteria:**
  - Suggest synonyms, "how do I" questions, competitor alternatives
  - Group into clusters

#### D2.2 Feedback loop storage
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - Store approve/reject decisions per workspace
  - Use decisions to re-rank future suggestions

---

## EPIC E: Scoring, Prioritization, Queue (Sprint 2)

### E1. Intent Classification `P0`

**User story:** As a user, I want the system to label intent so I can focus on high-converting posts.

#### E1.1 Intent classifier (rules + LLM fallback)
- **Owner:** BE/ML | **Estimate:** M
- **Acceptance criteria:**
  - Labels: discovery, seeking solution, comparing, complaining, recommendation request, troubleshooting
  - Confidence score per label

---

### E2. Opportunity Scoring + Explanations `P0`

#### E2.1 Scoring model v1
- **Owner:** BE/ML | **Estimate:** M
- **Acceptance criteria:**
  - Combine: recency, relevance-to-brief, intent strength, community fit, risk flags

#### E2.2 "Why this is ranked" explanation
- **Owner:** FE/BE | **Estimate:** S
- **Acceptance criteria:**
  - Show top 3 factors that drove rank

---

### E3. Queueing + Scheduling `P0`

#### E3.1 Digest generator
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Generate digest list per schedule: daily / weekly / custom
  - Deduplicate items across digests until status changes

#### E3.2 Urgency + backlog management
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - Auto-expire low urgency items after N days (configurable)

---

## EPIC F: Drafting Engine — Comment + Optional DM (Sprint 2)

### F1. Comment Drafting with Variants `P0`

**User story:** As a user, I get 2–3 reply drafts that reference the post details and feel human.

#### F1.1 Draft generator v1
- **Owner:** BE/ML | **Estimate:** M
- **Acceptance criteria:**
  - Produces 2–3 variants
  - Each draft must reference 1 specific detail from the post
  - Structure: reflect pain → clarifying question → 1–2 practical steps → soft mention rule

#### F1.2 Salesiness heuristic + warnings
- **Owner:** BE/FE | **Estimate:** S
- **Acceptance criteria:**
  - Highlight banned phrases
  - Score and explain (e.g., too many CTAs, too direct)

---

### F2. DM Drafts `P1` *(gated hard, off by default)*

**User story:** As a user, I can generate a DM draft only when invited, and it is never auto-sent.

#### F2.1 DM draft generator (off by default)
- **Owner:** BE/ML | **Estimate:** S
- **Acceptance criteria:**
  - Requires checkbox "user invited DM"
  - No connector sends messages

#### F2.2 DM safety friction
- **Owner:** FE | **Estimate:** S
- **Acceptance criteria:**
  - Always shows caution text
  - Requires one extra click to copy DM

---

### F3. Draft Editor UX `P0`

#### F3.1 Inline editor + tone switch
- **Owner:** FE | **Estimate:** M
- **Acceptance criteria:**
  - Edit draft
  - Switch tone preset and regenerate

#### F3.2 Copy buttons + formatting
- **Owner:** FE | **Estimate:** S
- **Acceptance criteria:**
  - Copy comment
  - Copy DM (if enabled)
  - Character count indicators

---

## EPIC G: Delivery — Notion / Sheets / In-app (Sprint 2)

### G1. In-app Inbox `P0`

**User story:** As a user, I can open one place to triage today's opportunities with direct links.

#### G1.1 Inbox list + filters
- **Owner:** FE | **Estimate:** M
- **Acceptance criteria:**
  - Filter by source, intent, score, brief

#### G1.2 Item detail view
- **Owner:** FE | **Estimate:** M
- **Acceptance criteria:**
  - Show snippet + link out
  - Show drafts + status

---

### G2. Notion Export `P0`

#### G2.1 Notion integration setup
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Connect Notion
  - Select/create database

#### G2.2 Idempotent sync
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Stable IDs, no duplicates
  - Update status + draft fields

---

### G3. Google Sheets Export `P0`

#### G3.1 Sheets integration setup
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Connect Google
  - Select/create sheet

#### G3.2 Sync rows with stable IDs
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Append new rows, update existing rows reliably

---

## EPIC H: Workflow and Analytics (Sprint 3)

### H1. Status Pipeline + Assignment `P0`

**User story:** As a team, we assign opportunities, track progress, and see what converts.

#### H1.1 Status model
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - States: New → Reviewed → Drafted → Posted → Replied → Follow-up → Won/Lost

#### H1.2 Assign owner + notes
- **Owner:** FE/BE | **Estimate:** M
- **Acceptance criteria:**
  - Assign to teammate
  - Add notes
  - Activity history

---

### H2. Outcome Tracking + Dashboards `P0/P1`

#### H2.1 Basic analytics v1
- **Owner:** BE/FE | **Estimate:** M
- **Acceptance criteria:**
  - Counts by status
  - Follow-up rate by source and intent

#### H2.2 Draft adoption reporting
- **Owner:** BE | **Estimate:** S
- **Acceptance criteria:**
  - Track "copied draft" events and link to outcomes

---

## EPIC I: Responsible Use and Abuse Controls (Sprint 3)

### I1. Guardrails and Limits `P0`

**User story:** As the product owner, I need built-in anti-spam controls to reduce platform enforcement risk.

#### I1.1 Rate and volume guidance
- **Owner:** FE/BE | **Estimate:** S
- **Acceptance criteria:**
  - Show daily recommended cap (configurable)
  - Warn if user is copying too many drafts in short time

#### I1.2 Abuse flags
- **Owner:** BE | **Estimate:** M
- **Acceptance criteria:**
  - Flag repeated posting patterns (same text)
  - Flag banned keywords usage
  - Admin can disable a workspace connector

---

## Definition of Done

Applies to **every ticket**:

- [ ] Feature-flagged where policy/API risk exists
- [ ] Telemetry events emitted
- [ ] Error states handled
- [ ] Tests: unit for core logic, smoke tests for workflows
- [ ] Docs: short internal README for setup and runbooks
