// E2E tests for settlement (S-10), per-person breakdown (S-11), and rounding (S-12).
import { test, expect } from "@playwright/test";
import { freshPage, addParticipant, addExpense } from "./helpers.js";

test.describe("S-10 — View the settlement summary", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
  });

  test("S-10.1: simple two-person — Sara pays Ali Rs.300", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await expect(page.locator("#section-settlement")).toContainText("Sara pays Ali");
    await expect(page.locator("#section-settlement .transfer-amount")).toContainText("300");
  });

  test("S-10.2: Faisalabad scenario — exactly 2 transfers", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Usman");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");

    await addExpense(page, {
      description: "Fuel to Faisalabad",
      amount: "1500",
      payerName: "Ali",
      sharerNames: ["Ali", "Usman"],
    });
    await addExpense(page, {
      description: "Fuel onwards",
      amount: "2000",
      payerName: "Usman",
      sharerNames: ["Ali", "Usman", "Sara", "Bilal"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "3001",
      payerName: "Sara",
      sharerNames: ["Ali", "Usman", "Sara", "Bilal"],
    });

    const settlement = page.locator("#section-settlement");
    const rows = settlement.locator(".transfer-row");
    await expect(rows).toHaveCount(2);

    // Bilal pays Sara Rs.1,250
    const bilalRow = rows.filter({ hasText: "Bilal" });
    await expect(bilalRow).toContainText("Sara");
    await expect(bilalRow.locator(".transfer-amount")).toContainText("1,250");

    // Ali pays Sara Rs.500
    const aliRow = rows.filter({ hasText: "Ali" });
    await expect(aliRow).toContainText("Sara");
    await expect(aliRow.locator(".transfer-amount")).toContainText("500");
  });

  test("S-10.3: all balances zero — settled message", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "600",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara"],
    });
    await expect(page.locator("#section-settlement")).toContainText(
      "All balances are settled — no transfers needed.",
    );
  });

  test("S-10.4: one participant — settled message", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addExpense(page, {
      description: "Snacks",
      amount: "300",
      payerName: "Ali",
      sharerNames: ["Ali"],
    });
    await expect(page.locator("#section-settlement")).toContainText(
      "All balances are settled — no transfers needed.",
    );
  });

  test("S-10.5: no expenses — empty state message", async ({ page }) => {
    await addParticipant(page, "Ali");
    await expect(page.locator("#section-settlement")).toContainText(
      "No expenses have been added yet.",
    );
  });

  test("S-10.6: section heading says 'Simplified settlement'", async ({ page }) => {
    await expect(page.locator("#section-settlement h2")).toContainText("Simplified settlement");
  });

  test("S-10.7: settlement recalculates after adding a new expense", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await expect(page.locator("#section-settlement")).toContainText("300");

    await addExpense(page, {
      description: "Hotel",
      amount: "400",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara"],
    });
    // After Hotel: Ali paid 600 owed 500, Sara paid 400 owed 500 → Sara owes Ali 100
    await expect(page.locator("#section-settlement")).toContainText("100");
  });
});

