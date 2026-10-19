// Greedy debtor-creditor settlement algorithm. Produces at most N-1 transfers.
// Not guaranteed to be the mathematical minimum; described as "simplified
// settlement" in the UI per the product decision in CLAUDE.md.

import type { NetBalance, Transfer } from "./types.js";

/**
 * Implements S-10.
 * Computes a list of transfers that brings every participant's net balance
 * to exactly Rs. 0 using a greedy matching algorithm:
 *   1. Sort debtors (negative net) largest-debt-first.
 *   2. Sort creditors (positive net) largest-credit-first.
 *   3. Pair the top debtor with the top creditor; transfer the smaller of
 *      the two absolute amounts. Reduce both balances; repeat.
 *
 * The algorithm terminates in at most N-1 iterations because each iteration
 * zeroes out at least one participant. A zero-balance participant is never
 * a debtor or creditor, so they are excluded before processing.
 *
 * @param balances  Net balances from computeNetBalances.
 * @returns         Ordered list of transfers. Empty if all balances are zero.
 */
export function computeSettlement(balances: NetBalance[]): Transfer[] {
  // Work with mutable copies; avoid mutating the input.
  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ id: b.participantId, amount: -b.net })) // amount is positive
    .sort((a, b) => b.amount - a.amount); // largest debt first

  const creditors = balances
    .filter((b) => b.net > 0)
    .map((b) => ({ id: b.participantId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount); // largest credit first

  const transfers: Transfer[] = [];

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];

    // TypeScript: arrays indexed in bounds — guaranteed by while condition,
    // but noUncheckedIndexedAccess requires a check.
    if (!debtor || !creditor) break;

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    transfers.push({
      fromId: debtor.id,
      toId: creditor.id,
      amount: transferAmount,
    });

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    // Advance past any participant whose balance is now zero.
    if (debtor.amount === 0) di++;
    if (creditor.amount === 0) ci++;
  }

  return transfers;
}
