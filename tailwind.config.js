/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // 關閉預設重置，避免破壞 Vant 4 元件庫樣式
  },
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f0f11',
          hover: '#222226',
        },
        coral: {
          DEFAULT: '#ff4d2e',
          light: '#fff1ee',
        },
        cobalt: {
          DEFAULT: '#2563eb',
          light: '#eff4ff',
        },
        softgray: {
          DEFAULT: '#f1f1f4',
          canvas: '#f7f7f9',
          border: '#e8e8ed',
        },
      },
    },
  },
  plugins: [],
}

