export const themeTokens = {
  colors: {
    brand: {
      primary: '#266DC9',   // Main Blue (Buttons / Active states)
      hover: '#80B0EB',     // Darker Blue (Button Hover)
      light: '#eff6ff',     // Soft Blue Tint (Badges / Highlights)
    },
    neutral: {
      light: '#f3f4f6',     // Light Grey (Component BG / Secondary Buttons)
      surface: '#9ca3af',   // Medium Grey (Borders / Muted Text)
      dark: '#374151',      // Dark Grey (Hover states / Card outlines)
    },
    base: {
      white: '#ffffff',
      offWhite: '#faf9f7',
      black: '#09090b',
    },
  },
} as const;

export type ThemeTokens = typeof themeTokens;