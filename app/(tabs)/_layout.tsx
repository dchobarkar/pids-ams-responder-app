import { Tabs, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Radii, Shadows, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "signedOut") {
      router.replace("/(auth)/login");
    }
  }, [status, router]);

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: palette.background },
        tabBarActiveTintColor: palette.tabIconSelected,
        tabBarInactiveTintColor: palette.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          Shadows.shell,
          {
            backgroundColor: palette.shell,
            borderColor: palette.shellBorder,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
    height: 78,
    borderRadius: Radii.card,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: {
    borderRadius: Radii.button,
    marginHorizontal: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
