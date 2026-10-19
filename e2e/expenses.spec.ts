// E2E tests for adding expenses: S-4 (Add expense) and S-5 (Add a tip).
import { test, expect } from "@playwright/test";
import {
  freshPage,
  addParticipant,
  addExpense,
  openExpenseForm,
  fillExpenseForm,
  saveExpense,
} from "./helpers.js";

test.describe("S-4 — Add an expense", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");
  });

  test("S-4.1: normal add — payer is sharer", async ({ page }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "900",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Fuel" });
    await expect(item).toContainText("Fuel");
    await expect(item).toContainText("900");
    await expect(item).toContainText("Ali");
    await expect(item).toContainText("Sara");
  });

  test("S-4.2: normal add — payer not sharer", async ({ page }) => {
    await addExpense(page, {
      description: "Snacks",
      amount: "300",
      payerName: "Ali",
      sharerNames: ["Sara", "Bilal"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Snacks" });
    await expect(item).toContainText("Ali");
    await expect(item).toContainText("Sara");
    await expect(item).toContainText("Bilal");
  });

  test("S-4.3: empty description shows error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "",
      amount: "500",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText("Description cannot be empty");
  });

  test("S-4.4: amount 0 shows error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Fuel",
      amount: "0",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText("Amount must be greater than zero");
  });

  test("S-4.5: negative amount shows error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Fuel",
      amount: "-500",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText("Amount must be greater than zero");
  });

  test("S-4.6: decimal amount shows error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Fuel",
      amount: "999.50",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText(
      "Amount must be a whole number of rupees",
    );
  });

  test("S-4.7: no sharers selected shows error", async ({ page }) => {
    await openExpenseForm(page);
    await page.fill("#ef-description", "Fuel");
    await page.fill("#ef-amount", "600");
    await page.selectOption("#ef-payer", { label: "Ali" });
    // Do not check any sharer
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText(
      "At least one participant must share this expense",
    );
  });

  test("S-4.8: no payer selected shows error", async ({ page }) => {
    await openExpenseForm(page);
    await page.fill("#ef-description", "Fuel");
    await page.fill("#ef-amount", "600");
    // Leave payer as default (none selected)
    await page
      .locator("label.checkbox-item")
      .filter({ hasText: "Ali" })
      .locator("input[type='checkbox']")
      .check();
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText("A payer must be selected");
  });

  test("S-4.9: amount 1 (minimum) is saved", async ({ page }) => {
    await addExpense(page, {
      description: "Minimal",
      amount: "1",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await expect(page.locator(".expense-item").filter({ hasText: "Minimal" })).toBeVisible();
  });

  test("S-4.10: amount 10000000 (cap) is saved", async ({ page }) => {
    await addExpense(page, {
      description: "Big",
      amount: "10000000",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await expect(page.locator(".expense-item").filter({ hasText: "Big" })).toBeVisible();
  });

  test("S-4.11: amount 10000001 exceeds cap", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "TooMuch",
      amount: "10000001",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText(
      "Amount cannot exceed Rs. 10,000,000",
    );
  });

  test("S-4.12: Rs. 10,000,000 among 3 participants — no scientific notation in breakdown", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "MaxExpense",
      amount: "10000000",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });
    const breakdown = page.locator("#section-breakdown");
    await expect(breakdown).not.toContainText("e+");
    await expect(breakdown).not.toContainText("e-");
    // All share values should be whole numbers formatted with commas
    const aliSection = breakdown.locator(".breakdown-person").filter({ hasText: "Ali" }).first();
    await expect(aliSection).toBeVisible();
  });

  test("S-4.13: after validation error, correct all fields — saved, errors clear", async ({
    page,
  }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "",
      amount: "0",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg").first()).toBeVisible();

    // Correct all fields
    await page.fill("#ef-description", "Fixed");
    await page.fill("#ef-amount", "500");
    await saveExpense(page);

    await expect(page.locator(".expense-item").filter({ hasText: "Fixed" })).toBeVisible();
    await expect(page.locator(".field-error-msg")).toHaveCount(0);
  });
});

