import type { ApiErrorBody } from "@/lib/api/types";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    code: string,
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function parseErrorResponse(
  response: Response,
): Promise<ApiError> {
  const status = response.status;
  const statusBit = [status, response.statusText].filter(Boolean).join(" ");
  let code = "UNKNOWN";
  let fieldErrors: Record<string, string> | undefined;

  const raw = await response.text();
  try {
    const data = JSON.parse(raw) as ApiErrorBody;
    if (data?.error) {
      code = data.error.code;
      fieldErrors = data.error.fieldErrors;
      return new ApiError(code, data.error.message, status, fieldErrors);
    }
  } catch {
    // not JSON — fall through
  }

  const trimmed = raw.trim();
  let message: string;
  if (trimmed.length > 0 && trimmed.length < 500) {
    message = `HTTP ${statusBit || status || "?"}: ${trimmed}`;
  } else {
    message = `HTTP ${statusBit || status || "error"} (empty or non-JSON body). If you use Expo web, enable CORS on the API for this origin and set EXPO_PUBLIC_API_BASE_URL to your backend base URL.`;
  }

  return new ApiError(code, message, status, fieldErrors);
}
