import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: "#4A6741", // Deep olive green
        secondary: "#2C3B29", // Dark forest green
        accent: "#E8EDE7", // Light sage
        background: "#FAFDF9", // Off-white with slight green tint
        "text-primary": "#1A1F1A", // Almost black with slight green undertone
        success: "#68A063", // Bright olive
        warning: "#C5A572", // Warm gold
        error: "#B54141", // Muted red
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.5',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;