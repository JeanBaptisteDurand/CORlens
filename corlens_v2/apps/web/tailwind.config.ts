import type { Config } from "tailwindcss";
import { designTokens } from "./src/styles/design-tokens.js";

const { colors, spacing, typography, radius, shadow } = designTokens;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // The home hero drops its side-by-side globe layout here; used almost
      // exclusively through the auto-generated `max-hero:` variant.
      screens: { hero: "900px" },
      colors: {
        xrp: colors.brand,
        slate: colors.slate,
        app: {
          bg: colors.bg,
          text: colors.text,
          border: colors.border,
          risk: colors.risk,
        },
      },
      spacing,
      borderRadius: radius,
      boxShadow: shadow,
      fontSize: typography.fontSize,
      fontFamily: {
        sans: [typography.fontFamily.base],
        mono: [typography.fontFamily.mono],
      },
      letterSpacing: typography.letterSpacing,
    },
  },
  plugins: [],
} satisfies Config;
