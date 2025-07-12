export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    'postcss-prefix-selector': {
      prefix: '.vc-calendar',
      transform(prefix, selector, prefixedSelector) {
        // Don't prefix html, body, :root, or at-rules
        if (
          selector.startsWith('html') ||
          selector.startsWith('body') ||
          selector.startsWith(':root') ||
          selector.startsWith('@')
        ) {
          return selector;
        }
        return prefixedSelector;
      }
    }
  },
} 