const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--inter-font)", ...fontFamily.sans],
        sans: ["var(--inter-font)", ...fontFamily.sans],
        mono: ["var(--noto-sans-mono-font)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
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
      animation: {
        wiggle: "wiggle .3s ease-in-out 1",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
