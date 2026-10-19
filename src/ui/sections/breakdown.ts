// Renders the per-person breakdown (S-11). Pure render — no events.

import type { AppState } from "../state.js";
import { computeExpenseResults } from "../../logic/balances.js";
import { escHtml, formatRs } from "../utils.js";

/**
 * Implements S-11.
 * For each participant: shows the expenses they shared, their share of each,
 * what they personally paid, who paid (so they know who they owe), and the
 * overall balance. Hidden when there are no expenses.
 *
 * Share values here are identical to those used in the settlement (S-10) —
 * both derive from computeExpenseResults, ensuring one source of truth (S-12).
 */
export function renderBreakdown(state: AppState): string {
  if (state.expenses.length === 0) return "";

  const nameById = new Map(state.participants.map((p) => [p.id, p.name]));
  const results = computeExpenseResults(state.expenses);

  const persons = state.participants.map((participant) => {
    const expenseRows: {
      description: string;
      share: number;
      paid: number;
      // "You" when this participant is the payer, otherwise the payer's name.
      // Tells the participant who they owe for each expense.
      paidBy: string;
      net: number;
    }[] = [];

    let totalPaid = 0;
    let totalOwed = 0;

    for (const result of results) {
      const expense = state.expenses.find((e) => e.id === result.expenseId);
      if (!expense) continue;

      const isSharer = result.shares.some((s) => s.participantId === participant.id);
      const isPayer = expense.payerId === participant.id;

      // Only include expenses where this participant is involved
      if (!isSharer && !isPayer) continue;

      const share = result.shares.find((s) => s.participantId === participant.id)?.amount ?? 0;
      const paid = isPayer ? result.total : 0;
      const net = paid - share;

      totalPaid += paid;
      totalOwed += share;

      // Show "You" when participant is the payer so they know they fronted the money.
      // Show the payer's name otherwise so they know exactly who they owe.
      const paidBy = isPayer ? "You" : (nameById.get(expense.payerId) ?? expense.payerId);

      expenseRows.push({ description: expense.description, share, paid, paidBy, net });
    }

    const netBalance = totalPaid - totalOwed;

    return renderPersonBreakdown(
      participant.name,
      expenseRows,
      totalPaid,
      totalOwed,
      netBalance,
    );
  });

  return `
    <div class="card" id="section-breakdown">
      <h2>Per-person breakdown</h2>
      <div class="breakdown-list">
        ${persons.join("")}
      </div>
    </div>
  `;
}

function renderPersonBreakdown(
  name: string,
  rows: { description: string; share: number; paid: number; paidBy: string; net: number }[],
  totalPaid: number,
  totalOwed: number,
  netBalance: number,
): string {
  if (rows.length === 0) {
    return `
      <div class="breakdown-person">
        <div class="breakdown-person-name">${escHtml(name)}</div>
        <p class="empty-state" style="font-size:.85rem">Not on any expense.</p>
      </div>
    `;
  }

  const netClass =
    netBalance > 0 ? "net-positive" : netBalance < 0 ? "net-negative" : "net-zero";

  // Plain +/− amount per row (unchanged semantics, column just renamed to Balance)
  const tableRows = rows.map((r) => {
    const balanceSign = r.net >= 0 ? "+" : "\u2212";
    const balanceAbs = formatRs(Math.abs(r.net));
    return `
      <tr>
        <td>${escHtml(r.description)}</td>
        <td class="num">${formatRs(r.share)}</td>
        <td class="num">${r.paid > 0 ? formatRs(r.paid) : "—"}</td>
        <td>${escHtml(r.paidBy)}</td>
        <td class="num">${balanceSign}${balanceAbs}</td>
      </tr>
    `;
  }).join("");

  // Plain-language balance label: avoids "Net" jargon.
  let balanceLabel: string;
  if (netBalance > 0) {
    balanceLabel = `Is owed <strong>${formatRs(netBalance)}</strong>`;
  } else if (netBalance < 0) {
    balanceLabel = `Owes <strong>${formatRs(-netBalance)}</strong>`;
  } else {
    balanceLabel = `<strong>Settled</strong>`;
  }

  return `
    <div class="breakdown-person">
      <div class="breakdown-person-name">${escHtml(name)}</div>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Expense</th>
            <th class="num">Share</th>
            <th class="num">Paid</th>
            <th>Paid by</th>
            <th class="num">Balance</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="breakdown-summary">
        <span>Total paid: <strong>${formatRs(totalPaid)}</strong></span>
        <span>Total owed: <strong>${formatRs(totalOwed)}</strong></span>
        <span class="${netClass}">${balanceLabel}</span>
      </div>
    </div>
  `;
}
