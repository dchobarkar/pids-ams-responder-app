import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { type Href, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { AppShell } from "@/components/app-shell";
import { NotificationBell } from "@/components/notification-bell";
import { ThemedText } from "@/components/themed-text";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Colors, Radii, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { useBootstrap } from "@/contexts/bootstrap-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type HubItem = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  href: Href;
  supervisorOnly?: boolean;
};

const HUB: HubItem[] = [
  {
    key: "alarms",
    title: "Alarms",
    subtitle: "Active alarms and actions",
    icon: "warning",
    href: "/alarms",
  },
  {
    key: "tasks",
    title: "Tasks",
    subtitle: "Your actionable worklist",
    icon: "assignment",
    href: "/tasks",
  },
  {
    key: "assignments",
    title: "Assignments",
    subtitle: "Coverage across chainages",
    icon: "supervisor-account",
    href: "/assignments",
    supervisorOnly: true,
  },
  {
    key: "consolidated",
    title: "Consolidated",
    subtitle: "History-oriented view",
    icon: "history",
    href: "/consolidated",
  },
  {
    key: "patrol",
    title: "Patrol",
    subtitle: "Session start / stop",
    icon: "my-location",
    href: "/patrol",
  },
  {
    key: "notifications",
    title: "Notifications",
    subtitle: "In-app messages",
    icon: "notifications",
    href: "/notifications",
  },
  {
    key: "theme",
    title: "Theme preview",
    subtitle: "Design tokens",
    icon: "palette",
    href: "/modal",
  },
];

export default function HomeHubScreen() {
  const theme = useColorScheme() ?? "light";
  const palette = Colors[theme];
  const router = useRouter();
  const { user } = useAuth();
  const { data: bootstrap, error: bootError, refresh } = useBootstrap();
  const isSupervisor = user?.role === "SUPERVISOR";

  const items = HUB.filter((h) => !h.supervisorOnly || isSupervisor);

  return (
    <AppShell
      header={
        <SurfacePanel style={styles.hero}>
          <View style={styles.heroTopRow}>
            <StatusPill label="Home" tone="primary" />
            <NotificationBell />
          </View>
          <View style={styles.heroTitleBlock}>
            <ThemedText type="title" style={styles.heroTitle}>
              {user?.role ?? "Responder"}
            </ThemedText>
            <ThemedText
              lightColor={palette.mutedText}
              darkColor={palette.mutedText}
            >
              Open a section — everything else uses stack navigation (no extra
              tab bar clutter).
            </ThemedText>
          </View>
          {bootError ? (
            <View style={styles.bootErr}>
              <ThemedText style={{ color: palette.highlight }}>
                {bootError}
              </ThemedText>
              <Pressable onPress={() => void refresh()}>
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: palette.primary }}
                >
                  Retry
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
          {bootstrap?.unreadNotificationCount != null ? (
            <ThemedText
              lightColor={palette.mutedText}
              darkColor={palette.mutedText}
            >
              Unread notifications: {bootstrap.unreadNotificationCount}
            </ThemedText>
          ) : null}
        </SurfacePanel>
      }
    >
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [
              styles.card,
              {
                opacity: pressed ? 0.85 : 1,
                borderColor: palette.border,
                backgroundColor: palette.card,
              },
            ]}
          >
            <MaterialIcons name={item.icon} size={28} color={palette.primary} />
            <View style={styles.cardText}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText
                lightColor={palette.mutedText}
                darkColor={palette.mutedText}
              >
                {item.subtitle}
              </ThemedText>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={palette.mutedText}
            />
          </Pressable>
        ))}
      </View>

      <SurfacePanel variant="inset">
        <ThemedText type="eyebrow">Signed in as</ThemedText>
        <ThemedText type="subtitle">{user?.name ?? "—"}</ThemedText>
        <ThemedText type="mono">{user?.email ?? ""}</ThemedText>
      </SurfacePanel>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing.md,
    paddingTop: Spacing.xl,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitleBlock: {
    gap: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.h1 + 2,
    lineHeight: 40,
  },
  grid: {
    gap: Spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radii.card,
    borderWidth: 1,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  bootErr: {
    gap: Spacing.xs,
  },
});
