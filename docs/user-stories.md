# User Stories

*Statuses updated after each story is built and verified against its acceptance criteria.*

---

## S-1 — Add a participant
**Serves:** J-1 | **Status:** Not implemented

As a Trip Treasurer, I want to add a named participant to the trip, so that
they can be assigned as payers or included in expense splits.

- Given an empty roster, when I type "Ali" and confirm, then "Ali" appears
  in the participant list.
- Given "Ali" is already in the roster, when I add "Sara", then both appear
  in the list.
- Given the add-participant form, when I submit an empty name (or a name of
  only spaces), then the form shows "Name cannot be empty" and no participant
  is added.
- Given "Ali" is in the roster, when I try to add "Ali" (same name,
  case-insensitive), then the form shows "A participant named Ali already
  exists" and no duplicate is added.
- Given the form shows an error, when I enter a valid unique name and confirm,
  then the participant is added and the error clears.

---

## S-2 — Rename a participant
**Serves:** J-1 | **Status:** Not implemented

As a Trip Treasurer, I want to rename a participant, so that I can correct a
typo or name change without losing their expense data.

- Given "Ali" is in the roster, when I rename them to "Ali Khan" and confirm,
  then "Ali Khan" appears in the list and all expenses that referenced "Ali"
  now reference "Ali Khan".
- Given the rename form, when I submit an empty name, then the form shows
  "Name cannot be empty" and the name is unchanged.
- Given "Ali" and "Sara" are in the roster, when I rename "Ali" to "Sara",
  then the form shows "A participant named Sara already exists" and the name
  is unchanged.
- Given "Ali" is in the roster, when I rename "Ali" to "Ali" (no change),
  then the form is accepted without error.
- Given "Ali" is in the roster, when I rename "Ali" to "ali" (same name,
  different case), then the form is accepted without error and the
  participant's name is updated to "ali".
- Given the form shows an error, when I enter a valid unique name and confirm,
  then the rename succeeds and the error clears.

---

## S-3 — Remove a participant
**Serves:** J-1 | **Status:** Not implemented

As a Trip Treasurer, I want to remove a participant from the trip, so that I
can correct mistakes in the group setup.

- Given "Ali" is in the roster and not named on any expense (neither as payer
  nor sharer), when I remove "Ali", then "Ali" no longer appears in the
  participant list.
- Given "Ali" is a sharer on "Fuel to Faisalabad", when I try to remove
  "Ali", then the app shows "Cannot remove Ali: they appear on Fuel to
  Faisalabad. Update that expense first." and Ali remains in the roster.
- Given "Ali" is the payer on "Snacks" but not a sharer on that expense, when
  I try to remove "Ali", then the app shows "Cannot remove Ali: they appear on
  Snacks. Update that expense first." and Ali remains.
- Given "Ali" appears on both "Fuel" and "Hotel", when I try to remove "Ali",
  then the message lists both: "Cannot remove Ali: they appear on Fuel and
  Hotel. Update those expenses first."
- Given Ali has been removed from all expenses they were named on, when I
  remove "Ali", then the removal succeeds.

---

## S-4 — Add an expense
**Serves:** J-1, J-2 | **Status:** Not implemented

As a Trip Treasurer, I want to add an expense with a description, total
amount, payer, and the subset of participants sharing it, so that I can record
exactly what was spent, who paid, and which members the cost applies to.

**Normal cases:**
- Given participants Ali, Sara, Bilal; when I save "Fuel" Rs. 900, paid by
  Ali, shared by Ali and Sara; then the expense shows description "Fuel",
  amount Rs. 900, payer Ali, sharers Ali and Sara.
- Given participants Ali, Sara, Bilal; when I save "Snacks" Rs. 300, paid by
  Ali, shared by Sara and Bilal (Ali is payer but not a sharer); then the
  expense is saved with Ali as payer and Sara and Bilal as the only sharers.

**Invalid input:**
- Given the form, when I submit with no description, then the form shows
  "Description cannot be empty" and no expense is saved.
