// Tests for rounding.ts — covers every acceptance criterion in S-12, plus the
// rounding note display strings.
import { describe, it, expect } from "vitest";
import { computeShares, resolveRoundingNote, formatRupees } from "../logic/rounding.js";

// Helper: resolve a rounding note using a fixed name map.
function resolve(
  note: string | null,
  map: Record<string, string>,
): string | null {
  return resolveRoundingNote(note, (id) => map[id] ?? id);
}

// ---------------------------------------------------------------------------
// S-12 Case A — payer is a sharer
// ---------------------------------------------------------------------------

describe("S-12 computeShares — Case A (payer is a sharer)", () => {
  it("S-12 Case A: Rs. 1000 / 3, payer Ali absorbs Re. 1", () => {
    const { shares, roundingNote } = computeShares(1000, "ali", ["ali", "sara", "bilal"]);
    expect(shares).toEqual([
      { participantId: "ali", amount: 334 },  // 1000 - 2×333 = 334
      { participantId: "sara", amount: 333 },
      { participantId: "bilal", amount: 333 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(1000);
    const note = resolve(roundingNote, { ali: "Ali", sara: "Sara", bilal: "Bilal" });
    expect(note).toBe("Ali absorbed Re. 1 rounding difference.");
  });

  it("S-12 Case A: Rs. 900 / 3 exact — no rounding note", () => {
    const { shares, roundingNote } = computeShares(900, "ali", ["ali", "sara", "bilal"]);
    expect(shares).toEqual([
      { participantId: "ali", amount: 300 },
      { participantId: "sara", amount: 300 },
      { participantId: "bilal", amount: 300 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(900);
    expect(roundingNote).toBeNull();
  });

  it("S-12 Case A: Rs. 1001 / 3, payer Ali absorbs Rs. 2", () => {
    const { shares, roundingNote } = computeShares(1001, "ali", ["ali", "sara", "bilal"]);
    expect(shares).toEqual([
      { participantId: "ali", amount: 335 },  // 1001 - 2×333 = 335
      { participantId: "sara", amount: 333 },
      { participantId: "bilal", amount: 333 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(1001);
    const note = resolve(roundingNote, { ali: "Ali" });
    expect(note).toBe("Ali absorbed Rs. 2 rounding difference.");
  });

  it("S-12 Case A with tip: Rs. 1100 / 3, payer Ali absorbs Rs. 2", () => {
    // Rs. 1000 + 10% tip = Rs. 1100; ⌊1100÷3⌋=366, leftover=2; Ali gets 368
    const { shares, roundingNote } = computeShares(1100, "ali", ["ali", "sara", "bilal"]);
    expect(shares).toEqual([
      { participantId: "ali", amount: 368 },
      { participantId: "sara", amount: 366 },
      { participantId: "bilal", amount: 366 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(1100);
    const note = resolve(roundingNote, { ali: "Ali" });
    expect(note).toBe("Ali absorbed Rs. 2 rounding difference.");
  });

  it("S-12 Case A: payer is last in listed order — still absorbs leftover", () => {
    // Sara last in list, leftover = 1
    const { shares } = computeShares(1000, "sara", ["ali", "bilal", "sara"]);
    const sara = shares.find((s) => s.participantId === "sara");
    expect(sara?.amount).toBe(334);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// S-12 Case B — payer is NOT a sharer
// ---------------------------------------------------------------------------

describe("S-12 computeShares — Case B (payer is not a sharer)", () => {
  it("S-12 Case B: Rs. 1000 / 3, leftover 1 → Sara gets Re. 1 extra", () => {
    const { shares, roundingNote } = computeShares(1000, "ali", ["sara", "bilal", "kamran"]);
    expect(shares).toEqual([
      { participantId: "sara", amount: 334 },
      { participantId: "bilal", amount: 333 },
      { participantId: "kamran", amount: 333 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(1000);
    const note = resolve(roundingNote, { sara: "Sara", bilal: "Bilal", kamran: "Kamran" });
    expect(note).toBe(
      "Re. 1 rounding difference added to Sara's share (first in listed order).",
    );
  });

  it("S-12 Case B: Rs. 1001 / 3, leftover 2 → Sara and Bilal each get +Re. 1", () => {
    const { shares, roundingNote } = computeShares(1001, "ali", ["sara", "bilal", "kamran"]);
    expect(shares).toEqual([
      { participantId: "sara", amount: 334 },
      { participantId: "bilal", amount: 334 },
      { participantId: "kamran", amount: 333 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(1001);
    const note = resolve(roundingNote, { sara: "Sara", bilal: "Bilal", kamran: "Kamran" });
    expect(note).toBe(
      "Rs. 2 rounding difference distributed to Sara and Bilal (first in listed order).",
    );
  });

  it("S-12 Case B: Rs. 1000 / 2 exact — no rounding note", () => {
    const { shares, roundingNote } = computeShares(1000, "ali", ["sara", "bilal"]);
    expect(shares).toEqual([
      { participantId: "sara", amount: 500 },
      { participantId: "bilal", amount: 500 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(1000);
    expect(roundingNote).toBeNull();
  });

  it("S-12 Case B very small: Rs. 2 / 3, Kamran gets Rs. 0", () => {
    // ⌊2÷3⌋=0, leftover=2 → Sara Rs.1, Bilal Rs.1, Kamran Rs.0
    const { shares, roundingNote } = computeShares(2, "ali", ["sara", "bilal", "kamran"]);
    expect(shares).toEqual([
      { participantId: "sara", amount: 1 },
      { participantId: "bilal", amount: 1 },
      { participantId: "kamran", amount: 0 },
    ]);
    expect(shares.reduce((s, x) => s + x.amount, 0)).toBe(2);
    const note = resolve(roundingNote, { sara: "Sara", bilal: "Bilal", kamran: "Kamran" });
    expect(note).toBe(
      "Rs. 2 rounding difference distributed to Sara and Bilal (first in listed order).",
    );
  });
});

// ---------------------------------------------------------------------------
// S-4 large number: no scientific notation
// ---------------------------------------------------------------------------

describe("S-4 large numbers", () => {
  it("S-4: Rs. 10,000,000 / 3 — all shares are whole rupees, no scientific notation", () => {
    const { shares } = computeShares(10_000_000, "ali", ["ali", "sara", "bilal"]);
    const total = shares.reduce((s, x) => s + x.amount, 0);
    expect(total).toBe(10_000_000);
    // No share should be represented in scientific notation
    for (const share of shares) {
      expect(share.amount.toString()).not.toMatch(/e/i);
    }
  });
});

// ---------------------------------------------------------------------------
// formatRupees — Re. vs Rs. convention
// ---------------------------------------------------------------------------

describe("formatRupees", () => {
  it("1 rupee → 'Re. 1'", () => {
    expect(formatRupees(1)).toBe("Re. 1");
  });

  it("2 rupees → 'Rs. 2'", () => {
    expect(formatRupees(2)).toBe("Rs. 2");
  });

  it("10 rupees → 'Rs. 10'", () => {
    expect(formatRupees(10)).toBe("Rs. 10");
  });
});
