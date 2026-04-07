/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          navy: "#1f2937",
          blue: "#2563eb",
          sky: "#eff6ff",
          green: "#22c55e",
          amber: "#eab308",
          red: "#ef4444",
          slate: "#f9fafb"
        }
      },
      boxShadow: {
        civic: "0 10px 30px rgba(15, 39, 71, 0.08)"
      }
    }
  },
  plugins: []
};
