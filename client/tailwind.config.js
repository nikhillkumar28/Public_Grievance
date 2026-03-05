/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          navy: "#0f2747",
          blue: "#1d4ed8",
          sky: "#eaf2ff",
          green: "#1f7a4c",
          amber: "#d97706",
          red: "#b42318",
          slate: "#f8fafc"
        }
      },
      boxShadow: {
        civic: "0 10px 30px rgba(15, 39, 71, 0.08)"
      }
    }
  },
  plugins: []
};
