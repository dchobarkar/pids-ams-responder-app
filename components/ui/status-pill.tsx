import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Radii, Spacing, withAlpha } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type StatusPillProps = {
  label: string;
  tone?: "primary" | "accent" | "highlight" | "shell";
};

export function StatusPill({ label, tone = "primary" }: StatusPillProps) {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const colorMap = {
    primary: palette.primary,
    accent: palette.accent,
    highlight: palette.highlight,
    shell: palette.shellMuted,
  } as const;

  const backgroundColor =
    tone === "shell"
      ? withAlpha(colorMap[tone], 0.9)
      : withAlpha(colorMap[tone], 0.12);
  const borderColor =
    tone === "shell"
      ? withAlpha(palette.shellBorder, 0.92)
      : withAlpha(colorMap[tone], 0.28);
  const textColor = tone === "shell" ? palette.shellText : colorMap[tone];

  return (
    <View style={[styles.pill, { backgroundColor, borderColor }]}>
      <ThemedText type="eyebrow" style={[styles.label, { color: textColor }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
  },
  label: {
    letterSpacing: 0.8,
  },
});
