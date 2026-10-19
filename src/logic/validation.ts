// Input validation for participants, expenses, and tips. Returns an error
// string on failure, null on success. No side effects; no DOM access.

import type { Participant, TipInput } from "./types.js";

const MAX_AMOUNT = 10_000_000; // Rs. 1 crore — keeps values in JS safe-integer range

// ---------------------------------------------------------------------------
// Participant validation (S-1, S-2)
// ---------------------------------------------------------------------------

/**
 * Implements S-1, S-2.
 * Validates a new or updated participant name against the existing roster.
 *
 * @param name           The name being submitted (may be trimmed by caller or not).
 * @param roster         All current participants.
 * @param excludeId      When renaming, pass the participant's own id so their
 *                       current name is excluded from the duplicate check.
 * @returns null if valid, or an error string to display.
 */
export function validateParticipantName(
  name: string,
  roster: Participant[],
  excludeId?: string,
): string | null {
  const trimmed = name.trim();

  if (trimmed === "") {
    return "Name cannot be empty";
  }

  // Case-insensitive duplicate check.
  // On rename: skip the participant being renamed (they are allowed to keep
  // their own name, or change only its casing — see S-2).
  const lower = trimmed.toLowerCase();
  const conflict = roster.find(
    (p) => p.name.toLowerCase() === lower && p.id !== excludeId,
  );
  if (conflict) {
    return `A participant named ${conflict.name} already exists`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Expense validation (S-4)
// ---------------------------------------------------------------------------

/**
 * Implements S-4.
 * Validates the description field of an expense form.
 *
 * @returns null if valid, or an error string.
 */
export function validateDescription(description: string): string | null {
  if (description.trim() === "") {
    return "Description cannot be empty";
  }
  return null;
}

/**
 * Implements S-4.
 * Validates the base expense amount (before tip).
 *
 * Whole-rupee check: we reject anything that isn't a safe integer, because
 * floating-point amounts like 999.50 would silently corrupt all share
 * calculations downstream.
 *
 * @returns null if valid, or an error string.
 */
export function validateAmount(amount: number): string | null {
  if (!Number.isFinite(amount) || amount !== Math.floor(amount)) {
    return "Amount must be a whole number of rupees";
  }
  if (amount <= 0) {
    return "Amount must be greater than zero";
  }
  if (amount > MAX_AMOUNT) {
    return "Amount cannot exceed Rs. 10,000,000";
  }
  return null;
}

/**
 * Implements S-4.
 * Validates that at least one participant has been selected as a sharer.
 *
 * @returns null if valid, or an error string.
 */
export function validateSharers(sharerIds: string[]): string | null {
  if (sharerIds.length === 0) {
    return "At least one participant must share this expense";
  }
  return null;
}

/**
 * Implements S-4.
 * Validates that a payer has been selected.
 *
 * @returns null if valid, or an error string.
 */
export function validatePayer(payerId: string | null | undefined): string | null {
  if (!payerId) {
    return "A payer must be selected";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tip validation (S-5)
// ---------------------------------------------------------------------------

/**
 * Implements S-5.
 * Validates a tip input. Call only when the user has actually entered a tip
 * (an absent/blank tip field bypasses this entirely).
 *
 * @returns null if valid, or an error string.
 */
export function validateTip(tip: TipInput): string | null {
  const { mode, value } = tip;

  if (!Number.isFinite(value)) {
    // Should not reach the user under normal conditions, but guard anyway.
    return mode === "flat"
      ? "Tip must be a whole number of rupees"
      : "Tip cannot be negative";
  }

  if (value < 0) {
    return "Tip cannot be negative";
  }

  if (mode === "percent") {
    if (value > 100) {
      return "Tip percentage cannot exceed 100%";
    }
  } else {
    // flat tip must be whole rupees
    if (value !== Math.floor(value)) {
      return "Tip must be a whole number of rupees";
    }
  }

  return null;
}

/**
 * Implements S-5.
 * Validates that the tip-inclusive total stays within the Rs. 10,000,000 cap.
 *
 * @param total  The already-computed tip-inclusive total in whole rupees.
 * @returns null if valid, or an error string.
 */
export function validateTotal(total: number): string | null {
  if (total > MAX_AMOUNT) {
    return "Total including tip cannot exceed Rs. 10,000,000";
  }
  return null;
}
