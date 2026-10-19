// Main render loop and all event handlers. Coordinates state, storage, and
// section renderers. All mutations to trip data call render() after updating.

import { getState, setState, setTripData } from "./state.js";
import type { ExpenseFormState } from "./state.js";
import { renderParticipants, bindParticipants } from "./sections/participants.js";
import { renderExpenseFormPanel, bindExpenseForm } from "./sections/expenseForm.js";
import { renderExpenseList, bindExpenseList } from "./sections/expenseList.js";
import { renderSettlement } from "./sections/settlement.js";
import { renderBreakdown } from "./sections/breakdown.js";
import { newId } from "./utils.js";
import { validateParticipantName, validateDescription, validateAmount, validateSharers, validatePayer, validateTip, validateTotal } from "../logic/validation.js";
import { computeTotal } from "../logic/tip.js";
import { saveTrip, clearTrip } from "../logic/storage.js";
import type { Expense, TipInput, TipMode } from "../logic/types.js";

// ── Render ────────────────────────────────────────────────────────────────

/** Re-renders the entire app from current state, then re-binds all events. */
export function render(): void {
  const root = document.getElementById("app");
  if (!root) return;

  // Preserve focus across re-renders so keyboard users don't lose context.
  const focusId = (document.activeElement as HTMLElement | null)?.id ?? null;

  const state = getState();

  root.innerHTML = `
    <header class="app-header">
      <div class="inner">
        <h1>Trip Expense Splitter</h1>
        <button type="button" class="btn btn-ghost-white btn-sm" id="btn-new-trip">
          New Trip
        </button>
      </div>
    </header>
    <main class="container">
      ${renderStorageError(state)}
      ${renderParticipants(state)}
      <div class="card" id="section-expenses">
        <div class="expense-section-header">
          <h2>Expenses</h2>
        </div>
        ${renderExpenseFormPanel(state)}
        ${renderExpenseList(state)}
      </div>
      ${renderSettlement(state)}
      ${renderBreakdown(state)}
    </main>
    ${renderNewTripModal(state)}
  `;

  bindAll();

  if (focusId) {
    const el = document.getElementById(focusId);
    if (el) (el as HTMLElement).focus();
  }
}

// ── Section renderers (inline, no events) ────────────────────────────────

function renderStorageError(state: ReturnType<typeof getState>): string {
  if (!state.storageLoadError) return "";
  return `
    <div class="banner banner-error" id="storage-error-banner">
      <span>Your saved trip data could not be loaded. Starting a new trip.</span>
      <button type="button" class="btn btn-ghost btn-sm" id="btn-dismiss-storage-error">
        Dismiss
      </button>
    </div>
  `;
}

function renderNewTripModal(state: ReturnType<typeof getState>): string {
  if (!state.newTripConfirmVisible) return "";
  return `
    <div class="modal-backdrop" id="new-trip-modal">
      <div class="modal">
        <h3>Start a new trip?</h3>
        <p>All participants and expenses will be cleared. This cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost btn-sm" id="btn-cancel-new-trip">Cancel</button>
          <button type="button" class="btn btn-danger btn-sm" id="btn-confirm-new-trip">Clear & start new</button>
        </div>
      </div>
    </div>
  `;
}

// ── Event binding ─────────────────────────────────────────────────────────

function bindAll(): void {
  const state = getState();

  // Storage error banner dismiss
  document.getElementById("btn-dismiss-storage-error")?.addEventListener("click", () => {
    setState({ storageLoadError: false });
    render();
  });

  // New trip (S-9)
  document.getElementById("btn-new-trip")?.addEventListener("click", () => {
    setState({ newTripConfirmVisible: true });
    render();
  });
  document.getElementById("btn-cancel-new-trip")?.addEventListener("click", () => {
    setState({ newTripConfirmVisible: false });
    render();
  });
  document.getElementById("btn-confirm-new-trip")?.addEventListener("click", handleNewTrip);

  // Participants (S-1, S-2, S-3)
  bindParticipants({
    onInputChange: (value) => setState({ participantInput: value }),
    onAddClick: handleAddParticipant,
    onRename: handleConfirmRename,
    onStartRename: handleStartRename,
    onCancelRename: handleCancelRename,
    onRemove: handleRemoveParticipant,
  });

  // Expense form (S-4, S-5, S-6)
  bindExpenseForm({
    onOpenForm: handleOpenExpenseForm,
    onFieldChange: handleExpenseFieldChange,
    onSharerToggle: handleSharerToggle,
    onTipModeChange: handleTipModeChange,
    onSave: handleSaveExpense,
    onCancel: handleCancelExpense,
  });

  // Expense list (S-7)
  bindExpenseList({
    onEdit: handleEditExpense,
    onDeleteRequest: (id) => { setState({ deleteConfirmId: id }); render(); },
    onDeleteConfirm: handleDeleteExpense,
    onDeleteCancel: () => { setState({ deleteConfirmId: null }); render(); },
  });

  void state; // suppress "unused" warning — state is used inside handlers via getState()
}

