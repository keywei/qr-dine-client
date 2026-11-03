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
        citron: {
          DEFAULT: '#c5d82d',
          dark: '#b4c725',
          light: '#f5f9dd',
          text: '#1a2010',
        },
        terracotta: {
          DEFAULT: '#d95338',
          dark: '#b83b22',
          light: '#fbeee9',
        },
        olive: {
          DEFAULT: '#607234',
          dark: '#485626',
          light: '#eff3e4',
        },
        warm: {
          canvas: '#f8f7f2',
          card: '#ffffff',
          border: '#e8e6df',
        },
      },
    },
  },
  plugins: [],
}

