// Tests for validation.ts — covers S-1, S-2, S-4, S-5 acceptance criteria.
import { describe, it, expect } from "vitest";
import {
  validateParticipantName,
  validateDescription,
  validateAmount,
  validateSharers,
  validatePayer,
  validateTip,
  validateTotal,
} from "../logic/validation.js";
import type { Participant } from "../logic/types.js";

// ---------------------------------------------------------------------------
// S-1 / S-2 — participant name validation
// ---------------------------------------------------------------------------

describe("validateParticipantName", () => {
  const roster: Participant[] = [
    { id: "1", name: "Ali" },
    { id: "2", name: "Sara" },
  ];

  it("S-1: accepts a valid new name", () => {
    expect(validateParticipantName("Bilal", roster)).toBeNull();
  });

  it("S-1: rejects an empty name", () => {
    expect(validateParticipantName("", roster)).toBe("Name cannot be empty");
  });

  it("S-1: rejects a whitespace-only name", () => {
    expect(validateParticipantName("   ", roster)).toBe("Name cannot be empty");
  });

  it("S-1: rejects an exact duplicate (same case)", () => {
    expect(validateParticipantName("Ali", roster)).toBe(
      "A participant named Ali already exists",
    );
  });

  it("S-1: rejects a duplicate (different case)", () => {
    expect(validateParticipantName("ali", roster)).toBe(
      "A participant named Ali already exists",
    );
  });

  it("S-2: rename to same name (exact) is accepted", () => {
    expect(validateParticipantName("Ali", roster, "1")).toBeNull();
  });

  it("S-2: rename to same name (different case) is accepted", () => {
    expect(validateParticipantName("ali", roster, "1")).toBeNull();
  });

  it("S-2: rename to an existing OTHER participant name is rejected", () => {
    expect(validateParticipantName("Sara", roster, "1")).toBe(
      "A participant named Sara already exists",
    );
  });

  it("S-2: rename to existing name (different case) is rejected", () => {
    expect(validateParticipantName("sara", roster, "1")).toBe(
      "A participant named Sara already exists",
    );
  });
});

// ---------------------------------------------------------------------------
// S-4 — expense field validation
// ---------------------------------------------------------------------------

describe("validateDescription", () => {
  it("S-4: rejects empty description", () => {
    expect(validateDescription("")).toBe("Description cannot be empty");
  });

  it("S-4: rejects whitespace-only description", () => {
    expect(validateDescription("   ")).toBe("Description cannot be empty");
  });

  it("S-4: accepts a non-empty description", () => {
    expect(validateDescription("Fuel")).toBeNull();
  });
});

describe("validateAmount", () => {
  it("S-4: rejects zero", () => {
    expect(validateAmount(0)).toBe("Amount must be greater than zero");
  });

  it("S-4: rejects negative amount", () => {
    expect(validateAmount(-500)).toBe("Amount must be greater than zero");
  });

  it("S-4: rejects decimal amount (e.g. 999.50)", () => {
    expect(validateAmount(999.5)).toBe("Amount must be a whole number of rupees");
  });

  it("S-4: accepts minimum valid amount (Rs. 1)", () => {
    expect(validateAmount(1)).toBeNull();
  });

  it("S-4: accepts Rs. 10,000,000 (boundary — exactly at cap)", () => {
    expect(validateAmount(10_000_000)).toBeNull();
  });

  it("S-4: rejects Rs. 10,000,001 (one above cap)", () => {
    expect(validateAmount(10_000_001)).toBe("Amount cannot exceed Rs. 10,000,000");
  });
});

describe("validateSharers", () => {
  it("S-4: rejects empty sharer list", () => {
    expect(validateSharers([])).toBe(
      "At least one participant must share this expense",
    );
  });

  it("S-4: accepts at least one sharer", () => {
    expect(validateSharers(["1"])).toBeNull();
  });
});

describe("validatePayer", () => {
  it("S-4: rejects null payer", () => {
    expect(validatePayer(null)).toBe("A payer must be selected");
  });

  it("S-4: rejects undefined payer", () => {
    expect(validatePayer(undefined)).toBe("A payer must be selected");
  });

  it("S-4: rejects empty string payer", () => {
    expect(validatePayer("")).toBe("A payer must be selected");
  });

  it("S-4: accepts a valid payer id", () => {
    expect(validatePayer("abc-123")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// S-5 — tip validation
// ---------------------------------------------------------------------------

describe("validateTip", () => {
  it("S-5: rejects negative flat tip", () => {
    expect(validateTip({ mode: "flat", value: -50 })).toBe(
      "Tip cannot be negative",
    );
  });

  it("S-5: rejects negative percentage tip", () => {
    expect(validateTip({ mode: "percent", value: -10 })).toBe(
      "Tip cannot be negative",
    );
  });

  it("S-5: rejects percentage tip above 100", () => {
    expect(validateTip({ mode: "percent", value: 101 })).toBe(
      "Tip percentage cannot exceed 100%",
    );
  });

  it("S-5: rejects flat tip with decimal (e.g. 99.50)", () => {
    expect(validateTip({ mode: "flat", value: 99.5 })).toBe(
      "Tip must be a whole number of rupees",
    );
  });

  it("S-5: accepts tip 0% (boundary)", () => {
    expect(validateTip({ mode: "percent", value: 0 })).toBeNull();
  });

  it("S-5: accepts tip exactly 100% (boundary)", () => {
    expect(validateTip({ mode: "percent", value: 100 })).toBeNull();
  });

  it("S-5: accepts valid flat tip", () => {
    expect(validateTip({ mode: "flat", value: 100 })).toBeNull();
  });
});

describe("validateTotal", () => {
  it("S-5: rejects total above Rs. 10,000,000", () => {
    expect(validateTotal(10_100_000)).toBe(
      "Total including tip cannot exceed Rs. 10,000,000",
    );
  });

  it("S-5: accepts total exactly Rs. 10,000,000", () => {
    expect(validateTotal(10_000_000)).toBeNull();
  });

  it("S-5: base Rs. 9,500,000 + flat tip Rs. 600,000 → rejected", () => {
    // Total = 10,100,000
    expect(validateTotal(9_500_000 + 600_000)).toBe(
      "Total including tip cannot exceed Rs. 10,000,000",
    );
  });

  it("S-5: base Rs. 9,500,000 + flat tip Rs. 500,000 → accepted", () => {
    // Total = 10,000,000 (exactly at cap)
    expect(validateTotal(9_500_000 + 500_000)).toBeNull();
  });
});
