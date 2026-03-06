/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sexyblue: "#343A40",
        kindofwhite: "#eeeeee",
        darkgray: "#2a2a2a",
        capistor: {
          50: "#F8F9FA",
          100: "#E9ECEF",
          200: "#DEE2E6",
          300: "#CED4DA",
          400: "#ADB5BD",
          500: "#6C757D",
          600: "#495057",
          700: "#343A40",
          800: "#212529",
        },
      },
      width: {
        50: "12.5rem", // Example custom size
      },
      height: {
        50: "12.5rem", // Example custom size
      },

      fontFamily: {
        domine: ["Domine", "serif"],
        helvetica: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        fransisco: ["San Francisco"],
        lora: ["Lora", "serif"], // Added for accent text
        futura: ['Futura', 'sans-serif'],
      },

      animation: {
        bounce: "bounce 1s infinite",
      },
      keyframes: {
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
