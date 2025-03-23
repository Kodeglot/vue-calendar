module.exports = {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './dist/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb'
        }
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false // Disable Tailwind's base styles to avoid conflicts
  }
}