- Given the form, when I enter amount 0, then the form shows "Amount must be
  greater than zero".
- Given the form, when I enter a negative amount (e.g. −500), then the form
  shows "Amount must be greater than zero".
- Given the form, when I enter 999.50, then the form shows "Amount must be a
  whole number of rupees".
- Given the form, when I select zero sharers, then the form shows "At least
  one participant must share this expense".
- Given the form, when I submit without selecting a payer, then the form shows
  "A payer must be selected".

**Boundary values:**
- Given the form, when I enter 1 (minimum valid amount), then the expense is
  saved.
- Given the form, when I enter Rs. 10,000,000, then the expense is saved.
- Given the form, when I enter Rs. 10,000,001, then the form shows "Amount
  cannot exceed Rs. 10,000,000".

**Large numbers:**
- Given Rs. 10,000,000 shared equally among 3 participants; when saved; then
  all shares display as whole-rupee figures and no value is shown in scientific
  notation.

**Continuation after error:**
- Given the form shows a validation error, when I correct all fields and
  resubmit, then the expense is saved and the error clears.

*(How shares are divided into whole rupees: see S-12. S-4 applies that rule;
it is not repeated here.)*

---

## S-5 — Add a tip to an expense
**Serves:** J-1, J-2 | **Status:** Not implemented

As a Trip Treasurer, I want to attach a tip to an expense as a whole
percentage or a flat rupee amount, so that the full amount actually paid is
included in each participant's share.

**Normal cases:**
- Given "Dinner" Rs. 1,000, tip 10%, shared equally by Ali and Sara; when
  saved; then total is Rs. 1,100 and each share is Rs. 550.
- Given "Dinner" Rs. 1,000, flat tip Rs. 100, shared equally by Ali and Sara;
  when saved; then total is Rs. 1,100 and each share is Rs. 550.
- Given "Fuel" Rs. 800, tip field left blank; when saved; then total is
  Rs. 800 (no tip applied).
- Given "Lunch" Rs. 600, tip 10%, shared by Ali and Sara but not Bilal; when
  saved; then total is Rs. 660, Ali Rs. 330, Sara Rs. 330, and Bilal owes
  nothing for this expense. *(Fairness: tip follows the sharers, not the
  whole group.)*

**Percentage tip rounding:**
- Given "Dinner" Rs. 1,235, tip 10%; the computed tip is Rs. 123.5, which
  rounds up to Rs. 124 (halves round up); total is Rs. 1,359.
- Given "Dinner" Rs. 1,234, tip 10%; the computed tip is Rs. 123.4, which
  rounds down to Rs. 123; total is Rs. 1,357.

**Invalid input:**
- Given the form, when I enter a flat tip of −50, then the form shows "Tip
  cannot be negative".
- Given the form, when I enter −10%, then the form shows "Tip cannot be
  negative".
- Given the form, when I enter 101%, then the form shows "Tip percentage
  cannot exceed 100%".
- Given the form, when I enter a flat tip of 99.50, then the form shows "Tip
  must be a whole number of rupees".

**Boundary values:**
- Given Rs. 500, tip exactly 100%; when saved; total is Rs. 1,000 and the
  expense is accepted.
- Given Rs. 500, tip 0%; when saved; total is Rs. 500.

**Tip causes total to exceed cap:**
- Given base Rs. 9,500,000 and flat tip Rs. 600,000 (total Rs. 10,100,000);
  then the form shows "Total including tip cannot exceed Rs. 10,000,000".
- Given base Rs. 9,500,000 and flat tip Rs. 500,000 (total Rs. 10,000,000);
  then the expense is saved.

*(Rounding when the tipped total is not evenly divisible: see S-12.)*

---

## S-6 — Edit an expense
**Serves:** J-1, J-2 | **Status:** Not implemented

As a Trip Treasurer, I want to edit a saved expense, so that I can correct
amounts, payers or participant lists after initial entry.

- Given expense "Fuel" Rs. 600; when I change the amount to Rs. 700 and save;
  then the expense shows Rs. 700.
