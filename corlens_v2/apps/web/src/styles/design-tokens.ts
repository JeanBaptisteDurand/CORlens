export const designTokens = {
  colors: {
    bg: {
      primary: "#020409",
      secondary: "#070B14",
      tertiary: "#0B0F1C",
      surface: "#070B14",
      panel: "#0B0F1C",
    },
    text: {
      primary: "#F4F6FA",
      secondary: "#8A93A6",
      tertiary: "#7C8AA0",
      muted: "#5A6483",
    },
    border: {
      subtle: "rgba(244,246,250,0.08)",
      default: "rgba(244,246,250,0.14)",
      strong: "rgba(244,246,250,0.22)",
    },
    brand: {
      50: "#F2F6FF",
      100: "#E1E9FF",
      200: "#C3D3FF",
      300: "#A7BFFF",
      400: "#8FB4FF",
      500: "#6E8FDD",
      600: "#3B5BA8",
      700: "#2E4785",
      800: "#223464",
      900: "#182449",
      950: "#0F1830",
    },
    slate: {
      50: "#F4F6FA",
      100: "#E4E7F0",
      200: "#C5CBE0",
      300: "#9AAAD0",
      400: "#7C8AA0",
      500: "#5A6483",
      600: "#3E465E",
      700: "#262C42",
      800: "#12172A",
      900: "#070B14",
      950: "#020409",
    },
    risk: {
      high: "#ef4444",
      med: "#f59e0b",
      low: "#6b7280",
      safe: "#10b981",
    },
    overlay: {
      graphMask: "rgba(2, 4, 9, 0.82)",
    },
  },
  gradients: {},
  typography: {
    fontFamily: {
      base: "'Sora', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
    },
    fontSize: {
      xs: "0.625rem",
      sm: "0.75rem",
      base: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.5rem",
      xxl: "3rem",
    },
    letterSpacing: {
      tight: "-0.025em",
      wide: "0.08em",
      wider: "0.2em",
    },
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
  },
  radius: {
    sm: "0px",
    md: "0px",
    lg: "0px",
    xl: "0px",
    pill: "9999px",
  },
  shadow: {
    soft: "0 8px 24px rgba(2, 4, 9, 0.4)",
    glow: "0 0 1px #8FB4FF, 0 0 12px rgba(110,163,255,0.55), 0 0 28px rgba(110,163,255,0.28)",
  },
  layout: {
    navbarHeight: "3.5rem",
    gridSize: "60px 60px",
    nodeDetailWidth: "320px",
  },
} as const;

type Primitive = string | number;
type TokenTree = { [key: string]: Primitive | TokenTree };

function flattenTokens(tree: TokenTree, path: string[] = []): Array<[string, Primitive]> {
  return Object.entries(tree).flatMap(([key, value]) => {
    const nextPath = [...path, key];
    if (typeof value === "string" || typeof value === "number") {
      return [[nextPath.join("-"), value]];
    }
    return flattenTokens(value as TokenTree, nextPath);
  });
}

export function applyDesignTokens(root: HTMLElement = document.documentElement): void {
  for (const [name, value] of flattenTokens(designTokens as unknown as TokenTree)) {
    root.style.setProperty(`--token-${name}`, String(value));
  }
}
