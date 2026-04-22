import { Stack } from "expo-router";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TasksLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.raised },
        headerTintColor: palette.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Tasks" }} />
      <Stack.Screen name="[taskId]" options={{ title: "Task" }} />
    </Stack>
  );
}