- Given expense "Hotel" shared by Ali and Sara; when I change the sharers to
  Ali, Sara, and Bilal; then the expense shows three sharers.
- Given expense "Fuel" with payer Ali; when I change the payer to Sara; then
  the expense shows Sara as payer.
- Given the edit form; when I submit invalid input (zero amount, decimal,
  above cap, no sharers, invalid tip); then the same error messages as in S-4
  and S-5 apply and the original expense data is preserved.
- Given the settlement summary is displayed; when I save an edit; then the
  settlement recalculates automatically.

---

## S-7 — Delete an expense
**Serves:** J-1 | **Status:** Not implemented

As a Trip Treasurer, I want to delete an expense, so that I can remove entries
added by mistake.

- Given expense "Snacks" Rs. 200; when I choose to delete it and confirm; then
  "Snacks" no longer appears in the expense list.
- Given I tap delete on an expense; then the app prompts for confirmation
  before removing it — a single accidental tap does not delete the expense.
- Given I tap delete and then cancel at the confirmation prompt; then the
  expense remains unchanged.
- Given the settlement summary is displayed and I delete an expense and
  confirm; then the settlement recalculates automatically.

---

## S-8 — Persist trip data in the browser
**Serves:** J-1 | **Status:** Not implemented

As a Trip Treasurer, I want the trip data to save automatically in my browser,
so that I can close the tab or restart the browser at any point during a
multi-day trip without losing any entered data.

- Given I have added participants Ali, Sara and expense "Fuel" Rs. 600; when I
  close the tab and reopen the app in the same browser on the same device;
  then Ali, Sara and "Fuel" Rs. 600 are still present.
- Given I have entered trip data; when I restart the browser and reopen the
  app; then all participants and expenses are restored exactly as entered.
- Given I add or edit an expense; then the change is saved immediately — no
  manual "save trip" action is required.
- Given the app is opened for the first time (no data in localStorage); then
  the app starts with an empty trip and shows no error or message.
- Given localStorage contains data for this app that cannot be parsed (e.g.
  the storage was corrupted); then the app shows "Your saved trip data could
  not be loaded. Starting a new trip." and starts with an empty trip rather
  than crashing or silently discarding the data.

---

## S-9 — Start a new trip
**Serves:** J-1 | **Status:** Not implemented

As a Trip Treasurer, I want to clear all current trip data and start fresh,
so that I can use the app for a new trip without previous data interfering.

- Given the trip has participants and expenses; when I choose "Start new trip"
  and confirm; then the participant list and expense list are both empty and
  localStorage is cleared.
- Given I choose "Start new trip"; when I cancel at the confirmation prompt;
  then all participants and expenses remain intact.
- Given the trip is already empty; when I choose "Start new trip" and confirm;
  then the app remains on an empty state with no error.

---

## S-10 — View the settlement summary
**Serves:** J-3 | **Status:** Not implemented

As a Trip Treasurer, I want to see a labelled list of transfers that clears
all balances, so that the group knows exactly who pays whom and the trip is
fully settled.

**Normal cases:**
- Given Ali paid Rs. 600 for "Fuel" shared equally by Ali and Sara (each
  Rs. 300); then the settlement shows "Sara pays Ali Rs. 300".
- Given the Faisalabad scenario:
  - "Fuel to Faisalabad" Rs. 1,500, paid by Ali, shared by Ali and Usman
    (Rs. 750 each, no rounding)
  - "Fuel onwards" Rs. 2,000, paid by Usman, shared by Ali, Usman, Sara,
    Bilal (Rs. 500 each, no rounding)
  - "Hotel" Rs. 3,001, paid by Sara, shared by Ali, Usman, Sara, Bilal
    (Sara is payer and sharer — Sara Rs. 751, others Rs. 750 each per S-12)

  Net balances: Ali −Rs. 500, Usman Rs. 0, Sara +Rs. 1,750,
  Bilal −Rs. 1,250.

  Then the settlement shows: "Bilal pays Sara Rs. 1,250" and
  "Ali pays Sara Rs. 500".

