import { expect, test } from "@playwright/test";
import { setupConsoleLogging } from "./helpers";

test("browser language detection for French", async ({ browser }) => {
  // Create a new context with French locale
  const context = await browser.newContext({
    locale: "fr-FR",
  });

  const page = await context.newPage();

  // Setup console logging
  const consoleHandler = setupConsoleLogging([page], "LANG_DETECT_FR");

  // Navigate to the home page
  await page.goto("/");

  // Check that the page displays French text
  // Test the game subtitle (this should be translated)
  await expect(
    page.getByText("Une IA contrôle quelqu'un dans le chat."),
  ).toBeVisible();

  // Test the scoring text (this should be translated)
  await expect(page.getByText("🔎 Enquêtez :")).toBeVisible();

  // Test form labels (this should be translated)
  await expect(page.getByLabel("Votre nom")).toBeVisible();

  // Now test conversation language button in lobby
  await page.getByLabel("Votre nom").fill("Host");
  await page.getByLabel("Submit").click();
  await page.getByLabel("New Game").waitFor();
  await page.getByLabel("New Game").click();

  // Wait for lobby to load
  await page.getByText("Langue de Conversation").waitFor();

  // Check that French button is selected (contained variant) and English is not
  const frenchButton = page.getByRole("button", { name: "Français" });
  const englishButton = page.getByRole("button", { name: "Anglais" });

  await expect(frenchButton).toBeVisible();
  await expect(englishButton).toBeVisible();

  // Check that French button has the contained variant (selected state)
  await expect(frenchButton).toHaveClass(/MuiButton-contained/);
  await expect(englishButton).toHaveClass(/MuiButton-text/);

  // Check for console errors
  consoleHandler.checkForConsoleErrors();

  await context.close();
});

test("browser language detection for English (default)", async ({
  browser,
}) => {
  // Create a new context with English locale
  const context = await browser.newContext({
    locale: "en-US",
  });

  const page = await context.newPage();

  // Setup console logging
  const consoleHandler2 = setupConsoleLogging([page], "LANG_DETECT_EN");

  // Navigate to the home page
  await page.goto("/");

  // Check that the page displays English text
  // Test the game subtitle (this should be in English)
  await expect(
    page.getByText("🤖 An AI controls someone in the chat"),
  ).toBeVisible();

  // Test the scoring text (this should be in English)
  await expect(page.getByText("🔎 Investigate:")).toBeVisible();

  // Test form labels (this should be in English)
  await expect(page.getByLabel("Your name")).toBeVisible();

  // Now test conversation language button in lobby
  await page.getByLabel("Your name").fill("Host");
  await page.getByLabel("Submit").click();
  await page.getByLabel("New Game").waitFor();
  await page.getByLabel("New Game").click();

  // Wait for lobby to load
  await page.getByText("Conversation Language").waitFor();

  // Check that English button is selected (contained variant) and French is not
  const englishButton = page.getByRole("button", { name: "English" });
  const frenchButton = page.getByRole("button", { name: "French" });

  await expect(englishButton).toBeVisible();
  await expect(frenchButton).toBeVisible();

  // Check that English button has the contained variant (selected state)
  await expect(englishButton).toHaveClass(/MuiButton-contained/);
  await expect(frenchButton).toHaveClass(/MuiButton-text/);

  // Check for console errors
  consoleHandler2.checkForConsoleErrors();

  await context.close();
});
