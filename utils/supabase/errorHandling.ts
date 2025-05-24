import { FunctionsResponse } from "@supabase/functions-js";

export async function extractSupabaseError(
  response: FunctionsResponse<any>,
  defaultMessage = "An error occurred",
): Promise<string> {
  // Try to extract error message from the response context
  if (response.error?.context) {
    try {
      const responseText = await response.error.context.text();
      const errorData = JSON.parse(responseText);
      if (errorData.error) {
        return errorData.error;
      }
    } catch (e) {
      // Fallback to generic message if parsing fails
      return response.error.message || defaultMessage;
    }
  }
  return response.error?.message || defaultMessage;
}
