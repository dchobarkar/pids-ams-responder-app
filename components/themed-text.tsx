import { StyleSheet, Text, type TextProps } from "react-native";

import { Fonts, Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "eyebrow"
    | "mono";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "eyebrow" ? styles.eyebrow : undefined,
        type === "mono" ? styles.mono : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.sans,
    fontSize: Typography.body,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: Fonts.sans,
    fontSize: Typography.body,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: Typography.h1,
    fontWeight: "800",
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: Typography.h3,
    lineHeight: 26,
    fontWeight: "700",
  },
  link: {
    fontFamily: Fonts.sans,
    fontSize: Typography.body,
    lineHeight: 24,
    color: "#2558f4",
    fontWeight: "600",
  },
  eyebrow: {
    fontFamily: Fonts.sans,
    fontSize: Typography.caption,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  mono: {
    fontFamily: Fonts.mono,
    fontSize: Typography.small,
    lineHeight: 20,
  },
});
