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
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const router = useRouter();

  return (
    <AppShell
      header={
        <SurfacePanel style={styles.hero}>
          <View style={styles.heroTopRow}>
            <StatusPill label="Responder Mobile" tone="primary" />
            <StatusPill label="Theme Synced" tone="accent" />
          </View>

          <View style={styles.heroTitleBlock}>
            <ThemedText type="title" style={styles.heroTitle}>
              PIDS AMS field shell
            </ThemedText>
            <ThemedText
              lightColor={palette.mutedText}
              darkColor={palette.mutedText}
            >
              The mobile app now shares the same palette, surface treatment,
              shell contrast, rounded geometry, and operational tone as the web
              app.
            </ThemedText>
          </View>

          <View style={styles.heroActions}>
            <View style={styles.actionWrap}>
              <AppButton
                label="Open preview"
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
                label="Browse tokens"
                onPress={() => router.push("/explore")}
                variant="secondary"
                icon={
                  <MaterialIcons
                    name="palette"
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
      <View style={styles.metricsRow}>
        <SurfacePanel variant="inset" style={styles.metricCard}>
          <ThemedText
            type="eyebrow"
            lightColor={palette.mutedText}
            darkColor={palette.mutedText}
          >
            Page Surface
          </ThemedText>
          <ThemedText type="subtitle">Warm neutral</ThemedText>
          <ThemedText type="mono">
            {palette.background.toUpperCase()}
          </ThemedText>
        </SurfacePanel>
        <SurfacePanel variant="inset" style={styles.metricCard}>
          <ThemedText
            type="eyebrow"
            lightColor={palette.mutedText}
            darkColor={palette.mutedText}
          >
            Primary Action
          </ThemedText>
          <ThemedText type="subtitle">Signal blue</ThemedText>
          <ThemedText type="mono">{palette.primary.toUpperCase()}</ThemedText>
        </SurfacePanel>
      </View>

      <SurfacePanel>
        <ThemedText type="subtitle">Shared surface language</ThemedText>
        <ThemedText
          lightColor={palette.mutedText}
          darkColor={palette.mutedText}
        >
          Cards use the same soft neutral stack as the dashboard, while the tab
          shell below mirrors the dark operator chrome. Buttons, borders, and
          status chips now all come from the same token set.
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
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: Spacing.xs,
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
