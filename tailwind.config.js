/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',  
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './demo/**/*.{vue,js,ts,jsx,tsx}'
  ],
  safelist: [
    // Background colors for events
    {
      pattern: /bg-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'group-hover']
    },
    // Border colors for events
    {
      pattern: /border-(l-)?(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'group-hover']
    },
    // Text colors
    {
      pattern: /text-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus', 'group-hover']
    },
    // Common utility classes
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500',
    'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'border-gray-50', 'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500',
    'absolute', 'relative', 'fixed', 'sticky', 'top-0', 'bottom-0', 'left-0', 'right-0', 'inset-0',
    'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    'flex', 'flex-col', 'flex-row', 'flex-wrap', 'flex-nowrap', 'items-center', 'items-start', 'items-end',
    'justify-center', 'justify-between', 'justify-start', 'justify-end', 'grow', 'shrink',
    'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7',
    'p-1', 'p-2', 'p-3', 'p-4', 'px-1', 'px-2', 'px-3', 'px-4', 'py-1', 'py-2', 'py-3', 'py-4',
    'm-1', 'm-2', 'm-3', 'm-4', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mt-1', 'mt-2', 'mt-3', 'mt-4',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl',
    'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold',
    'text-center', 'text-left', 'text-right', 'whitespace-nowrap', 'truncate',
    'border', 'border-t', 'border-b', 'border-l', 'border-r', 'border-0', 'border-2', 'border-4',
    'rounded', 'rounded-lg', 'rounded-md', 'rounded-sm', 'rounded-full',
    'shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl',
    'opacity-0', 'opacity-10', 'opacity-20', 'opacity-30', 'opacity-40', 'opacity-50', 'opacity-60', 'opacity-70', 'opacity-80', 'opacity-90', 'opacity-100',
    'transition', 'transition-all', 'transition-opacity', 'transition-colors',
    'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
    'cursor-pointer', 'cursor-move', 'cursor-row-resize', 'cursor-col-resize',
    'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
    'min-h-screen', 'min-h-32', 'h-24', 'h-2', 'h-8', 'w-20', 'w-8', 'w-full',
    'gap-px', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-y-1', 'gap-y-2', 'gap-y-3', 'gap-y-4',
    'hover:bg-gray-100', 'hover:bg-blue-600', 'hover:bg-blue-700', 'hover:shadow-sm',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-primary-500',
    'group-hover:opacity-100',
    'event-transition', 'bg-opacity-10', 'pointer-events-none', 'container', 'mx-auto'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6', // blue-500
        }
      }
    },
  },
  plugins: [
    require( '@tailwindcss/forms' ),
    require( '@tailwindcss/typography' )
  ],
}
