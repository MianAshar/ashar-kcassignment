// Trip data persistence. Takes a StorageBackend parameter so the real
// localStorage and a fake in-memory store can both be used — making the
// corrupted-data path fully testable without a browser (S-8).

import type { TripData } from "./types.js";

const STORAGE_KEY = "trip-expense-splitter-v1";

/** Minimal interface for a key/value string store. Matches localStorage exactly. */
export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Implements S-8.
 * Result of a load attempt — either the recovered trip data or an indication
 * that the data was absent or corrupt.
 */
export type LoadResult =
  | { ok: true; data: TripData }
  | { ok: false; reason: "empty" }
  | { ok: false; reason: "corrupt" };

/**
 * Implements S-8.
 * Loads trip data from the storage backend.
 *
 * Three outcomes:
 *   - ok: true  — valid data was found and parsed.
 *   - ok: false, reason: "empty"   — nothing stored yet (first run).
 *   - ok: false, reason: "corrupt" — data exists but cannot be parsed;
 *     the UI should show "Your saved trip data could not be loaded.
 *     Starting a new trip." and start empty.
 *
 * @param storage  The storage backend (pass localStorage in production,
 *                 a fake object in tests).
 * @returns        LoadResult discriminated union.
 */
export function loadTrip(storage: StorageBackend): LoadResult {
  const raw = storage.getItem(STORAGE_KEY);

  if (raw === null) {
    return { ok: false, reason: "empty" };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    // Basic structural validation — ensures we have the shape we expect
    // before trusting the data downstream. Any missing or wrong-typed
    // field counts as corrupt.
    if (!isTripData(parsed)) {
      return { ok: false, reason: "corrupt" };
    }

    return { ok: true, data: parsed };
  } catch {
    // JSON.parse threw — the stored string is not valid JSON.
    return { ok: false, reason: "corrupt" };
  }
}

/**
 * Implements S-8.
 * Saves the current trip to the storage backend immediately (no debounce).
 * Called after every mutation so no manual "save" action is needed.
 *
 * @param storage  The storage backend.
 * @param data     The current trip state to persist.
 */
export function saveTrip(storage: StorageBackend, data: TripData): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Implements S-9.
 * Removes all trip data from the storage backend.
 *
 * @param storage  The storage backend.
 */
export function clearTrip(storage: StorageBackend): void {
  storage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Structural type guard
// ---------------------------------------------------------------------------

/**
 * Returns true when the parsed JSON value has the shape of a valid TripData.
 * We check just enough to prevent crashes — business-rule validation (valid
 * amounts etc.) is the caller's responsibility.
 */
function isTripData(value: unknown): value is TripData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  if (!Array.isArray(v["participants"])) return false;
  if (!Array.isArray(v["expenses"])) return false;

  for (const p of v["participants"] as unknown[]) {
    if (typeof p !== "object" || p === null) return false;
    const pp = p as Record<string, unknown>;
    if (typeof pp["id"] !== "string") return false;
    if (typeof pp["name"] !== "string") return false;
  }

  for (const e of v["expenses"] as unknown[]) {
    if (typeof e !== "object" || e === null) return false;
    const ee = e as Record<string, unknown>;
    if (typeof ee["id"] !== "string") return false;
    if (typeof ee["description"] !== "string") return false;
    if (typeof ee["amount"] !== "number") return false;
    if (typeof ee["payerId"] !== "string") return false;
    if (!Array.isArray(ee["sharerIds"])) return false;
  }

  return true;
}
