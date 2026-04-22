import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { postAlarmAcknowledgement } from "@/lib/api/workflow";

export default function AcknowledgeScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const router = useRouter();
  const auth = useAuth();
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputBg = useThemeColor(
    { light: palette.card, dark: palette.card },
    "card",
  );
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const pickAndSubmit = async () => {
    if (!alarmId) return;
    if (!remarks.trim()) {
      setError("Remarks are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("remarks", remarks.trim());

      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          setError("Photo library permission is required for evidence.");
          setSubmitting(false);
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 0.85,
        });
        if (!result.canceled && result.assets?.length) {
          for (const asset of result.assets) {
            if (asset.uri) {
              formData.append("evidence", {
                uri: asset.uri,
                name: asset.fileName ?? "evidence.jpg",
                type: asset.mimeType ?? "image/jpeg",
              } as unknown as Blob);
            }
          }
        }
      }

      await postAlarmAcknowledgement(alarmId, formData, auth.getApiDeps());
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell header={<ThemedText type="title">Acknowledge</ThemedText>}>
      <SurfacePanel>
        <ThemedText type="eyebrow">Remarks</ThemedText>
        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Required"
          placeholderTextColor={palette.mutedText}
          multiline
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor,
              color: textColor,
            },
          ]}
        />
        {Platform.OS === "web" ? (
          <ThemedText
            style={{ marginTop: Spacing.sm }}
            lightColor={palette.mutedText}
            darkColor={palette.mutedText}
          >
            Evidence upload uses native builds; web can submit remarks only if
            the API allows it.
          </ThemedText>
        ) : (
          <ThemedText
            style={{ marginTop: Spacing.sm }}
            lightColor={palette.mutedText}
            darkColor={palette.mutedText}
          >
            You will be prompted to attach images after tapping Submit.
          </ThemedText>
        )}
        {error ? (
          <ThemedText
            style={{ color: palette.highlight, marginTop: Spacing.sm }}
          >
            {error}
          </ThemedText>
        ) : null}
        <View style={styles.btn}>
          <AppButton
            label={submitting ? "Submitting…" : "Submit"}
            onPress={() => void pickAndSubmit()}
            disabled={submitting}
          />
        </View>
      </SurfacePanel>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radii.button,
    padding: Spacing.md,
    minHeight: 100,
    textAlignVertical: "top",
  },
  btn: {
    marginTop: Spacing.lg,
    borderRadius: Radii.button,
    overflow: "hidden",
  },
});
