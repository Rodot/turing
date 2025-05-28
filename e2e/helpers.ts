import { Page } from "@playwright/test";

interface ConsoleError {
  page: string;
  type: string;
  message: string;
}

export function setupConsoleLogging(
  pages: Page[],
  testName = "TEST",
  ignoredErrorPatterns: string[] = [],
) {
  const consoleErrors: ConsoleError[] = [];

  pages.forEach((page, index) => {
    const pageLabel = index === 0 ? "HOST" : `GUEST${index}`;
    page.on("console", (msg) => {
      const message = msg.text();
      console.log(`${testName} ${pageLabel} [${msg.type()}]:`, message);

      // Collect console errors
      if (msg.type() === "error") {
        // Check if this error should be ignored
        const shouldIgnore = ignoredErrorPatterns.some((pattern) =>
          message.includes(pattern),
        );

        if (!shouldIgnore) {
          consoleErrors.push({
            page: pageLabel,
            type: msg.type(),
            message: message,
          });
        }
      }
    });
  });

  // Return a function to check for console errors
  return {
    checkForConsoleErrors: () => {
      if (consoleErrors.length > 0) {
        const errorMessages = consoleErrors
          .map((error) => `${error.page}: ${error.message}`)
          .join("\n");
        throw new Error(`Console errors detected:\n${errorMessages}`);
      }
    },
    getConsoleErrors: () => consoleErrors,
  };
}
