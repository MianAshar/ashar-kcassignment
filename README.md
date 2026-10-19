# Trip Expense Splitter

A browser-based calculator that tracks shared expenses across a group trip and
produces a settlement showing who pays whom. Built as a take-home assignment
for KnowledgeCity (Technology Division).

---

## What it does and who it is for

**User:** The Trip Treasurer — one person who records shared expenses during or
after a group trip and needs to produce a final settlement the whole group can
trust.

**Problem it solves:** Multi-leg trips with variable group membership and
multiple payers produce a calculation that phone calculators and mental
arithmetic cannot handle reliably. For example: two legs with different
headcounts, each paid by a different person, with some participants on only one
leg — the net balance for each person and the minimum set of transfers is not
obvious.

**Why this calculator over others:** Dedicated expense-sharing apps require
accounts, app installs, and ongoing access. For a one-off group trip where a
single person is doing the bookkeeping, a purpose-built browser tool that runs
locally with no sign-up is faster to start and shares no data with any server.

**What you get:**

- A **simplified settlement** (greedy debtor-creditor matching): at most N − 1
  transfers, enough to clear every balance. Labelled "Simplified settlement"
  in the UI because the greedy result is not guaranteed to be the mathematical
  minimum — it is sufficient for typical group sizes of 3–8 people.
- A **per-person breakdown** showing each participant's share of every expense,
  what they paid, who they owe, and their net balance — so any group member can
  verify the numbers independently.

---

## Running the app

**Requirement:** Node 20 or later. No accounts, API keys, or cloud services.

```bash
npm install        # install dependencies (first time only)
npm run dev        # start dev server → open http://localhost:5173
```

### Unit tests

```bash
npm test           # runs once and exits (no watch mode)
```

### End-to-end tests

Requires a one-time Chromium download (~130 MB):

```bash
npx playwright install chromium   # one time only
npm run test:e2e                   # runs the full Playwright suite
```

`npm test` and `npm run test:e2e` are independent. Unit tests stay fast and
do not require a browser.

### Production build (optional)

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

---

## How it was verified

| Layer | Tool | Count |
|---|---|---|
| Pure logic (rounding, balances, settlement, storage) | Vitest unit tests | 95 tests |
| Full UI and user flows | Playwright E2E (Chromium) | 83 tests |
| Manual walkthroughs | 10 scenarios in `docs/qa-checklist.md` | all Pass — Chrome, 2026-10-19 |

Every story marked Implemented in `docs/user-stories.md` is covered by at
least one automated test and at least one passed manual scenario.

---

## AI tools used

**Claude Code CLI** (model: claude-sonnet-4-6) — used for the entire
assignment: wrote all code, tests, and documentation under PM direction.
Two prompts in session 01 were drafted in Claude Desktop before being
sent via Claude Code; all actual code and file changes were made through
Claude Code.

The PM (assignment author) directed each step, reviewed outputs, caught bugs,
and confirmed acceptance criteria by hand.

---

## Manual code changes

None. All changes were made through Claude Code under explicit PM instruction.
If any hand-edits are made after submission, they will be logged here.

---

## Assumptions and scope

### In scope

- Add, rename, remove participants (with guard: cannot remove someone on an
  expense).
- Add, edit, delete expenses: description, amount (whole rupees), payer, subset
  of sharers.
- Optional tip per expense: percentage or flat rupee amount, added before
  splitting.
- localStorage persistence: survives tab close and browser restart on the same
  device and browser.
- New Trip: clears all data after explicit confirmation.
- Simplified settlement (greedy, at most N − 1 transfers).
- Per-person breakdown with "Paid by" column for auditability.

### Rounding rule (S-12)

All shares are whole rupees. For total T, payer P, n sharers in listed order:

- **Case A — P is a sharer:** every other sharer gets ⌊T ÷ n⌋; P absorbs the
  remainder. Example: Rs. 1,000 ÷ 3 → others Rs. 333, payer Rs. 334.
- **Case B — P is not a sharer:** base share ⌊T ÷ n⌋; leftover rupees
  distributed one each to the first sharers in listed order. Example:
  Rs. 1,000 paid by Ali (not sharing), 3 sharers → Sara Rs. 334, others
  Rs. 333.
- Percentage tip rounds to the nearest whole rupee (halves round up) before
  splitting.
- A rounding note appears under the expense in the list when leftover > 0.
  No note when the total divides evenly.

### Out of scope

| Feature | Reason excluded |
|---|---|
| Custom per-item splits | Multiplies edge-case complexity; outside time budget |
| Cross-device sync | Requires a backend; forbidden by reviewer constraint |
| Multi-currency | Requires a live exchange-rate API |
| User accounts, group invites, payment reminders | Require a backend |
| Receipt photo / OCR | Requires a vision API |
| Ongoing household ledger | Wrong shape for a one-trip tool |

### Known limitations (assumptions from discovery)

- **A1** — Data is entered on one device and browser. Clearing browser storage
  or switching device loses the trip.
- **A2** — One person enters all data; no simultaneous multi-user input.
- **A3** — Equal-per-participant splitting only; custom item-level weights are
  out of scope for v1.
- **A4** — Users who already use a dedicated expense-sharing app are unlikely
  to switch for a single trip.
- **A5** — Greedy settlement (at most N − 1 transfers) is acceptable; not
  guaranteed to be the mathematical minimum.
- **A6** — All amounts are in Pakistani Rupees; no multi-currency support.

---

## Project documents

| Document | Contents |
|---|---|
| `docs/assignment-brief.md` | Original brief from KnowledgeCity |
| `docs/app-roles.md` | Two app roles: Trip Treasurer and Trip Participant |
| `docs/jobs-to-be-done.md` | Four jobs-to-be-done (J-1 through J-4) |
| `docs/user-stories.md` | 12 stories (S-1 through S-12) with acceptance criteria and status |
| `docs/qa-checklist.md` | 10 manual QA scenarios with Pass/Fail results |

## Session transcripts

| File | Contents |
|---|---|
| `transcripts/session-01-discovery-and-docs.md` | Discovery session: chose the calculator type, wrote all three product docs |
| `transcripts/session-02-user-stories-and-implementation.md` | Build session: Wave 1 (logic layer), Wave 2 (UI), E2E tests, QA, and story status updates. Note: this session was auto-compacted by Claude Code due to context length; the complete record including all tool calls is in the `.jsonl` session log at `.claude/projects/…/fa7d1f19-50c5-4caa-8067-074c31491b79.jsonl` |

### PM skills

Product discovery and documentation used the open-source
[pm-skills](https://github.com/phuryn/pm-skills) plugins for Claude Code.
The skills provided frameworks for thinking; their outputs were then
rewritten into the exact formats the brief requires (App Roles, Jobs To
Be Done, User Stories with Given/When/Then criteria).

| Skill | Plugin | Used for |
|---|---|---|
| market-segments | pm-market-research | Comparing user segments and choosing the Trip Treasurer as the target role |
| test-scenarios | pm-execution | Finding edge cases for the acceptance criteria |
| job-stories | pm-execution | Framing the jobs to be done |
