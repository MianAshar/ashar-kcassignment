// Renders the add/edit expense form panel and exposes its binder (S-4, S-5, S-6).

import type { AppState, ExpenseFormState } from "../state.js";
import type { Participant } from "../../logic/types.js";
import { escHtml, formatRs } from "../utils.js";
import { computeTotal } from "../../logic/tip.js";
import type { TipMode } from "../../logic/types.js";

// ── Renderer ──────────────────────────────────────────────────────────────

/**
 * Implements S-4, S-5, S-6.
 * Renders the expense form panel when the form is open, or a plain
 * "Add Expense" button when it is closed.
 */
export function renderExpenseFormPanel(state: AppState): string {
  if (!state.expenseForm) {
    return `
      <div style="text-align:right;margin-bottom:.75rem">
        <button type="button" class="btn btn-primary btn-sm" id="btn-open-expense-form">
          + Add Expense
        </button>
      </div>
    `;
  }

  const f = state.expenseForm;
  const isEditing = f.editingId !== null;
  const title = isEditing ? "Edit Expense" : "Add Expense";

  return `
    <div class="form-panel" id="expense-form-panel">
      <h3>${title}</h3>

      <div class="form-group">
        <label for="ef-description">Description</label>
        <input type="text" id="ef-description" value="${escHtml(f.description)}"
          placeholder="e.g. Fuel to Faisalabad" autocomplete="off"
          class="${f.errors.description ? "field-error" : ""}">
        ${f.errors.description ? `<span class="field-error-msg">${escHtml(f.errors.description)}</span>` : ""}
      </div>

      <div class="form-group">
        <label for="ef-amount">Amount (Rs.)</label>
        <input type="number" id="ef-amount" value="${escHtml(f.amountStr)}"
          placeholder="0" min="1" step="1"
          class="${f.errors.amount ? "field-error" : ""}">
        ${f.errors.amount ? `<span class="field-error-msg">${escHtml(f.errors.amount)}</span>` : ""}
      </div>

      <div class="form-group">
        <label for="ef-payer">Paid by</label>
        <select id="ef-payer" class="${f.errors.payer ? "field-error" : ""}">
          <option value="">— select payer —</option>
          ${state.participants.map((p) =>
            `<option value="${p.id}"${f.payerId === p.id ? " selected" : ""}>${escHtml(p.name)}</option>`
          ).join("")}
        </select>
        ${f.errors.payer ? `<span class="field-error-msg">${escHtml(f.errors.payer)}</span>` : ""}
      </div>

      <div class="form-group">
        <label>Participants sharing this expense</label>
        ${renderSharerCheckboxes(state.participants, f)}
        ${f.errors.sharers ? `<span class="field-error-msg">${escHtml(f.errors.sharers)}</span>` : ""}
      </div>

      ${renderTipSection(f)}

      ${renderTotalPreview(f)}

      <div class="form-actions">
        <button type="button" class="btn btn-primary btn-sm" id="btn-save-expense">
          ${isEditing ? "Save Changes" : "Add Expense"}
        </button>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-cancel-expense">
          Cancel
        </button>
      </div>
    </div>
  `;
}

function renderSharerCheckboxes(
  participants: Participant[],
  f: ExpenseFormState,
): string {
  if (participants.length === 0) {
    return `<p class="empty-state" style="font-size:.85rem">Add participants first.</p>`;
  }
  return `
    <div class="checkbox-grid">
      ${participants.map((p) => `
        <label class="checkbox-item">
          <input type="checkbox" name="sharer" value="${p.id}"
            ${f.sharerIds.includes(p.id) ? "checked" : ""}>
          ${escHtml(p.name)}
        </label>
      `).join("")}
    </div>
  `;
}

function renderTipSection(f: ExpenseFormState): string {
  const mode = f.tipMode;
  return `
    <div class="form-group">
      <label>Tip (optional)</label>
      <div class="tip-modes">
        <label class="tip-mode-opt">
          <input type="radio" name="tip-mode" value="" ${mode === "" ? "checked" : ""}> None
        </label>
        <label class="tip-mode-opt">
          <input type="radio" name="tip-mode" value="percent" ${mode === "percent" ? "checked" : ""}> Percentage
        </label>
        <label class="tip-mode-opt">
          <input type="radio" name="tip-mode" value="flat" ${mode === "flat" ? "checked" : ""}> Flat amount
        </label>
      </div>
      ${mode !== "" ? `
        <div class="form-row" style="margin-top:.25rem">
          <input type="number" id="ef-tip-value" value="${escHtml(f.tipValueStr)}"
            placeholder="${mode === "percent" ? "e.g. 10" : "e.g. 100"}"
            min="0" step="${mode === "percent" ? "0.01" : "1"}"
            style="max-width:160px"
            class="${f.errors.tip || f.errors.total ? "field-error" : ""}">
          <span style="align-self:center;color:#6b7280;font-size:.9rem">
            ${mode === "percent" ? "%" : "Rs."}
          </span>
        </div>
        ${f.errors.tip ? `<span class="field-error-msg">${escHtml(f.errors.tip)}</span>` : ""}
        ${f.errors.total ? `<span class="field-error-msg">${escHtml(f.errors.total)}</span>` : ""}
      ` : ""}
    </div>
  `;
}

