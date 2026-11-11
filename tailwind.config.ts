import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          dark: "#0F172A",
          navy: "#1E3A8A",
          accent: "#DC2626",
          slate: "#334155",
          light: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
export default config;
