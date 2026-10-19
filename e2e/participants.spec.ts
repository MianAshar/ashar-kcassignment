// E2E tests for participant management: S-1 (Add), S-2 (Rename), S-3 (Remove).
import { test, expect } from "@playwright/test";
import {
  freshPage,
  addParticipant,
  addExpense,
  startRenameParticipant,
  confirmRename,
  removeParticipant,
} from "./helpers.js";

test.describe("S-1 — Add a participant", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
  });

  test("S-1.1: add to empty roster", async ({ page }) => {
    await addParticipant(page, "Ali");
    await expect(page.locator(".participant-list")).toContainText("Ali");
  });

  test("S-1.2: add Ali then Sara — both appear", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await expect(page.locator(".participant-list")).toContainText("Ali");
    await expect(page.locator(".participant-list")).toContainText("Sara");
  });

  test("S-1.3: empty name shows error", async ({ page }) => {
    await page.fill("#new-participant-name", "");
    await page.click("#btn-add-participant");
    await expect(page.locator(".field-error-msg")).toContainText("Name cannot be empty");
  });

  test("S-1.4: whitespace-only name shows error", async ({ page }) => {
    await page.fill("#new-participant-name", "   ");
    await page.click("#btn-add-participant");
    await expect(page.locator(".field-error-msg")).toContainText("Name cannot be empty");
  });

  test("S-1.5: duplicate name (case-insensitive) shows error", async ({ page }) => {
    await addParticipant(page, "Ali");
    await page.fill("#new-participant-name", "ali");
    await page.click("#btn-add-participant");
    await expect(page.locator(".field-error-msg")).toContainText(
      "A participant named Ali already exists",
    );
  });

  test("S-1.6: after duplicate error, add Bilal succeeds and error clears", async ({ page }) => {
    await addParticipant(page, "Ali");
    await page.fill("#new-participant-name", "ali");
    await page.click("#btn-add-participant");
    await expect(page.locator(".field-error-msg")).toBeVisible();

    await addParticipant(page, "Bilal");
    await expect(page.locator(".participant-list")).toContainText("Bilal");
    await expect(page.locator(".field-error-msg")).toHaveCount(0);
  });
});

test.describe("S-2 — Rename a participant", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
  });

  test("S-2.1: rename Ali to Ali Khan propagates to expense", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await startRenameParticipant(page, "Ali");
    await confirmRename(page, "Ali Khan");

    await expect(page.locator(".participant-list")).toContainText("Ali Khan");

    // Open the expense edit form to verify payer updated
    await page
      .locator(".expense-item")
      .filter({ hasText: "Fuel" })
      .locator("[data-action='edit-expense']")
      .click();
    await expect(page.locator("#ef-payer")).toContainText("Ali Khan");
    await page.click("#btn-cancel-expense");
  });

  test("S-2.2: empty rename shows error", async ({ page }) => {
    await addParticipant(page, "Ali");
    await startRenameParticipant(page, "Ali");
    await page.fill("#rename-input", "");
    await page.click("[data-action='confirm-rename']");
    await expect(page.locator(".inline-error")).toContainText("Name cannot be empty");
  });

  test("S-2.3: rename Ali to Sara (existing name) shows error", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await startRenameParticipant(page, "Ali");
    await page.fill("#rename-input", "Sara");
    await page.click("[data-action='confirm-rename']");
    await expect(page.locator(".inline-error")).toContainText(
      "A participant named Sara already exists",
    );
  });

  test("S-2.4: rename Ali to Ali (same, exact) is accepted", async ({ page }) => {
    await addParticipant(page, "Ali");
    await startRenameParticipant(page, "Ali");
    await confirmRename(page, "Ali");
    await expect(page.locator(".inline-error")).toHaveCount(0);
    await expect(page.locator(".participant-list")).toContainText("Ali");
  });

  test("S-2.5: rename Ali to ali (different case) is accepted and updates", async ({ page }) => {
    await addParticipant(page, "Ali");
    await startRenameParticipant(page, "Ali");
    await confirmRename(page, "ali");
    await expect(page.locator(".inline-error")).toHaveCount(0);
    await expect(page.locator(".participant-list")).toContainText("ali");
  });

  test("S-2.6: after error, rename to Kamran succeeds and error clears", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await startRenameParticipant(page, "Ali");
    await page.fill("#rename-input", "Sara");
    await page.click("[data-action='confirm-rename']");
    await expect(page.locator(".inline-error")).toBeVisible();

    await page.fill("#rename-input", "Kamran");
    await page.click("[data-action='confirm-rename']");
    await expect(page.locator(".participant-list")).toContainText("Kamran");
    await expect(page.locator(".inline-error")).toHaveCount(0);
  });
});

test.describe("S-3 — Remove a participant", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
  });

  test("S-3.1: remove Ali (not on any expense) succeeds", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await removeParticipant(page, "Ali");
    await expect(page.locator(".participant-list")).not.toContainText("Ali");
  });

  test("S-3.2: remove Ali who is sharer on Fuel is blocked", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara"],
    });
    await removeParticipant(page, "Ali");
    await expect(page.locator("#section-participants")).toContainText(
      "Cannot remove Ali: they appear on",
    );
    await expect(page.locator("#section-participants")).toContainText("Fuel");
    await expect(page.locator("#section-participants")).toContainText(
      "Update that expense first.",
    );
  });

  test("S-3.3: remove Ali who is payer-only on Snacks is blocked", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Snacks",
      amount: "300",
      payerName: "Ali",
      sharerNames: ["Sara"],
    });
    await removeParticipant(page, "Ali");
    await expect(page.locator("#section-participants")).toContainText(
      "Cannot remove Ali: they appear on",
    );
    await expect(page.locator("#section-participants")).toContainText("Snacks");
  });

  test("S-3.4: Ali on Fuel AND Hotel — error lists both", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "900",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara"],
    });
    await removeParticipant(page, "Ali");
    await expect(page.locator("#section-participants")).toContainText("Fuel");
    await expect(page.locator("#section-participants")).toContainText("Hotel");
    await expect(page.locator("#section-participants")).toContainText(
      "Update those expenses first.",
    );
  });

  test("S-3.5: after editing Fuel to remove Ali, remove Ali succeeds", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara"],
    });

    // Edit Fuel: uncheck Ali from sharers, keep only Sara; change payer to Sara
    await page
      .locator(".expense-item")
      .filter({ hasText: "Fuel" })
      .locator("[data-action='edit-expense']")
      .click();
    // Uncheck Ali from sharers
    await page
      .locator("label.checkbox-item")
      .filter({ hasText: "Ali" })
      .locator("input[type='checkbox']")
      .uncheck();
    await page.click("#btn-save-expense");

    // Now remove Ali
    await removeParticipant(page, "Ali");
    await expect(page.locator(".participant-list")).not.toContainText("Ali");
  });
});
