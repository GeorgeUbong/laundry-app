export const themeTokens = {
  colors: {
    brand: {
      primary: '#2563eb',   // Main Blue (Buttons / Active states)
      hover: '#1d4ed8',     // Darker Blue (Button Hover)
      light: '#eff6ff',     // Soft Blue Tint (Badges / Highlights)
    },
    neutral: {
      light: '#f3f4f6',     // Light Grey (Component BG / Secondary Buttons)
      surface: '#9ca3af',   // Medium Grey (Borders / Muted Text)
      dark: '#374151',      // Dark Grey (Hover states / Card outlines)
    },
    base: {
      white: '#ffffff',
      black: '#09090b',
    },
  },
} as const;

export type ThemeTokens = typeof themeTokens;