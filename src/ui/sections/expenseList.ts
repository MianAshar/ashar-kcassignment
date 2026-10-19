// Renders the expense list with delete confirmations (S-7) and rounding
// notes (S-12). Does not render the add/edit form — that is expenseForm.ts.

import type { AppState } from "../state.js";
import type { Expense } from "../../logic/types.js";
import { escHtml, formatRs } from "../utils.js";
import { computeTotal } from "../../logic/tip.js";
import { computeShares, resolveRoundingNote } from "../../logic/rounding.js";

// ── Renderer ──────────────────────────────────────────────────────────────

/**
 * Implements S-7, S-12.
 * Renders each expense with its total, payer, sharers, rounding note, and
 * action buttons. A delete-confirm prompt replaces the action buttons while
 * awaiting confirmation.
 */
export function renderExpenseList(state: AppState): string {
  if (state.expenses.length === 0) {
    return `<p class="empty-state">No expenses yet.</p>`;
  }

  const nameById = new Map(state.participants.map((p) => [p.id, p.name]));

  return `
    <div class="expense-list" id="expense-list">
      ${state.expenses.map((e) => renderExpenseItem(e, nameById, state)).join("")}
    </div>
  `;
}

function renderExpenseItem(
  expense: Expense,
  nameById: Map<string, string>,
  state: AppState,
): string {
  const total = computeTotal(expense.amount, expense.tip);
  const payerName = escHtml(nameById.get(expense.payerId) ?? expense.payerId);
  const sharerNames = expense.sharerIds
    .map((id) => escHtml(nameById.get(id) ?? id))
    .join(", ");

  const { roundingNote } = computeShares(total, expense.payerId, expense.sharerIds);
  const noteText = resolveRoundingNote(roundingNote, (id) => nameById.get(id) ?? id);

  const awaitingDelete = state.deleteConfirmId === expense.id;

  return `
    <div class="expense-item" id="expense-${expense.id}">
      <div class="expense-header">
        <div>
          <div class="expense-title">${escHtml(expense.description)}</div>
          <div class="expense-meta">
            Paid by ${payerName} &middot; Shared by ${sharerNames}
            ${expense.tip ? ` &middot; incl. tip` : ""}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.35rem">
          <span class="expense-amount">${formatRs(total)}</span>
          ${!awaitingDelete ? `
            <div class="expense-actions">
              <button type="button" class="btn btn-ghost btn-sm"
                data-action="edit-expense" data-id="${expense.id}">Edit</button>
              <button type="button" class="btn btn-danger btn-sm"
                data-action="delete-expense" data-id="${expense.id}">Delete</button>
            </div>
          ` : ""}
        </div>
      </div>
      ${noteText ? `<div class="rounding-note">${escHtml(noteText)}</div>` : ""}
      ${awaitingDelete ? `
        <div class="delete-confirm">
          <span>Delete &ldquo;${escHtml(expense.description)}&rdquo;?</span>
          <button type="button" class="btn btn-danger btn-sm"
            data-action="confirm-delete" data-id="${expense.id}">Delete</button>
          <button type="button" class="btn btn-ghost btn-sm"
            data-action="cancel-delete">Cancel</button>
        </div>
      ` : ""}
    </div>
  `;
}

// ── Binder ────────────────────────────────────────────────────────────────

/**
 * Implements S-7.
 * Attaches expense list event listeners after render.
 */
export function bindExpenseList(handlers: {
  onEdit: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
}): void {
  document.querySelectorAll("[data-action='edit-expense']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => {
      handlers.onEdit((btn as HTMLElement).dataset["id"]!);
    });
  });

  document.querySelectorAll("[data-action='delete-expense']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => {
      handlers.onDeleteRequest((btn as HTMLElement).dataset["id"]!);
    });
  });

  document.querySelectorAll("[data-action='confirm-delete']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => {
      handlers.onDeleteConfirm((btn as HTMLElement).dataset["id"]!);
    });
  });

  document.querySelectorAll("[data-action='cancel-delete']").forEach((btn) => {
    (btn as HTMLElement).addEventListener("click", () => handlers.onDeleteCancel());
  });
}
