import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { ThemedText } from "@/components/themed-text";
import { AppButton } from "@/components/ui/app-button";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { useAuth } from "@/contexts/auth-context";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const { user, refreshProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);
      void (async () => {
        try {
          await refreshProfile();
        } catch (e) {
          if (!cancelled) {
            setError(
              e instanceof Error ? e.message : "Could not load profile.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [refreshProfile]),
  );

  const onSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }, [signOut]);

  return (
    <AppShell>
      <SurfacePanel style={styles.hero}>
        <StatusPill label="Account" tone="primary" />
        <ThemedText type="title">Profile</ThemedText>
        <ThemedText
          lightColor={palette.mutedText}
          darkColor={palette.mutedText}
        >
          Signed-in responder details from the server.
        </ThemedText>
      </SurfacePanel>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={palette.primary} />
        </View>
      ) : null}

      {error ? (
        <SurfacePanel variant="inset">
          <ThemedText style={{ color: palette.highlight }}>{error}</ThemedText>
        </SurfacePanel>
      ) : null}

      <SurfacePanel>
        <ThemedText type="eyebrow">Name</ThemedText>
        <ThemedText type="subtitle">{user?.name ?? "—"}</ThemedText>

        <View style={styles.gap} />

        <ThemedText type="eyebrow">Email</ThemedText>
        <ThemedText type="subtitle">{user?.email ?? "—"}</ThemedText>

        <View style={styles.gap} />

        <ThemedText type="eyebrow">Role</ThemedText>
        <ThemedText type="mono">{user?.role ?? "—"}</ThemedText>

        <View style={styles.gap} />

        <ThemedText type="eyebrow">Phone</ThemedText>
        <ThemedText type="subtitle">
          {user?.phone != null && user.phone !== ""
            ? user.phone
            : "—"}
        </ThemedText>

        <View style={styles.gap} />

        <ThemedText type="eyebrow">Active</ThemedText>
        <ThemedText type="subtitle">
          {user?.isActive === undefined
            ? "—"
            : user.isActive
              ? "Yes"
              : "No"}
        </ThemedText>
      </SurfacePanel>

      <View style={styles.buttonWrap}>
        <AppButton
          label={signingOut ? "Signing out…" : "Sign out"}
          onPress={() => void onSignOut()}
          disabled={signingOut}
          variant="secondary"
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.md,
  },
  loading: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  gap: {
    height: Spacing.md,
  },
  buttonWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
});
