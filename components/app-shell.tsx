import type { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Spacing, withAlpha } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type AppShellProps = PropsWithChildren<{
  header?: ReactNode;
  scrollProps?: ScrollViewProps;
  contentStyle?: StyleProp<ViewStyle>;
  /** Use with FlatList as child to avoid ScrollView nesting */
  scrollable?: boolean;
}>;

export function AppShell({
  children,
  header,
  scrollProps,
  contentStyle,
  scrollable = true,
}: AppShellProps) {
  const backgroundColor = useThemeColor({}, "background");
  const primary = useThemeColor({}, "primary");
  const accent = useThemeColor({}, "accent");

  const body = scrollable ? (
    <ScrollView
      {...scrollProps}
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {header}
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.listBody, contentStyle]}>
      {header}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.auraLayer}>
          <View
            style={[
              styles.auraOrb,
              styles.primaryOrb,
              { backgroundColor: withAlpha(primary, 0.14) },
            ]}
          />
          <View
            style={[
              styles.auraOrb,
              styles.secondaryOrb,
              { backgroundColor: withAlpha(accent, 0.12) },
            ]}
          />
        </View>
        {body}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  auraLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  auraOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  primaryOrb: {
    top: -100,
    right: -80,
    width: 260,
    height: 260,
  },
  secondaryOrb: {
    bottom: -100,
    left: -60,
    width: 220,
    height: 220,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl * 3,
    gap: Spacing.lg,
  },
  listBody: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl * 3,
    gap: Spacing.lg,
  },
});
