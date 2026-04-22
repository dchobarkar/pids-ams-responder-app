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
import { getTasks, normalizeTaskList } from "@/lib/api/tasks";
import type { TaskSummary } from "@/lib/api/types/domain";

/** Supervisor coverage: tasks with `scope=visible`. */
export default function AssignmentsScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const router = useRouter();
  const auth = useAuth();
  const { refresh: refreshBootstrap } = useBootstrap();
  const [items, setItems] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getTasks(
        { scope: "visible", page: 1, pageSize: 50 },
        auth.getApiDeps(),
      );
      setItems(normalizeTaskList(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignments");
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

  const label = (t: TaskSummary) =>
    String(t.code ?? t.title ?? t.alarmCode ?? t.id ?? "Assignment");

  return (
    <AppShell
      scrollable={false}
      header={
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.headerTitle}>
            Assignments
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
                router.push(`/tasks/${encodeURIComponent(item.id)}`)
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
              No assignments.
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
