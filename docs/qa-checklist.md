# QA Checklist

One row per acceptance criterion. Fill in the **Result** column as you test.
Mark each row **Pass**, **Fail**, or **Skip** (with a note if fail/skip).
A story moves to **Implemented** in `user-stories.md` only when every row for
that story passes.

---

## S-1 — Add a participant

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 1.1 | Add to empty roster | Open app fresh (or after new trip). Type "Ali" in the name field, click Add. | "Ali" appears in the participant list. | |
| 1.2 | Add second participant | With "Ali" in roster, type "Sara", click Add. | Both "Ali" and "Sara" appear. | |
| 1.3 | Empty name rejected | Clear the name field, click Add. | Form shows "Name cannot be empty". No participant added. | |
| 1.4 | Whitespace-only name rejected | Type "   " (spaces only), click Add. | Form shows "Name cannot be empty". No participant added. | |
| 1.5 | Duplicate name rejected (case-insensitive) | With "Ali" in roster, type "ali", click Add. | Form shows "A participant named Ali already exists". No duplicate added. | |
| 1.6 | Error clears on valid re-submission | Trigger the duplicate error (1.5), then type "Bilal", click Add. | "Bilal" is added; error message disappears. | |

---

## S-2 — Rename a participant

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 2.1 | Rename succeeds and propagates to expenses | Add Ali. Add expense "Fuel" paid by Ali, shared by Ali. Click Rename on Ali, enter "Ali Khan", click Save. | "Ali Khan" appears in the roster. "Fuel" now shows Ali Khan as payer and sharer. | |
| 2.2 | Empty rename rejected | Click Rename on any participant, clear the field, click Save. | Form shows "Name cannot be empty". Name unchanged. | |
| 2.3 | Rename to existing other name rejected | With Ali and Sara in roster, click Rename on Ali, type "Sara", click Save. | Form shows "A participant named Sara already exists". Name unchanged. | |
| 2.4 | Rename to same name (exact) accepted | Click Rename on Ali, leave "Ali" unchanged, click Save. | Form accepted without error. | |
| 2.5 | Rename to same name (different case) accepted | Click Rename on Ali, change to "ali", click Save. | Form accepted without error; participant name updates to "ali". | |
| 2.6 | Error clears on valid re-submission | Trigger the duplicate error (2.3), then type "Kamran", click Save. | Rename succeeds; error disappears. | |

---

## S-3 — Remove a participant

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 3.1 | Remove succeeds when not on any expense | Add Ali. Add Sara. Do NOT add any expense for Ali. Click Remove on Ali. | Ali disappears from the roster. | |
| 3.2 | Remove blocked when participant is a sharer | Add Ali, Sara. Add expense "Fuel" shared by Ali (Ali is sharer). Click Remove on Ali. | App shows "Cannot remove Ali: they appear on Fuel. Update that expense first." Ali stays in the roster. | |
| 3.3 | Remove blocked when participant is payer (not sharer) | Add Ali, Sara. Add expense "Snacks" paid by Ali, shared by Sara only. Click Remove on Ali. | App shows "Cannot remove Ali: they appear on Snacks. Update that expense first." Ali stays. | |
| 3.4 | Blocking message lists multiple expenses | Add Ali. Add "Fuel" with Ali as sharer. Add "Hotel" with Ali as sharer. Click Remove on Ali. | Message shows "Cannot remove Ali: they appear on "Fuel" and "Hotel". Update those expenses first." | |
| 3.5 | Remove succeeds after resolving expenses | After 3.2, edit "Fuel" to remove Ali as sharer (and not payer). Then click Remove on Ali. | Removal succeeds; Ali removed from roster. | |

---

