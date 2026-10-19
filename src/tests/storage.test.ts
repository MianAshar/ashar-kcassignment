// Tests for storage.ts — covers S-8 persistence: load, save, clear, and the
// corrupted-data path. Uses a fake in-memory StorageBackend; no real browser.
import { describe, it, expect, beforeEach } from "vitest";
import { loadTrip, saveTrip, clearTrip } from "../logic/storage.js";
import type { StorageBackend } from "../logic/storage.js";
import type { TripData } from "../logic/types.js";

// ---------------------------------------------------------------------------
// Fake in-memory storage backend (replaces localStorage in tests)
// ---------------------------------------------------------------------------

function makeFakeStorage(initial?: Record<string, string>): StorageBackend {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
  };
}

// ---------------------------------------------------------------------------
// S-8 — loadTrip
// ---------------------------------------------------------------------------

describe("loadTrip", () => {
  it("S-8: returns 'empty' when storage has no data (first run)", () => {
    const storage = makeFakeStorage();
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "empty" });
  });

  it("S-8: returns valid TripData when storage contains correct JSON", () => {
    const trip: TripData = {
      participants: [{ id: "1", name: "Ali" }, { id: "2", name: "Sara" }],
      expenses: [
        {
          id: "e1",
          description: "Fuel",
          amount: 600,
          payerId: "1",
          sharerIds: ["1", "2"],
        },
      ],
    };
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": JSON.stringify(trip),
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: true, data: trip });
  });

  it("S-8: returns 'corrupt' when stored string is not valid JSON", () => {
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": "not-valid-json{{{",
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "corrupt" });
  });

  it("S-8: returns 'corrupt' when stored JSON is missing 'participants' array", () => {
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": JSON.stringify({ expenses: [] }),
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "corrupt" });
  });

  it("S-8: returns 'corrupt' when stored JSON is missing 'expenses' array", () => {
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": JSON.stringify({ participants: [] }),
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "corrupt" });
  });

  it("S-8: returns 'corrupt' when a participant is missing 'id'", () => {
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": JSON.stringify({
        participants: [{ name: "Ali" }], // no id
        expenses: [],
      }),
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "corrupt" });
  });

  it("S-8: returns 'corrupt' when an expense is missing 'sharerIds'", () => {
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": JSON.stringify({
        participants: [],
        expenses: [
          { id: "e1", description: "x", amount: 100, payerId: "1" }, // no sharerIds
        ],
      }),
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "corrupt" });
  });

  it("S-8: returns 'corrupt' when root value is null", () => {
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": "null",
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "corrupt" });
  });

  it("S-8: empty trip (no participants, no expenses) is valid", () => {
    const trip: TripData = { participants: [], expenses: [] };
    const storage = makeFakeStorage({
      "trip-expense-splitter-v1": JSON.stringify(trip),
    });
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: true, data: trip });
  });
});

// ---------------------------------------------------------------------------
// S-8 — saveTrip and round-trip
// ---------------------------------------------------------------------------

describe("saveTrip", () => {
  it("S-8: save then load returns the same data", () => {
    const storage = makeFakeStorage();
    const trip: TripData = {
      participants: [{ id: "1", name: "Ali" }],
      expenses: [],
    };
    saveTrip(storage, trip);
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: true, data: trip });
  });

  it("S-8: overwriting with new data is immediately visible on load", () => {
    const storage = makeFakeStorage();
    const trip1: TripData = { participants: [{ id: "1", name: "Ali" }], expenses: [] };
    const trip2: TripData = { participants: [{ id: "1", name: "Ali" }, { id: "2", name: "Sara" }], expenses: [] };
    saveTrip(storage, trip1);
    saveTrip(storage, trip2);
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: true, data: trip2 });
  });
});

// ---------------------------------------------------------------------------
// S-9 — clearTrip
// ---------------------------------------------------------------------------

describe("clearTrip", () => {
  it("S-9: after clear, load returns 'empty'", () => {
    const storage = makeFakeStorage();
    saveTrip(storage, { participants: [], expenses: [] });
    clearTrip(storage);
    const result = loadTrip(storage);
    expect(result).toEqual({ ok: false, reason: "empty" });
  });

  it("S-9: clearing an already-empty storage does not throw", () => {
    const storage = makeFakeStorage();
    expect(() => clearTrip(storage)).not.toThrow();
    expect(loadTrip(storage)).toEqual({ ok: false, reason: "empty" });
  });
});