// ── Participant handlers (S-1, S-2, S-3) ────────────────────────────────

function handleAddParticipant(rawName: string): void {
  const state = getState();
  const error = validateParticipantName(rawName, state.participants);
  if (error) {
    setState({ participantInput: rawName, participantInputError: error });
    render();
    return;
  }

  const newParticipants = [
    ...state.participants,
    { id: newId(), name: rawName.trim() },
  ];
  setTripData(newParticipants, state.expenses);
  setState({ participantInput: "", participantInputError: null });
  saveTripData();
  render();
}

function handleStartRename(participantId: string): void {
  const state = getState();
  const p = state.participants.find((x) => x.id === participantId);
  setState({
    renamingId: participantId,
    renameInput: p?.name ?? "",
    renameError: null,
    removeError: null,
  });
  render();
}

function handleConfirmRename(participantId: string, newName: string): void {
  const state = getState();
  const error = validateParticipantName(newName, state.participants, participantId);
  if (error) {
    setState({ renameInput: newName, renameError: error });
    render();
    return;
  }

  const trimmed = newName.trim();
  const newParticipants = state.participants.map((p) =>
    p.id === participantId ? { ...p, name: trimmed } : p,
  );
  setTripData(newParticipants, state.expenses);
  setState({ renamingId: null, renameError: null });
  saveTripData();
  render();
}

function handleCancelRename(): void {
  setState({ renamingId: null, renameError: null });
  render();
}

function handleRemoveParticipant(participantId: string): void {
  const state = getState();
  const participant = state.participants.find((p) => p.id === participantId);
  if (!participant) return;

  // Find all expenses that reference this participant (as payer or sharer).
  const blocking = state.expenses.filter(
    (e) => e.payerId === participantId || e.sharerIds.includes(participantId),
  );

  if (blocking.length > 0) {
    const names = blocking.map((e) => `\u201c${e.description}\u201d`);
    const expenseList = formatNameList(names);
    const plural = blocking.length > 1;
    const message =
      `Cannot remove ${participant.name}: they appear on ${expenseList}. ` +
      `Update ${plural ? "those expenses" : "that expense"} first.`;
    setState({ removeError: { participantId, message } });
    render();
    return;
  }

  const newParticipants = state.participants.filter((p) => p.id !== participantId);
  setTripData(newParticipants, state.expenses);
  setState({ removeError: null });
  saveTripData();
  render();
}

// ── Expense form handlers (S-4, S-5, S-6) ───────────────────────────────

function handleOpenExpenseForm(): void {
  setState({
    expenseForm: emptyExpenseForm(),
    deleteConfirmId: null,
  });
  render();
}

function handleCancelExpense(): void {
  setState({ expenseForm: null });
  render();
}

function handleExpenseFieldChange(field: string, value: string): void {
  const state = getState();
  if (!state.expenseForm) return;

  // Track live field values in state so they survive re-renders triggered
  // by other interactions. Re-render only for payer (affects the select UI).
  if (field === "description") {
    setState({ expenseForm: { ...state.expenseForm, description: value } });
  } else if (field === "amount") {
    setState({ expenseForm: { ...state.expenseForm, amountStr: value } });
  } else if (field === "payer") {
    setState({ expenseForm: { ...state.expenseForm, payerId: value } });
    render();
  } else if (field === "tipValue") {
    setState({ expenseForm: { ...state.expenseForm, tipValueStr: value } });
  }
}

function handleSharerToggle(participantId: string, checked: boolean): void {
  const state = getState();
  if (!state.expenseForm) return;
  const current = state.expenseForm.sharerIds;
  const updated = checked
    ? [...current, participantId]
    : current.filter((id) => id !== participantId);
  setState({ expenseForm: { ...state.expenseForm, sharerIds: updated } });
}

function handleTipModeChange(mode: string): void {
  const state = getState();
  if (!state.expenseForm) return;
  setState({
    expenseForm: {
      ...state.expenseForm,
      tipMode: mode as TipMode | "",
      tipValueStr: "",
      errors: { ...state.expenseForm.errors, tip: undefined, total: undefined },
    },
  });
  render();
}