## S-4 — Add an expense

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 4.1 | Normal add — payer is a sharer | Add Ali, Sara, Bilal. Click Add Expense. Enter "Fuel", Rs. 900, payer Ali, sharers Ali+Sara. Save. | Expense "Fuel" appears: Rs. 900, paid by Ali, shared by Ali and Sara. | |
| 4.2 | Normal add — payer is not a sharer | Add Ali, Sara, Bilal. Add "Snacks" Rs. 300, payer Ali, sharers Sara+Bilal only. Save. | Expense shows Ali as payer; sharers are Sara and Bilal (Ali not in sharers). | |
| 4.3 | Empty description rejected | Open form, leave description blank, fill other valid fields, Save. | Form shows "Description cannot be empty". No expense saved. | |
| 4.4 | Zero amount rejected | Enter amount 0, valid other fields, Save. | Form shows "Amount must be greater than zero". | |
| 4.5 | Negative amount rejected | Enter amount −500, Save. | Form shows "Amount must be greater than zero". | |
| 4.6 | Decimal amount rejected | Enter amount 999.50, Save. | Form shows "Amount must be a whole number of rupees". | |
| 4.7 | No sharers selected rejected | Select no sharer checkboxes, Save. | Form shows "At least one participant must share this expense". | |
| 4.8 | No payer selected rejected | Leave payer as "— select payer —", Save. | Form shows "A payer must be selected". | |
| 4.9 | Minimum amount (Rs. 1) accepted | Enter amount 1, valid other fields, Save. | Expense is saved at Rs. 1. | |
| 4.10 | Maximum amount (Rs. 10,000,000) accepted | Enter amount 10000000, Save. | Expense is saved at Rs. 10,000,000. | |
| 4.11 | Above cap (Rs. 10,000,001) rejected | Enter amount 10000001, Save. | Form shows "Amount cannot exceed Rs. 10,000,000". | |
| 4.12 | Large number — no scientific notation | Add expense Rs. 10,000,000 shared among 3 participants. Check breakdown. | All displayed share values are whole rupees with no "e" notation. | |
| 4.13 | Error clears on valid re-submission | Trigger any validation error, correct all fields, Save. | Expense is saved; error disappears. | |

---

## S-5 — Add a tip to an expense

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 5.1 | Percentage tip — total and shares correct | Add Ali, Sara. Add "Dinner" Rs. 1,000, tip 10%, payer Ali, sharers Ali+Sara. Save. | Expense shows Rs. 1,100. Ali's and Sara's shares are each Rs. 550. | |
| 5.2 | Flat tip — total and shares correct | Add "Dinner" Rs. 1,000, flat tip Rs. 100, payer Ali, sharers Ali+Sara. Save. | Expense shows Rs. 1,100. Each share Rs. 550. | |
| 5.3 | No tip — total equals base | Add "Fuel" Rs. 800, leave tip field as None. Save. | Expense shows Rs. 800. | |
| 5.4 | Tip follows sharers not whole group | Add Ali, Sara, Bilal. Add "Lunch" Rs. 600, tip 10%, sharers Ali+Sara (not Bilal). Save. Check breakdown. | Total Rs. 660. Ali Rs. 330, Sara Rs. 330. Bilal owes nothing for this expense. | |
| 5.5 | Percentage rounding — halves round up | Add "Dinner" Rs. 1,235, tip 10%. Save. | Total is Rs. 1,359 (tip = Rs. 124, halves up from 123.5). | |
| 5.6 | Percentage rounding — rounds down | Add "Dinner" Rs. 1,234, tip 10%. Save. | Total is Rs. 1,357 (tip = Rs. 123, rounds down from 123.4). | |
| 5.7 | Negative flat tip rejected | Enter flat tip −50, Save. | Form shows "Tip cannot be negative". | |
| 5.8 | Negative percentage rejected | Enter −10%, Save. | Form shows "Tip cannot be negative". | |
| 5.9 | Percentage above 100 rejected | Enter 101%, Save. | Form shows "Tip percentage cannot exceed 100%". | |
| 5.10 | Decimal flat tip rejected | Enter flat tip 99.50, Save. | Form shows "Tip must be a whole number of rupees". | |
| 5.11 | 100% tip boundary accepted | Add Rs. 500, tip 100%. Save. | Total is Rs. 1,000. Expense is saved. | |
| 5.12 | 0% tip accepted | Add Rs. 500, tip 0%. Save. | Total is Rs. 500. | |
| 5.13 | Tip causes total to exceed cap — rejected | Add Rs. 9,500,000, flat tip Rs. 600,000. Save. | Form shows "Total including tip cannot exceed Rs. 10,000,000". | |
| 5.14 | Tip brings total to exactly Rs. 10,000,000 — accepted | Add Rs. 9,500,000, flat tip Rs. 500,000. Save. | Expense is saved at total Rs. 10,000,000. | |

---

## S-6 — Edit an expense

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 6.1 | Edit amount | Add "Fuel" Rs. 600. Click Edit, change amount to Rs. 700, Save. | Expense now shows Rs. 700. | |
| 6.2 | Edit sharers | Add "Hotel" with sharers Ali+Sara. Click Edit, add Bilal as sharer, Save. | Expense now shows three sharers. | |
| 6.3 | Edit payer | Add "Fuel" paid by Ali. Click Edit, change payer to Sara, Save. | Expense now shows Sara as payer. | |
| 6.4 | Invalid input in edit form — same errors as S-4/S-5 | Click Edit on any expense, clear the description, Save. | Form shows "Description cannot be empty". Original data preserved (clicking Cancel restores it). | |
| 6.5 | Settlement recalculates after edit | With settlement visible, edit an expense amount. Save. | Settlement transfers update immediately to reflect new amounts. | |

