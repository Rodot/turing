import { test } from "@playwright/test";

test("user signup, create game, and copy link flow", async ({ page }) => {
  // Navigate to the homepage
  await page.goto("/");

  // Enter a name in the signup field
  await page.getByLabel("Your name").fill("TestPlayer");

  // Click the submit button to save the name
  await page.locator('button[type="submit"]').click();

  // Wait for the name to be saved and the "New Game" button to appear
  await page.getByRole("button", { name: "New Game" }).waitFor();

  // Click the "New Game" button
  await page.getByRole("button", { name: "New Game" }).click();

  // Wait for navigation to the game page and for it to load
  await page.waitForURL("**/game");

  // Wait for the Invite Link section to appear on the lobby page
  await page.getByText("Invite Link").waitFor();

  // Click the copy button next to the text field
  await page
    .getByRole("button")
    .filter({ has: page.locator('svg[data-testid="ContentCopyIcon"]') })
    .click();
});
