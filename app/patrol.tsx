import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useBootstrap } from "@/contexts/bootstrap-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getPatrolCurrent,
  patchPatrolSessionStop,
  postPatrolSession,
} from "@/lib/api/patrol";
import type { PatrolSessionInfo } from "@/lib/api/types/domain";

export default function PatrolScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const auth = useAuth();
  const { refresh: refreshBootstrap } = useBootstrap();
  const [session, setSession] = useState<PatrolSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getPatrolCurrent(auth.getApiDeps());
      setSession(res.session ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load patrol");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    void load();
  }, [load]);

  const start = async () => {
    setBusy(true);
    try {
      await postPatrolSession(auth.getApiDeps());
      await load();
      await refreshBootstrap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Start failed");
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    if (!session?.sessionId) return;
    setBusy(true);
    try {
      await patchPatrolSessionStop(session.sessionId, auth.getApiDeps());
      await load();
      await refreshBootstrap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stop failed");
    } finally {
      setBusy(false);
    }
  };

  const role = auth.user?.role ?? "";
  const isRmp = role === "RMP";

  return (
    <AppShell header={<ThemedText type="title">Patrol</ThemedText>}>
      {!isRmp ? (
        <SurfacePanel variant="inset">
          <ThemedText
            lightColor={palette.mutedText}
            darkColor={palette.mutedText}
          >
            Patrol session controls are intended for RMP. Other roles may use
            GPS features when enabled by the backend.
          </ThemedText>
        </SurfacePanel>
      ) : null}

      {loading ? (
        <ActivityIndicator color={palette.primary} />
      ) : error ? (
        <ThemedText style={{ color: palette.highlight }}>{error}</ThemedText>
      ) : (
        <SurfacePanel>
          <ThemedText type="subtitle">Session</ThemedText>
          {session ? (
            <>
              <ThemedText type="mono">{session.sessionId}</ThemedText>
              <ThemedText
                lightColor={palette.mutedText}
                darkColor={palette.mutedText}
              >
                Started {session.startedAt}
              </ThemedText>
            </>
          ) : (
            <ThemedText
              lightColor={palette.mutedText}
              darkColor={palette.mutedText}
            >
              No active patrol session.
            </ThemedText>
          )}
          <View style={styles.actions}>
            {session ? (
              <AppButton
                label={busy ? "Stopping…" : "Stop patrol"}
                onPress={() => void stop()}
                disabled={busy}
                variant="secondary"
              />
            ) : (
              <AppButton
                label={busy ? "Starting…" : "Start patrol"}
                onPress={() => void start()}
                disabled={busy}
              />
            )}
          </View>
        </SurfacePanel>
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: Spacing.lg,
    borderRadius: 12,
    overflow: "hidden",
  },
});
