import { expect, Page, test } from "@playwright/test";
import { setupConsoleLogging } from "./helpers";

interface TestPlayer {
  name: string;
  page: Page;
}

test("smart chat scrolling behavior", async ({ browser }) => {
  // Create 3 players (minimum required to start a game)
  const contexts = await Promise.all([1, 2, 3].map(() => browser.newContext()));
  const pages = await Promise.all(contexts.map((context) => context.newPage()));

  // Setup console logging for all pages
  setupConsoleLogging(pages, "SMART_SCROLL");

  const testPlayers: TestPlayer[] = pages.map((page, index) => ({
    name: `Player${index}`,
    page,
  }));

  const [host, ...guests] = testPlayers;
  if (!host) throw new Error("Need host player for test");

  // Setup and join game - copy exact flow from happy-path.spec.ts
  await host.page.goto("/");
  await host.page.getByLabel("Your name").fill(host.name);
  await host.page.getByLabel("Submit").click();
  await host.page.getByLabel("New Game").waitFor();
  await host.page.getByLabel("New Game").click();

  await host.page.getByText("Invite Link").waitFor();
  const gameUrl = host.page.url();

  for (const guest of guests) {
    await guest.page.goto(gameUrl);
    await guest.page.getByLabel("Your name").fill(guest.name);
    await guest.page.getByLabel("Submit").click();
    await guest.page.getByLabel("Join Game").waitFor();

    // Check that existing player names are visible before joining
    await expect(
      guest.page.getByText(host.name, { exact: true }),
    ).toBeVisible();

    await guest.page.getByLabel("Join Game").click();
  }

  // Start the game to get to chat phase
  await host.page.getByLabel("Start Game").waitFor();
  await host.page.getByLabel("Start Game").click();

  // Handle the start game confirmation modal
  await host.page.getByText("Yes, let's go!").waitFor();
  await host.page.getByText("Yes, let's go!").click();

  // Wait for the chat phase (warmup talking)
  await expect(host.page.getByText("Warming up")).toBeVisible();

  // Take screenshot when warmup phase starts
  await host.page.screenshot({
    path: "test-results/warmup-start.png",
    fullPage: true,
  });

  // Send enough messages to make the chat scrollable
  const chatInput = host.page.getByRole("textbox", { name: "Send message" });
  const sendButton = host.page.getByRole("button", {
    name: "Send message button",
  });

  // Take screenshot before trying to interact with chat input
  await host.page.screenshot({
    path: "test-results/before-chat-input.png",
    fullPage: true,
  });

  // Send one very long message to create scrollable content without triggering warmup transition
  const longMessage = Array(20)
    .fill(
      "This is a very long message that will create enough content to make the chat scrollable and test the smart scrolling behavior without triggering the warmup transition by sending too many separate messages.",
    )
    .join(" ");

  await chatInput.fill(longMessage);
  await sendButton.click();

  // Test 1: When at bottom, new messages should auto-scroll
  // Verify we can see the latest message (should be auto-scrolled)
  await expect(
    host.page.getByText("This is a very long message", { exact: false }),
  ).toBeVisible();

  // Test 2: Scroll up manually on ALL pages, then add new message

  // Take screenshots before scrolling
  await host.page.screenshot({
    path: "test-results/page0-before-scroll-up.png",
    fullPage: true,
  });
  await guests[0]!.page.screenshot({
    path: "test-results/page1-before-scroll-up.png",
    fullPage: true,
  });
  await guests[1]!.page.screenshot({
    path: "test-results/page2-before-scroll-up.png",
    fullPage: true,
  });

  // Scroll all pages to top and trigger scroll event
  await host.page.evaluate(() => {
    window.scrollTo(0, 0);
    // Force synchronous event dispatch
    window.dispatchEvent(new Event("scroll", { bubbles: true }));
    // Also check the scroll position manually
    console.log(
      `Manual scroll check - scrollTop: ${window.pageYOffset}, scrollHeight: ${document.documentElement.scrollHeight}, clientHeight: ${window.innerHeight}`,
    );
  });
  await guests[0]!.page.evaluate(() => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("scroll", { bubbles: true }));
    console.log(
      `Manual scroll check - scrollTop: ${window.pageYOffset}, scrollHeight: ${document.documentElement.scrollHeight}, clientHeight: ${window.innerHeight}`,
    );
  });
  await guests[1]!.page.evaluate(() => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event("scroll", { bubbles: true }));
    console.log(
      `Manual scroll check - scrollTop: ${window.pageYOffset}, scrollHeight: ${document.documentElement.scrollHeight}, clientHeight: ${window.innerHeight}`,
    );
  });

  // Take screenshots after scrolling
  await host.page.screenshot({
    path: "test-results/page0-after-manual-scroll.png",
    fullPage: true,
  });
  await guests[0]!.page.screenshot({
    path: "test-results/page1-after-manual-scroll.png",
    fullPage: true,
  });
  await guests[1]!.page.screenshot({
    path: "test-results/page2-after-manual-scroll.png",
    fullPage: true,
  });

  // Send a new message from HOST (so guests receive it)
  await host.page
    .getByRole("textbox", { name: "Send message" })
    .fill("New message after scroll up");
  await host.page.getByRole("button", { name: "Send message button" }).click();

  // Wait for the message to appear and mutation to complete
  await expect(
    host.page.getByText("New message after scroll up"),
  ).toBeVisible();

  // Take screenshots after receiving message
  await host.page.screenshot({
    path: "test-results/page0-after-receiving-message.png",
    fullPage: true,
  });
  await guests[0]!.page.screenshot({
    path: "test-results/page1-after-receiving-message.png",
    fullPage: true,
  });
  await guests[1]!.page.screenshot({
    path: "test-results/page2-after-receiving-message.png",
    fullPage: true,
  });

  // Test 3: Check visibility on all pages
  console.log(
    "Testing visibility on host page (should auto-scroll because it's their message)",
  );
  await expect(
    host.page.getByText("New message after scroll up"),
  ).toBeVisible();

  console.log(
    "Testing scroll position on guest1 page (should NOT auto-scroll)",
  );
  const guest1ScrollTop = await guests[0]!.page.evaluate(
    () => window.pageYOffset,
  );
  console.log(`Guest1 scroll position: ${guest1ScrollTop}`);
  expect(guest1ScrollTop).toBe(0); // Should still be at top

  console.log(
    "Testing scroll position on guest2 page (should NOT auto-scroll)",
  );
  const guest2ScrollTop = await guests[1]!.page.evaluate(
    () => window.pageYOffset,
  );
  console.log(`Guest2 scroll position: ${guest2ScrollTop}`);
  expect(guest2ScrollTop).toBe(0); // Should still be at top

  // Test 4: Verify the "new messages" button appears on guest pages
  await expect(
    guests[0]!.page.locator('[data-testid="new-messages-button"]'),
  ).toBeVisible();
  await expect(
    guests[1]!.page.locator('[data-testid="new-messages-button"]'),
  ).toBeVisible();

  // Test 5: Click the button on guest1 and verify it scrolls to bottom
  await guests[0]!.page.locator('[data-testid="new-messages-button"]').click();
  await expect(
    guests[0]!.page.getByText("New message after scroll up"),
  ).toBeVisible();

  // Test 6: Verify the button disappears after scrolling to bottom
  await expect(
    guests[0]!.page.locator('[data-testid="new-messages-button"]'),
  ).not.toBeVisible();

  // Test 7: Host should auto-scroll when THEY send a message (even if scrolled up)
  // Scroll host page to top
  await host.page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await host.page.waitForTimeout(500);

  // Host sends a message while scrolled up
  await host.page
    .getByRole("textbox", { name: "Send message" })
    .fill("Host message while scrolled up");

  // Wait for send button to be enabled before clicking
  await expect(
    host.page.getByRole("button", { name: "Send message button" }),
  ).toBeEnabled();

  await host.page.getByRole("button", { name: "Send message button" }).click();

  // Host should see their own message (auto-scrolled)
  await expect(
    host.page.getByText("Host message while scrolled up"),
  ).toBeVisible();

  // Cleanup
  await Promise.all(contexts.map((context) => context.close()));
});
