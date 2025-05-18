import { expect, Page, test } from "@playwright/test";

test("multi-user game flow", async ({ browser }) => {
  // Create contexts and pages for N players

  const contexts = await Promise.all(
    [1, 2, 3, 4].map(() => browser.newContext()),
  );
  const players = await Promise.all(
    contexts.map((context) => context.newPage()),
  );

  // Setup and join game

  const host = players[0] as Page;
  const guests = players.slice(1) as Page[];

  await host.goto("/");
  await host.getByLabel("Your name").fill("HostPlayerName");
  await host.getByLabel("Submit").click();
  await host.getByLabel("New Game").waitFor();
  await host.getByLabel("New Game").click();

  await host.getByText("Invite Link").waitFor();

  const gameUrl = host.url();

  for (const guest of guests) {
    await guest.goto(gameUrl);
    await guest.getByLabel("Your name").fill("GuestPlayerName");
    await guest.getByLabel("Submit").click();
    await guest.getByLabel("Join Game").waitFor();
    await guest.getByLabel("Join Game").click();
  }

  await expect(host.getByText("HostPlayerName (you)")).toHaveCount(1);
  await expect(host.getByText("GuestPlayerName")).toHaveCount(guests.length);

  for (const guest of guests) {
    await expect(guest.getByText("GuestPlayerName (you)")).toHaveCount(1);
    await expect(guest.getByText("GuestPlayerName")).toHaveCount(guests.length);
    await expect(guest.getByText("HostPlayerName")).toHaveCount(2);
  }

  await host.getByLabel("Start Game").waitFor();
  await host.getByLabel("Start Game").click();

  await host.waitForTimeout(1000);

  // Separate humans from ais

  const humans = [] as Page[];
  const ais = [] as Page[];
  for (const player of players) {
    try {
      if (await player.getByLabel("Message Input").isVisible()) {
        console.log("Found human");
        humans.push(player);
      }
    } catch {}
    try {
      if (await player.getByLabel("AI Answers").isVisible()) {
        console.log("Found AI");
        ais.push(player);
      }
    } catch {}
  }

  expect(humans.length).toBe(players.length - 1);
  expect(ais.length).toBe(1);

  // Send human messages

  await humans[0]
    ?.getByLabel("Message Input")
    .getByRole("textbox")
    .fill("Hello");
  await humans[0]?.getByLabel("Send message").click();

  for (const player of players) {
    await player.getByText("Hello").waitFor();
  }

  await humans[1]
    ?.getByLabel("Message Input")
    .getByRole("textbox")
    .fill("How are you?");
  await humans[1]?.getByLabel("Send message").click();

  for (const player of players) {
    await player.getByText("How are you?").waitFor();
  }

  // Send AI message

  await ais[0]?.getByLabel("AI Answers").click();
});
