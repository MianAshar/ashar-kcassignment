# Trip Expense Splitter

A browser-based calculator that tracks shared expenses across a group trip and produces a settlement showing who pays whom. Built as a take-home assignment for KnowledgeCity (Technology Division).

---

## Running the app

**Requirements:** Node 20 or later. No accounts, API keys or cloud services needed.

```bash
npm install      # install dependencies (first time only)
npm run dev      # start local dev server → open http://localhost:5173
```

### Running tests

```bash
npm test         # run unit tests once and exit
```

### Production build (optional)

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

---

## What it does

Add trip participants, record shared expenses (who paid, who shares, optional tip), and get:

- A **simplified settlement** listing who pays whom to clear all debts.
- A **per-person breakdown** showing each participant's share of every expense, what they paid, and their net balance — so anyone can verify the numbers.

Data is saved automatically to the browser's local storage. Closing the tab and reopening restores your trip. Use **New Trip** to clear everything and start again.

---

## Key assumptions

The following assumptions were made during discovery (no real user interviews were conducted):

- **A1** — Users enter expenses on the same device and browser throughout the trip. Data survives tab closure; it does not survive clearing browser storage or switching device.
- **A2** — One person acts as treasurer and does all data entry. Simultaneous multi-user input is not supported.
- **A3** — Equal-per-participant splitting is the dominant rule. Item-level splits within a single bill are out of scope for v1.
- **A4** — Users prefer a purpose-built browser tool over a phone calculator for multi-expense trips. This is the core adoption risk: users who feel enough pain may already use dedicated expense-sharing apps, and those who don't may not adopt a new tool either.
- **A5** — Greedy settlement (≤ N−1 transfers) is acceptable. Users do not need a mathematically optimal minimum.
- **A6** — All amounts are in Pakistani Rupees. No multi-currency support.

---

## Manual changes

*None so far. If you edit code by hand, log the change here with a date and description.*

---

## Architecture

```
src/
  logic/          Pure TypeScript — no DOM, fully unit tested
    types.ts      Domain types (Participant, Expense, TipInput, …)
    validation.ts Input validation (returns error strings or null)
    tip.ts        Tip calculation and percentage rounding
    rounding.ts   Whole-rupee share splitting (S-12 canonical rule)
    balances.ts   Net balance computation per participant
    settlement.ts Greedy debtor-creditor settlement algorithm
    storage.ts    localStorage load/save (takes a StorageBackend parameter)
  ui/
    state.ts      App state singleton
    utils.ts      escHtml, formatRs, newId
    app.ts        Render loop + all event handlers
    sections/     One file per UI section (render + bind)
  main.ts         Entry point
  style.css       Styles
```

The logic layer has zero DOM access and zero side effects. All calculation functions take plain data in and return plain data out. Storage takes a `StorageBackend` interface so tests can use an in-memory fake.
