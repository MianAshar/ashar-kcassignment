# Manual QA Scenarios

Ten scenario-based walkthroughs for acceptance criteria that are best verified by hand: genuine browser restart, cross-browser checks, and complex multi-step flows that span several stories. Run these after the automated Playwright suite passes. Mark each scenario Pass or Fail and note the browser and date.

Automated coverage: the Playwright suite in `e2e/` covers all acceptance criteria that can be driven programmatically. These scenarios cover the remainder and add end-to-end confidence across real browser sessions.

---

## Scenario 1 — Faisalabad trip end-to-end

**Covers:** S-1.1, S-1.2, S-4.1, S-4.2, S-10.2, S-10.6, S-11.1, S-11.2, S-11.4, S-12.1, S-12.2, S-12.9, S-12.10, S-12.11

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state (no prior data). Use "New Trip" to clear if needed.

**Steps:**

1. Add participants: Ali, Usman, Sara, Bilal.
2. Click "+ Add Expense". Enter: description "Fuel to Faisalabad", amount 1500, payer Ali, sharers Ali and Usman. Save.
3. Add a second expense: description "Fuel onwards", amount 2000, payer Usman, sharers Ali, Usman, Sara, Bilal. Save.
4. Add a third expense: description "Hotel", amount 3001, payer Sara, sharers Ali, Usman, Sara, Bilal. Save.
5. Scroll to the "Simplified settlement" section.
6. Scroll to the "Per-person breakdown" section and review each person's table.
7. Look under the "Fuel to Faisalabad" expense item for any rounding note.
8. Look under the "Hotel" expense item for a rounding note.
9. In the breakdown, sum all four share figures shown for Hotel.

**Expected results:**

