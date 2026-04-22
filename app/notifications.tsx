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
import { ThemedText } from "@/components/themed-text";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useBootstrap } from "@/contexts/bootstrap-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getNotifications,
  normalizeNotificationList,
  postNotificationRead,
  postNotificationsReadAll,
} from "@/lib/api/notifications";
import type { NotificationItem } from "@/lib/api/types/domain";

export default function NotificationsScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const router = useRouter();
  const auth = useAuth();
  const { refresh: refreshBootstrap } = useBootstrap();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getNotifications(auth.getApiDeps());
      setItems(normalizeNotificationList(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
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

  const markRead = async (id: string) => {
    await postNotificationRead(id, auth.getApiDeps());
    await load();
    await refreshBootstrap();
  };

  const markAll = async () => {
    await postNotificationsReadAll(auth.getApiDeps());
    await load();
    await refreshBootstrap();
  };

  const label = (n: NotificationItem) =>
    String(n.title ?? n.message ?? n.type ?? n.id);

  return (
    <AppShell
      scrollable={false}
      header={
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.headerTitle}>
            Notifications
          </ThemedText>
          <Pressable onPress={() => void markAll()} hitSlop={8}>
            <ThemedText
              type="defaultSemiBold"
              style={{ color: palette.primary }}
            >
              Mark all read
            </ThemedText>
          </Pressable>
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
              onPress={() => {
                void markRead(item.id);
                const alarmId =
                  typeof item.alarmId === "string"
                    ? item.alarmId
                    : typeof item.alarm_id === "string"
                      ? item.alarm_id
                      : null;
                if (alarmId) {
                  router.push(`/alarms/${encodeURIComponent(alarmId)}`);
                }
              }}
            >
              <SurfacePanel style={styles.card}>
                <ThemedText type="defaultSemiBold">{label(item)}</ThemedText>
                {item.read === false ? (
                  <ThemedText
                    lightColor={palette.mutedText}
                    darkColor={palette.mutedText}
                  >
                    Unread
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
              No notifications.
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
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  headerTitle: {
    flex: 1,
    minWidth: 120,
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
