import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfacePanel } from "@/components/ui/surface-panel";
import {
  Colors,
  Radii,
  Spacing,
  Typography,
  withAlpha,
} from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const router = useRouter();
  const { user } = useAuth();

  return (
    <AppShell
      header={
        <SurfacePanel style={styles.hero}>
          <View style={styles.heroTopRow}>
            <StatusPill label="Responder Mobile" tone="primary" />
            <StatusPill label="Signed in" tone="accent" />
          </View>

          <View style={styles.heroTitleBlock}>
            <ThemedText type="title" style={styles.heroTitle}>
              Home
            </ThemedText>
            <ThemedText
              lightColor={palette.mutedText}
              darkColor={palette.mutedText}
            >
              Operational overview. GPS tracking and patrol sync will connect
              here in later phases.
            </ThemedText>
          </View>

          <View style={styles.heroActions}>
            <View style={styles.actionWrap}>
              <AppButton
                label="Open theme preview"
                onPress={() => router.push("/modal")}
                icon={
                  <MaterialIcons
                    name="visibility"
                    size={18}
                    color={palette.shellText}
                  />
                }
              />
            </View>
            <View style={styles.actionWrap}>
              <AppButton
                label="Profile"
                onPress={() => router.push("/(tabs)/profile")}
                variant="secondary"
                icon={
                  <MaterialIcons
                    name="person"
                    size={18}
                    color={palette.buttonSecondaryText}
                  />
                }
              />
            </View>
          </View>
        </SurfacePanel>
      }
    >
      <SurfacePanel variant="inset" style={styles.summary}>
        <ThemedText
          type="eyebrow"
          lightColor={palette.mutedText}
          darkColor={palette.mutedText}
        >
          Signed in as
        </ThemedText>
        <ThemedText type="subtitle">{user?.name ?? "—"}</ThemedText>
        <ThemedText type="mono" style={styles.roleLine}>
          {user?.role ?? ""}
        </ThemedText>
      </SurfacePanel>

      <SurfacePanel>
        <ThemedText type="subtitle">Next steps</ThemedText>
        <ThemedText
          lightColor={palette.mutedText}
          darkColor={palette.mutedText}
        >
          Background GPS, local queue, and patrol session APIs will land per the
          product roadmap. Mobile API v1 covers authentication and profile only.
        </ThemedText>
        <View style={styles.swatchRow}>
          {[
            { label: "Primary", color: palette.primary },
            { label: "Accent", color: palette.accent },
            { label: "Highlight", color: palette.highlight },
            { label: "Shell", color: palette.shell },
          ].map((item) => (
            <View
              key={item.label}
              style={[
                styles.swatch,
                {
                  backgroundColor: withAlpha(
                    item.color,
                    item.label === "Shell" ? 0.96 : 0.14,
                  ),
                  borderColor: withAlpha(
                    item.color,
                    item.label === "Shell" ? 0.3 : 0.24,
                  ),
                },
              ]}
            >
              <View
                style={[styles.swatchDot, { backgroundColor: item.color }]}
              />
              <ThemedText type="defaultSemiBold">{item.label}</ThemedText>
            </View>
          ))}
        </View>
      </SurfacePanel>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  heroTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  heroTitleBlock: {
    gap: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.h1 + 2,
    lineHeight: 40,
  },
  heroActions: {
    gap: Spacing.sm,
  },
  actionWrap: {
    borderRadius: Radii.button,
    overflow: "hidden",
  },
  summary: {
    gap: Spacing.xs,
  },
  roleLine: {
    marginTop: Spacing.xs,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  swatch: {
    minWidth: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
});
