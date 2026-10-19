// Renders the per-person breakdown (S-11). Pure render — no events.

import type { AppState } from "../state.js";
import { computeExpenseResults } from "../../logic/balances.js";
import { escHtml, formatRs, formatNet } from "../utils.js";

/**
 * Implements S-11.
 * For each participant: shows the expenses they shared, their share of each,
 * what they personally paid, the per-expense net, and the overall summary.
 * Hidden when there are no expenses (nothing to show).
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

      expenseRows.push({ description: expense.description, share, paid, net });
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
  rows: { description: string; share: number; paid: number; net: number }[],
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

  const tableRows = rows.map((r) => {
    const netSign = r.net >= 0 ? "+" : "\u2212";
    const netAbs = formatRs(Math.abs(r.net));
    return `
      <tr>
        <td>${escHtml(r.description)}</td>
        <td class="num">${formatRs(r.share)}</td>
        <td class="num">${r.paid > 0 ? formatRs(r.paid) : "—"}</td>
        <td class="num">${netSign}${netAbs}</td>
      </tr>
    `;
  }).join("");

  return `
    <div class="breakdown-person">
      <div class="breakdown-person-name">${escHtml(name)}</div>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Expense</th>
            <th class="num">Share</th>
            <th class="num">Paid</th>
            <th class="num">Net</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="breakdown-summary">
        <span>Total paid: <strong>${formatRs(totalPaid)}</strong></span>
        <span>Total owed: <strong>${formatRs(totalOwed)}</strong></span>
        <span class="${netClass}">Net: ${formatNet(netBalance)}</span>
      </div>
    </div>
  `;
}