test.describe("S-11 — View the per-person breakdown", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
  });

  test("S-11.1: breakdown shows correct per-expense figures for Ali", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");

    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "900",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });

    const aliSection = page.locator(".breakdown-person").filter({ hasText: "Ali" }).first();

    // Fuel row: share=300, paid=600
    const fuelRow = aliSection.locator("tbody tr").filter({ hasText: "Fuel" });
    await expect(fuelRow.locator("td").nth(1)).toContainText("300");
    await expect(fuelRow.locator("td").nth(2)).toContainText("600");

    // Hotel row: share=300, paid=— (Ali didn't pay)
    const hotelRow = aliSection.locator("tbody tr").filter({ hasText: "Hotel" });
    await expect(hotelRow.locator("td").nth(1)).toContainText("300");
    await expect(hotelRow.locator("td").nth(2)).toContainText("—");
  });

  test("S-11.2: Fuel not shared by Bilal — not in Bilal's breakdown", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");

    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "900",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });

    const bilalSection = page.locator(".breakdown-person").filter({ hasText: "Bilal" });
    await expect(bilalSection).not.toContainText("Fuel");
  });

  test("S-11.3: payer-not-sharer: Ali pays Snacks, sharers Sara+Bilal → share=0, paid=300", async ({
    page,
  }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");

    await addExpense(page, {
      description: "Snacks",
      amount: "300",
      payerName: "Ali",
      sharerNames: ["Sara", "Bilal"],
    });

    const aliSection = page.locator(".breakdown-person").filter({ hasText: "Ali" }).first();
    const snacksRow = aliSection.locator("tbody tr").filter({ hasText: "Snacks" });
    await expect(snacksRow.locator("td").nth(1)).toContainText("0");
    await expect(snacksRow.locator("td").nth(2)).toContainText("300");
  });

  test("S-11.4: net balance matches settlement — Ali net Rs.0 in S-11.1 scenario", async ({
    page,
  }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");

    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "900",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });

    const aliSection = page.locator(".breakdown-person").filter({ hasText: "Ali" }).first();
    await expect(aliSection.locator(".breakdown-summary")).toContainText("Settled");
  });

  test("S-11.5: zero net — Ali not in settlement transfers", async ({ page }) => {
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");

    await addExpense(page, {
      description: "Fuel",
      amount: "600",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara"],
    });
    await addExpense(page, {
      description: "Hotel",
      amount: "900",
      payerName: "Sara",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });

    // Ali net is 0, so Ali should not appear in any transfer row
    const transfers = page.locator("#section-settlement .transfer-row");
    const count = await transfers.count();
    for (let i = 0; i < count; i++) {
      const text = await transfers.nth(i).textContent();
      expect(text).not.toContain("Ali pays");
      expect(text).not.toContain("pays Ali");
    }
  });
});