---

## S-7 — Delete an expense

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 7.1 | Delete with confirmation | Add "Snacks" Rs. 200. Click Delete, then click the confirm Delete button in the prompt. | "Snacks" no longer appears in the expense list. | |
| 7.2 | Delete requires confirmation — single tap does not delete | Click Delete on any expense. Do nothing else. | A confirmation prompt appears; the expense is still in the list. | |
| 7.3 | Cancel delete keeps expense | Click Delete, then click Cancel in the prompt. | Expense remains unchanged. | |
| 7.4 | Settlement recalculates after delete | With settlement visible and multiple expenses, delete one expense and confirm. | Settlement updates immediately. | |

---

## S-8 — Persist trip data in the browser

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 8.1 | Data survives tab close | Add Ali, Sara, and expense "Fuel" Rs. 600. Close the browser tab. Reopen `http://localhost:5173`. | Ali, Sara, and "Fuel" Rs. 600 are present. | |
| 8.2 | Data survives browser restart | With data entered, quit the browser entirely. Reopen and navigate to the app. | All participants and expenses are restored exactly. | |
| 8.3 | Save is automatic — no manual action needed | Add or edit an expense, then immediately close the tab without clicking any "save" button. Reopen. | The change is persisted. | |
| 8.4 | First run — no error shown | Open the app in a fresh browser profile (no prior data). | App starts with empty trip; no error or warning message. | |
| 8.5 | Corrupted storage shows message | Open DevTools → Application → Local Storage. Set the key `trip-expense-splitter-v1` to `{broken`. Reload the page. | App shows "Your saved trip data could not be loaded. Starting a new trip." Starts empty without crashing. | |

---

## S-9 — Start a new trip

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 9.1 | Confirm new trip clears all data | Add participants and expenses. Click "New Trip", then confirm. | Participant list and expense list are both empty. localStorage key is gone (verify in DevTools). | |
| 9.2 | Cancel new trip keeps data | Click "New Trip", then click Cancel. | All participants and expenses remain unchanged. | |
| 9.3 | New trip on already-empty state works | Start with empty trip. Click "New Trip", confirm. | App stays in empty state with no error. | |

---

## S-10 — View the settlement summary

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 10.1 | Simple two-person settlement | Add Ali, Sara. Add "Fuel" Rs. 600, paid by Ali, shared by Ali+Sara. | Settlement shows "Sara pays Ali Rs. 300". | |
| 10.2 | Faisalabad scenario — full case | Add Ali, Usman, Sara, Bilal. Add three expenses: (a) "Fuel to Faisalabad" Rs. 1,500 paid by Ali shared by Ali+Usman; (b) "Fuel onwards" Rs. 2,000 paid by Usman shared by all four; (c) "Hotel" Rs. 3,001 paid by Sara shared by all four. | Settlement shows exactly: "Bilal pays Sara Rs. 1,250" and "Ali pays Sara Rs. 500". No other transfers. | |
| 10.3 | All balances zero — settled message | Add Ali, Sara. Add "Fuel" Rs. 600 paid by Ali shared by Ali+Sara. Add "Hotel" Rs. 600 paid by Sara shared by Ali+Sara. | Settlement shows "All balances are settled — no transfers needed." | |
| 10.4 | One participant only — settled message | Add only Ali. Add one expense paid by Ali shared by Ali. | Settlement shows "All balances are settled — no transfers needed." | |
| 10.5 | No expenses — empty state message | Open app with no expenses. | Settlement shows "No expenses have been added yet." | |
| 10.6 | Section heading is "Simplified settlement" | Check the settlement section heading. | Heading reads "Simplified settlement" (not "Minimum transfers" or similar). | |
| 10.7 | Settlement recalculates on expense change | With settlement visible, add or edit an expense. | Settlement updates immediately without a page reload. | |

---

