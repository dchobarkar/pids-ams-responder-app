import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useBootstrap } from "@/contexts/bootstrap-context";
import { useThemeColor } from "@/hooks/use-theme-color";

export function NotificationBell() {
  const router = useRouter();
  const { data } = useBootstrap();
  const tint = useThemeColor({}, "text");
  const count =
    typeof data?.unreadNotificationCount === "number"
      ? data.unreadNotificationCount
      : 0;

  return (
    <Pressable
      onPress={() => router.push("/notifications")}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
    >
      <MaterialIcons name="notifications-none" size={26} color={tint} />
      {count > 0 ? (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>
            {count > 99 ? "99+" : String(count)}
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: Spacing.xs,
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#c62828",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
