import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ApiError } from "@/lib/api/errors";

export default function LoginScreen() {
  const router = useRouter();
  const { status, signIn } = useAuth();
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inputBg = useThemeColor(
    { light: palette.card, dark: palette.card },
    "card",
  );
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = palette.mutedText;

  useEffect(() => {
    if (status === "signedIn") {
      router.replace("/(tabs)");
    }
  }, [status, router]);

  const onSubmit = useCallback(async () => {
    setErrorMessage(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (e) {
      if (e instanceof ApiError) {
        setErrorMessage(e.message);
        if (e.fieldErrors && Object.keys(e.fieldErrors).length > 0) {
          setFieldErrors(e.fieldErrors);
        }
        if (e.code === "FORBIDDEN_ROLE" || e.code === "INVALID_CREDENTIALS") {
          setErrorMessage(e.message);
        }
      } else {
        setErrorMessage(
          e instanceof Error ? e.message : "Something went wrong.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [email, password, signIn, router]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Sign in
            </ThemedText>
            <ThemedText
              lightColor={palette.mutedText}
              darkColor={palette.mutedText}
            >
              Field assignee accounts only (SUPERVISOR, RMP, QRV, NPV, ER).
            </ThemedText>
          </View>

          <SurfacePanel style={styles.form}>
            {errorMessage ? (
              <ThemedText style={[styles.banner, { color: palette.highlight }]}>
                {errorMessage}
              </ThemedText>
            ) : null}

            <ThemedText type="eyebrow">Email</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              placeholder="you@example.com"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor,
                  color: textColor,
                },
              ]}
            />
            {fieldErrors.email ? (
              <ThemedText style={styles.fieldErr}>
                {fieldErrors.email}
              </ThemedText>
            ) : null}

            <ThemedText type="eyebrow" style={styles.labelSpacer}>
              Password
            </ThemedText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
              placeholder="••••••••"
              placeholderTextColor={placeholderColor}
              style={[
                styles.input,
                {
                  backgroundColor: inputBg,
                  borderColor,
                  color: textColor,
                },
              ]}
            />
            {fieldErrors.password ? (
              <ThemedText style={styles.fieldErr}>
                {fieldErrors.password}
              </ThemedText>
            ) : null}

            {fieldErrors.installId ? (
              <ThemedText style={styles.fieldErr}>
                {fieldErrors.installId}
              </ThemedText>
            ) : null}

            <View style={styles.buttonWrap}>
              <AppButton
                label={submitting ? "Signing in…" : "Sign in"}
                onPress={() => void onSubmit()}
                disabled={submitting}
              />
            </View>
          </SurfacePanel>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.h1 + 2,
    lineHeight: 40,
  },
  form: {
    gap: Spacing.sm,
  },
  banner: {
    marginBottom: Spacing.sm,
  },
  labelSpacer: {
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.button,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  fieldErr: {
    color: "#c62828",
    fontSize: 13,
  },
  buttonWrap: {
    marginTop: Spacing.md,
    borderRadius: Radii.button,
    overflow: "hidden",
  },
});
