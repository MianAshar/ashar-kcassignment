// Net balance computation: for each participant, total paid minus total owed
// across all expenses. Used by both S-10 (settlement) and S-11 (breakdown).

import type { Expense, Participant, NetBalance, ExpenseResult } from "./types.js";
import { computeShares } from "./rounding.js";
import { computeTotal } from "./tip.js";

/**
 * Implements S-10, S-11.
 * Computes the full per-expense results (total, shares, rounding note) for
 * every expense. This is the single source of truth for share values — the
 * same data feeds both the settlement and the per-person breakdown, ensuring
 * S-12's consistency requirement is met.
 *
 * @param expenses  All expenses in the trip.
 * @returns         One ExpenseResult per expense, in the same order.
 */
export function computeExpenseResults(expenses: Expense[]): ExpenseResult[] {
  return expenses.map((expense) => {
    const total = computeTotal(expense.amount, expense.tip);
    const { shares, roundingNote } = computeShares(
      total,
      expense.payerId,
      expense.sharerIds,
    );
    return { expenseId: expense.id, total, shares, roundingNote };
  });
}

/**
 * Implements S-10, S-11.
 * Computes each participant's net balance: positive means they are owed money,
 * negative means they owe money.
 *
 * Net = (total amount paid as payer) − (sum of all shares assigned to them).
 *
 * @param participants  Full roster (ensures every participant appears in the
 *                      result, even if they have no expenses).
 * @param expenses      All expenses in the trip.
 * @returns             One NetBalance per participant.
 */
export function computeNetBalances(
  participants: Participant[],
  expenses: Expense[],
): NetBalance[] {
  const net = new Map<string, number>(
    participants.map((p) => [p.id, 0]),
  );

  const results = computeExpenseResults(expenses);

  for (const result of results) {
    const expense = expenses.find((e) => e.id === result.expenseId);
    if (!expense) continue;

    // Payer gains the full expense total (they are owed it back)
    net.set(expense.payerId, (net.get(expense.payerId) ?? 0) + result.total);

    // Each sharer loses their share (they owe that portion)
    for (const share of result.shares) {
      net.set(
        share.participantId,
        (net.get(share.participantId) ?? 0) - share.amount,
      );
    }
  }

  return participants.map((p) => ({
    participantId: p.id,
    net: net.get(p.id) ?? 0,
  }));
}
