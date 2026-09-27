import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        space: {
          900: "#04040a",
          800: "#080816",
          700: "#0c0c20",
          600: "#12122c",
          500: "#1a1a3a",
        }
      },
    },
  },
  plugins: [],
};
export default config;