- After step 1: all four names appear in the participant list.
- After step 4: three expenses visible with correct descriptions, amounts, payers, and sharers.
- Step 5: settlement section heading reads "Simplified settlement" (not "Minimum transfers"). Exactly two transfer rows appear: "Bilal pays Sara Rs. 1,250" and "Ali pays Sara Rs. 500". No other transfers.
- Step 6: Ali's breakdown shows Fuel to Faisalabad (share Rs. 750, paid Rs. 1,500) and Fuel onwards (share Rs. 500, paid Rs. 0) and Hotel (share Rs. 750, paid Rs. 0). Net balance Rs. 0 — Ali does not appear as a payer in the settlement. Bilal's breakdown does not contain "Fuel to Faisalabad".
- Step 7: No rounding note under "Fuel to Faisalabad" (1,500 ÷ 2 = 750 exactly).
- Step 8: Rounding note appears under "Hotel": "Sara absorbed Re. 1 rounding difference." The same note does NOT appear anywhere inside the per-person breakdown tables.
- Step 9: The four Hotel share values (from each person's breakdown row) sum to exactly 3,001.

---

## Scenario 2 — Roster management

**Covers:** S-1.3, S-1.5, S-2.1, S-2.3, S-2.5, S-3.2, S-3.4, S-3.5

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state.

**Steps:**

1. Add participants Ali, Sara, Bilal.
2. Try to add "ali" (lowercase) — observe the error.
3. Try to add "" (empty name) — observe the error.
4. Add expense "Fuel" Rs. 600, paid by Ali, sharers Ali and Sara.
5. Rename Ali to "Ali Khan". Click Rename on Ali, type "Ali Khan", click Save.
6. Open the edit form for "Fuel" and check the payer dropdown and sharer checkboxes.
7. Try to rename Sara to "ali khan" — observe the error.
8. Try to rename Sara to "sara" (different case) — observe the result.
9. Try to remove Ali Khan — observe the error.
10. Add expense "Hotel" Rs. 900, paid by Ali Khan, sharers Ali Khan and Sara.
11. Try to remove Ali Khan again — observe the error message.
12. Edit "Fuel": uncheck Ali Khan from sharers and change payer to Sara. Save.
13. Edit "Hotel": uncheck Ali Khan from sharers and change payer to Sara. Save.
14. Remove Ali Khan.

**Expected results:**

- Step 2: "A participant named Ali already exists". No duplicate added.
- Step 3: "Name cannot be empty". No participant added.
- Step 5: Roster shows "Ali Khan". The "Fuel" expense now shows "Ali Khan" as payer and sharer in the edit form.
- Step 7: "A participant named Ali Khan already exists". Sara's name unchanged.
- Step 8: Rename accepted without error; Sara's name updates to "sara" (or same case entered).
- Step 9: Error: "Cannot remove Ali Khan: they appear on "Fuel". Update that expense first."
- Step 11: Error lists both expenses: "...they appear on "Fuel" and "Hotel". Update those expenses first."
- Step 14: Ali Khan removed successfully; roster shows only Sara (or "sara") and Bilal.

---

## Scenario 3 — Expense with tip

**Covers:** S-5.1, S-5.2, S-5.4, S-5.5, S-12.8, S-12.9

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state. Add participants Ali, Sara, Bilal.

**Steps:**

1. Add expense "Dinner" Rs. 1,235, payer Ali, sharers Ali and Sara, tip 10%. Save.
2. Observe the total shown on the expense item.
3. Scroll to the per-person breakdown and check Ali's and Sara's shares of "Dinner".
4. Look under the "Dinner" expense item for a rounding note.
5. Check the per-person breakdown tables — confirm no rounding note text appears there.
6. Add expense "Lunch" Rs. 600, payer Ali, sharers Ali and Sara only (Bilal NOT selected), flat tip Rs. 60. Save.
7. Observe the total on "Lunch".
8. Check Bilal's breakdown.

**Expected results:**

- Step 2: "Dinner" shows Rs. 1,359 (not Rs. 1,358.50 — the tip Rs. 123.5 rounds up to Rs. 124, total = Rs. 1,235 + Rs. 124 = Rs. 1,359).
- Step 3: Ali's share of Dinner is Rs. 680 (Ali absorbs the Rs. 1 leftover: ⌊1359 ÷ 2⌋ = 679, Ali gets 680). Sara's share is Rs. 679. (Or Ali Rs. 679, Sara Rs. 680 depending on listed order — both sum to 1,359.)
- Step 4: Rounding note visible under "Dinner" expense item.
- Step 5: No rounding note text appears inside the per-person breakdown section.
- Step 7: "Lunch" shows Rs. 660 (600 + 60 flat tip).
- Step 8: Bilal's breakdown does not contain "Lunch". Bilal owes nothing for that expense.

---

## Scenario 4 — Payer not sharing

**Covers:** S-4.2, S-11.3, S-12.4, S-12.7

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state. Add participants Ali, Sara, Bilal, Kamran.

**Steps:**

1. Add expense "Groceries" Rs. 1,000, payer Ali, sharers Sara, Bilal, Kamran (Ali NOT a sharer). Save.
2. Check the rounding note under "Groceries".
3. Check Ali's breakdown section.
4. Add expense "Petrol" Rs. 2, payer Ali, sharers Sara, Bilal, Kamran. Save.
5. Check Kamran's breakdown row for "Petrol".
6. Check the rounding note under "Petrol".

**Expected results:**

- Step 2: Note reads "Re. 1 rounding difference added to Sara's share (first in listed order)." (1,000 ÷ 3 = 333 rem. 1; Sara gets 334, Bilal and Kamran get 333 each.)
- Step 3: Ali's row for "Groceries" shows share Rs. 0 and paid Rs. 1,000.
- Step 5: Kamran's row for "Petrol" shows share Rs. 0. The row still appears (Kamran is a named sharer; zero share is displayed, not omitted).
- Step 6: Note reads "Rs. 2 rounding difference distributed to Sara and Bilal (first in listed order)." (⌊2 ÷ 3⌋ = 0, leftover = 2; Sara gets 1, Bilal gets 1, Kamran gets 0.)

---

## Scenario 5 — Edit and delete workflow

**Covers:** S-6.1, S-6.2, S-6.3, S-6.4, S-6.5, S-7.1, S-7.2, S-7.3, S-7.4

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state. Add participants Ali, Sara, Bilal.

**Steps:**

1. Add expense "Fuel" Rs. 600, payer Ali, sharers Ali and Sara. Save.
2. Add expense "Hotel" Rs. 900, payer Sara, sharers Ali and Sara. Save.
3. Note the settlement transfers shown.
4. Edit "Fuel": change amount to Rs. 700, change payer to Sara, add Bilal as a sharer. Save.
5. Note the updated settlement.
6. Edit "Hotel": clear the description field, click Save.
7. Observe the error, then click Cancel.
8. Confirm "Hotel" still shows Rs. 900 in the list.
9. Click Delete on "Hotel". Observe the confirmation prompt without clicking confirm — note "Hotel" is still in the list.
10. Click Cancel on the confirmation.
11. Confirm "Hotel" is still in the list with Rs. 900.
12. Click Delete on "Hotel" again, then confirm by clicking the Delete button in the prompt.
13. Confirm "Hotel" is gone and the settlement has updated.

**Expected results:**

- Step 5: Settlement reflects the edited "Fuel" (Rs. 700, payer Sara, sharers Ali+Sara+Bilal). Numbers differ from step 3.
- Step 6: Error "Description cannot be empty" shown. Form still open.
- Step 8: Original "Hotel" Rs. 900 is in the list unchanged (Cancel preserved it).
- Step 9: Confirmation prompt visible. "Hotel" still shows in the list.
- Step 11: "Hotel" still in list at Rs. 900.
- Step 13: "Hotel" removed from the expense list. Settlement now only reflects "Fuel" (edited version).

---

## Scenario 6 — Browser persistence

**Covers:** S-8.1, S-8.2, S-8.3, S-8.4, S-8.5

**Result: Pass** — Chrome, 2026-10-19

**Setup:** A real browser (not the Playwright headless session). Use Chrome or Firefox.

**Steps:**

1. Open the app at `http://localhost:5173`. Add participants Ali and Sara. Add expense "Fuel" Rs. 600, paid by Ali, sharers Ali and Sara.
2. Close the browser tab (do not quit the browser). Open a new tab and navigate back to `http://localhost:5173`.
3. Observe the app state.
4. Quit the browser entirely. Relaunch the browser and navigate to `http://localhost:5173`.
5. Observe the app state.
6. Open DevTools (F12) → Application → Local Storage → `http://localhost:5173`. Find the key `trip-expense-splitter-v1`. Set its value to `{broken`. Press Enter to save.
7. Reload the page (Ctrl+R or Cmd+R).
8. Observe the banner and app state.
9. Open the app in a fresh private/incognito window (no prior data).
10. Observe whether any error or warning is shown on first load.

**Expected results:**

- Step 3: Ali, Sara, and "Fuel" Rs. 600 are all present. Nothing was lost by closing the tab.
- Step 5: All participants and expenses are still present after a full browser restart.
- Step 8: A banner appears: "Your saved trip data could not be loaded. Starting a new trip." The participant list is empty and no expenses are shown. The app did not crash.
- Step 10: App shows an empty trip with no error message or warning.

---

## Scenario 7 — New trip flow

**Covers:** S-9.1, S-9.2, S-9.3

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state.

**Steps:**

1. Add participants Ali and Sara. Add expense "Fuel" Rs. 600.
2. Click "New Trip" in the header.
3. Click Cancel in the confirmation dialog.
4. Observe the app state.
5. Click "New Trip" again.
6. Click "Clear & start new" to confirm.
7. Observe the app state.
8. Open DevTools → Application → Local Storage. Check whether the `trip-expense-splitter-v1` key exists.
9. Click "New Trip" again and confirm on the already-empty state.
10. Observe whether any error appears.

**Expected results:**

- Step 4: All participants and expenses remain intact after Cancel.
- Step 7: Participant list shows "No participants yet." Expense list shows "No expenses yet." Both are empty.
- Step 8: The `trip-expense-splitter-v1` key is absent from Local Storage.
- Step 10: App remains on an empty state with no error.

---

## Scenario 8 — Settled and single-person states

**Covers:** S-10.1, S-10.3, S-10.4, S-10.5, S-10.7, S-11.5

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state.

**Steps:**

1. Add participants Ali and Sara. Add "Fuel" Rs. 600, paid by Ali, shared by Ali and Sara.
2. Observe the settlement.
3. Add "Hotel" Rs. 600, paid by Sara, shared by Ali and Sara.
4. Observe the settlement.
5. Click "New Trip" and confirm. Add only Ali (no Sara). Add one expense "Snacks" Rs. 300, paid by Ali, shared by Ali.
6. Observe the settlement.
7. Click "New Trip" and confirm. Add Ali and Sara. Do not add any expenses.
8. Observe the settlement section.

**Expected results:**

- Step 2: "Sara pays Ali Rs. 300" appears in the settlement.
- Step 4: Settlement shows "All balances are settled — no transfers needed." Also confirm Ali's net balance in the breakdown is Rs. 0, and Ali does not appear in any transfer row.
- Step 6: Settlement shows "All balances are settled — no transfers needed." (Single participant, zero balance.)
- Step 8: Settlement shows "No expenses have been added yet."

---

## Scenario 9 — Error handling sweep

**Covers:** S-1.3, S-1.4, S-1.5, S-1.6, S-2.2, S-2.3, S-2.6, S-3.2, S-3.3, S-4.3, S-4.4, S-4.5, S-4.6, S-4.7, S-4.8, S-4.11, S-4.13, S-5.7, S-5.8, S-5.9, S-5.10, S-5.13

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state.

**Steps:**

1. Try to add participant with empty name. Correct and add "Ali". Confirm error clears.
2. Try to add participant with whitespace-only name "   ". Correct and add "Sara".
3. Try to add "ali" (duplicate). Correct and add "Bilal".
4. Rename Ali: try empty name. Correct with a valid name "Kamran". Confirm success.
5. Rename Sara: try to rename to "Bilal". Correct with "Sara Khan". Confirm success.
6. Add expense "Fuel" Rs. 600, payer Kamran, sharers Kamran and Sara Khan.
7. Try to remove Kamran. Observe block message naming "Fuel".
8. Add expense "Snacks" Rs. 200, payer Bilal, sharers Sara Khan (Bilal is payer but not sharer).
9. Try to remove Bilal. Observe block message naming "Snacks".
10. Open the Add Expense form. Try each of the following in turn (correct after each error before trying the next):
    - Submit with empty description.
    - Enter amount 0.
    - Enter amount −500.
    - Enter amount 999.50 (decimal).
    - Uncheck all sharers, submit.
    - Leave payer unselected, submit.
    - Enter amount 10,000,001.
11. Correct all fields and save — confirm the expense is saved and no error remains.
12. Add another expense. Try each tip error:
    - Select "Flat amount", enter −50. Submit.
    - Change to −10% percentage. Submit.
    - Enter 101%. Submit.
    - Select "Flat amount", enter 99.50. Submit.
    - Enter base 9,500,000 with flat tip 600,000. Submit.
13. Correct the tip and save. Confirm success.

**Expected results:**

Each invalid submission shows exactly the error message specified in `docs/user-stories.md` for that criterion. After each correction and resubmission, the error disappears and the action succeeds. No submission with invalid data is ever persisted. The app never crashes or freezes at any point in the sweep.

Exact error messages to verify:
- Empty/whitespace name: "Name cannot be empty"
- Duplicate name: "A participant named [Name] already exists"
- Remove blocked by expense: "Cannot remove [Name]: they appear on [Expense]. Update that expense first."
- Empty description: "Description cannot be empty"
- Amount ≤ 0: "Amount must be greater than zero"
- Decimal amount: "Amount must be a whole number of rupees"
- No sharers: "At least one participant must share this expense"
- No payer: "A payer must be selected"
- Amount above cap: "Amount cannot exceed Rs. 10,000,000"
- Negative tip: "Tip cannot be negative"
- Tip percentage > 100%: "Tip percentage cannot exceed 100%"
- Decimal flat tip: "Tip must be a whole number of rupees"
- Total with tip above cap: "Total including tip cannot exceed Rs. 10,000,000"

---

## Scenario 10 — Boundary values

**Covers:** S-4.9, S-4.10, S-4.11, S-4.12, S-5.11, S-5.12, S-5.14

**Result: Pass** — Chrome, 2026-10-19

**Setup:** Open the app in a fresh state. Add participants Ali, Sara, Bilal.

**Steps:**

1. Add expense "Min" Rs. 1, payer Ali, sharers Ali. Save.
2. Observe the expense item.
3. Add expense "Max" Rs. 10,000,000, payer Ali, sharers Ali, Sara, Bilal. Save.
4. Open the per-person breakdown and inspect each share value for "Max".
5. Try to add expense "OverCap" Rs. 10,000,001. Submit.
6. Correct to Rs. 500. Select tip 0%. Save.
7. Check the total displayed.
8. Select tip 100%. Save.
9. Check the total displayed.
10. Add expense "TipExact" Rs. 9,500,000 with flat tip Rs. 500,000, payer Ali, sharers Ali. Save.
11. Add expense "TipOver" Rs. 9,500,000 with flat tip Rs. 600,000. Submit.

**Expected results:**

- Step 2: "Min" saved and visible at Rs. 1. No error.
- Step 3: "Max" saved and visible at Rs. 10,000,000. No error.
- Step 4: All share values display as whole numbers (e.g., "3,333,334" and "3,333,333"). No value uses scientific notation (no "e+" or "e−").
- Step 5: Error "Amount cannot exceed Rs. 10,000,000".
- Step 7: Total is Rs. 500 (0% tip adds nothing).
- Step 9: Total is Rs. 1,000 (100% tip doubles the base).
- Step 10: "TipExact" saved at Rs. 10,000,000. No error.
- Step 11: Error "Total including tip cannot exceed Rs. 10,000,000".
