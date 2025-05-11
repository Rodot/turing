import { expect, Page, test } from "@playwright/test";

test("multi-user game flow", async ({ browser }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  const players = [host, guest];

  // HOST: Sign up and create a room
  await host.goto("/");
  await host.getByLabel("Your name").fill("HostPlayer");
  await host.getByLabel("Submit").click();
  await host.getByLabel("New Game").waitFor();
  await host.getByLabel("New Game").click();

  // HOST: Wait for room to be created and get the URL
  await host.getByText("Invite Link").waitFor();

  // Get the current URL which contains the room ID
  const roomUrl = host.url();

  // GUEST: Navigate to the app, sign up, and join the room
  await guest.goto(roomUrl);
  await guest.getByLabel("Your name").fill("GuestPlayer");
  await guest.getByLabel("Submit").click();
  await guest.getByLabel("Join Game").waitFor();
  await guest.getByLabel("Join Game").click();

  // HOST: In the lobby
  await host.getByText("HostPlayer (you)").waitFor();
  await host.getByText("GuestPlayer").waitFor();

  // GUEST: In the lobby
  await guest.getByText("GuestPlayer (you)").waitFor();
  await guest.getByText("Waiting for HostPlayer").waitFor();

  // HOST: Start the game
  await host.getByLabel("Start Game").waitFor();
  await host.getByLabel("Start Game").click();

  await host.waitForTimeout(1000);

  // Get human and ai roles
  const humans = [] as Page[];
  const ais = [] as Page[];
  for (const player of players) {
    console.log("Checking player");
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

  // HUMAN: Send a message
  await humans[0]
    ?.getByLabel("Message Input")
    .getByRole("textbox")
    .fill("Hello");
  await humans[0]?.getByLabel("Send message").click();

  // AI: Check if the message is received
  await ais[0]?.getByText("Hello").waitFor();

  // AI: Generate answers
  await ais[0]?.getByLabel("AI Answers").click();
});
