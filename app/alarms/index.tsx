import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { AppShell } from "@/components/app-shell";
import { NotificationBell } from "@/components/notification-bell";
import { ThemedText } from "@/components/themed-text";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useBootstrap } from "@/contexts/bootstrap-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAlarms, normalizeAlarmList } from "@/lib/api/alarms";
import type { AlarmSummary } from "@/lib/api/types/domain";

export default function AlarmsListScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const router = useRouter();
  const auth = useAuth();
  const { refresh: refreshBootstrap } = useBootstrap();
  const [items, setItems] = useState<AlarmSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getAlarms({ page: 1, pageSize: 50 }, auth.getApiDeps());
      setItems(normalizeAlarmList(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load alarms");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
    void refreshBootstrap();
  }, [load, refreshBootstrap]);

  const label = (a: AlarmSummary) =>
    String(a.code ?? a.title ?? a.id ?? "Alarm");

  return (
    <AppShell
      scrollable={false}
      header={
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.headerTitle}>
            Alarms
          </ThemedText>
          <NotificationBell />
        </View>
      }
    >
      {loading ? (
        <ActivityIndicator color={palette.primary} />
      ) : error ? (
        <SurfacePanel variant="inset">
          <ThemedText style={{ color: palette.highlight }}>{error}</ThemedText>
          <ThemedText
            style={{ marginTop: Spacing.sm }}
            lightColor={palette.mutedText}
            darkColor={palette.mutedText}
          >
            Pull down to retry when you are back online.
          </ThemedText>
        </SurfacePanel>
      ) : (
        <FlatList
          style={styles.list}
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push(`/alarms/${encodeURIComponent(item.id)}`)
              }
            >
              <SurfacePanel style={styles.card}>
                <ThemedText type="defaultSemiBold">{label(item)}</ThemedText>
                {item.status != null ? (
                  <ThemedText
                    lightColor={palette.mutedText}
                    darkColor={palette.mutedText}
                  >
                    {String(item.status)}
                  </ThemedText>
                ) : null}
              </SurfacePanel>
            </Pressable>
          )}
          ListEmptyComponent={
            <ThemedText
              lightColor={palette.mutedText}
              darkColor={palette.mutedText}
            >
              No alarms.
            </ThemedText>
          }
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.sm,
    paddingBottom: 40,
  },
  card: {
    marginBottom: Spacing.sm,
  },
});
