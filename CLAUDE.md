# CLAUDE.md

## Context
This is a take-home assignment for KnowledgeCity (Technology Division). I am a
Product Manager directing you to build a calculator web app. The full brief is
in `docs/assignment-brief.md`. Reviewers grade four things: the working app,
my product thinking, how I work with you (from the transcript), and accuracy
of the docs against what was built.

## Status of this file
v1: product decisions confirmed. Discovery complete; all three docs written
and committed. Next step: build story by story from docs/user-stories.md.

## Hard constraints (from the brief)
- Runs in current Chrome, Edge, Firefox and Safari.
- A reviewer starts it locally from the README with no paid accounts, API
  keys or cloud services.
- Invalid input and error cases (e.g. division by zero) show a clear message.
  Never a crash, never a wrong result.
- Every story marked Implemented must behave exactly as its acceptance
  criteria describe in the running app.
- You write the code. I direct, review and test. If I edit code by hand,
  remind me to log it in the README under "Manual changes".
- Time budget: 2 to 4 hours total. Prefer a small app that is fully correct
  over a large one that is partly correct. Push back if scope grows.
- Never name specific competitor products or brands anywhere in responses,
  docs, README or code. Use generic terms (e.g. "dedicated expense-sharing
  apps").

## Workflow
1. Discovery: choose the user and problem. Record decisions below.
2. Docs, strictly in this order, each building on the previous:
   `docs/app-roles.md` → `docs/jobs-to-be-done.md` → `docs/user-stories.md`
3. Build story by story from `docs/user-stories.md`.
4. Verify every acceptance criterion by hand and with tests, then update the
   statuses.
5. README and packaging.
Do not start a step before I confirm the previous one.

## Document formats (exact, from the brief)
- App Role: "A [role] is [who and their situation]. They can [what they see
  and do in the app]. They must never [what the app must prevent]."
  Roles must be real kinds of people whose needs differ.
- Job (J-n, names its role): "When [situation], I want to [motivation], so I
  can [expected outcome]." A job must NOT mention the app, its screens,
  buttons or features. If it does, it is a feature, not a job.
- Story (S-n, names its job, status Implemented / Not implemented):
  "As a [role], I want [capability], so that [benefit]." Acceptance criteria
  as "Given [state], when [action], then [observable result]". Cover the
  normal case, invalid input, boundary values, very large and very small
  numbers, and what happens when the user continues after a result or error.
- Traceability: every story serves a job, every job belongs to a role.
- Status reflects what the app does today. Never overstate.

## Using PM skills
pm-skills are available. Use them for thinking, then rewrite the output into
the exact formats above. Skill templates differ from this brief: e.g. jobs
here have no acceptance criteria, and criteria belong only on stories.
Discovery is assumption-based (no real user interviews). Label assumptions
clearly so they can go in the README.

## Tech defaults (open to change after discovery)
- Node 20, Vite, vanilla TypeScript, Vitest.
- Pure calculation logic in `src/logic/`, kept separate from the UI and fully
  unit tested.
- Test names reference story IDs, e.g. `S-3: shows "Cannot divide by zero"`.
- No backend, no external services, no analytics.

## Product decisions
_Decided in discovery session. Do not change without a corresponding update
to the docs._

- **Calculator type:** Trip and group expense splitter
- **Primary role:** Trip Treasurer — one person who tracks shared expenses
  during or after a group trip and produces a final settlement. The
  one-off dinner bill is a degenerate case (one expense, all participants)
  and requires no separate role.
- **Why this choice:** Multi-leg trips with variable group membership and
  multiple payers produce a genuinely hard calculation problem that phone
  calculators and mental arithmetic fail at. The Faisalabad trip scenario
  (two legs, different headcounts per leg, multiple payers) is the
  canonical test case.

