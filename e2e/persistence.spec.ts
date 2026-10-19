// E2E tests for browser persistence (S-8) and new trip (S-9).
import { test, expect } from "@playwright/test";
import { freshPage, addParticipant, addExpense } from "./helpers.js";

const STORAGE_KEY = "trip-expense-splitter-v1";

test.describe("S-8 — Persist trip data in the browser", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
  });

  test("S-8.1: data survives tab close — open new page in same context", async ({
    page,
    context,
  }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    // Open a new page in the same browser context (shares localStorage)
    const page2 = await context.newPage();
    await page2.goto("/");

    await expect(page2.locator(".participant-list")).toContainText("Ali");
    await expect(page2.locator(".participant-list")).toContainText("Sara");
    await expect(page2.locator(".expense-list")).toContainText("Fuel");

    await page2.close();
  });

  test("S-8.2: auto-save — add expense, reload without explicit save, data is there", async ({
    page,
  }) => {
    await addParticipant(page, "Ali");
    await addExpense(page, {
      description: "Snacks",
      amount: "300",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });

    // Reload without any explicit save action
    await page.reload();

    await expect(page.locator(".participant-list")).toContainText("Ali");
    await expect(page.locator(".expense-list")).toContainText("Snacks");
  });

  test("S-8.3: first run shows no error banner", async ({ page }) => {
    // freshPage already ensures clean state
    await expect(page.locator("#storage-error-banner")).toHaveCount(0);
  });

  test("S-8.4: corrupt storage shows banner and starts empty", async ({ page }) => {
    // Inject corrupt JSON into localStorage
    await page.evaluate((key) => {
      localStorage.setItem(key, "{broken");
    }, STORAGE_KEY);
    await page.reload();

    await expect(page.locator("#storage-error-banner")).toContainText(
      "Your saved trip data could not be loaded. Starting a new trip.",
    );
    // App should start empty — no participants
    await expect(page.locator(".participant-list")).not.toContainText("Ali");
  });
});

test.describe("S-9 — Start a new trip", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
  });

  test("S-9.1: confirm new trip clears all data and localStorage key", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page.click("#btn-new-trip");
    await page.click("#btn-confirm-new-trip");

    // Lists should be empty
    await expect(page.locator(".participant-list")).toContainText("No participants yet");
    await expect(page.locator("#section-expenses")).not.toContainText("Fuel");

    // localStorage key should be gone
    const keyExists = await page.evaluate(
      (key) => localStorage.getItem(key) !== null,
      STORAGE_KEY,
    );
    expect(keyExists).toBe(false);
  });

  test("S-9.2: cancel new trip — data unchanged", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });

    await page.click("#btn-new-trip");
    await page.click("#btn-cancel-new-trip");

    await expect(page.locator(".participant-list")).toContainText("Ali");
    await expect(page.locator(".expense-list")).toContainText("Fuel");
  });

  test("S-9.3: new trip on empty state — no error", async ({ page }) => {
    // Already empty from freshPage
    await page.click("#btn-new-trip");
    await page.click("#btn-confirm-new-trip");

    await expect(page.locator("#storage-error-banner")).toHaveCount(0);
    await expect(page.locator(".participant-list")).toContainText("No participants yet");
  });
});