test.describe("S-5 — Add a tip to an expense", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");
  });

  test("S-5.1: 10% tip on Rs.1000 shared by Ali+Sara → total Rs.1100, each Rs.550", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Dinner",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
      tipMode: "percent",
      tipValue: "10",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Dinner" });
    await expect(item).toContainText("1,100");

    // Check breakdown
    const aliBreakdown = page
      .locator(".breakdown-person")
      .filter({ hasText: "Ali" })
      .first();
    await expect(
      aliBreakdown.locator("tbody tr").filter({ hasText: "Dinner" }).locator("td").nth(1),
    ).toContainText("550");
  });

  test("S-5.2: flat tip Rs.100 on Rs.1000 → total Rs.1100", async ({ page }) => {
    await addExpense(page, {
      description: "Dinner",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
      tipMode: "flat",
      tipValue: "100",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Dinner" });
    await expect(item).toContainText("1,100");
  });

  test("S-5.3: no tip on Rs.800 → total Rs.800", async ({ page }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "800",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Fuel" });
    await expect(item).toContainText("800");
  });

  test("S-5.4: 10% tip, sharers Ali+Sara not Bilal → total Rs.660; Bilal has no row", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Lunch",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
      tipMode: "percent",
      tipValue: "10",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Lunch" });
    await expect(item).toContainText("660");

    // Bilal's breakdown should not contain "Lunch"
    const bilalBreakdown = page.locator(".breakdown-person").filter({ hasText: "Bilal" });
    await expect(bilalBreakdown).not.toContainText("Lunch");
  });

  test("S-5.5: Rs.1235 + 10% → total Rs.1359 (tip rounds up from 123.5 to 124)", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Dinner",
      amount: "1235",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "percent",
      tipValue: "10",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Dinner" });
    await expect(item).toContainText("1,359");
  });

  test("S-5.6: Rs.1234 + 10% → total Rs.1357 (tip rounds down from 123.4 to 123)", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Dinner",
      amount: "1234",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "percent",
      tipValue: "10",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Dinner" });
    await expect(item).toContainText("1,357");
  });

  test("S-5.7: flat tip -50 shows error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Dinner",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "flat",
      tipValue: "-50",
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText("Tip cannot be negative");
  });

  test("S-5.8: -10% tip shows error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Dinner",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "percent",
      tipValue: "-10",
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText("Tip cannot be negative");
  });

  test("S-5.9: 101% tip shows error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Dinner",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "percent",
      tipValue: "101",
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText(
      "Tip percentage cannot exceed 100%",
    );
  });

  test("S-5.10: flat tip 99.50 shows decimal error", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Dinner",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "flat",
      tipValue: "99.50",
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText(
      "Tip must be a whole number of rupees",
    );
  });

  test("S-5.11: Rs.500 + 100% tip → total Rs.1000, saved", async ({ page }) => {
    await addExpense(page, {
      description: "Dinner",
      amount: "500",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "percent",
      tipValue: "100",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Dinner" });
    await expect(item).toContainText("1,000");
  });

  test("S-5.12: Rs.500 + 0% tip → total Rs.500, saved", async ({ page }) => {
    await addExpense(page, {
      description: "Dinner",
      amount: "500",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "percent",
      tipValue: "0",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Dinner" });
    await expect(item).toContainText("500");
  });

  test("S-5.13: base Rs.9500000 + flat tip Rs.600000 → exceeds cap", async ({ page }) => {
    await openExpenseForm(page);
    await fillExpenseForm(page, {
      description: "Huge",
      amount: "9500000",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "flat",
      tipValue: "600000",
    });
    await saveExpense(page);
    await expect(page.locator(".field-error-msg")).toContainText(
      "Total including tip cannot exceed Rs. 10,000,000",
    );
  });

  test("S-5.14: base Rs.9500000 + flat tip Rs.500000 → saved at Rs.10,000,000", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "MaxTipped",
      amount: "9500000",
      payerName: "Ali",
      sharerNames: ["Ali"],
      tipMode: "flat",
      tipValue: "500000",
    });
    const item = page.locator(".expense-item").filter({ hasText: "MaxTipped" });
    await expect(item).toContainText("10,000,000");
  });
});
