# CLAUDE.md

## Context
This is a take-home assignment for KnowledgeCity (Technology Division). I am a
Product Manager directing you to build a calculator web app. The full brief is
in `docs/assignment-brief.md`. Reviewers grade four things: the working app,
my product thinking, how I work with you (from the transcript), and accuracy
of the docs against what was built.

## Status of this file
v0: constraints only. The calculator type, target users and scope are NOT
decided yet. We will decide them through discovery in this project, then
update the "Product decisions" section below.

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
_To be filled after discovery._
- Calculator type:
- Primary role(s):
- Why this choice:
- In scope / out of scope:
- Key assumptions: