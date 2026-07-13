import { test, expect } from "@playwright/test";

test("has title and displays console greeting onboarding", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Aeris/);
  await expect(page.locator("text=Identify Terminal Node")).toBeVisible();
});
