import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#162033",
    mutedText: "#5d6879",
    background: "#f1ede4",
    card: "#fbfaf6",
    panel: "#eee8dc",
    raised: "#fffdf9",
    border: "#d7d1c3",
    tint: "#2558f4",
    icon: "#5d6879",
    tabIconDefault: "#9eabc0",
    tabIconSelected: "#ffffff",
    primary: "#2558f4",
    primaryHover: "#1c43c7",
    secondary: "#162033",
    accent: "#158c84",
    highlight: "#d49729",
    focus: "#2558f4",
    shell: "#141d2d",
    shellMuted: "#1e2a43",
    shellBorder: "#31415d",
    shellText: "#f4f7fb",
    shellSubtle: "#9eabc0",
    buttonSecondaryBg: "#e9e3d7",
    buttonSecondaryText: "#22314a",
    buttonSecondaryBorder: "#cec6b7",
    danger: "#c84a3b",
    dangerHover: "#a4382b",
  },
  dark: {
    text: "#f4f7fb",
    mutedText: "#9eabc0",
    background: "#111926",
    card: "#192436",
    panel: "#22314a",
    raised: "#263651",
    border: "#31415d",
    tint: "#2558f4",
    icon: "#9eabc0",
    tabIconDefault: "#9eabc0",
    tabIconSelected: "#ffffff",
    primary: "#2558f4",
    primaryHover: "#4b78ff",
    secondary: "#f4f7fb",
    accent: "#1aa69d",
    highlight: "#e4ac37",
    focus: "#2558f4",
    shell: "#141d2d",
    shellMuted: "#1e2a43",
    shellBorder: "#31415d",
    shellText: "#f4f7fb",
    shellSubtle: "#9eabc0",
    buttonSecondaryBg: "#22314a",
    buttonSecondaryText: "#f4f7fb",
    buttonSecondaryBorder: "#31415d",
    danger: "#d95d4d",
    dangerHover: "#ef7868",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Typography = {
  h1: 32,
  h2: 26,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  caption: 12,
} as const;

export const Radii = {
  card: 24,
  button: 16,
  input: 18,
  pill: 999,
} as const;

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: "#151b28",
      shadowOpacity: 0.08,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 12 },
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  quiet: Platform.select({
    ios: {
      shadowColor: "#151b28",
      shadowOpacity: 0.05,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),
  shell: Platform.select({
    ios: {
      shadowColor: "#0a0e19",
      shadowOpacity: 0.22,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 18 },
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
  button: Platform.select({
    ios: {
      shadowColor: "#2558f4",
      shadowOpacity: 0.18,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),
} as const;

export const withAlpha = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return hex;
  }

  const clamped = Math.max(0, Math.min(alpha, 1));
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${clamped})`;
};
