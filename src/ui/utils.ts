// Shared UI utilities: HTML escaping, money formatting, ID generation.

/**
 * Escapes a string for safe insertion as HTML text content.
 * Prevents XSS from user-entered names or descriptions.
 */
export function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Formats a whole-rupee amount as "Rs. 1,500".
 * Uses non-breaking space after "Rs." to prevent awkward line breaks.
 */
export function formatRs(amount: number): string {
  return `Rs.\u00a0${amount.toLocaleString("en-US")}`;
}

/**
 * Formats a signed net balance: +Rs. 300, −Rs. 500, or Rs. 0.
 * Used in the per-person breakdown summary.
 */
export function formatNet(net: number): string {
  if (net > 0) return `+${formatRs(net)}`;
  if (net < 0) return `\u2212${formatRs(-net)}`; // − (minus sign, not hyphen)
  return formatRs(0);
}

/** Returns a stable UUID for new participants and expenses. */
export function newId(): string {
  return crypto.randomUUID();
}
