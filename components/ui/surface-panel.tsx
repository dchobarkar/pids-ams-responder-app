import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { Radii, Shadows, Spacing, withAlpha } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type SurfacePanelProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  variant?: "panel" | "inset" | "shell";
}>;

export function SurfacePanel({
  children,
  style,
  variant = "panel",
}: SurfacePanelProps) {
  const card = useThemeColor({}, "card");
  const panel = useThemeColor({}, "panel");
  const shell = useThemeColor({}, "shellMuted");
  const border = useThemeColor({}, "border");
  const shellBorder = useThemeColor({}, "shellBorder");

  const backgroundColor =
    variant === "shell" ? shell : variant === "inset" ? panel : card;
  const borderColor =
    variant === "shell"
      ? withAlpha(shellBorder, 0.92)
      : withAlpha(border, 0.92);
  const shadowStyle =
    variant === "shell"
      ? Shadows.shell
      : variant === "inset"
        ? Shadows.quiet
        : Shadows.card;

  return (
    <View
      style={[
        styles.base,
        shadowStyle,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radii.card,
    padding: Spacing.lg,
  },
});
