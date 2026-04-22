import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/auth-context";
import { getBootstrap } from "@/lib/api/bootstrap";
import type { BootstrapResponse } from "@/lib/api/types/domain";

type BootstrapContextValue = {
  data: BootstrapResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const BootstrapContext = createContext<BootstrapContextValue | null>(null);

export function BootstrapProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [data, setData] = useState<BootstrapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (auth.status !== "signedIn") {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getBootstrap(auth.getApiDeps());
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bootstrap failed");
    } finally {
      setLoading(false);
    }
  }, [auth.status, auth.getApiDeps]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
      refresh,
    }),
    [data, loading, error, refresh],
  );

  return (
    <BootstrapContext.Provider value={value}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap(): BootstrapContextValue {
  const ctx = useContext(BootstrapContext);
  if (!ctx) {
    throw new Error("useBootstrap must be used within BootstrapProvider");
  }
  return ctx;
}
