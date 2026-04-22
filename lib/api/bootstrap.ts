import type { AuthFetchDeps } from "@/lib/api/authenticated-fetch";
import { authFetchJsonGet } from "@/lib/api/authenticated-fetch";
import type { BootstrapResponse } from "@/lib/api/types/domain";

export async function getBootstrap(
  deps: AuthFetchDeps,
): Promise<BootstrapResponse> {
  return authFetchJsonGet<BootstrapResponse>("/bootstrap", deps);
}
