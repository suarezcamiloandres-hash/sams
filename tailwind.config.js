/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        espresso: "#1D1207",
        "espresso-2": "#2A1B0C",
        crema: "#F7F3EB",
        "crema-2": "#EFE8DB",
        gold: "#C89B4A",
        "gold-deep": "#A87D35",
        leaf: "#5A6B3F",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        script: ["var(--font-alex-brush)", "cursive"],
      },
      keyframes: {
        "slide-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "slide-left": "slide-left 3s linear infinite",
        "spin-slow": "spin 6s linear infinite",
      },
    },
  },
};