- **In scope:**
  - Manage trip participants: add, rename, remove (with guard against
    removing someone already on an expense).
  - Add, edit, delete expenses: description, total amount (whole rupees),
    payer (any participant, not required to share the expense), and the
    subset of participants who share it.
  - Optional tip per expense, entered as a percentage or a flat rupee
    amount; added to the expense total before splitting.
  - localStorage persistence: the current trip (participants + expenses)
    survives tab close and browser restart on the same device and browser.
  - Start new trip: clears all saved data after explicit confirmation.
  - Settlement summary: greedy debtor-creditor matching — sort net
    balances, pair the largest debtor with the largest creditor, transfer
    the smaller of the two amounts, repeat until all balances are zero.
    Produces at most N-1 transfers. Not guaranteed to be the mathematical
    minimum (that problem is computationally hard); the greedy result is
    sufficient for typical group sizes of 3–8 people. The docs and UI
    will describe this honestly as "simplified settlement".
  - Per-person breakdown: for each participant, a view showing which
    expenses they shared, their share of each, what they personally paid,
    and the net balance that results. The underlying data is already
    computed during settlement; this view makes the result auditable and
    is what gives the group confidence to accept the numbers without
    argument.
  - Rounding: all shares are in whole rupees. Two cases:
    (A) Payer is one of the n sharers: every other sharer receives
    ⌊T ÷ n⌋; the payer receives T − (n−1) × ⌊T ÷ n⌋ (absorbs the
    leftover). Example: Rs. 1,000 ÷ 3 → others Rs. 333, payer Rs. 334.
    (B) Payer is not one of the n sharers: every sharer receives
    ⌊T ÷ n⌋ as a base; the leftover rupees are distributed one each to
    the first sharers in listed order. Example: Rs. 1,000 paid by Ali
    (not sharing), shared by Sara → Bilal → Kamran → Sara Rs. 334,
    Bilal Rs. 333, Kamran Rs. 333. Shares always sum exactly to T in
    both cases.
    Percentage tip rounding: the computed tip amount is rounded to the
    nearest whole rupee (halves round up) before being added to the base.
    Example: Rs. 1,235 at 10% → tip Rs. 124 → total Rs. 1,359.
  - Error handling (full list — each has exact messages in user-stories.md):
    zero participants on an expense; zero or negative expense amount;
    expense amount that is not a whole number of rupees; expense amount
    above Rs. 10,000,000; negative tip (flat or percentage); percentage tip
    above 100%; flat tip that is not a whole number of rupees; total
    including tip above Rs. 10,000,000; duplicate or empty participant
    names; no expenses entered when settlement is requested; corrupted
    localStorage data on load (show message, start empty — do not crash
    or silently discard).

- **Out of scope (and why):**
  - Custom-weight splits within a single expense: multiplies UI and
    edge-case complexity; out of time budget.
  - Cross-device sync: requires a backend or cloud service; forbidden by
    reviewer constraint.
  - Multi-currency: requires a live exchange-rate API; out of scope.
  - Receipt photo / OCR: requires a vision API; out of scope.
  - User accounts and group invites: require a backend; out of scope.
  - Payment collection / reminders: require a backend; out of scope.
  - Ongoing household ledger: core job requires persistent cross-session
    tracking across months; a one-trip tool is the wrong shape for it.

## Code standards
_Apply to every file without exception._

- Code should be self-explanatory first: clear names, small functions, one
  responsibility per module.
- Every exported function gets a short doc comment saying what it does,
  its inputs and outputs, and which story it implements
  (e.g. `/** Implements S-12. Computes whole-rupee shares … */`).
- Comment the why, not the what. Explain business rules and non-obvious
  decisions (e.g. why the payer absorbs the leftover), not obvious lines.
- Each file starts with a one-line comment on its purpose.

- **Key assumptions (discovery was assumption-based; no real user
  interviews were conducted):**
  - A1: Users enter expenses on the same device and browser throughout
    the trip. localStorage prevents loss from tab closure; data is still
    lost if the user clears browser storage or switches device.
  - A2: One person acts as treasurer and does all data entry; the app is
    not designed for collaborative simultaneous input.
  - A3: Equal-per-participant is the dominant split rule; item-level
    splits within a single bill are rare enough to exclude from v1.
  - A4: Users prefer a purpose-built browser tool over a phone calculator
    for multi-expense trips. This is the core adoption risk: users who
    feel enough pain may already use dedicated expense-sharing apps, and
    those who don't may not adopt a new tool either.
  - A5: Greedy settlement (≤ N-1 transfers) is acceptable; users do not
    need a mathematically optimal minimum number of transfers.
  - A6: All amounts are in Pakistani Rupees; no multi-currency need for
    the target use case.