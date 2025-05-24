import { headers } from "./cors.ts";

export function createErrorResponse(error: unknown): Response {
  console.error(error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const data = JSON.stringify({ error: errorMessage });
  return new Response(data, { headers, status: 400 });
}
