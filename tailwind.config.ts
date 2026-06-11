import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class", ".dark"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "var(--font-space-grotesk)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.3" }],
        xs: ["11px", { lineHeight: "1.35" }],
        sm: ["12px", { lineHeight: "1.5" }],
        base: ["13px", { lineHeight: "1.5" }],
        md: ["15px", { lineHeight: "1.4" }],
        lg: ["18px", { lineHeight: "1.3" }],
        xl: ["22px", { lineHeight: "1.25" }],
        "2xl": ["28px", { lineHeight: "1.2" }],
        "3xl": ["40px", { lineHeight: "1.1" }],
      },
      letterSpacing: {
        caps: "0.18em",
      },
      colors: {
        border: {
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--border-strong))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        faint: "hsl(var(--faint))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          strong: "hsl(var(--primary-strong))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          strong: "hsl(var(--accent-strong))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
          "soft-foreground": "hsl(var(--accent-soft-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          strong: "hsl(var(--brand-strong))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          hover: "hsl(var(--surface-hover))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        panel: {
          DEFAULT: "hsl(var(--panel))",
          foreground: "hsl(var(--panel-foreground))",
        },
        timeline: {
          DEFAULT: "hsl(var(--timeline))",
          block: "hsl(var(--timeline-block))",
          "block-active": "hsl(var(--timeline-block-active))",
          grid: "hsl(var(--timeline-gridline))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
      },
      borderRadius: {
        xs: "3px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "12px",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        pop: "var(--shadow-pop)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "pulse-subtle": "pulse-subtle 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
