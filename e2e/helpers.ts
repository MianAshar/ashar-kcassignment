// E2E test helpers — shared utilities for all spec files.
import type { Page } from "@playwright/test";

export interface ExpenseOpts {
  description: string;
  amount: string;
  payerName: string;
  sharerNames: string[];
  tipMode?: "percent" | "flat";
  tipValue?: string;
}

/** Clears localStorage and reloads so each test starts with an empty trip. */
export async function freshPage(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

/** Fills the participant name input and clicks Add. */
export async function addParticipant(page: Page, name: string): Promise<void> {
  await page.fill("#new-participant-name", name);
  await page.click("#btn-add-participant");
}

/** Clicks the Add Expense button to open the expense form. */
export async function openExpenseForm(page: Page): Promise<void> {
  await page.click("#btn-open-expense-form");
}

/** Fills all expense form fields but does not save. */
export async function fillExpenseForm(page: Page, opts: ExpenseOpts): Promise<void> {
  await page.fill("#ef-description", opts.description);
  await page.fill("#ef-amount", opts.amount);

  // Select payer by name from the dropdown
  await page.selectOption("#ef-payer", { label: opts.payerName });

  // Check sharer checkboxes by participant name
  for (const name of opts.sharerNames) {
    await page
      .locator("label.checkbox-item")
      .filter({ hasText: name })
      .locator("input[type='checkbox']")
      .check();
  }

  // Set tip if provided
  if (opts.tipMode) {
    await page.click(`input[name='tip-mode'][value='${opts.tipMode}']`);
    if (opts.tipValue !== undefined) {
      await page.fill("#ef-tip-value", opts.tipValue);
    }
  }
}

/** Clicks the save/add-expense button to submit the form. */
export async function saveExpense(page: Page): Promise<void> {
  await page.click("#btn-save-expense");
}

/** Opens the expense form, fills all fields, and saves. */
export async function addExpense(page: Page, opts: ExpenseOpts): Promise<void> {
  await openExpenseForm(page);
  await fillExpenseForm(page, opts);
  await saveExpense(page);
}

/** Clicks the Rename button on the participant row containing the given name. */
export async function startRenameParticipant(page: Page, name: string): Promise<void> {
  await page
    .locator(".participant-row")
    .filter({ hasText: name })
    .locator("[data-action='start-rename']")
    .click();
}

/** Fills the rename input and clicks Save to confirm the rename. */
export async function confirmRename(page: Page, newName: string): Promise<void> {
  await page.fill("#rename-input", newName);
  await page.click("[data-action='confirm-rename']");
}

/** Clicks the Remove button on the participant row containing the given name. */
export async function removeParticipant(page: Page, name: string): Promise<void> {
  await page
    .locator(".participant-row")
    .filter({ hasText: name })
    .locator("[data-action='remove-participant']")
    .click();
}
