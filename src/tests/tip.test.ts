// Tests for tip.ts — covers S-5 tip computation and percentage rounding.
import { describe, it, expect } from "vitest";
import { computeTipAmount, computeTotal } from "../logic/tip.js";

describe("computeTipAmount", () => {
  it("S-5: flat tip of Rs. 100 → Rs. 100", () => {
    expect(computeTipAmount(1000, { mode: "flat", value: 100 })).toBe(100);
  });

  it("S-5: 10% of Rs. 1000 → Rs. 100 (exact)", () => {
    expect(computeTipAmount(1000, { mode: "percent", value: 10 })).toBe(100);
  });

  it("S-5: 10% of Rs. 1235 → Rs. 123.5, rounds UP to Rs. 124 (half rounds up)", () => {
    expect(computeTipAmount(1235, { mode: "percent", value: 10 })).toBe(124);
  });

  it("S-5: 10% of Rs. 1234 → Rs. 123.4, rounds DOWN to Rs. 123", () => {
    expect(computeTipAmount(1234, { mode: "percent", value: 10 })).toBe(123);
  });

  it("S-5: 0% tip → Rs. 0", () => {
    expect(computeTipAmount(500, { mode: "percent", value: 0 })).toBe(0);
  });

  it("S-5: 100% tip of Rs. 500 → Rs. 500", () => {
    expect(computeTipAmount(500, { mode: "percent", value: 100 })).toBe(500);
  });
});

describe("computeTotal", () => {
  it("S-5: base Rs. 1000 + 10% tip → Rs. 1100", () => {
    expect(computeTotal(1000, { mode: "percent", value: 10 })).toBe(1100);
  });

  it("S-5: base Rs. 1000 + flat Rs. 100 → Rs. 1100", () => {
    expect(computeTotal(1000, { mode: "flat", value: 100 })).toBe(1100);
  });

  it("S-5: Rs. 1235 + 10% → tip Rs. 124 → total Rs. 1359", () => {
    expect(computeTotal(1235, { mode: "percent", value: 10 })).toBe(1359);
  });

  it("S-5: Rs. 1234 + 10% → tip Rs. 123 → total Rs. 1357", () => {
    expect(computeTotal(1234, { mode: "percent", value: 10 })).toBe(1357);
  });

  it("S-5: no tip → total equals base", () => {
    expect(computeTotal(800)).toBe(800);
  });

  it("S-5: Rs. 500 + 100% tip → Rs. 1000", () => {
    expect(computeTotal(500, { mode: "percent", value: 100 })).toBe(1000);
  });

  it("S-5: Rs. 500 + 0% tip → Rs. 500", () => {
    expect(computeTotal(500, { mode: "percent", value: 0 })).toBe(500);
  });

  it("S-5: Rs. 600 + 10% tip → Rs. 660 (sharers don't matter for total)", () => {
    expect(computeTotal(600, { mode: "percent", value: 10 })).toBe(660);
  });
});
