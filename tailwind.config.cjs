/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
