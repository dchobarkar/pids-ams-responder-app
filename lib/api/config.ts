function resolveApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error(
      "Missing required EXPO_PUBLIC_API_BASE_URL. Define it in your local env or EAS environment before starting the app.",
    );
  }

  const normalized = raw.replace(/\/+$/, "");

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      `Invalid EXPO_PUBLIC_API_BASE_URL: "${raw}". Expected an absolute http(s) URL.`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid EXPO_PUBLIC_API_BASE_URL protocol: "${parsed.protocol}". Expected http or https.`,
    );
  }

  return normalized;
}

const API_BASE_URL = resolveApiBaseUrl();

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export const MOBILE_V1_PATH = "/api/mobile/v1";
