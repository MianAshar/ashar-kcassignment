// Tests for settlement.ts — covers S-10 acceptance criteria including the
// Faisalabad scenario and the mathematical invariant.
import { describe, it, expect } from "vitest";
import { computeSettlement } from "../logic/settlement.js";
import { computeNetBalances } from "../logic/balances.js";
import type { Participant, Expense, NetBalance } from "../logic/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nb(id: string, net: number): NetBalance {
  return { participantId: id, net };
}

function participant(id: string): Participant {
  return { id, name: id };
}

function expense(
  id: string,
  amount: number,
  payerId: string,
  sharerIds: string[],
): Expense {
  return { id, description: id, amount, payerId, sharerIds };
}

// ---------------------------------------------------------------------------
// S-10 — settlement from net balances
// ---------------------------------------------------------------------------

describe("computeSettlement", () => {
  it("S-10: simple two-person case — Sara pays Ali Rs. 300", () => {
    const transfers = computeSettlement([nb("ali", 300), nb("sara", -300)]);
    expect(transfers).toEqual([{ fromId: "sara", toId: "ali", amount: 300 }]);
  });

  it("S-10: all balances zero → no transfers", () => {
    const transfers = computeSettlement([nb("ali", 0), nb("sara", 0)]);
    expect(transfers).toHaveLength(0);
  });

  it("S-10: only one participant → no transfers", () => {
    const transfers = computeSettlement([nb("ali", 0)]);
    expect(transfers).toHaveLength(0);
  });

  it("S-10: zero-balance participant is excluded from transfers", () => {
    // Usman net = 0, should not appear in any transfer
    const transfers = computeSettlement([
      nb("ali", -500),
      nb("usman", 0),
      nb("sara", 500),
    ]);
    expect(transfers.every((t) => t.fromId !== "usman" && t.toId !== "usman")).toBe(true);
  });

  it("S-10 Faisalabad: Bilal pays Sara Rs. 1250, Ali pays Sara Rs. 500", () => {
    // Net: Ali −500, Usman 0, Sara +1750, Bilal −1250
    const transfers = computeSettlement([
      nb("ali", -500),
      nb("usman", 0),
      nb("sara", 1750),
      nb("bilal", -1250),
    ]);

    // Greedy: largest debtor first (Bilal 1250) vs largest creditor (Sara 1750)
    // → Bilal pays Sara 1250; Sara remaining +500
    // → Ali pays Sara 500
    expect(transfers).toHaveLength(2);
    expect(transfers[0]).toEqual({ fromId: "bilal", toId: "sara", amount: 1250 });
    expect(transfers[1]).toEqual({ fromId: "ali", toId: "sara", amount: 500 });
  });

  it("S-10: three-way split — produces at most N-1 transfers", () => {
    // Three participants, two debtors, one creditor
    const transfers = computeSettlement([
      nb("ali", 1000),
      nb("sara", -600),
      nb("bilal", -400),
    ]);
    // At most 2 transfers (N-1 = 3-1)
    expect(transfers.length).toBeLessThanOrEqual(2);
    // All balances should be zeroed by applying the transfers
    expect(verifyZeroBalance(transfers, [nb("ali", 1000), nb("sara", -600), nb("bilal", -400)])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// S-10 mathematical invariant
// ---------------------------------------------------------------------------

describe("S-10 mathematical invariant: applying all transfers zeroes every balance", () => {
  function runInvariant(participants: Participant[], expenses: Expense[]): boolean {
    const balances = computeNetBalances(participants, expenses);
    const transfers = computeSettlement(balances);
    return verifyZeroBalance(transfers, balances);
  }

  it("S-10 invariant: simple two-person case", () => {
    const ps = [participant("ali"), participant("sara")];
    const es = [expense("fuel", 600, "ali", ["ali", "sara"])];
    expect(runInvariant(ps, es)).toBe(true);
  });

  it("S-10 invariant: Faisalabad scenario", () => {
    const ps = [
      participant("ali"),
      participant("usman"),
      participant("sara"),
      participant("bilal"),
    ];
    const es = [
      expense("fuel1", 1500, "ali", ["ali", "usman"]),
      expense("fuel2", 2000, "usman", ["ali", "usman", "sara", "bilal"]),
      expense("hotel", 3001, "sara", ["ali", "usman", "sara", "bilal"]),
    ];
    expect(runInvariant(ps, es)).toBe(true);
  });

  it("S-10 invariant: multiple creditors and debtors", () => {
    const ps = [
      participant("a"),
      participant("b"),
      participant("c"),
      participant("d"),
    ];
    const es = [
      expense("e1", 400, "a", ["a", "b", "c", "d"]),
      expense("e2", 300, "b", ["b", "c"]),
      expense("e3", 200, "c", ["a", "c", "d"]),
    ];
    expect(runInvariant(ps, es)).toBe(true);
  });

  it("S-10 invariant: no expenses → transfers empty, all zero", () => {
    const ps = [participant("a"), participant("b")];
    expect(runInvariant(ps, [])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Helper: apply transfers to balances and check all reach zero
// ---------------------------------------------------------------------------

function verifyZeroBalance(transfers: { fromId: string; toId: string; amount: number }[], balances: NetBalance[]): boolean {
  const net = new Map<string, number>(balances.map((b) => [b.participantId, b.net]));
  for (const t of transfers) {
    // fromId is a debtor (negative net): paying reduces their debt → net goes up
    // toId is a creditor (positive net): receiving reduces their credit → net goes down
    net.set(t.fromId, (net.get(t.fromId) ?? 0) + t.amount);
    net.set(t.toId, (net.get(t.toId) ?? 0) - t.amount);
  }
  return [...net.values()].every((v) => v === 0);
}
