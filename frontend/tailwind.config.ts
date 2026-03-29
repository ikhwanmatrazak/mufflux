import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseGlow: { "0%, 100%": { boxShadow: "0 0 5px #D400A8" }, "50%": { boxShadow: "0 0 20px #D400A8, 0 0 40px #D400A8" } },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#D400A8",
              foreground: "#FFFFFF",
              50: "#fce4f8",
              100: "#f9bdf0",
              200: "#f48fe6",
              300: "#ef60da",
              400: "#e832ce",
              500: "#D400A8",
              600: "#aa0086",
              700: "#800064",
              800: "#560043",
              900: "#2b0022",
            },
            secondary: {
              DEFAULT: "#F5C200",
              foreground: "#0A0A0A",
              50: "#fff9e0",
              100: "#fff1b3",
              200: "#ffe980",
              300: "#ffe04d",
              400: "#ffd81a",
              500: "#F5C200",
              600: "#c49b00",
              700: "#937400",
              800: "#624d00",
              900: "#312700",
            },
            background: "#0A0A0A",
            foreground: "#FFFFFF",
            focus: "#D400A8",
            content1: "#111111",
            content2: "#1a1a1a",
            content3: "#222222",
            content4: "#2a2a2a",
            divider: "#333333",
          },
        },
      },
      defaultTheme: "dark",
    }),
  ],
};

export default config;
