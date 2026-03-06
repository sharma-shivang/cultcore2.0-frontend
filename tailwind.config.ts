import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        cta: "rgb(var(--cta) / <alpha-value>)",
        "cta-hover": "rgb(var(--cta-hover) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        "secondary-text": "rgb(var(--secondary-text) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
export default config;
