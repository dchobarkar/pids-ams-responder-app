import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAlarmById, postAlarmSelfAssign } from "@/lib/api/alarms";
import type { AlarmSummary } from "@/lib/api/types/domain";

export default function AlarmDetailScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const router = useRouter();
  const auth = useAuth();
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const [alarm, setAlarm] = useState<AlarmSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!alarmId) return;
    setError(null);
    try {
      const res = await getAlarmById(alarmId, auth.getApiDeps());
      setAlarm(res.alarm);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alarm");
    } finally {
      setLoading(false);
    }
  }, [alarmId, auth]);

  useEffect(() => {
    void load();
  }, [load]);

  const lat =
    alarm && typeof alarm.latitude === "number"
      ? alarm.latitude
      : alarm && typeof alarm.lat === "number"
        ? alarm.lat
        : null;
  const lng =
    alarm && typeof alarm.longitude === "number"
      ? alarm.longitude
      : alarm && typeof alarm.lng === "number"
        ? alarm.lng
        : null;

  const openMaps = () => {
    if (lat != null && lng != null) {
      void Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
    }
  };

  const role = auth.user?.role ?? "";
  const isSupervisor = role === "SUPERVISOR";

  return (
    <AppShell
      header={
        <ThemedText type="title">
          {alarm ? String(alarm.code ?? alarm.id) : "Alarm"}
        </ThemedText>
      }
    >
      {loading ? (
        <ActivityIndicator color={palette.primary} />
      ) : error ? (
        <ThemedText style={{ color: palette.highlight }}>{error}</ThemedText>
      ) : alarm ? (
        <ScrollView>
          <SurfacePanel style={styles.block}>
            {Object.entries(alarm)
              .filter(([k]) => !k.startsWith("can"))
              .slice(0, 24)
              .map(([k, v]) => (
                <View key={k} style={styles.row}>
                  <ThemedText type="eyebrow">{k}</ThemedText>
                  <ThemedText>
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </ThemedText>
                </View>
              ))}
          </SurfacePanel>
          {lat != null && lng != null ? (
            <View style={styles.actions}>
              <AppButton label="Directions" onPress={openMaps} />
            </View>
          ) : null}
          {alarm.canSelfAssign ? (
            <View style={styles.actions}>
              <AppButton
                label="Self-assign"
                onPress={async () => {
                  try {
                    await postAlarmSelfAssign(alarmId!, auth.getApiDeps());
                    await load();
                  } catch {
                    /* optional toast */
                  }
                }}
                variant="secondary"
              />
            </View>
          ) : null}
          {alarm.canAcknowledge ? (
            <View style={styles.actions}>
              <AppButton
                label="Acknowledge"
                onPress={() =>
                  router.push(`/acknowledge/${encodeURIComponent(alarmId!)}`)
                }
              />
            </View>
          ) : null}
          {alarm.canVerify ? (
            <View style={styles.actions}>
              <AppButton
                label="Verify"
                onPress={() =>
                  router.push(`/verify/${encodeURIComponent(alarmId!)}`)
                }
              />
            </View>
          ) : null}
          {isSupervisor && alarm.canAssign ? (
            <View style={styles.actions}>
              <AppButton
                label="Assign"
                onPress={() =>
                  router.push(`/assign/${encodeURIComponent(alarmId!)}`)
                }
                variant="secondary"
              />
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.sm,
  },
  row: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  actions: {
    marginTop: Spacing.md,
    borderRadius: 12,
    overflow: "hidden",
  },
});