## S-11 — View the per-person breakdown

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 11.1 | Breakdown shows correct per-expense figures | Add Ali, Sara, Bilal. Add "Fuel" Rs. 600 paid by Ali shared by Ali+Sara. Add "Hotel" Rs. 900 paid by Sara shared by Ali+Sara+Bilal. Check Ali's breakdown. | Ali's breakdown shows: Fuel — share Rs. 300, paid Rs. 600; Hotel — share Rs. 300, paid Rs. 0. Summary: total paid Rs. 600, total owed Rs. 600, net Rs. 0. | |
| 11.2 | Expense not shared by participant is excluded | Using the setup from 11.1, check Bilal's breakdown. | Bilal's breakdown shows only "Hotel" (not "Fuel"). | |
| 11.3 | Payer-not-sharer case | Add Ali, Sara, Bilal. Add "Snacks" Rs. 300 paid by Ali, shared by Sara+Bilal only. Check Ali's breakdown. | Ali's row for Snacks: share Rs. 0, paid Rs. 300, net +Rs. 300. | |
| 11.4 | Net balance matches settlement | Using any multi-person scenario, compare each person's net balance in the breakdown with the amounts in the settlement transfers. | The net values are consistent: a participant with net −Rs. 500 in the breakdown appears as a Rs. 500 debtor in the settlement. | |
| 11.5 | Zero net balance — not in settlement transfers | In 11.1 above, verify Ali's net is Rs. 0. Check settlement. | Ali does not appear in any settlement transfer. | |

---

## S-12 — Rounding and rounding notes

| # | Criterion | Steps to test | Expected result | Result |
|---|---|---|---|---|
| 12.1 | Case A — payer absorbs Re. 1 | Add Ali, Sara, Bilal. Add expense Rs. 1,000 paid by Ali, sharers Ali→Sara→Bilal (Ali first). Check expense and breakdown. | Sara Rs. 333, Bilal Rs. 333, Ali Rs. 334. Note under expense: "Ali absorbed Re. 1 rounding difference." | |
| 12.2 | Case A — exact division, no note | Add expense Rs. 900 paid by Ali, sharers Ali+Sara+Bilal. | Each Rs. 300. No rounding note shown. | |
| 12.3 | Case A — payer absorbs Rs. 2 | Add expense Rs. 1,001 paid by Ali, sharers Ali+Sara+Bilal. | Sara Rs. 333, Bilal Rs. 333, Ali Rs. 335. Note: "Ali absorbed Rs. 2 rounding difference." | |
| 12.4 | Case B — leftover 1, first sharer gets +Re. 1 | Add Ali (not sharing), Sara, Bilal, Kamran. Add Rs. 1,000 paid by Ali, sharers Sara→Bilal→Kamran. | Sara Rs. 334, Bilal Rs. 333, Kamran Rs. 333. Note: "Re. 1 rounding difference added to Sara's share (first in listed order)." | |
| 12.5 | Case B — leftover 2, first two sharers get +Re. 1 each | Add Rs. 1,001 paid by Ali (not sharing), sharers Sara→Bilal→Kamran. | Sara Rs. 334, Bilal Rs. 334, Kamran Rs. 333. Note: "Rs. 2 rounding difference distributed to Sara and Bilal (first in listed order)." | |
| 12.6 | Case B — exact division, no note | Add Rs. 1,000 paid by Ali (not sharing), sharers Sara+Bilal (2 people). | Sara Rs. 500, Bilal Rs. 500. No rounding note shown. | |
| 12.7 | Very small amount — share can be Rs. 0 | Add Rs. 2 paid by Ali (not sharing), sharers Sara→Bilal→Kamran. Check breakdown. | Sara Rs. 1, Bilal Rs. 1, Kamran Rs. 0. Kamran still appears in breakdown with Rs. 0 share. Note: "Rs. 2 rounding difference distributed to Sara and Bilal (first in listed order)." | |
| 12.8 | With percentage tip — rounding applied to tipped total | Add Rs. 1,000, tip 10% = Rs. 1,100 total, paid by Ali (sharer), sharers Ali→Sara→Bilal. | Sara Rs. 366, Bilal Rs. 366, Ali Rs. 368. Note: "Ali absorbed Rs. 2 rounding difference." | |
| 12.9 | Rounding note placement — under expense in list, not in breakdown | Add any expense with a non-zero rounding remainder. | Rounding note appears in the expense list below that expense. The per-person breakdown shows share numbers only — no rounding note text. | |
| 12.10 | Shares sum exactly to total | For any of the above, add up all share figures visible in the breakdown. | Sum equals the expense total including tip exactly. | |
| 12.11 | Shares consistent across views | Compare share amounts for the same expense in the expense list area and the per-person breakdown. | The same rupee figure appears in both places. | |