- Given all net balances are zero; then the settlement shows "All balances
  are settled — no transfers needed."
- Given only one participant exists; then the settlement shows "All balances
  are settled — no transfers needed."

**Empty state:**
- Given no expenses have been added; when I view the settlement; then the app
  shows "No expenses have been added yet."

**Algorithm label:**
- The settlement section is headed "Simplified settlement" (not "Minimum
  transfers") to reflect that the greedy algorithm is not guaranteed to be
  the mathematical minimum.

**Mathematical invariant (verified by automated tests):**
- Given any set of valid expenses; when the settlement is computed; then
  applying all listed transfers to participants' net balances brings every
  balance to exactly Rs. 0.

**Continuation:**
- Given the settlement is displayed; when I add, edit or delete an expense;
  then the settlement recalculates automatically.

---

## S-11 — View the per-person breakdown
**Serves:** J-2, J-4 | **Status:** Not implemented

As a Trip Treasurer, I want to see a breakdown for each participant showing
the expenses they shared, their share of each, what they personally paid, and
their net balance, so that any group member can verify their own figure without
argument.

**Normal cases:**
- Given Ali paid Rs. 600 for "Fuel" (shared Ali, Sara — each Rs. 300), and
  Sara paid Rs. 900 for "Hotel" (shared Ali, Sara, Bilal — each Rs. 300);
  Ali's breakdown shows:
  - "Fuel": share Rs. 300, paid Rs. 600 → net from this expense: +Rs. 300
  - "Hotel": share Rs. 300, paid Rs. 0 → net from this expense: −Rs. 300
  - Summary: total paid Rs. 600, total owed Rs. 600, net balance Rs. 0
- Given Bilal was not on "Fuel"; then "Fuel" does not appear in Bilal's
  breakdown.
- Given Ali paid Rs. 300 for "Snacks" shared by Sara and Bilal only (Ali is
  payer but not a sharer); Ali's breakdown shows "Snacks": paid Rs. 300,
  share Rs. 0, net from this expense +Rs. 300.

**Consistency with settlement:**
- Given both the per-person breakdown and the settlement summary are
  displayed; then each participant's net balance in the breakdown matches
  exactly the net balance used in the settlement calculation.

**Zero balance:**
- Given a participant's total paid equals their total owed; then their
  breakdown shows net balance Rs. 0 and they do not appear in the settlement
  transfers.

*(Share values in the breakdown use the same rounded whole-rupee figures
defined in S-12.)*

---

## S-12 — See how each expense's shares were rounded
**Serves:** J-2, J-4 | **Status:** Not implemented

As a Trip Treasurer, I want to see, for each expense, how the total was
divided into whole-rupee shares and who absorbed the leftover, so that any
participant can confirm the rounding was consistent and fair.

### Canonical rounding rule
*(Referenced by S-4, S-5, S-10, S-11 — defined once here.)*

For an expense with total T (base + any rounded tip), payer P, and n sharers
listed in a fixed order:

**Case A — P is one of the n sharers:**
1. Every sharer except P receives ⌊T ÷ n⌋.
2. P receives T − (n − 1) × ⌊T ÷ n⌋. P absorbs the leftover.
3. Invariant: all n shares sum to T exactly.

**Case B — P is not one of the n sharers:**
1. Base share for each sharer: ⌊T ÷ n⌋.
2. Leftover = T − n × ⌊T ÷ n⌋ (between 0 and n − 1 rupees).
3. The first `leftover` sharers in listed order each receive one extra rupee.
4. Invariant: all n shares sum to T exactly.

**Tip rounding:** when a percentage tip is entered, the computed rupee amount
is rounded to the nearest whole rupee before being added to the base (halves
round up). The rounded total T is then divided as above.

**Shares always sum exactly to T in both cases.**

### Display placement

Rounding notes appear as a line beneath each expense in the expense list.
They are **not** repeated in the per-person breakdown (S-11).

### Zero-leftover rule

When leftover = 0 (the total divides evenly among all sharers), **no
rounding note is shown** — for both Case A and Case B.

### Acceptance criteria

**Case A — payer is a sharer:**
- Given Rs. 1,000, paid by Ali, shared by Ali → Sara → Bilal (listed order):
  Sara Rs. 333, Bilal Rs. 333, Ali Rs. 334 (absorbs Re. 1). Display shows
  "Ali absorbed Re. 1 rounding difference."
- Given Rs. 900, paid by Ali, shared by Ali → Sara → Bilal: each Rs. 300, no
  remainder. No rounding note shown.
- Given Rs. 1,001, paid by Ali, shared by Ali → Sara → Bilal: Sara Rs. 333,
  Bilal Rs. 333, Ali Rs. 335 (absorbs Rs. 2). Display shows "Ali absorbed
  Rs. 2 rounding difference."

**Case B — payer is not a sharer:**
- Given Rs. 1,000, paid by Ali (not sharing), shared by Sara → Bilal →
  Kamran: ⌊1000 ÷ 3⌋ = 333, leftover = 1. Sara Rs. 334, Bilal Rs. 333,
  Kamran Rs. 333. Sum = 1,000. Display shows "Re. 1 rounding difference added
  to Sara's share (first in listed order)."
- Given Rs. 1,001, paid by Ali (not sharing), shared by Sara → Bilal →
  Kamran: leftover = 2. Sara Rs. 334, Bilal Rs. 334, Kamran Rs. 333.
  Sum = 1,001. Display shows "Rs. 2 rounding difference distributed to Sara
  and Bilal (first in listed order)."
- Given Rs. 1,000, paid by Ali (not sharing), shared by Sara → Bilal only
  (2 sharers): 1000 ÷ 2 = 500 exactly. Sara Rs. 500, Bilal Rs. 500. No
  rounding note shown.

**Very small amounts:**
- Given Rs. 2, paid by Ali (not sharing), shared by Sara → Bilal → Kamran:
  ⌊2 ÷ 3⌋ = 0, leftover = 2. Sara Rs. 1, Bilal Rs. 1, Kamran Rs. 0.
  Sum = 2. Display shows "Rs. 2 rounding difference distributed to Sara and
  Bilal (first in listed order)." Kamran's share is Rs. 0 and still appears
  in the breakdown.

**With tip (Case A):**
- Given Rs. 1,000 + 10% tip = Rs. 1,100 total, paid by Ali (payer and
  sharer), shared by Ali → Sara → Bilal: ⌊1100 ÷ 3⌋ = 366, leftover = 2.
  Sara Rs. 366, Bilal Rs. 366, Ali Rs. 368. Display shows "Ali absorbed
  Rs. 2 rounding difference."

**Consistency:**
- The shares shown in S-12 are identical to those used in S-11 (per-person
  breakdown) and S-10 (settlement). There is one source of truth for rounding.

---

## "They must never" coverage

| Constraint from app-roles.md | Covered by |
|---|---|
| See a settlement where transfers do not account for every rupee of every net balance | S-10: mathematical invariant criterion |
| See shares on an expense that do not sum to the expense total including tip | S-12: invariant — shares sum exactly to T in both Case A and Case B |
| Lose entered data without an explicit confirmation step | S-7: delete confirmation; S-9: new-trip confirmation; S-8: corrupt-data message instead of silent discard |
| Remove a participant who is named on one or more expenses — app blocks and names the expenses | S-3: blocked-as-sharer, blocked-as-payer, multi-expense message |
| Submit an expense with no participants sharing it | S-4: "At least one participant must share this expense" |
| Enter a zero or negative expense amount | S-4: "Amount must be greater than zero" |
| Add a participant with an empty or duplicate name | S-1: empty-name and duplicate criteria; S-2: same on rename |
| Enter an amount that is not a whole number of rupees | S-4: "Amount must be a whole number of rupees"; S-5: "Tip must be a whole number of rupees" |
| Enter a single expense amount above Rs. 10,000,000 | S-4: boundary criteria; S-5: total-including-tip cap |
| Enter a negative tip, or a percentage tip above 100% | S-5: negative-tip and >100% criteria |
