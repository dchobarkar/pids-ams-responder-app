import { ThemeProvider, type Theme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { PatrolPingLoop } from "@/components/patrol-ping-loop";
import { Colors } from "@/constants/theme";
import { AuthProvider } from "@/contexts/auth-context";
import { BootstrapProvider } from "@/contexts/bootstrap-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "index",
};

export const RootLayout = () => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const navigationTheme: Theme = {
    dark: colorScheme === "dark",
    colors: {
      primary: palette.tint,
      background: palette.background,
      card: palette.card,
      text: palette.text,
      border: palette.border,
      notification: palette.highlight,
    },
    fonts: {
      regular: {
        fontFamily: "System",
        fontWeight: "400",
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500",
      },
      bold: {
        fontFamily: "System",
        fontWeight: "700",
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "800",
      },
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
        <BootstrapProvider>
          <PatrolPingLoop />

          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Theme Preview",
                headerStyle: { backgroundColor: palette.raised },
                headerTintColor: palette.text,
                headerShadowVisible: false,
              }}
            />

            <Stack.Screen
              name="notifications"
              options={{
                presentation: "modal",
                title: "Notifications",
                headerStyle: { backgroundColor: palette.raised },
                headerTintColor: palette.text,
                headerShadowVisible: false,
              }}
            />

            <Stack.Screen
              name="acknowledge/[alarmId]"
              options={{
                title: "Acknowledge",
                headerStyle: { backgroundColor: palette.raised },
                headerTintColor: palette.text,
                headerShadowVisible: false,
              }}
            />

            <Stack.Screen
              name="verify/[alarmId]"
              options={{
                title: "Verify",
                headerStyle: { backgroundColor: palette.raised },
                headerTintColor: palette.text,
                headerShadowVisible: false,
              }}
            />

            <Stack.Screen
              name="assign/[alarmId]"
              options={{
                title: "Assign",
                headerStyle: { backgroundColor: palette.raised },
                headerTintColor: palette.text,
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </BootstrapProvider>
      </AuthProvider>

      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
};

export default RootLayout;
