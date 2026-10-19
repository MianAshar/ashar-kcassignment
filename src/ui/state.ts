// App state: the single source of truth for both trip data and UI state.
// All mutations go through setState(); renders are triggered by the caller.

import type { Participant, Expense, TipMode } from "../logic/types.js";

// ── Form state types ──────────────────────────────────────────────────────

export interface ExpenseFormErrors {
  description?: string;
  amount?: string;
  payer?: string;
  sharers?: string;
  tip?: string;
  total?: string;
}

/** Live state of the add/edit expense form. null = form not shown. */
export interface ExpenseFormState {
  /** null = adding a new expense; an id = editing that expense. */
  editingId: string | null;
  description: string;
  amountStr: string;
  payerId: string;
  sharerIds: string[];
  tipMode: TipMode | "";
  tipValueStr: string;
  errors: ExpenseFormErrors;
}

// ── Full app state ────────────────────────────────────────────────────────

export interface AppState {
  // Trip data
  participants: Participant[];
  expenses: Expense[];

  // Participant forms (S-1, S-2, S-3)
  participantInput: string;
  participantInputError: string | null;
  renamingId: string | null;       // participant being renamed
  renameInput: string;
  renameError: string | null;
  removeError: { participantId: string; message: string } | null;

  // Expense form (S-4, S-5, S-6)
  expenseForm: ExpenseFormState | null;

  // Delete confirmation (S-7)
  deleteConfirmId: string | null;

  // Global UI
  newTripConfirmVisible: boolean;  // S-9
  storageLoadError: boolean;       // S-8
}

// ── State singleton ───────────────────────────────────────────────────────

const initial: AppState = {
  participants: [],
  expenses: [],
  participantInput: "",
  participantInputError: null,
  renamingId: null,
  renameInput: "",
  renameError: null,
  removeError: null,
  expenseForm: null,
  deleteConfirmId: null,
  newTripConfirmVisible: false,
  storageLoadError: false,
};

let _state: AppState = { ...initial };

export function getState(): AppState {
  return _state;
}

/**
 * Merges partial updates into state. Does NOT trigger a render — the caller
 * is responsible for calling render() after state changes that require it.
 */
export function setState(updates: Partial<AppState>): void {
  _state = { ..._state, ...updates };
}

/** Replaces trip data in state (participants + expenses). */
export function setTripData(
  participants: Participant[],
  expenses: Expense[],
): void {
  _state = { ..._state, participants, expenses };
}
