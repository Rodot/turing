import { expect, test } from "@playwright/test";

test("snackbar should close when X button is clicked", async ({ page }) => {
  // Navigate to a non-existent game to trigger an error
  await page.goto("/?game=nonexistent123");

  // Verify snackbar is visible
  const snackbar = page.locator(".MuiSnackbar-root");
  await snackbar.waitFor({ state: "visible" });
  await expect(snackbar).toBeVisible();
  const alertMessage = page.locator(".MuiAlert-message");
  await expect(alertMessage).toContainText("Game not found");

  // Try to close the snackbar using the X button
  const closeButton = page.locator(".MuiAlert-action button");
  await closeButton.click();

  // Verify the snackbar is NOT visible after clicking X
  await expect(snackbar).not.toBeVisible({ timeout: 1000 });
});

test("snackbar should auto-hide after timeout", async ({ page }) => {
  // Navigate to a non-existent game to trigger an error
  await page.goto("/?game=nonexistent123");

  // Verify snackbar is visible
  const snackbar = page.locator(".MuiSnackbar-root");
  await snackbar.waitFor({ state: "visible" });
  await expect(snackbar).toBeVisible();
  const alertMessage = page.locator(".MuiAlert-message");
  await expect(alertMessage).toContainText("Game not found");

  // Wait longer than the autoHideDuration
  await page.waitForTimeout(5000);

  // Verify the snackbar is NOT visible after the timeout
  await expect(snackbar).not.toBeVisible({ timeout: 1000 });
});

test("snackbar should not close on clickaway", async ({ page }) => {
  // Navigate to a non-existent game to trigger an error
  await page.goto("/?game=nonexistent123");

  // Verify snackbar is visible
  const snackbar = page.locator(".MuiSnackbar-root");
  await snackbar.waitFor({ state: "visible" });
  await expect(snackbar).toBeVisible();
  const alertMessage = page.locator(".MuiAlert-message");
  await expect(alertMessage).toContainText("Game not found");

  // Verify clickaway behavior - clicking elsewhere shouldn't close the snackbar
  await page.click("body", { position: { x: 10, y: 10 } });
  await expect(snackbar).toBeVisible({ timeout: 1000 });
});
