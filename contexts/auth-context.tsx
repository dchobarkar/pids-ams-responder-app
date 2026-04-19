import Constants from "expo-constants";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

import {
  getProfileWithRetry,
  postLogin,
  postLogoutWithRetry,
  postRefresh,
} from "@/lib/api/mobile-v1";
import type { MobileUser } from "@/lib/api/types";
import { getInstallId } from "@/lib/auth/install-id";
import {
  clearSession,
  isAccessExpired,
  loadStoredSession,
  saveSession,
} from "@/lib/auth/token-storage";

export type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthContextValue = {
  status: AuthStatus;
  user: MobileUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Used after 401 to rotate tokens and return new access token, or null if signed out */
  refreshAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<MobileUser | null>(null);

  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const expiresAtRef = useRef<string | null>(null);

  const refreshAccessTokenInner = useCallback(async (): Promise<
    string | null
  > => {
    const rt = refreshTokenRef.current;
    if (!rt) {
      return null;
    }
    try {
      const data = await postRefresh(rt);
      refreshTokenRef.current = data.refreshToken;
      accessTokenRef.current = data.accessToken;
      expiresAtRef.current = data.expiresAt;
      setUser(data.user);
      await saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        user: data.user,
      });
      return data.accessToken;
    } catch {
      accessTokenRef.current = null;
      refreshTokenRef.current = null;
      expiresAtRef.current = null;
      setUser(null);
      await clearSession();
      setStatus("signedOut");
      return null;
    }
  }, []);

  const ensureValidAccessToken = useCallback(async (): Promise<
    string | null
  > => {
    let access = accessTokenRef.current;
    const exp = expiresAtRef.current;
    if (access && exp && !isAccessExpired(exp)) {
      return access;
    }
    return refreshAccessTokenInner();
  }, [refreshAccessTokenInner]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    return refreshAccessTokenInner();
  }, [refreshAccessTokenInner]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = await loadStoredSession();
      if (cancelled) {
        return;
      }

      if (!stored.refreshToken) {
        setStatus("signedOut");
        return;
      }

      refreshTokenRef.current = stored.refreshToken;
      accessTokenRef.current = stored.accessToken;
      expiresAtRef.current = stored.expiresAt;

      if (stored.user) {
        setUser(stored.user);
      }

      const exp = stored.expiresAt;
      const access = stored.accessToken;

      if (access && exp && !isAccessExpired(exp)) {
        setStatus("signedIn");
        return;
      }

      try {
        const data = await postRefresh(stored.refreshToken);
        if (cancelled) {
          return;
        }
        refreshTokenRef.current = data.refreshToken;
        accessTokenRef.current = data.accessToken;
        expiresAtRef.current = data.expiresAt;
        setUser(data.user);
        await saveSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          user: data.user,
        });
        setStatus("signedIn");
      } catch {
        if (cancelled) {
          return;
        }
        await clearSession();
        refreshTokenRef.current = null;
        accessTokenRef.current = null;
        expiresAtRef.current = null;
        setUser(null);
        setStatus("signedOut");
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const installId = await getInstallId();
    const deviceName = Constants.deviceName ?? undefined;
    const appVersion = Constants.expoConfig?.version ?? undefined;
    const platform = Platform.OS;

    const data = await postLogin({
      email: email.trim(),
      password,
      installId,
      deviceName,
      platform,
      appVersion,
    });

    accessTokenRef.current = data.accessToken;
    refreshTokenRef.current = data.refreshToken;
    expiresAtRef.current = data.expiresAt;
    setUser(data.user);
    await saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      user: data.user,
    });
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    const access = accessTokenRef.current;
    if (access) {
      try {
        await postLogoutWithRetry(access, refreshAccessTokenInner);
      } catch {
        // Still clear local session
      }
    }
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    expiresAtRef.current = null;
    setUser(null);
    await clearSession();
    setStatus("signedOut");
  }, [refreshAccessTokenInner]);

  const refreshProfile = useCallback(async () => {
    const token = await ensureValidAccessToken();
    if (!token) {
      return;
    }
    const res = await getProfileWithRetry(token, refreshAccessTokenInner);
    setUser(res.user);
    const exp = expiresAtRef.current;
    const rt = refreshTokenRef.current;
    if (accessTokenRef.current && rt && exp) {
      await saveSession({
        accessToken: accessTokenRef.current,
        refreshToken: rt,
        expiresAt: exp,
        user: res.user,
      });
    }
  }, [ensureValidAccessToken, refreshAccessTokenInner]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn,
      signOut,
      refreshProfile,
      refreshAccessToken,
    }),
    [status, user, signIn, signOut, refreshProfile, refreshAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
