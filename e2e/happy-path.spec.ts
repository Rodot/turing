import { test } from "@playwright/test";

test("multi-user game flow", async ({ browser }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();

  // HOST: Sign up and create a room
  await host.goto("/");
  await host.getByLabel("Your name").fill("HostPlayer");
  await host.locator('button[type="submit"]').click();
  await host.getByRole("button", { name: "New Game" }).waitFor();
  await host.getByRole("button", { name: "New Game" }).click();

  // HOST: Wait for room to be created and get the URL
  await host.getByText("Invite Link").waitFor();

  // Get the current URL which contains the room ID
  const roomUrl = host.url();

  // GUEST: Navigate to the app, sign up, and join the room
  await guest.goto(roomUrl);
  await guest.getByLabel("Your name").fill("GuestPlayer");
  await guest.locator('button[type="submit"]').click();
  await guest.getByRole("button", { name: "Join Game" }).waitFor();
  await guest.getByRole("button", { name: "Join Game" }).click();

  // HOST: In the lobby
  await host.getByText("HostPlayer (you)").waitFor();
  await host.getByText("GuestPlayer").waitFor();

  // GUEST: In the lobby
  await guest.getByText("GuestPlayer (you)").waitFor();
  await guest.getByText("Waiting for HostPlayer").waitFor();

  // HOST: Start the game
  await host.getByRole("button", { name: "Start Game" }).waitFor();
  await host.getByRole("button", { name: "Start Game" }).click();

  // get human ai roles
  const hostIsAI = await guest
    .getByText("Send a message as GuestPlayer")
    .isVisible();
  const human = hostIsAI ? host : guest;
  const ai = hostIsAI ? guest : host;

  // HUMAN: Send a message
  await human.locator('input[type="text"]').fill("Hello");
  await human.locator('button[type="submit"]').click();

  // AI: Check if the message is received
  await ai.getByText("Hello").waitFor();

  // AI: Generate answers
  await ai.getByRole("button", { name: "AI Answers" }).click();
});
