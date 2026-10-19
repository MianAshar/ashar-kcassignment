# App Roles

**A Trip Treasurer** is a person in a travel group who ends up holding all the
receipts. Think of the driver on a road trip where a friend joins mid-way in
Faisalabad: the first leg is split between two people, the rest between four,
different people pay for fuel, food and accommodation at different stops, and
at the end everyone looks to one person to work out who owes whom. They need a
fast, correct answer that the whole group will trust.

They can: add and manage trip participants (add, rename, remove); add, edit
and delete expenses, each with a description, a total amount in whole rupees,
a designated payer (who does not have to share the expense), and the subset of
participants splitting it; attach an optional tip to any expense as a
percentage or a flat rupee amount; view a settlement summary showing the
transfers needed to clear all balances; view a per-person breakdown showing
each participant's expenses, their share of each, what they personally paid,
and their resulting net balance; and start a new trip, clearing all saved data
after an explicit confirmation. Their data is saved in the browser and survives
tab closure and browser restarts on the same device.

They must never: see a settlement where the listed transfers do not account for
every rupee of every net balance; see shares on an expense that do not sum to
the expense total including tip; lose entered data without an explicit
confirmation step; remove a participant who is named on one or more expenses —
the app blocks the removal and tells the user which expenses must be updated
first; submit an expense with no participants sharing it; enter a zero or
negative expense amount; add a participant with an empty or duplicate name;
enter any monetary value — expense amount or tip — that is not a whole number of rupees (e.g. Rs. 99.50 is rejected);
enter a single expense amount above Rs. 10,000,000 (1 crore) — this cap sits
well above any realistic group expense and keeps all arithmetic within
JavaScript's safe integer range, preventing scientific notation or silent
rounding errors in any displayed result; or enter a negative tip, or a
percentage tip above 100% — the 100% ceiling blocks accidental typos such as
typing 150 instead of 15 while still accommodating any realistic generosity.

---

*There is one role because the one-off dinner bill — one expense, everyone
present, one payer — is a degenerate case of the trip. The same participant
list, expense entry, and settlement logic handle it without any additional
capability. A separate Dinner Splitter role would describe the same person
doing the same job on a smaller scale.*
