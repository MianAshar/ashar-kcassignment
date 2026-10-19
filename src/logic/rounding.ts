// Whole-rupee share splitting and rounding note generation. Implements the
// canonical rounding rule from S-12, referenced by S-4, S-5, S-10, S-11.

import type { Share, RoundingNote } from "./types.js";

/**
 * Implements S-12.
 * Splits a whole-rupee total T among n sharers, assigning each a whole-rupee
 * share that together sum exactly to T.
 *
 * Two cases:
 *   Case A — payer IS one of the sharers:
 *     Every other sharer gets ⌊T ÷ n⌋. The payer absorbs the leftover, so
 *     their share = T − (n−1) × ⌊T ÷ n⌋. The payer absorbs the leftover
 *     because they already control the money; adjusting their own share is
 *     the simplest way to guarantee the shares sum exactly to T.
 *
 *   Case B — payer is NOT one of the sharers:
 *     Base share = ⌊T ÷ n⌋ for all.
 *     Leftover = T − n × ⌊T ÷ n⌋ (0 to n−1 rupees).
 *     The first `leftover` sharers in listed order each receive +Re. 1.
 *     Listed order is used (rather than random selection) so that the result
 *     is deterministic and auditable.
 *
 * @param total      Tip-inclusive total in whole rupees (T).
 * @param payerId    ID of the participant who paid.
 * @param sharerIds  Participant IDs in listed order (order matters for Case B).
 * @returns          { shares, roundingNote }
 */
export function computeShares(
  total: number,
  payerId: string,
  sharerIds: string[],
): { shares: Share[]; roundingNote: RoundingNote } {
  const n = sharerIds.length;
  const base = Math.floor(total / n);
  const leftover = total - base * n; // always 0 to n-1

  const payerIsSharer = sharerIds.includes(payerId);

  if (payerIsSharer) {
    return computeSharesCaseA(total, payerId, sharerIds, base, leftover);
  } else {
    return computeSharesCaseB(sharerIds, base, leftover);
  }
}

/** Case A: payer absorbs the entire leftover (their share = T − (n−1)×⌊T÷n⌋). */
function computeSharesCaseA(
  total: number,
  payerId: string,
  sharerIds: string[],
  base: number,
  leftover: number,
): { shares: Share[]; roundingNote: RoundingNote } {
  const shares: Share[] = sharerIds.map((id) => {
    if (id === payerId) {
      // Payer absorbs the leftover: their share is whatever is left after
      // paying every other sharer their floor share.
      const othersCount = sharerIds.length - 1;
      return { participantId: id, amount: total - othersCount * base };
    }
    return { participantId: id, amount: base };
  });

  const roundingNote = buildNoteA(payerId, leftover);
  return { shares, roundingNote };
}

/** Case B: leftover distributed one rupee each to the first `leftover` sharers. */
function computeSharesCaseB(
  sharerIds: string[],
  base: number,
  leftover: number,
): { shares: Share[]; roundingNote: RoundingNote } {
  const shares: Share[] = sharerIds.map((id, index) => ({
    participantId: id,
    amount: index < leftover ? base + 1 : base,
  }));

  const roundingNote = buildNoteB(sharerIds, leftover);
  return { shares, roundingNote };
}

// ---------------------------------------------------------------------------
// Rounding note builders (S-12 display text, placed under each expense)
// Zero leftover → null (no note shown) for both Case A and Case B.
// ---------------------------------------------------------------------------

/**
 * Builds the rounding note for Case A.
 * Uses participant ID as a placeholder — callers resolve to display names.
 */
function buildNoteA(payerId: string, leftover: number): RoundingNote {
  if (leftover === 0) return null;
  const rupeesLabel = formatRupees(leftover);
  return `${payerId}|absorbed|${rupeesLabel}`;
}

/**
 * Builds the rounding note for Case B.
 * Encodes the IDs of recipients — callers resolve to display names.
 */
function buildNoteB(sharerIds: string[], leftover: number): RoundingNote {
  if (leftover === 0) return null;
  const recipients = sharerIds.slice(0, leftover);
  const rupeesLabel = formatRupees(leftover);
  return `${recipients.join(",")}|distributed|${rupeesLabel}`;
}

/**
 * Implements S-12 display format: "Re. 1" (singular) vs "Rs. N" (plural).
 * Pakistani convention uses "Re." for exactly one rupee and "Rs." otherwise.
 */
export function formatRupees(amount: number): string {
  return amount === 1 ? "Re. 1" : `Rs. ${amount}`;
}

/**
 * Implements S-12 display text.
 * Resolves the encoded rounding note (with participant IDs) into a human-
 * readable string using a name-lookup function.
 *
 * @param note       The raw RoundingNote from computeShares.
 * @param getName    Function that resolves a participant ID to their display name.
 * @returns          Human-readable rounding note string, or null if no note.
 */
export function resolveRoundingNote(
  note: RoundingNote,
  getName: (id: string) => string,
): string | null {
  if (note === null) return null;

  const parts = note.split("|");
  // Guard — malformed note should never reach here in production
  if (parts.length !== 3) return null;

  const [ids, kind, rupeesLabel] = parts as [string, string, string];

  if (kind === "absorbed") {
    // Case A: "Ali absorbed Re. 1 rounding difference."
    const name = getName(ids);
    return `${name} absorbed ${rupeesLabel} rounding difference.`;
  }

  // Case B: one or more recipients
  const names = ids.split(",").map(getName);
  const rupeesLabelStr = rupeesLabel;

  if (names.length === 1) {
    // "Re. 1 rounding difference added to Sara's share (first in listed order)."
    return `${rupeesLabelStr} rounding difference added to ${names[0]}'s share (first in listed order).`;
  }

  // "Rs. 2 rounding difference distributed to Sara and Bilal (first in listed order)."
  const nameList = formatNameList(names);
  return `${rupeesLabelStr} rounding difference distributed to ${nameList} (first in listed order).`;
}

/** Joins names as "Sara", "Sara and Bilal", or "Sara, Bilal and Kamran". */
function formatNameList(names: string[]): string {
  if (names.length === 1) return names[0] ?? "";
  const last = names[names.length - 1];
  const rest = names.slice(0, -1);
  return `${rest.join(", ")} and ${last}`;
}
