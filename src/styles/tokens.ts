/**
 * Design tokens — spacing scale (4px base) and semantic color keys.
 * Visual values live in `src/app/globals.css` as CSS variables.
 */

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

export const layoutSpacing = {
  pageX: "px-4 sm:px-6 lg:px-8",
  pageY: "py-4 sm:py-6",
  pageMax: "mx-auto w-full min-w-0 max-w-7xl",
  section: "space-y-6 sm:space-y-8",
  stackSm: "space-y-2",
  stackMd: "space-y-4",
  stackLg: "space-y-6",
  inlineSm: "gap-2",
  inlineMd: "gap-3 sm:gap-4",
  inlineLg: "gap-4 sm:gap-6",
} as const;

export const colors = {
  background: "background",
  foreground: "foreground",
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
  muted: "muted",
  card: "card",
  border: "border",
  destructive: "destructive",
} as const;

export type SpacingKey = keyof typeof spacing;
export type LayoutSpacingKey = keyof typeof layoutSpacing;
