import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { AssigneeOption } from "@/lib/api/types/domain";
import { getAssigneeOptions, postAlarmAssignment } from "@/lib/api/workflow";

function normalizeAssignees(res: {
  options?: AssigneeOption[];
  assignees?: AssigneeOption[];
}): AssigneeOption[] {
  return res.options ?? res.assignees ?? [];
}

export default function AssignScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const router = useRouter();
  const auth = useAuth();
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const [items, setItems] = useState<AssigneeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!alarmId) return;
    setError(null);
    try {
      const res = await getAssigneeOptions(alarmId, auth.getApiDeps());
      setItems(normalizeAssignees(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load assignees");
    } finally {
      setLoading(false);
    }
  }, [alarmId, auth]);

  useEffect(() => {
    void load();
  }, [load]);

  const assign = async (userId: string) => {
    if (!alarmId) return;
    setAssigning(userId);
    try {
      await postAlarmAssignment(
        alarmId,
        { assigneeUserId: userId },
        auth.getApiDeps(),
      );
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assign failed");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <AppShell
      scrollable={false}
      header={<ThemedText type="title">Assign</ThemedText>}
    >
      {loading ? (
        <ActivityIndicator color={palette.primary} />
      ) : error ? (
        <ThemedText style={{ color: palette.highlight }}>{error}</ThemedText>
      ) : (
        <FlatList
          style={styles.flex}
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => void assign(item.id)}
              disabled={assigning !== null}
            >
              <SurfacePanel style={styles.card}>
                <ThemedText type="defaultSemiBold">
                  {item.name ?? item.email ?? item.id}
                </ThemedText>
                {assigning === item.id ? (
                  <ThemedText
                    lightColor={palette.mutedText}
                    darkColor={palette.mutedText}
                  >
                    Assigning…
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
              No assignees.
            </ThemedText>
          }
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: 40,
  },
  card: {
    marginBottom: Spacing.sm,
  },
});
