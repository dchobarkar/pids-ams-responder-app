import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
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
import { postAlarmVerification } from "@/lib/api/workflow";

export default function VerifyScreen() {
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const router = useRouter();
  const auth = useAuth();
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const [remarks, setRemarks] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputBg = useThemeColor(
    { light: palette.card, dark: palette.card },
    "card",
  );
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const fillLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Location permission is required for verification.");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setLat(String(pos.coords.latitude));
    setLng(String(pos.coords.longitude));
  };

  const submit = async () => {
    if (!alarmId) return;
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setError("Latitude and longitude are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
      formData.append("remarks", remarks.trim());

      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.granted) {
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
      }

      await postAlarmVerification(alarmId, formData, auth.getApiDeps());
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell header={<ThemedText type="title">Verify</ThemedText>}>
      <SurfacePanel>
        <View style={styles.row}>
          <AppButton
            label="Use current location"
            onPress={() => void fillLocation()}
            variant="secondary"
          />
        </View>
        <ThemedText type="eyebrow">Latitude</ThemedText>
        <TextInput
          value={lat}
          onChangeText={setLat}
          keyboardType="decimal-pad"
          placeholder="e.g. 19.076"
          placeholderTextColor={palette.mutedText}
          style={[
            styles.single,
            {
              backgroundColor: inputBg,
              borderColor,
              color: textColor,
            },
          ]}
        />
        <ThemedText type="eyebrow" style={styles.gap}>
          Longitude
        </ThemedText>
        <TextInput
          value={lng}
          onChangeText={setLng}
          keyboardType="decimal-pad"
          placeholder="e.g. 72.8777"
          placeholderTextColor={palette.mutedText}
          style={[
            styles.single,
            {
              backgroundColor: inputBg,
              borderColor,
              color: textColor,
            },
          ]}
        />
        <ThemedText type="eyebrow" style={styles.gap}>
          Remarks
        </ThemedText>
        <TextInput
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Optional"
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
        {error ? (
          <ThemedText
            style={{ color: palette.highlight, marginTop: Spacing.sm }}
          >
            {error}
          </ThemedText>
        ) : null}
        <View style={styles.btn}>
          <AppButton
            label={submitting ? "Submitting…" : "Submit verification"}
            onPress={() => void submit()}
            disabled={submitting}
          />
        </View>
      </SurfacePanel>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: Spacing.md,
    borderRadius: Radii.button,
    overflow: "hidden",
  },
  single: {
    borderWidth: 1,
    borderRadius: Radii.button,
    padding: Spacing.md,
    fontSize: 16,
  },
  gap: {
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.button,
    padding: Spacing.md,
    minHeight: 88,
    textAlignVertical: "top",
  },
  btn: {
    marginTop: Spacing.lg,
    borderRadius: Radii.button,
    overflow: "hidden",
  },
});
