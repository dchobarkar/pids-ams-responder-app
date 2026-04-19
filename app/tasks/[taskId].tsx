import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getTasks, normalizeTaskList } from "@/lib/api/tasks";
import type { TaskSummary } from "@/lib/api/types/domain";
import { postAcceptAssignment } from "@/lib/api/workflow";

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const auth = useAuth();
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const [task, setTask] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async () => {
    if (!taskId) return;
    setError(null);
    try {
      const res = await getTasks(
        { scope: "my", page: 1, pageSize: 100 },
        auth.getApiDeps(),
      );
      const found = normalizeTaskList(res).find((t) => t.id === taskId);
      setTask(found ?? null);
      if (!found) {
        setError("Task not found in the current list.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load task");
    } finally {
      setLoading(false);
    }
  }, [taskId, auth]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = async () => {
    const aid =
      task?.assignmentId ??
      (typeof task?.assignment_id === "string" ? task.assignment_id : null);
    if (!aid) return;
    setAccepting(true);
    try {
      await postAcceptAssignment(aid, auth.getApiDeps());
      await load();
    } finally {
      setAccepting(false);
    }
  };

  return (
    <AppShell
      header={
        <ThemedText type="title">
          {task ? String(task.code ?? task.id) : "Task"}
        </ThemedText>
      }
    >
      {loading ? (
        <ActivityIndicator color={palette.primary} />
      ) : error ? (
        <ThemedText style={{ color: palette.highlight }}>{error}</ThemedText>
      ) : task ? (
        <ScrollView>
          {task.canAcceptAssignment ? (
            <View style={styles.actions}>
              <AppButton
                label={accepting ? "Accepting…" : "Accept assignment"}
                onPress={() => void accept()}
                disabled={accepting}
              />
            </View>
          ) : null}
          <SurfacePanel style={styles.block}>
            {Object.entries(task)
              .filter(([k]) => !k.startsWith("can"))
              .slice(0, 32)
              .map(([k, v]) => (
                <View key={k} style={styles.row}>
                  <ThemedText type="eyebrow">{k}</ThemedText>
                  <ThemedText>
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </ThemedText>
                </View>
              ))}
          </SurfacePanel>
        </ScrollView>
      ) : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginBottom: Spacing.md,
    borderRadius: 12,
    overflow: "hidden",
  },
  block: {
    gap: Spacing.sm,
  },
  row: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
});
