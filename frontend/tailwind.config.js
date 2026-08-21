/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate: {
          150: "#e9edf3",
          205: "#e2e8f0",
          250: "#dce3ed",
          350: "#b5c2d4",
          450: "#8393a8",
          455: "#7c8ca3",
          650: "#4b5563",
          850: "#151e2e",
          855: "#111928",
          950: "#0b0f19",
          955: "#080d1a",
        },
      },
    },
  },
  plugins: [],
};
