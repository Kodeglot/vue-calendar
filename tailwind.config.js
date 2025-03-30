/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',  
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  safelist: [
    {
      pattern: /bg-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(100|500)/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /border-l-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(500)/,
      variants: ['hover', 'focus']
    }
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require( '@tailwindcss/forms' ),
    require( '@tailwindcss/typography' )
  ],
}
