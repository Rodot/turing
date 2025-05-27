import { Page } from "@playwright/test";

export function setupConsoleLogging(pages: Page[], testName = "TEST") {
  pages.forEach((page, index) => {
    const pageLabel = index === 0 ? "HOST" : `GUEST${index}`;
    page.on("console", (msg) => {
      console.log(`${testName} ${pageLabel} [${msg.type()}]:`, msg.text());
    });
  });
}
