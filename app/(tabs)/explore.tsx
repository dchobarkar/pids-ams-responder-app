import { StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { Collapsible } from "@/components/ui/collapsible";
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

export default function TabTwoScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];

  return (
    <AppShell>
      <SurfacePanel style={styles.hero}>
        <StatusPill label="Design Tokens" tone="highlight" />
        <ThemedText type="title">Shared style guide</ThemedText>
        <ThemedText
          lightColor={palette.mutedText}
          darkColor={palette.mutedText}
        >
          This tab is now a compact reference for the mobile theme system
          derived from the web app.
        </ThemedText>
      </SurfacePanel>

      <SurfacePanel>
        <ThemedText type="subtitle">Palette</ThemedText>
        <View style={styles.paletteGrid}>
          {[
            { label: "Primary", color: palette.primary },
            { label: "Secondary", color: palette.secondary },
            { label: "Accent", color: palette.accent },
            { label: "Highlight", color: palette.highlight },
            { label: "Shell", color: palette.shell },
            { label: "Raised", color: palette.raised },
          ].map((item) => (
            <View key={item.label} style={styles.paletteCard}>
              <View
                style={[
                  styles.paletteSwatch,
                  {
                    backgroundColor: item.color,
                    borderColor: withAlpha(item.color, 0.24),
                  },
                ]}
              />
              <ThemedText type="defaultSemiBold">{item.label}</ThemedText>
              <ThemedText type="mono">{item.color.toUpperCase()}</ThemedText>
            </View>
          ))}
        </View>
      </SurfacePanel>

      <Collapsible title="Surface stack">
        <ThemedText>
          Use <ThemedText type="defaultSemiBold">background</ThemedText> for
          page chrome, <ThemedText type="defaultSemiBold">card</ThemedText> for
          primary content containers,{" "}
          <ThemedText type="defaultSemiBold">panel</ThemedText> for inset
          sections, and <ThemedText type="defaultSemiBold">shell</ThemedText>{" "}
          for navigation or operator chrome.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Typography">
        <ThemedText type="title" style={styles.typeSampleTitle}>
          Command-ready headline
        </ThemedText>
        <ThemedText>
          Body copy stays warm, readable, and operationally calm, while{" "}
          <ThemedText type="defaultSemiBold">eyebrows</ThemedText> and{" "}
          <ThemedText type="mono">monospace values</ThemedText> support
          dashboards and diagnostics.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Shape and elevation">
        <ThemedText>
          Cards use a{" "}
          <ThemedText type="defaultSemiBold">{Radii.card}px</ThemedText> radius,
          buttons use{" "}
          <ThemedText type="defaultSemiBold">{Radii.button}px</ThemedText>, and
          the tab shell carries the darker elevated treatment from the web
          layout.
        </ThemedText>
      </Collapsible>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.md,
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  paletteCard: {
    width: "47%",
    gap: Spacing.xs,
  },
  paletteSwatch: {
    height: 64,
    borderRadius: Radii.button,
    borderWidth: 1,
  },
  typeSampleTitle: {
    fontSize: Typography.h2,
    lineHeight: 32,
  },
});
