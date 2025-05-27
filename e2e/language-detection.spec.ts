import { expect, test } from "@playwright/test";
import { setupConsoleLogging } from "./helpers";

test("browser language detection for French", async ({ browser }) => {
  // Create a new context with French locale
  const context = await browser.newContext({
    locale: "fr-FR",
  });

  const page = await context.newPage();

  // Setup console logging
  setupConsoleLogging([page], "LANG_DETECT");

  // Navigate to the home page
  await page.goto("/");

  // Check that the page displays French text
  // Note: The title "The Turing Trial" is hardcoded and not translated

  // Test the game subtitle (this should be translated)
  await expect(
    page.getByText("Une IA contrôle quelqu'un dans le chat."),
  ).toBeVisible();

  // Test the game description (this should be translated)
  await expect(
    page.getByText("Saurez-vous distinguer vos amis de l'IA ?"),
  ).toBeVisible();

  // Test form labels (this should be translated)
  await expect(page.getByLabel("Votre nom")).toBeVisible();

  // Test scoring rules (these should be translated)
  await expect(
    page.getByText("+1 🧠 si vous trouvez l'IA parmi les humains"),
  ).toBeVisible();
  await expect(
    page.getByText("-1 🧠 si vous confondez un humain avec l'IA"),
  ).toBeVisible();

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

  // Navigate to the home page
  await page.goto("/");

  // Check that the page displays English text
  // Note: The title "The Turing Trial" is hardcoded and always in English

  // Test the game subtitle (this should be in English)
  await expect(
    page.getByText("An AI controls someone in the chat."),
  ).toBeVisible();

  // Test the game description (this should be in English)
  await expect(
    page.getByText("Will you tell your friends from the AI?"),
  ).toBeVisible();

  // Test form labels (this should be in English)
  await expect(page.getByLabel("Your name")).toBeVisible();

  // Test scoring rules (these should be in English)
  await expect(
    page.getByText("+1 🧠 if you find the AI among humans"),
  ).toBeVisible();
  await expect(
    page.getByText("-1 🧠 if you confuse a human for the AI"),
  ).toBeVisible();

  await context.close();
});
