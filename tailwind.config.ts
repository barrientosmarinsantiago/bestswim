import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        swim: {
          navy: "#020A18",
          ink: "#061327",
          cobalt: "#0D4BFF",
          cyan: "#18D8FF",
          aqua: "#7EF3FF",
          steel: "#AFC6E0",
          white: "#F7FBFF",
          lime: "#C7F94E",
          coral: "#FF6B4A",
          gold: "#FFC24B",
          mint: "#34D399",
          go: "#34D399"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glow: "0 0 40px rgba(24, 216, 255, 0.22)",
        "glow-coral": "0 0 40px rgba(255, 107, 74, 0.24)",
        "glow-go": "0 0 40px rgba(52, 211, 153, 0.26)",
        lift: "0 18px 60px rgba(0, 0, 0, 0.28)"
      },
      backgroundImage: {
        "grid-lines":
          "linear-gradient(rgba(126, 243, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(126, 243, 255, 0.08) 1px, transparent 1px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
