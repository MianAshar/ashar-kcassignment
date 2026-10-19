// Tip calculation: converts a TipInput into a whole-rupee tip amount and
// adds it to the base expense to produce the total used for share splitting.

import type { TipInput } from "./types.js";

/**
 * Implements S-5.
 * Computes the whole-rupee tip amount from a TipInput and a base amount.
 *
 * For percentage tips, the raw rupee value (base × percent / 100) is rounded
 * to the nearest whole rupee with halves rounding up (standard Rs. convention).
 * For flat tips, the caller has already validated the value is a whole rupee,
 * so no rounding is needed.
 *
 * @param base  The base expense amount in whole rupees.
 * @param tip   The tip input from the form.
 * @returns     The tip in whole rupees (always ≥ 0).
 */
export function computeTipAmount(base: number, tip: TipInput): number {
  if (tip.mode === "flat") {
    return tip.value;
  }

  // Percentage mode: multiply then round. Math.round uses "round half away
  // from zero", which for positive values is "round half up" — exactly what
  // the spec requires (S-5: halves round up).
  return Math.round((base * tip.value) / 100);
}

/**
 * Implements S-5.
 * Returns the tip-inclusive total for an expense.
 *
 * @param base  Base amount in whole rupees.
 * @param tip   Optional tip input. When absent/undefined, total equals base.
 * @returns     Total in whole rupees.
 */
export function computeTotal(base: number, tip?: TipInput): number {
  if (!tip) return base;
  return base + computeTipAmount(base, tip);
}