function renderTotalPreview(f: ExpenseFormState): string {
  // Show a live total preview when base amount + tip are both valid numbers.
  const base = parseFloat(f.amountStr);
  if (!Number.isFinite(base) || base <= 0) return "";
  if (f.errors.amount || f.errors.tip || f.errors.total) return "";

  const tipInput =
    f.tipMode !== "" && f.tipValueStr !== ""
      ? { mode: f.tipMode as TipMode, value: parseFloat(f.tipValueStr) }
      : undefined;

  if (tipInput && !Number.isFinite(tipInput.value)) return "";

  const total = computeTotal(Math.floor(base), tipInput);
  if (f.tipMode === "") return "";  // only show preview when a tip is present

  return `<p style="font-size:.85rem;color:#374151;margin-bottom:.5rem">
    Total including tip: <strong>${formatRs(total)}</strong>
  </p>`;
}

// ── Binder ────────────────────────────────────────────────────────────────

/**
 * Implements S-4, S-5, S-6.
 * Attaches event listeners to expense form elements after render.
 */
export function bindExpenseForm(handlers: {
  onOpenForm: () => void;
  onFieldChange: (field: string, value: string) => void;
  onSharerToggle: (participantId: string, checked: boolean) => void;
  onTipModeChange: (mode: string) => void;
  onSave: (values: {
    description: string;
    amountStr: string;
    payerId: string;
    sharerIds: string[];
    tipMode: string;
    tipValueStr: string;
  }) => void;
  onCancel: () => void;
}): void {
  document.getElementById("btn-open-expense-form")?.addEventListener("click", handlers.onOpenForm);
  document.getElementById("btn-cancel-expense")?.addEventListener("click", handlers.onCancel);

  document.getElementById("ef-description")?.addEventListener("input", (e) => {
    handlers.onFieldChange("description", (e.target as HTMLInputElement).value);
  });
  document.getElementById("ef-amount")?.addEventListener("input", (e) => {
    handlers.onFieldChange("amount", (e.target as HTMLInputElement).value);
  });
  document.getElementById("ef-payer")?.addEventListener("change", (e) => {
    handlers.onFieldChange("payer", (e.target as HTMLSelectElement).value);
  });

  document.querySelectorAll("input[name='sharer']").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const el = e.target as HTMLInputElement;
      handlers.onSharerToggle(el.value, el.checked);
    });
  });

  document.querySelectorAll("input[name='tip-mode']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      handlers.onTipModeChange((e.target as HTMLInputElement).value);
    });
  });

  document.getElementById("ef-tip-value")?.addEventListener("input", (e) => {
    handlers.onFieldChange("tipValue", (e.target as HTMLInputElement).value);
  });

  document.getElementById("btn-save-expense")?.addEventListener("click", () => {
    handlers.onSave(readFormValues());
  });
}

/** Reads all current form values from the DOM at the time of save. */
function readFormValues(): {
  description: string;
  amountStr: string;
  payerId: string;
  sharerIds: string[];
  tipMode: string;
  tipValueStr: string;
} {
  const description = (document.getElementById("ef-description") as HTMLInputElement | null)?.value ?? "";
  const amountStr = (document.getElementById("ef-amount") as HTMLInputElement | null)?.value ?? "";
  const payerId = (document.getElementById("ef-payer") as HTMLSelectElement | null)?.value ?? "";
  const sharerIds = Array.from(
    document.querySelectorAll<HTMLInputElement>("input[name='sharer']:checked"),
  ).map((cb) => cb.value);
  const tipMode =
    (document.querySelector<HTMLInputElement>("input[name='tip-mode']:checked")?.value) ?? "";
  const tipValueStr = (document.getElementById("ef-tip-value") as HTMLInputElement | null)?.value ?? "";

  return { description, amountStr, payerId, sharerIds, tipMode, tipValueStr };
}
