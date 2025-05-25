import { expect, Page, test } from "@playwright/test";

interface TestPlayer {
  name: string;
  page: Page;
  isAI?: boolean;
}

test("multi-user game flow", async ({ browser }) => {
  // Create contexts and pages for N players

  const contexts = await Promise.all([1, 2, 3].map(() => browser.newContext()));
  const pages = await Promise.all(contexts.map((context) => context.newPage()));

  const testPlayers: TestPlayer[] = pages.map((page, index) => ({
    name: `Player${index}`,
    page,
  }));

  // Setup and join game

  const [host, ...guests] = testPlayers;
  if (!host) throw new Error("No host player available");

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
    await guest.page.getByLabel("Join Game").click();
  }

  // Verify all players are visible in the lobby
  for (const player of testPlayers) {
    await expect(host.page.getByText(player.name, { exact: true })).toHaveCount(
      1,
    );
  }

  for (const guest of guests) {
    for (const player of testPlayers) {
      await expect(
        guest.page.getByText(player.name, { exact: true }),
      ).toHaveCount(1);
    }
  }

  await host.page.getByLabel("Start Game").waitFor();
  await host.page.getByLabel("Start Game").click();

  await host.page.waitForTimeout(3000);

  // Check initial warmup phase status
  await expect(host.page.getByText("Warming up")).toBeVisible();

  // Check that the ice breaker message (starting with 💡) is visible on mobile viewport
  await expect(host.page.getByText(/💡/).first()).toBeVisible();

  // During warmup phase, all players should be human and able to send messages
  // Each player needs to send 2 messages to trigger transition to hunt phase
  for (let i = 0; i < 2; i++) {
    for (const player of testPlayers) {
      await player.page
        .getByLabel("Message input")
        .getByRole("textbox")
        .fill(`Warmup message ${i + 1} from ${player.name}`);
      await player.page.getByLabel("Send message button").click();
    }
  }

  await expect(host.page.getByText("Find the AI")).toBeVisible();

  // Now determine which players are humans vs AI (after transition to hunt phase)
  for (const player of testPlayers) {
    try {
      if (await player.page.getByLabel("Message input").isVisible()) {
        console.log(`Found human: ${player.name}`);
        player.isAI = false;
      }
    } catch {}
    try {
      if (await player.page.getByLabel("AI Answers").isVisible()) {
        console.log(`Found AI: ${player.name}`);
        player.isAI = true;
      }
    } catch {}
  }

  const humans = testPlayers.filter((p) => p.isAI === false);
  const ais = testPlayers.filter((p) => p.isAI === true);

  expect(humans.length).toBe(testPlayers.length - 1);
  expect(ais.length).toBe(1);

  const [human1, human2] = humans;
  if (!human1 || !human2) throw new Error("Need at least 2 human players");
  const [aiPlayer] = ais;
  if (!aiPlayer) throw new Error("Need at least 1 AI player");

  // Send human messages

  await human1.page
    .getByLabel("Message input")
    .getByRole("textbox")
    .fill("Hello");
  await human1.page.getByLabel("Send message button").click();

  for (const player of testPlayers) {
    await player.page.getByText("Hello").waitFor();
  }

  await human2.page
    .getByLabel("Message input")
    .getByRole("textbox")
    .fill("How are you?");
  await human2.page.getByLabel("Send message button").click();

  for (const player of testPlayers) {
    await player.page.getByText("How are you?").waitFor();
  }

  // Test voting phase - start a vote
  await human1.page.getByLabel("Start Vote").click();

  // Wait for voting phase and check status changed
  await human1.page.waitForTimeout(4000); // Wait for the 3 second delay + transition
  await expect(human1.page.getByText("Vote now")).toBeVisible();

  // Verify voting interface is available for humans
  await expect(human1.page.getByText("Who was the AI? 🤖")).toBeVisible();
  await expect(human2.page.getByText("Who was the AI? 🤖")).toBeVisible();
});