test.describe("S-12 — Rounding notes", () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page);
    await addParticipant(page, "Ali");
    await addParticipant(page, "Sara");
    await addParticipant(page, "Bilal");
    await addParticipant(page, "Kamran");
  });

  test("S-12.1: Case A, leftover 1 — Rs.1000 paid Ali, sharers Ali+Sara+Bilal → note shown", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Meal",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Meal" });
    await expect(item.locator(".rounding-note")).toContainText("Ali absorbed Re. 1 rounding difference.");
  });

  test("S-12.2: Case A, exact (Rs.900/3) — no rounding note", async ({ page }) => {
    await addExpense(page, {
      description: "Exact",
      amount: "900",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Exact" });
    await expect(item.locator(".rounding-note")).toHaveCount(0);
  });

  test("S-12.3: Case A, leftover 2 (Rs.1001/3) — note shows Rs.2", async ({ page }) => {
    await addExpense(page, {
      description: "Meal",
      amount: "1001",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Meal" });
    await expect(item.locator(".rounding-note")).toContainText("Ali absorbed Rs. 2 rounding difference.");
  });

  test("S-12.4: Case B, leftover 1 — Rs.1000 paid Ali not sharing, sharers Sara+Bilal+Kamran → note mentions Sara", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Groceries",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Sara", "Bilal", "Kamran"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Groceries" });
    await expect(item.locator(".rounding-note")).toContainText(
      "Re. 1 rounding difference added to Sara's share (first in listed order).",
    );
  });

  test("S-12.5: Case B, leftover 2 (Rs.1001) — note mentions Sara and Bilal", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Groceries",
      amount: "1001",
      payerName: "Ali",
      sharerNames: ["Sara", "Bilal", "Kamran"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Groceries" });
    await expect(item.locator(".rounding-note")).toContainText(
      "Rs. 2 rounding difference distributed to Sara and Bilal (first in listed order).",
    );
  });

  test("S-12.6: Case B, exact (Rs.1000 / Sara+Bilal) — no rounding note", async ({ page }) => {
    await addExpense(page, {
      description: "Even",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Sara", "Bilal"],
    });
    const item = page.locator(".expense-item").filter({ hasText: "Even" });
    await expect(item.locator(".rounding-note")).toHaveCount(0);
  });

  test("S-12.7: very small (Rs.2 paid Ali not sharing, sharers Sara+Bilal+Kamran) — Kamran=0, note mentions Sara and Bilal", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Tiny",
      amount: "2",
      payerName: "Ali",
      sharerNames: ["Sara", "Bilal", "Kamran"],
    });

    // Check rounding note
    const item = page.locator(".expense-item").filter({ hasText: "Tiny" });
    await expect(item.locator(".rounding-note")).toContainText("Sara");
    await expect(item.locator(".rounding-note")).toContainText("Bilal");

    // Check Kamran's breakdown shows Rs.0 for this expense
    const kamranSection = page.locator(".breakdown-person").filter({ hasText: "Kamran" });
    const tinyRow = kamranSection.locator("tbody tr").filter({ hasText: "Tiny" });
    await expect(tinyRow.locator("td").nth(1)).toContainText("0");
  });

  test("S-12.8: with tip (Rs.1000 + 10% = Rs.1100, paid Ali sharer, Ali+Sara+Bilal) → note shows Rs.2", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Tipped",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara", "Bilal"],
      tipMode: "percent",
      tipValue: "10",
    });
    const item = page.locator(".expense-item").filter({ hasText: "Tipped" });
    await expect(item.locator(".rounding-note")).toContainText("Ali absorbed Rs. 2 rounding difference.");
  });

  test("S-12.9: rounding note is in .expense-item NOT in #section-breakdown", async ({ page }) => {
    await addExpense(page, {
      description: "Meal",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });
    // Rounding note should NOT appear inside the breakdown section
    await expect(page.locator("#section-breakdown .rounding-note")).toHaveCount(0);
    // It should appear in the expense list
    await expect(
      page.locator(".expense-item").filter({ hasText: "Meal" }).locator(".rounding-note"),
    ).toBeVisible();
  });

  test("S-12.10: shares sum to Hotel Rs.3001 in Faisalabad scenario", async ({ page }) => {
    await addParticipant(page, "Usman");

    await addExpense(page, {
      description: "Hotel",
      amount: "3001",
      payerName: "Sara",
      sharerNames: ["Ali", "Usman", "Sara", "Bilal"],
    });

    // Collect all share values from Hotel row in breakdown and sum them
    const breakdown = page.locator("#section-breakdown");
    let totalShares = 0;
    const persons = ["Ali", "Usman", "Sara", "Bilal"];
    for (const name of persons) {
      // Filter by the name element specifically, not full section text (which now includes payer names)
      const section = breakdown
        .locator(".breakdown-person")
        .filter({ has: page.locator(".breakdown-person-name", { hasText: name }) })
        .first();
      const hotelRow = section.locator("tbody tr").filter({ hasText: "Hotel" });
      const shareText = await hotelRow.locator("td").nth(1).textContent();
      // shareText like "Rs. 750" — extract the number
      const match = shareText?.replace(/[^0-9,]/g, "").replace(/,/g, "");
      if (match) totalShares += parseInt(match, 10);
    }
    expect(totalShares).toBe(3001);
  });

  test("S-12.11: share amounts consistent — expense list and breakdown agree for Fuel", async ({
    page,
  }) => {
    await addExpense(page, {
      description: "Fuel",
      amount: "1000",
      payerName: "Ali",
      sharerNames: ["Ali", "Sara", "Bilal"],
    });

    // From breakdown, get Ali's share of Fuel
    const aliSection = page.locator(".breakdown-person").filter({ hasText: "Ali" }).first();
    const fuelRow = aliSection.locator("tbody tr").filter({ hasText: "Fuel" });
    const shareText = await fuelRow.locator("td").nth(1).textContent();
    // Ali absorbs the remainder: 334
    expect(shareText).toContain("334");

    // Sara and Bilal get 333 each
    const saraSection = page.locator(".breakdown-person").filter({ hasText: "Sara" }).first();
    const saraFuelRow = saraSection.locator("tbody tr").filter({ hasText: "Fuel" });
    await expect(saraFuelRow.locator("td").nth(1)).toContainText("333");

    const bilalSection = page.locator(".breakdown-person").filter({ hasText: "Bilal" }).first();
    const bilalFuelRow = bilalSection.locator("tbody tr").filter({ hasText: "Fuel" });
    await expect(bilalFuelRow.locator("td").nth(1)).toContainText("333");
  });
});
