import { expect, test } from "@playwright/test";

/**
 * Regression tests for snackbar issues:
 * 1. Snackbars don't auto-hide after the timeout
 * 2. The close (X) button doesn't work to dismiss snackbars
 *
 * Note: These tests are EXPECTED TO FAIL while the bugs exist.
 * When the bugs are fixed, these tests will pass.
 */

test("snackbar should close when X button is clicked", async ({ page }) => {
  // Navigate to a non-existent game to trigger an error
  await page.goto("/?game=nonexistent123");

  // Wait for the snackbar to appear after the error is triggered
  const snackbar = page.locator(".MuiSnackbar-root");
  await snackbar.waitFor({ state: "visible" });

  // Verify snackbar is visible
  await expect(snackbar).toBeVisible();

  // Get the snackbar message
  const alertMessage = page.locator(".MuiAlert-message");
  await expect(alertMessage).toContainText(
    "invalid input syntax for type uuid",
  );

  // Try to close the snackbar using the X button
  const closeButton = page.locator(".MuiAlert-action button");
  await closeButton.click();

  // Verify the snackbar is NOT visible after clicking X (this will fail with the current bug)
  await expect(snackbar).not.toBeVisible({ timeout: 1000 });
});

test("snackbar should auto-hide after timeout", async ({ page }) => {
  // Navigate to a non-existent game to trigger an error
  await page.goto("/?game=nonexistent123");

  // Wait for the snackbar to appear after the error is triggered
  const snackbar = page.locator(".MuiSnackbar-root");
  await snackbar.waitFor({ state: "visible" });

  // Verify snackbar is visible
  await expect(snackbar).toBeVisible();

  // Wait longer than the autoHideDuration (3000ms defined in snackbarContext.tsx)
  // Adding extra time to ensure it's past the timeout
  await page.waitForTimeout(5000);

  // Verify the snackbar is NOT visible after the timeout (this will fail with the current bug)
  await expect(snackbar).not.toBeVisible({ timeout: 1000 });
});

test("snackbar should not close on clickaway", async ({ page }) => {
  // Navigate to a non-existent game to trigger an error
  await page.goto("/?game=nonexistent123");

  // Wait for the snackbar to appear after the error is triggered
  const snackbar = page.locator(".MuiSnackbar-root");
  await snackbar.waitFor({ state: "visible" });

  // Verify snackbar is visible
  await expect(snackbar).toBeVisible();

  // Verify clickaway behavior - clicking elsewhere shouldn't close the snackbar
  // (This should pass even when the other bugs are fixed because the component correctly ignores clickaway)
  await page.click("body", { position: { x: 10, y: 10 } });
  await expect(snackbar).toBeVisible({ timeout: 1000 });
});
