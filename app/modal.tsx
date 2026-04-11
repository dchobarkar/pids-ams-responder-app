import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Radii, Spacing, withAlpha } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ModalScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const router = useRouter();

  return (
    <AppShell contentStyle={styles.content}>
      <SurfacePanel style={styles.container}>
        <StatusPill label="Modal Surface" tone="shell" />
        <ThemedText type="title">Preview panel</ThemedText>
        <ThemedText
          lightColor={palette.mutedText}
          darkColor={palette.mutedText}
        >
          Modal screens now inherit the same warm canvas, raised panel
          treatment, and action styling as the rest of the app shell.
        </ThemedText>

        <View
          style={[
            styles.previewStrip,
            {
              backgroundColor: withAlpha(palette.primary, 0.08),
              borderColor: withAlpha(palette.primary, 0.18),
            },
          ]}
        >
          <MaterialIcons
            name="shutter-speed"
            size={18}
            color={palette.primary}
          />
          <ThemedText type="defaultSemiBold">
            Shared tokens make future feature screens consistent.
          </ThemedText>
        </View>

        <View style={styles.actionWrap}>
          <AppButton
            label="Back to overview"
            onPress={() => router.replace("/")}
            variant="secondary"
            icon={
              <MaterialIcons
                name="arrow-back"
                size={18}
                color={palette.buttonSecondaryText}
              />
            }
          />
        </View>
      </SurfacePanel>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    gap: Spacing.lg,
  },
  previewStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  actionWrap: {
    borderRadius: Radii.button,
    overflow: "hidden",
  },
});
