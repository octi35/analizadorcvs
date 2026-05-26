import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#080c14",
        card: "#0f1623",
        border: "#1e2d45",
        accent: {
          blue: "#3b82f6",
          green: "#22c55e",
          red: "#ef4444",
          yellow: "#f59e0b",
        },
        text: "#e2e8f0",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "border-dance": {
          "0%, 100%": { borderColor: "#1e2d45" },
          "50%": { borderColor: "#3b82f6" },
        },
        "draw-arc": {
          "0%": { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "var(--final-offset)" },
        },
      },
      animation: {
        "border-dance": "border-dance 2.5s ease-in-out infinite",
        "draw-arc": "draw-arc 1.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
