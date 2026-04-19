import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function Index() {
  const { status } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  if (status === "loading") {
    return (
      <View style={[styles.centered, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (status === "signedIn") {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
