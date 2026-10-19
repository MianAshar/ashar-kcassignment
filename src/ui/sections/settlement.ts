// Renders the simplified settlement summary (S-10). Pure render — no events.

import type { AppState } from "../state.js";
import { computeNetBalances } from "../../logic/balances.js";
import { computeSettlement } from "../../logic/settlement.js";
import { escHtml, formatRs } from "../utils.js";

/**
 * Implements S-10.
 * Renders the "Simplified settlement" section. Shows the greedy transfer list,
 * the all-settled message, or the no-expenses message as appropriate.
 *
 * The section is headed "Simplified settlement" (not "Minimum transfers") to
 * honestly reflect that the greedy algorithm does not guarantee the minimum
 * number of transfers.
 */
export function renderSettlement(state: AppState): string {
  const nameById = new Map(state.participants.map((p) => [p.id, p.name]));

  const body = buildSettlementBody(state, nameById);

  return `
    <div class="card" id="section-settlement">
      <h2>Simplified settlement</h2>
      ${body}
    </div>
  `;
}

function buildSettlementBody(
  state: AppState,
  nameById: Map<string, string>,
): string {
  if (state.expenses.length === 0) {
    return `<p class="empty-state">No expenses have been added yet.</p>`;
  }

  const balances = computeNetBalances(state.participants, state.expenses);
  const transfers = computeSettlement(balances);

  if (transfers.length === 0) {
    return `<p class="empty-state">All balances are settled — no transfers needed.</p>`;
  }

  const rows = transfers.map((t) => {
    const from = escHtml(nameById.get(t.fromId) ?? t.fromId);
    const to = escHtml(nameById.get(t.toId) ?? t.toId);
    return `
      <div class="transfer-row">
        <span>${from} pays ${to}</span>
        <span class="transfer-amount">${formatRs(t.amount)}</span>
      </div>
    `;
  }).join("");

  return `<div class="settlement-list">${rows}</div>`;
}
