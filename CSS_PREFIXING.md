# CSS Prefixing Solution for Vue Calendar Plugin

## Problem Solved

When importing CSS from a plugin (like `@kodeglot/vue-calendar/dist/style.css`) into a Vue app, all CSS selectors are applied globally. This can cause conflicts with the host app's styles, especially when using utility frameworks like Tailwind CSS.

### Symptoms of CSS Leakage:
- App-wide layouts (like Tailwind's grid) break or stop being responsive
- Styles from the calendar plugin "leak" into unrelated parts of the app
- Generic selectors like `.grid`, `.col-*`, or element selectors override host app styles

## Solution Implemented

### 1. CSS Prefixing with PostCSS

All CSS selectors are now prefixed with `.vc-calendar` to ensure they only apply within the calendar component.

**Configuration in `postcss.config.js`:**
```javascript
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
```

### 2. Component Structure

The main calendar component (`CalendarView.vue`) now includes the `vc-calendar` class as the root wrapper:

```vue
<template>
  <div
    :class="[
      'vc-calendar grow w-full flex flex-col',
      'bg-white rounded-xl shadow-lg overflow-hidden',
      'border border-gray-200',
      customClasses?.container,
    ]"
    :style="{ height: height }"
  >
    <!-- Calendar content -->
  </div>
</template>
```

The modal component (`EventModal.vue`) also includes the prefix:

```vue
<template>
  <Transition name="modal">
    <div
      v-if="isOpen"
      class="vc-calendar fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <!-- Modal content -->
    </div>
  </Transition>
</template>
```

## Result

After building, the generated CSS in `dist/style.css` now has all selectors prefixed:

```css
.vc-calendar .pointer-events-none { pointer-events: none }
.vc-calendar .invisible { visibility: hidden }
.vc-calendar .visible { visibility: visible }
.vc-calendar .absolute { position: absolute }
/* ... and so on for all Tailwind classes */
```

## Benefits

1. **No Style Leakage**: Calendar styles only apply within `.vc-calendar` elements
2. **Host App Safety**: Host app's Tailwind CSS or other styles remain unaffected
3. **Isolation**: Calendar plugin can be safely imported into any Vue app
4. **Maintainability**: Clear separation between plugin and host app styles

## Usage

When using the calendar plugin in a host app:

```vue
<template>
  <div>
    <!-- This will be styled by the host app -->
    <div class="grid grid-cols-3">
      <div>Host app content</div>
    </div>
    
    <!-- This will be styled by the calendar plugin -->
    <CalendarView />
  </div>
</template>
```

The host app's grid layout will work normally, while the calendar's styles are contained within the `.vc-calendar` wrapper.

## Dependencies

- `postcss-prefix-selector`: Added as a dev dependency for CSS prefixing
- No changes to existing dependencies required

## Testing

All existing tests pass, confirming that the prefixing doesn't break functionality while providing the necessary style isolation. 