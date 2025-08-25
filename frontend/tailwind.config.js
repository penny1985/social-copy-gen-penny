/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          beige: "#f4efe6",
          gold: "#bfa15a",
          deepgreen: "#0b3d2e"
        }
      },
      fontFamily: {
        sans: ['ui-sans-serif','system-ui','-apple-system','BlinkMacSystemFont','Segoe UI','Noto Sans TC','Helvetica','Arial','sans-serif']
      }
    }
  },
  plugins: [],
};
