const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--inter-font)", ...fontFamily.sans],
        sans: ["var(--inter-font)", ...fontFamily.sans],
        mono: ["var(--noto-sans-mono-font)", ...fontFamily.sans],
      },
      animation: {
        wiggle: "wiggle .3s ease-in-out 1",
      },
      keyframes: {
        wiggle: {
          "25%": {
            transform: "translateX(4px)",
          },
          "50%": {
            transform: "translateX(-4px)",
          },
          "75%": {
            transform: "translateX(4px)",
          },
        },
      },
    },
  },
  plugins: [require("daisyui")],
};