function handleSaveExpense(values: {
  description: string;
  amountStr: string;
  payerId: string;
  sharerIds: string[];
  tipMode: string;
  tipValueStr: string;
}): void {
  const state = getState();
  if (!state.expenseForm) return;

  const errors: ExpenseFormState["errors"] = {};

  // Validate each field in turn, collecting all errors.
  const descError = validateDescription(values.description);
  if (descError) errors.description = descError;

  const amount = parseFloat(values.amountStr);
  const amountError = validateAmount(Number.isNaN(amount) ? 0 : amount);
  if (amountError) errors.amount = amountError;

  const payerError = validatePayer(values.payerId);
  if (payerError) errors.payer = payerError;

  const sharersError = validateSharers(values.sharerIds);
  if (sharersError) errors.sharers = sharersError;

  // Tip validation only when a tip mode is selected with a value.
  let tipInput: TipInput | undefined;
  if (values.tipMode !== "" && values.tipValueStr !== "") {
    const tipValue = parseFloat(values.tipValueStr);
    tipInput = { mode: values.tipMode as TipMode, value: Number.isNaN(tipValue) ? 0 : tipValue };
    const tipError = validateTip(tipInput);
    if (tipError) {
      errors.tip = tipError;
      tipInput = undefined; // don't compute total with invalid tip
    }
  }

  // Total cap check (only when base and tip are individually valid)
  if (!errors.amount && !errors.tip && Number.isFinite(amount) && amount > 0) {
    const total = computeTotal(Math.floor(amount), tipInput);
    const totalError = validateTotal(total);
    if (totalError) errors.total = totalError;
  }

  if (Object.keys(errors).length > 0) {
    setState({
      expenseForm: {
        ...state.expenseForm,
        description: values.description,
        amountStr: values.amountStr,
        payerId: values.payerId,
        sharerIds: values.sharerIds,
        tipMode: values.tipMode as TipMode | "",
        tipValueStr: values.tipValueStr,
        errors,
      },
    });
    render();
    return;
  }

  const expense: Expense = {
    id: state.expenseForm.editingId ?? newId(),
    description: values.description.trim(),
    amount: Math.floor(amount),
    payerId: values.payerId,
    sharerIds: values.sharerIds,
    tip: tipInput,
  };

  const currentState = getState();
  const newExpenses =
    state.expenseForm.editingId !== null
      ? currentState.expenses.map((e) => (e.id === expense.id ? expense : e))
      : [...currentState.expenses, expense];

  setTripData(currentState.participants, newExpenses);
  setState({ expenseForm: null, deleteConfirmId: null });
  saveTripData();
  render();
}

function handleEditExpense(expenseId: string): void {
  const state = getState();
  const expense = state.expenses.find((e) => e.id === expenseId);
  if (!expense) return;

  const tipMode = expense.tip?.mode ?? "";
  const tipValueStr = expense.tip ? String(expense.tip.value) : "";

  setState({
    expenseForm: {
      editingId: expenseId,
      description: expense.description,
      amountStr: String(expense.amount),
      payerId: expense.payerId,
      sharerIds: [...expense.sharerIds],
      tipMode,
      tipValueStr,
      errors: {},
    },
    deleteConfirmId: null,
  });
  render();
}

function handleDeleteExpense(expenseId: string): void {
  const state = getState();
  const newExpenses = state.expenses.filter((e) => e.id !== expenseId);
  setTripData(state.participants, newExpenses);
  setState({ deleteConfirmId: null });
  saveTripData();
  render();
}

// ── New trip handler (S-9) ────────────────────────────────────────────────

function handleNewTrip(): void {
  setTripData([], []);
  setState({
    newTripConfirmVisible: false,
    expenseForm: null,
    deleteConfirmId: null,
    renamingId: null,
    renameError: null,
    removeError: null,
    participantInput: "",
    participantInputError: null,
    storageLoadError: false,
  });
  // Remove the key entirely rather than saving an empty object (S-9).
  clearTrip(localStorage);
  render();
}

// ── Storage helpers ───────────────────────────────────────────────────────

/** Persists current trip data to localStorage after every mutation (S-8). */
function saveTripData(): void {
  const state = getState();
  saveTrip(localStorage, { participants: state.participants, expenses: state.expenses });
}

// ── Utility ───────────────────────────────────────────────────────────────

function emptyExpenseForm(): ExpenseFormState {
  return {
    editingId: null,
    description: "",
    amountStr: "",
    payerId: "",
    sharerIds: [],
    tipMode: "",
    tipValueStr: "",
    errors: {},
  };
}

/** Formats ["A", "B", "C"] as "A, B and C". */
function formatNameList(names: string[]): string {
  if (names.length === 1) return names[0] ?? "";
  const last = names[names.length - 1];
  return `${names.slice(0, -1).join(", ")} and ${last}`;
}

