import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radii, Shadows, Spacing, withAlpha } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: ReactNode;
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
}: AppButtonProps) {
  const primary = useThemeColor({}, "primary");
  const primaryHover = useThemeColor({}, "primaryHover");
  const secondaryBg = useThemeColor({}, "buttonSecondaryBg");
  const secondaryText = useThemeColor({}, "buttonSecondaryText");
  const secondaryBorder = useThemeColor({}, "buttonSecondaryBorder");
  const shellText = useThemeColor({}, "shellText");
  const danger = useThemeColor({}, "danger");
  const dangerHover = useThemeColor({}, "dangerHover");

  const backgroundColor =
    variant === "primary"
      ? primary
      : variant === "danger"
        ? danger
        : secondaryBg;
  const pressedColor =
    variant === "primary"
      ? primaryHover
      : variant === "danger"
        ? dangerHover
        : withAlpha(secondaryBg, 0.82);
  const borderColor =
    variant === "secondary"
      ? secondaryBorder
      : withAlpha(backgroundColor, 0.88);
  const textColor = variant === "secondary" ? secondaryText : shellText;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        Shadows.button,
        {
          backgroundColor: pressed ? pressedColor : backgroundColor,
          borderColor,
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <ThemedText style={[styles.label, { color: textColor }]}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: Radii.button,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "700",
  },
});
