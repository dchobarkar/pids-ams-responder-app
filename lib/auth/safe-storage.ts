import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Prefix for web localStorage keys (SecureStore is not available on web).
 */
const WEB_LS_PREFIX = "__pids_ams__";

function webStorage(): Storage | null {
  if (typeof globalThis === "undefined") return null;

  try {
    if ("localStorage" in globalThis)
      return (globalThis as unknown as { localStorage: Storage }).localStorage;
  } catch {
    return null;
  }
  return null;
}

/**
 * SecureStore on iOS/Android; localStorage on web so Expo web / localhost works.
 */
export async function safeGetItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    const ls = webStorage();
    return ls?.getItem(WEB_LS_PREFIX + key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

export async function safeSetItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    const ls = webStorage();
    if (!ls) throw new Error("Web storage is not available.");

    ls.setItem(WEB_LS_PREFIX + key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function safeDeleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    const ls = webStorage();
    ls?.removeItem(WEB_LS_PREFIX + key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
