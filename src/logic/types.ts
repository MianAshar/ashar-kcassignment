// Core domain types shared across all logic modules.

/** A person in the trip roster. Id is a stable UUID assigned at creation. */
export interface Participant {
  id: string;
  name: string;
}

/** How the optional tip on an expense was entered. */
export type TipMode = "percent" | "flat";

export interface TipInput {
  mode: TipMode;
  /** Whole number (percent 0-100) or whole rupee amount. Raw user value. */
  value: number;
}

/**
 * One recorded expense. Sharers are stored as participant IDs in the order
 * they were listed — order matters because Case B rounding distributes the
 * leftover to the first sharers in listed order (S-12).
 */
export interface Expense {
  id: string;
  description: string;
  /** Base amount in whole rupees before tip. */
  amount: number;
  payerId: string;
  /** Participant IDs of everyone splitting this expense, in listed order. */
  sharerIds: string[];
  /** Optional tip — absent means no tip. */
  tip?: TipInput;
}

/** The whole-rupee share one participant owes on a single expense (S-12). */
export interface Share {
  participantId: string;
  /** Whole rupees. Can be 0 (valid — see S-12 very-small-amount case). */
  amount: number;
}

/**
 * The rounding note to display under an expense in the expense list (S-12).
 * null means no note should be shown (leftover was zero).
 */
export type RoundingNote = string | null;

/**
 * Full computed result for a single expense: the tip-inclusive total,
 * each sharer's whole-rupee share, and the display note for rounding.
 */
export interface ExpenseResult {
  expenseId: string;
  /** Base + rounded tip. */
  total: number;
  shares: Share[];
  roundingNote: RoundingNote;
}

/** One participant's net position across the whole trip (S-10, S-11). */
export interface NetBalance {
  participantId: string;
  /** Positive = is owed money; negative = owes money. */
  net: number;
}

/** A single transfer in the settlement (S-10). */
export interface Transfer {
  fromId: string;
  toId: string;
  amount: number;
}

/** The whole persisted trip — this is what goes to / comes from storage. */
export interface TripData {
  participants: Participant[];
  expenses: Expense[];
}
