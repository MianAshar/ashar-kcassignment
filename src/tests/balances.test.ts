// Tests for balances.ts — covers S-10 and S-11 net balance computation,
// including the full Faisalabad scenario.
import { describe, it, expect } from "vitest";
import { computeNetBalances, computeExpenseResults } from "../logic/balances.js";
import type { Participant, Expense } from "../logic/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function participant(id: string, name: string): Participant {
  return { id, name };
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
// S-10 simple two-person case
// ---------------------------------------------------------------------------

describe("computeNetBalances — simple cases", () => {
  it("S-10: Ali paid Rs. 600 for Fuel shared equally by Ali and Sara", () => {
    const participants = [participant("ali", "Ali"), participant("sara", "Sara")];
    const expenses = [expense("fuel", 600, "ali", ["ali", "sara"])];
    const balances = computeNetBalances(participants, expenses);

    const ali = balances.find((b) => b.participantId === "ali");
    const sara = balances.find((b) => b.participantId === "sara");

    // Ali paid 600, owes 300 → net +300
    expect(ali?.net).toBe(300);
    // Sara paid 0, owes 300 → net −300
    expect(sara?.net).toBe(-300);
  });

  it("S-10: payer not sharing — Ali paid Rs. 300 for Snacks shared by Sara and Bilal", () => {
    const participants = [
      participant("ali", "Ali"),
      participant("sara", "Sara"),
      participant("bilal", "Bilal"),
    ];
    const expenses = [expense("snacks", 300, "ali", ["sara", "bilal"])];
    const balances = computeNetBalances(participants, expenses);

    const ali = balances.find((b) => b.participantId === "ali");
    const sara = balances.find((b) => b.participantId === "sara");
    const bilal = balances.find((b) => b.participantId === "bilal");

    expect(ali?.net).toBe(300);   // paid 300, owes 0
    expect(sara?.net).toBe(-150); // paid 0, owes 150
    expect(bilal?.net).toBe(-150);
  });

  it("S-10: participant with no expenses → net Rs. 0", () => {
    const participants = [
      participant("ali", "Ali"),
      participant("sara", "Sara"),
      participant("bilal", "Bilal"),
    ];
    const expenses = [expense("fuel", 600, "ali", ["ali", "sara"])];
    const balances = computeNetBalances(participants, expenses);

    const bilal = balances.find((b) => b.participantId === "bilal");
    expect(bilal?.net).toBe(0);
  });

  it("S-10: no expenses → all balances are zero", () => {
    const participants = [participant("ali", "Ali"), participant("sara", "Sara")];
    const balances = computeNetBalances(participants, []);
    for (const b of balances) {
      expect(b.net).toBe(0);
    }
  });

  it("S-10: all net balances sum to zero (money conservation invariant)", () => {
    const participants = [
      participant("ali", "Ali"),
      participant("sara", "Sara"),
      participant("bilal", "Bilal"),
    ];
    const expenses = [
      expense("fuel", 900, "ali", ["ali", "sara"]),
      expense("hotel", 900, "sara", ["ali", "sara", "bilal"]),
    ];
    const balances = computeNetBalances(participants, expenses);
    const total = balances.reduce((s, b) => s + b.net, 0);
    expect(total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// S-10 Faisalabad scenario (canonical test case from the spec)
// ---------------------------------------------------------------------------

describe("S-10 Faisalabad scenario", () => {
  // "Fuel to Faisalabad" Rs. 1500, paid by Ali, shared by Ali and Usman
  // "Fuel onwards" Rs. 2000, paid by Usman, shared by Ali, Usman, Sara, Bilal
  // "Hotel" Rs. 3001, paid by Sara, shared by Ali, Usman, Sara, Bilal
  //
  // Expected net balances:
  //   Ali:   paid 1500, owed 750+500+750 = 2000 → net −500
  //   Usman: paid 2000, owed 750+500+750 = 2000 → net 0
  //   Sara:  paid 3001, owed 500+751 = 1251     → net +1750
  //   Bilal: paid 0,    owed 500+750 = 1250      → net −1250

  const participants = [
    participant("ali", "Ali"),
    participant("usman", "Usman"),
    participant("sara", "Sara"),
    participant("bilal", "Bilal"),
  ];

  const expenses: Expense[] = [
    expense("fuel1", 1500, "ali", ["ali", "usman"]),
    expense("fuel2", 2000, "usman", ["ali", "usman", "sara", "bilal"]),
    expense("hotel", 3001, "sara", ["ali", "usman", "sara", "bilal"]),
  ];

  it("S-10 Faisalabad: Hotel shares — Sara (payer) absorbs Re. 1 leftover", () => {
    const results = computeExpenseResults(expenses);
    const hotelResult = results.find((r) => r.expenseId === "hotel");
    expect(hotelResult?.total).toBe(3001);
    // Case A: Sara is payer and sharer. ⌊3001÷4⌋=750, Sara gets 3001−3×750=751
    const saraShare = hotelResult?.shares.find((s) => s.participantId === "sara");
    expect(saraShare?.amount).toBe(751);
    const others = hotelResult?.shares.filter((s) => s.participantId !== "sara");
    for (const s of others ?? []) {
      expect(s.amount).toBe(750);
    }
  });

  it("S-10 Faisalabad: net balances are correct", () => {
    const balances = computeNetBalances(participants, expenses);

    const ali = balances.find((b) => b.participantId === "ali");
    const usman = balances.find((b) => b.participantId === "usman");
    const sara = balances.find((b) => b.participantId === "sara");
    const bilal = balances.find((b) => b.participantId === "bilal");

    expect(ali?.net).toBe(-500);
    expect(usman?.net).toBe(0);
    expect(sara?.net).toBe(1750);
    expect(bilal?.net).toBe(-1250);
  });

  it("S-10 invariant: all net balances sum to exactly Rs. 0", () => {
    const balances = computeNetBalances(participants, expenses);
    const total = balances.reduce((s, b) => s + b.net, 0);
    expect(total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// S-11 consistency: expense results feed the breakdown
// ---------------------------------------------------------------------------

describe("computeExpenseResults — S-11 consistency", () => {
  it("S-11: Ali paid Rs. 900 for Hotel shared by Ali, Sara, Bilal — each Rs. 300", () => {
    const expenses = [expense("hotel", 900, "ali", ["ali", "sara", "bilal"])];
    const results = computeExpenseResults(expenses);
    expect(results[0]?.total).toBe(900);
    const shares = results[0]?.shares;
    expect(shares?.every((s) => s.amount === 300)).toBe(true);
    expect(results[0]?.roundingNote).toBeNull();
  });

  it("S-11: payer not a sharer — Ali paid Rs. 300 for Snacks, Sara and Bilal share", () => {
    const expenses = [expense("snacks", 300, "ali", ["sara", "bilal"])];
    const results = computeExpenseResults(expenses);
    expect(results[0]?.total).toBe(300);
    // Ali's share does not appear (he is not a sharer)
    const aliFound = results[0]?.shares.find((s) => s.participantId === "ali");
    expect(aliFound).toBeUndefined();
  });
});
