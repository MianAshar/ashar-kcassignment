// E2E tests for editing expenses (S-6) and deleting expenses (S-7).
import { test, expect } from "@playwright/test";
import { freshPage, addParticipant, addExpense } from "./helpers.js";

test.describe("S-6 — Edit an expense", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");
  });

  test("S-6.1: edit amount — change Fuel Rs.600 to Rs.700", async ({ page }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page
      .locator(".expense-item")
      .filter({ hasText: "Fuel" })
      .locator("[data-action='edit-expense']")
      .click();
    await page.fill("#ef-amount", "700");
    await page.click("#btn-save-expense");

    const item = page.locator(".expense-item").filter({ hasText: "Fuel" });
    await expect(item).toContainText("700");
  });

  test("S-6.2: edit sharers — add Bilal to Hotel", async ({ page }) => {
    await addExpense(page, {
      description: "Hotel",
      amount: "900",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page
      .locator(".expense-item")
      .filter({ hasText: "Hotel" })
      .locator("[data-action='edit-expense']")
      .click();
    await page
      .locator("label.checkbox-item")
      .filter({ hasText: "Bilal" })
      .locator("input[type='checkbox']")
      .check();
    await page.click("#btn-save-expense");

    const item = page.locator(".expense-item").filter({ hasText: "Hotel" });
    await expect(item).toContainText("Bilal");
  });

  test("S-6.3: edit payer — change from Ali to Sara", async ({ page }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page
      .locator(".expense-item")
      .filter({ hasText: "Fuel" })
      .locator("[data-action='edit-expense']")
      .click();
    await page.selectOption("#ef-payer", { label: "Sara" });
    await page.click("#btn-save-expense");

    const item = page.locator(".expense-item").filter({ hasText: "Fuel" });
    await expect(item).toContainText("Sara");
  });

  test("S-6.4: edit with invalid data (zero amount) — error shown, cancel restores original", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page
      .locator(".expense-item")
      .filter({ hasText: "Fuel" })
      .locator("[data-action='edit-expense']")
      .click();
    await page.fill("#ef-amount", "0");
    await page.click("#btn-save-expense");
    await expect(page.locator(".field-error-msg")).toContainText("Amount must be greater than zero");

    // Cancel — original should still be there
    await page.click("#btn-cancel-expense");
    const item = page.locator(".expense-item").filter({ hasText: "Fuel" });
    await expect(item).toContainText("600");
  });

  test("S-6.5: settlement recalculates after edit", async ({ page }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    // Note original settlement amount
    await expect(page.locator("#section-settlement")).toContainText("300");

    await page
      .locator(".expense-item")
      .filter({ hasText: "Fuel" })
      .locator("[data-action='edit-expense']")
      .click();
    await page.fill("#ef-amount", "1000");
    await page.click("#btn-save-expense");

    // Settlement should now show 500 (not 300)
    await expect(page.locator("#section-settlement")).toContainText("500");
    await expect(page.locator("#section-settlement")).not.toContainText("Rs.\u00a0300");
  });
});

test.describe("S-7 — Delete an expense", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
  });

  test("S-7.1: delete Snacks with confirmation — gone from list", async ({ page }) => {
    await addExpense(page, {
      description: "Snacks",
      amount: "200",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page
      .locator(".expense-item")
      .filter({ hasText: "Snacks" })
      .locator("[data-action='delete-expense']")
      .click();
    await page
      .locator(".expense-item")
      .filter({ hasText: "Snacks" })
      .locator("[data-action='confirm-delete']")
      .click();

    await expect(page.locator("#section-expenses")).not.toContainText("Snacks");
  });

  test("S-7.2: click Delete → confirmation prompt appears, expense still in list", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Snacks",
      amount: "200",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page
      .locator(".expense-item")
      .filter({ hasText: "Snacks" })
      .locator("[data-action='delete-expense']")
      .click();

    // Confirmation prompt visible
    await expect(
      page.locator(".expense-item").filter({ hasText: "Snacks" }).locator(".delete-confirm"),
    ).toBeVisible();
    // Expense still in list
    await expect(page.locator(".expense-list")).toContainText("Snacks");
  });

  test("S-7.3: click Delete then Cancel — expense remains", async ({ page }) => {
    await addExpense(page, {
      description: "Snacks",
      amount: "200",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });

    await page
      .locator(".expense-item")
      .filter({ hasText: "Snacks" })
      .locator("[data-action='delete-expense']")
      .click();
    await page
      .locator(".expense-item")
      .filter({ hasText: "Snacks" })
      .locator("[data-action='cancel-delete']")
      .click();

    await expect(page.locator(".expense-list")).toContainText("Snacks");
  });

  test("S-7.4: settlement recalculates after delete", async ({ page }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "400",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara"],
    });

    // Initial settlement: Ali net -100 (paid 600, owed 500), Sara net +100
    // "Sara pays Ali Rs. 100" ... let's just verify settlement is present
    await expect(page.locator("#section-settlement")).toContainText("pays");

    // Delete Hotel
    await page
      .locator(".expense-item")
      .filter({ hasText: "Hotel" })
      .locator("[data-action='delete-expense']")
      .click();
    await page
      .locator(".expense-item")
      .filter({ hasText: "Hotel" })
      .locator("[data-action='confirm-delete']")
      .click();

    // Settlement should now only reflect Fuel
    await expect(page.locator("#section-settlement")).toContainText("300");
  });
});
