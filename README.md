# Vue Calendar 🗓️

[![npm version](https://img.shields.io/npm/v/@kodeglot/vue-calendar.svg)](https://www.npmjs.com/package/@kodeglot/vue-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/Kodeglot/vue-calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/Kodeglot/vue-calendar/actions)
[![Coverage](https://img.shields.io/codecov/c/github/Kodeglot/vue-calendar)](https://codecov.io/gh/Kodeglot/vue-calendar)
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://kodeglot.github.io/vue-calendar/)

A fully-featured, customizable calendar component for Vue 3 with built-in Tailwind CSS support. Perfect for building scheduling applications, event calendars, and date management systems.

## Live Demo

👉 [Try the Vue Calendar Live Demo on GitHub Pages](https://kodeglot.github.io/vue-calendar/)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Demo](#demo)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Customization](#customization)
- [Development](#development)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- 🎨 **Fully customizable** with Tailwind CSS
- ⚡️ **Lightweight and performant** Vue 3 component
- 🧩 **TypeScript support** with full type definitions
- 📱 **Responsive design** for all screen sizes
- 🔌 **Easy to integrate** with any Vue 3 project
- 🛡️ **CSS Style Isolation** - All styles prefixed with `.vc-calendar` to prevent conflicts with host apps
- 🖱️ **Drag and drop support** for event management with reliable time preservation
- 🖱️ **Click to create events** - Click on empty space to create new events with automatic time rounding
- 🖱️ **Improved event interaction**: Edit modal only opens on single click, not on drag or resize
- 🔄 **Reactive event updates**: Calendar updates instantly when events are added/edited
- 🎨 **22 customizable event colors** using Tailwind color palette
- 🗓️ **Multiple view modes** (month, week, day)
- 🔄 **Event resizing** with time snapping
- 📅 **All-day event support**
- 🎯 **Time-based positioning** with 5-minute snap intervals
- 🛠️ **Plugin architecture** for extensibility
- 🧪 **Comprehensive testing** with Vitest (177+ tests across all components)
- 🎨 **Enhanced visual hierarchy** with improved month view styling
- 📱 **Mobile-optimized modals** with fixed headers/footers and scrollable content
- 🔧 **Clean codebase** with regular maintenance and removal of unused code
- 🚫 **Demo events control** with `showDemoEvents` prop to prevent unwanted demo events in production

## Installation

### Using npm
```bash
npm install @kodeglot/vue-calendar date-fns date-fns-tz
```

### Using yarn
```bash
yarn add @kodeglot/vue-calendar date-fns date-fns-tz
```

### Using pnpm
```bash
pnpm add @kodeglot/vue-calendar date-fns date-fns-tz
```

### CDN
Add the following script tag to your HTML:
```html
<script src="https://unpkg.com/@kodeglot/vue-calendar/dist/vue-calendar.umd.js"></script>
```

## Demo

🚀 **Live Demo**: [https://kodeglot.github.io/vue-calendar/](https://kodeglot.github.io/vue-calendar/)

The demo showcases all the calendar features including:
- Multiple view modes (month, week, day)
- **Click to create events** with interactive guides
- Custom event content and modals
- Drag and drop functionality
- Event resizing
- Custom controls and navigation
- Event creation with metadata
- **Enhanced visual hierarchy** with improved styling
- **Mobile-optimized modals** with responsive design
- **Demo events** (enabled for testing purposes - disabled by default in production)

## Quick Start

### 1. Install Dependencies

```bash
npm install @kodeglot/vue-calendar pinia date-fns date-fns-tz
```

### 2. Basic Usage (No Demo Events)

```vue
<template>
  <CalendarView
    :show-demo-events="false"
    :initial-date="new Date()"
    :initial-view="'month'"
  />
</template>

<script setup lang="ts">
import { CalendarView } from '@kodeglot/vue-calendar'
</script>
```

**Important**: The `showDemoEvents` prop defaults to `false`, so your calendar will be clean without any demo events by default.

## CSS Style Isolation

The Vue Calendar plugin includes comprehensive CSS style isolation to prevent conflicts with your host application:

### ✅ Safe Integration
- All calendar styles are prefixed with `.vc-calendar`
- No interference with your app's Tailwind CSS or other styling frameworks
- Safe to use alongside any CSS framework or custom styles

### 🔧 How It Works
The calendar automatically wraps all its content with the `vc-calendar` class, ensuring that:
- Calendar styles only apply within the calendar component
- Your app's global styles remain unaffected
- No CSS conflicts or style leakage

### 📝 Usage Example
```vue
<template>
  <div>
    <!-- Your app's styles work normally -->
    <div class="grid grid-cols-3">
      <div>Your content</div>
    </div>
    
    <!-- Calendar styles are isolated -->
    <CalendarView />
  </div>
</template>
```

In this example, your app's grid layout will work normally, while the calendar's styles are completely isolated within the `.vc-calendar` wrapper.

### 2. Import Styles (REQUIRED)

**Important**: You must import the CSS file for the calendar to display correctly:

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import the calendar styles - THIS IS REQUIRED!
import '@kodeglot/vue-calendar/style.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

**Alternative import path** (if the above doesn't work):
```typescript
import '@kodeglot/vue-calendar/dist/style.css'
```

### 3. Setup Pinia Store

Create your calendar store using Pinia:

```typescript
// stores/calendarStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface CalendarEvent {
  id: string
  title: string
  description?: string // Optional event description
  location?: string   // Optional event location
  start: string        // ISO date string (UTC)
  end: string          // ISO date string (UTC)
  tailwindColor: string // Tailwind color name (e.g., 'blue', 'red', 'green')
  allDay?: boolean
  width?: number       // For event stacking
  left?: number        // For event positioning
  marginLeft?: number  // For event spacing
  order?: number       // Vertical stacking order
  metadata?: Record<string, any> // Custom key-value pairs for user-defined data
}

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<Map<string, CalendarEvent>>(new Map())
  const currentDate = ref(new Date())
  const selectedDate = ref<Date | null>(null)

  const addEvent = (event: CalendarEvent) => {
    if (!event.id) {
      event.id = uuidv4()
    }
    events.value.set(event.id, event)
  }

  const updateEventDateOnly = (eventId: string, newDate: Date) => {
    const event = events.value.get(eventId)
    if (event) {
      const start = new Date(event.start)
      const end = new Date(event.end)
      const duration = end.getTime() - start.getTime()

      const newStart = new Date(newDate)
      const newEnd = new Date(newStart.getTime() + duration)

      event.start = newStart.toISOString()
      event.end = newEnd.toISOString()
      events.value.set(eventId, event)
    }
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return Array.from(events.value.values()).filter(event =>
      new Date(event.start).toDateString() === date.toDateString()
    )
  }

  return {
    events,
    currentDate,
    selectedDate,
    addEvent,
    updateEventDateOnly,
    getEventsForDate
  }
})
```

### 4. Use the Calendar Component

```vue
<template>
  <CalendarView
    :initial-date="new Date()"
    :initial-view="'month'"
    :show-controls="true"
    :show-event-button="true"
    :enable-drag-drop="true"
    @event-created="handleEventCreated"
    @event-updated="handleEventUpdated"
    @event-deleted="handleEventDeleted"
  />
</template>

<script setup lang="ts">
import CalendarView from '@kodeglot/vue-calendar'

const handleEventCreated = (event) => {
  console.log('Event created:', event)
}

const handleEventUpdated = (event) => {
  console.log('Event updated:', event)
}

const handleEventDeleted = (eventId) => {
  console.log('Event deleted:', eventId)
}
</script>

## Click to Create Events

The calendar now supports creating events by clicking on empty space:

### Month View
- Click on any date cell to create an event at 9 AM on that date
- Previous/next month dates have a subtle gray background for better visual hierarchy

### Week/Day View  
- Click on any time slot to create an event at that specific time
- Times are automatically rounded to the nearest 5-minute interval
- All new events default to 1-hour duration

### Features
- **Automatic time rounding**: Times are rounded to the nearest 5 minutes for consistency
- **Default duration**: New events automatically span 1 hour
- **Visual feedback**: Clear indication of clickable areas
- **Cross-view consistency**: Works seamlessly across all view modes

## Event Interaction

The calendar provides intuitive event interaction across all views:

### Creating Events
- **Month View**: Click on empty date cells to create events at 9 AM on that date
- **Week/Day View**: Click on empty time slots to create events at that specific time
- **All Views**: Use the "Create Event" button for quick event creation

### Editing Events
- **Click on any event** to open the edit modal
- **Month View**: Events are draggable between days (preserves time)
- **Week/Day View**: Events can be dragged and resized with time snapping
- **All Views**: Edit modal provides full event management (title, time, color, delete)

### Drag and Drop
- **Month View**: Drag events between days while preserving original time
- **Week/Day View**: Drag events to new times and resize for duration changes
- **Time Preservation**: Moving events between days maintains the original time components

## Debug Logging

Vue Calendar includes a comprehensive debug logging system that helps with development and troubleshooting:

### Automatic Debug Mode

- **Development**: Debug logs are automatically enabled when running `npm run dev`
- **Production**: Debug logs are disabled by default to keep builds clean
- **Conditional Output**: All debug logs are wrapped in conditional checks

### Browser Console Controls

You can control debug mode directly from the browser console:

```javascript
// Enable debug mode
__enableCalendarDebug()

// Disable debug mode  
__disableCalendarDebug()

// Check current debug status
__getCalendarDebugStatus()
```

### Debug Coverage

The debug system logs comprehensive information about:

- **Calendar Lifecycle**: Component mounting, updates, and cleanup
- **User Interactions**: Clicks, drags, resizes, and navigation
- **Event Operations**: Creation, updates, deletions, and movements
- **Data Flow**: Store updates, event filtering, and reactivity
- **Performance**: Timing for expensive operations
- **Errors**: Detailed error information with context

### Using Debug in Your Code

```typescript
import { debug } from '@kodeglot/vue-calendar'

// Basic logging
debug.log('User clicked event:', eventId)

// Warning and error logging
debug.warn('Event not found:', eventId)
debug.error('Failed to update event:', error)

// Grouped logging for complex operations
debug.group('Event Drag Operation')
debug.log('Drag started:', { eventId, startTime })
debug.log('Drag position:', { x, y })
debug.groupEnd()

// Performance timing
debug.time('Event Filtering')
// ... your code ...
debug.timeEnd('Event Filtering')
```

### Debug Output Example

```
[Vue Calendar Debug] Store: Adding event {eventId: "123", title: "Meeting", start: "2024-01-15T10:00:00Z"}
[Vue Calendar Debug] CalendarView: Component mounted
[Vue Calendar Debug] Event: Drag started {eventId: "123", position: {x: 100, y: 200}}
[Vue Calendar Debug] Store: Updating event date only {eventId: "123", preservedTime: "10:0:0"}
```

## Troubleshooting

### CSS Style Conflicts?

The Vue Calendar plugin includes comprehensive CSS style isolation to prevent conflicts with your host application. All calendar styles are prefixed with `.vc-calendar` to ensure they only apply within the calendar component.

If you're experiencing style conflicts, ensure that:
- The calendar component is properly wrapped with the `vc-calendar` class (this happens automatically)
- Your host app's styles are not interfering with the calendar's isolated styles
- The CSS import is working correctly

### Calendar Not Styling Correctly?

If the calendar appears unstyled or broken, make sure you've imported the CSS:

1. **Check your main.ts/main.js file** - ensure you have:
   ```typescript
   import '@kodeglot/vue-calendar/style.css'
   ```

2. **Try the alternative import path**:
   ```typescript
   import '@kodeglot/vue-calendar/dist/style.css'
   ```

3. **If using a bundler**, make sure it's configured to handle CSS imports

4. **For CDN usage**, include the CSS file:
   ```html
   <link rel="stylesheet" href="https://unpkg.com/@kodeglot/vue-calendar/dist/style.css">
   ```

### Missing Colors or Resize Handles?

If you're experiencing issues with:
- **Missing event colors** (orange, purple, etc.)
- **Resize handles not visible**
- **Hover effects not working**
- **Cursor changes not appearing**

This is likely a **CSS purging issue** in your implementing app. The calendar uses dynamic Tailwind classes that may be purged during your app's build process.

#### Solution: Add to Your App's Tailwind Config

Add this comprehensive safelist to your implementing app's `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ... your content paths
  ],
  safelist: [
    // Background colors - ALL variants
    'bg-red-50', 'bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800', 'bg-orange-900',
    'bg-amber-50', 'bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400', 'bg-amber-500', 'bg-amber-600', 'bg-amber-700', 'bg-amber-800', 'bg-amber-900',
    'bg-yellow-50', 'bg-yellow-100', 'bg-yellow-200', 'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800', 'bg-yellow-900',
    'bg-lime-50', 'bg-lime-100', 'bg-lime-200', 'bg-lime-300', 'bg-lime-400', 'bg-lime-500', 'bg-lime-600', 'bg-lime-700', 'bg-lime-800', 'bg-lime-900',
    'bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900',
    'bg-emerald-50', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700', 'bg-emerald-800', 'bg-emerald-900',
    'bg-teal-50', 'bg-teal-100', 'bg-teal-200', 'bg-teal-300', 'bg-teal-400', 'bg-teal-500', 'bg-teal-600', 'bg-teal-700', 'bg-teal-800', 'bg-teal-900',
    'bg-cyan-50', 'bg-cyan-100', 'bg-cyan-200', 'bg-cyan-300', 'bg-cyan-400', 'bg-cyan-500', 'bg-cyan-600', 'bg-cyan-700', 'bg-cyan-800', 'bg-cyan-900',
    'bg-sky-50', 'bg-sky-100', 'bg-sky-200', 'bg-sky-300', 'bg-sky-400', 'bg-sky-500', 'bg-sky-600', 'bg-sky-700', 'bg-sky-800', 'bg-sky-900',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900',
    'bg-indigo-50', 'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-300', 'bg-indigo-400', 'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800', 'bg-indigo-900',
    'bg-violet-50', 'bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-500', 'bg-violet-600', 'bg-violet-700', 'bg-violet-800', 'bg-violet-900',
    'bg-purple-50', 'bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-purple-900',
    'bg-fuchsia-50', 'bg-fuchsia-100', 'bg-fuchsia-200', 'bg-fuchsia-300', 'bg-fuchsia-400', 'bg-fuchsia-500', 'bg-fuchsia-600', 'bg-fuchsia-700', 'bg-fuchsia-800', 'bg-fuchsia-900',
    'bg-pink-50', 'bg-pink-100', 'bg-pink-200', 'bg-pink-300', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800', 'bg-pink-900',
    'bg-rose-50', 'bg-rose-100', 'bg-rose-200', 'bg-rose-300', 'bg-rose-400', 'bg-rose-500', 'bg-rose-600', 'bg-rose-700', 'bg-rose-800', 'bg-rose-900',
    'bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-slate-400', 'bg-slate-500', 'bg-slate-600', 'bg-slate-700', 'bg-slate-800', 'bg-slate-900',
    'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'bg-zinc-50', 'bg-zinc-100', 'bg-zinc-200', 'bg-zinc-300', 'bg-zinc-400', 'bg-zinc-500', 'bg-zinc-600', 'bg-zinc-700', 'bg-zinc-800', 'bg-zinc-900',
    'bg-neutral-50', 'bg-neutral-100', 'bg-neutral-200', 'bg-neutral-300', 'bg-neutral-400', 'bg-neutral-500', 'bg-neutral-600', 'bg-neutral-700', 'bg-neutral-800', 'bg-neutral-900',
    'bg-stone-50', 'bg-stone-100', 'bg-stone-200', 'bg-stone-300', 'bg-stone-400', 'bg-stone-500', 'bg-stone-600', 'bg-stone-700', 'bg-stone-800', 'bg-stone-900',
    
    // Left border colors specifically
    'border-l-red-50', 'border-l-red-100', 'border-l-red-200', 'border-l-red-300', 'border-l-red-400', 'border-l-red-500', 'border-l-red-600', 'border-l-red-700', 'border-l-red-800', 'border-l-red-900',
    'border-l-orange-50', 'border-l-orange-100', 'border-l-orange-200', 'border-l-orange-300', 'border-l-orange-400', 'border-l-orange-500', 'border-l-orange-600', 'border-l-orange-700', 'border-l-orange-800', 'border-l-orange-900',
    'border-l-amber-50', 'border-l-amber-100', 'border-l-amber-200', 'border-l-amber-300', 'border-l-amber-400', 'border-l-amber-500', 'border-l-amber-600', 'border-l-amber-700', 'border-l-amber-800', 'border-l-amber-900',
    'border-l-yellow-50', 'border-l-yellow-100', 'border-l-yellow-200', 'border-l-yellow-300', 'border-l-yellow-400', 'border-l-yellow-500', 'border-l-yellow-600', 'border-l-yellow-700', 'border-l-yellow-800', 'border-l-yellow-900',
    'border-l-lime-50', 'border-l-lime-100', 'border-l-lime-200', 'border-l-lime-300', 'border-l-lime-400', 'border-l-lime-500', 'border-l-lime-600', 'border-l-lime-700', 'border-l-lime-800', 'border-l-lime-900',
    'border-l-green-50', 'border-l-green-100', 'border-l-green-200', 'border-l-green-300', 'border-l-green-400', 'border-l-green-500', 'border-l-green-600', 'border-l-green-700', 'border-l-green-800', 'border-l-green-900',
    'border-l-emerald-50', 'border-l-emerald-100', 'border-l-emerald-200', 'border-l-emerald-300', 'border-l-emerald-400', 'border-l-emerald-500', 'border-l-emerald-600', 'border-l-emerald-700', 'border-l-emerald-800', 'border-l-emerald-900',
    'border-l-teal-50', 'border-l-teal-100', 'border-l-teal-200', 'border-l-teal-300', 'border-l-teal-400', 'border-l-teal-500', 'border-l-teal-600', 'border-l-teal-700', 'border-l-teal-800', 'border-l-teal-900',
    'border-l-cyan-50', 'border-l-cyan-100', 'border-l-cyan-200', 'border-l-cyan-300', 'border-l-cyan-400', 'border-l-cyan-500', 'border-l-cyan-600', 'border-l-cyan-700', 'border-l-cyan-800', 'border-l-cyan-900',
    'border-l-sky-50', 'border-l-sky-100', 'border-l-sky-200', 'border-l-sky-300', 'border-l-sky-400', 'border-l-sky-500', 'border-l-sky-600', 'border-l-sky-700', 'border-l-sky-800', 'border-l-sky-900',
    'border-l-blue-50', 'border-l-blue-100', 'border-l-blue-200', 'border-l-blue-300', 'border-l-blue-400', 'border-l-blue-500', 'border-l-blue-600', 'border-l-blue-700', 'border-l-blue-800', 'border-l-blue-900',
    'border-l-indigo-50', 'border-l-indigo-100', 'border-l-indigo-200', 'border-l-indigo-300', 'border-l-indigo-400', 'border-l-indigo-500', 'border-l-indigo-600', 'border-l-indigo-700', 'border-l-indigo-800', 'border-l-indigo-900',
    'border-l-violet-50', 'border-l-violet-100', 'border-l-violet-200', 'border-l-violet-300', 'border-l-violet-400', 'border-l-violet-500', 'border-l-violet-600', 'border-l-violet-700', 'border-l-violet-800', 'border-l-violet-900',
    'border-l-purple-50', 'border-l-purple-100', 'border-l-purple-200', 'border-l-purple-300', 'border-l-purple-400', 'border-l-purple-500', 'border-l-purple-600', 'border-l-purple-700', 'border-l-purple-800', 'border-l-purple-900',
    'border-l-fuchsia-50', 'border-l-fuchsia-100', 'border-l-fuchsia-200', 'border-l-fuchsia-300', 'border-l-fuchsia-400', 'border-l-fuchsia-500', 'border-l-fuchsia-600', 'border-l-fuchsia-700', 'border-l-fuchsia-800', 'border-l-fuchsia-900',
    'border-l-pink-50', 'border-l-pink-100', 'border-l-pink-200', 'border-l-pink-300', 'border-l-pink-400', 'border-l-pink-500', 'border-l-pink-600', 'border-l-pink-700', 'border-l-pink-800', 'border-l-pink-900',
    'border-l-rose-50', 'border-l-rose-100', 'border-l-rose-200', 'border-l-rose-300', 'border-l-rose-400', 'border-l-rose-500', 'border-l-rose-600', 'border-l-rose-700', 'border-l-rose-800', 'border-l-rose-900',
    'border-l-slate-50', 'border-l-slate-100', 'border-l-slate-200', 'border-l-slate-300', 'border-l-slate-400', 'border-l-slate-500', 'border-l-slate-600', 'border-l-slate-700', 'border-l-slate-800', 'border-l-slate-900',
    'border-l-gray-50', 'border-l-gray-100', 'border-l-gray-200', 'border-l-gray-300', 'border-l-gray-400', 'border-l-gray-500', 'border-l-gray-600', 'border-l-gray-700', 'border-l-gray-800', 'border-l-gray-900',
    'border-l-zinc-50', 'border-l-zinc-100', 'border-l-zinc-200', 'border-l-zinc-300', 'border-l-zinc-400', 'border-l-zinc-500', 'border-l-zinc-600', 'border-l-zinc-700', 'border-l-zinc-800', 'border-l-zinc-900',
    'border-l-neutral-50', 'border-l-neutral-100', 'border-l-neutral-200', 'border-l-neutral-300', 'border-l-neutral-400', 'border-l-neutral-500', 'border-l-neutral-600', 'border-l-neutral-700', 'border-l-neutral-800', 'border-l-neutral-900',
    'border-l-stone-50', 'border-l-stone-100', 'border-l-stone-200', 'border-l-stone-300', 'border-l-stone-400', 'border-l-stone-500', 'border-l-stone-600', 'border-l-stone-700', 'border-l-stone-800', 'border-l-stone-900',
    
    // Hover states
    'hover:bg-red-50', 'hover:bg-red-100', 'hover:bg-red-200', 'hover:bg-red-300', 'hover:bg-red-400', 'hover:bg-red-500', 'hover:bg-red-600', 'hover:bg-red-700', 'hover:bg-red-800', 'hover:bg-red-900',
    'hover:bg-orange-50', 'hover:bg-orange-100', 'hover:bg-orange-200', 'hover:bg-orange-300', 'hover:bg-orange-400', 'hover:bg-orange-500', 'hover:bg-orange-600', 'hover:bg-orange-700', 'hover:bg-orange-800', 'hover:bg-orange-900',
    'hover:bg-amber-50', 'hover:bg-amber-100', 'hover:bg-amber-200', 'hover:bg-amber-300', 'hover:bg-amber-400', 'hover:bg-amber-500', 'hover:bg-amber-600', 'hover:bg-amber-700', 'hover:bg-amber-800', 'hover:bg-amber-900',
    'hover:bg-yellow-50', 'hover:bg-yellow-100', 'hover:bg-yellow-200', 'hover:bg-yellow-300', 'hover:bg-yellow-400', 'hover:bg-yellow-500', 'hover:bg-yellow-600', 'hover:bg-yellow-700', 'hover:bg-yellow-800', 'hover:bg-yellow-900',
    'hover:bg-lime-50', 'hover:bg-lime-100', 'hover:bg-lime-200', 'hover:bg-lime-300', 'hover:bg-lime-400', 'hover:bg-lime-500', 'hover:bg-lime-600', 'hover:bg-lime-700', 'hover:bg-lime-800', 'hover:bg-lime-900',
    'hover:bg-green-50', 'hover:bg-green-100', 'hover:bg-green-200', 'hover:bg-green-300', 'hover:bg-green-400', 'hover:bg-green-500', 'hover:bg-green-600', 'hover:bg-green-700', 'hover:bg-green-800', 'hover:bg-green-900',
    'hover:bg-emerald-50', 'hover:bg-emerald-100', 'hover:bg-emerald-200', 'hover:bg-emerald-300', 'hover:bg-emerald-400', 'hover:bg-emerald-500', 'hover:bg-emerald-600', 'hover:bg-emerald-700', 'hover:bg-emerald-800', 'hover:bg-emerald-900',
    'hover:bg-teal-50', 'hover:bg-teal-100', 'hover:bg-teal-200', 'hover:bg-teal-300', 'hover:bg-teal-400', 'hover:bg-teal-500', 'hover:bg-teal-600', 'hover:bg-teal-700', 'hover:bg-teal-800', 'hover:bg-teal-900',
    'hover:bg-cyan-50', 'hover:bg-cyan-100', 'hover:bg-cyan-200', 'hover:bg-cyan-300', 'hover:bg-cyan-400', 'hover:bg-cyan-500', 'hover:bg-cyan-600', 'hover:bg-cyan-700', 'hover:bg-cyan-800', 'hover:bg-cyan-900',
    'hover:bg-sky-50', 'hover:bg-sky-100', 'hover:bg-sky-200', 'hover:bg-sky-300', 'hover:bg-sky-400', 'hover:bg-sky-500', 'hover:bg-sky-600', 'hover:bg-sky-700', 'hover:bg-sky-800', 'hover:bg-sky-900',
    'hover:bg-blue-50', 'hover:bg-blue-100', 'hover:bg-blue-200', 'hover:bg-blue-300', 'hover:bg-blue-400', 'hover:bg-blue-500', 'hover:bg-blue-600', 'hover:bg-blue-700', 'hover:bg-blue-800', 'hover:bg-blue-900',
    'hover:bg-indigo-50', 'hover:bg-indigo-100', 'hover:bg-indigo-200', 'hover:bg-indigo-300', 'hover:bg-indigo-400', 'hover:bg-indigo-500', 'hover:bg-indigo-600', 'hover:bg-indigo-700', 'hover:bg-indigo-800', 'hover:bg-indigo-900',
    'hover:bg-violet-50', 'hover:bg-violet-100', 'hover:bg-violet-200', 'hover:bg-violet-300', 'hover:bg-violet-400', 'hover:bg-violet-500', 'hover:bg-violet-600', 'hover:bg-violet-700', 'hover:bg-violet-800', 'hover:bg-violet-900',
    'hover:bg-purple-50', 'hover:bg-purple-100', 'hover:bg-purple-200', 'hover:bg-purple-300', 'hover:bg-purple-400', 'hover:bg-purple-500', 'hover:bg-purple-600', 'hover:bg-purple-700', 'hover:bg-purple-800', 'hover:bg-purple-900',
    'hover:bg-fuchsia-50', 'hover:bg-fuchsia-100', 'hover:bg-fuchsia-200', 'hover:bg-fuchsia-300', 'hover:bg-fuchsia-400', 'hover:bg-fuchsia-500', 'hover:bg-fuchsia-600', 'hover:bg-fuchsia-700', 'hover:bg-fuchsia-800', 'hover:bg-fuchsia-900',
    'hover:bg-pink-50', 'hover:bg-pink-100', 'hover:bg-pink-200', 'hover:bg-pink-300', 'hover:bg-pink-400', 'hover:bg-pink-500', 'hover:bg-pink-600', 'hover:bg-pink-700', 'hover:bg-pink-800', 'hover:bg-pink-900',
    'hover:bg-rose-50', 'hover:bg-rose-100', 'hover:bg-rose-200', 'hover:bg-rose-300', 'hover:bg-rose-400', 'hover:bg-rose-500', 'hover:bg-rose-600', 'hover:bg-rose-700', 'hover:bg-rose-800', 'hover:bg-rose-900',
    'hover:bg-slate-50', 'hover:bg-slate-100', 'hover:bg-slate-200', 'hover:bg-slate-300', 'hover:bg-slate-400', 'hover:bg-slate-500', 'hover:bg-slate-600', 'hover:bg-slate-700', 'hover:bg-slate-800', 'hover:bg-slate-900',
    'hover:bg-gray-50', 'hover:bg-gray-100', 'hover:bg-gray-200', 'hover:bg-gray-300', 'hover:bg-gray-400', 'hover:bg-gray-500', 'hover:bg-gray-600', 'hover:bg-gray-700', 'hover:bg-gray-800', 'hover:bg-gray-900',
    'hover:bg-zinc-50', 'hover:bg-zinc-100', 'hover:bg-zinc-200', 'hover:bg-zinc-300', 'hover:bg-zinc-400', 'hover:bg-zinc-500', 'hover:bg-zinc-600', 'hover:bg-zinc-700', 'hover:bg-zinc-800', 'hover:bg-zinc-900',
    'hover:bg-neutral-50', 'hover:bg-neutral-100', 'hover:bg-neutral-200', 'hover:bg-neutral-300', 'hover:bg-neutral-400', 'hover:bg-neutral-500', 'hover:bg-neutral-600', 'hover:bg-neutral-700', 'hover:bg-neutral-800', 'hover:bg-neutral-900',
    'hover:bg-stone-50', 'hover:bg-stone-100', 'hover:bg-stone-200', 'hover:bg-stone-300', 'hover:bg-stone-400', 'hover:bg-stone-500', 'hover:bg-stone-600', 'hover:bg-stone-700', 'hover:bg-stone-800', 'hover:bg-stone-900',
    
    // Cursor states
    'cursor-move', 'cursor-ns-resize', 'cursor-ew-resize', 'cursor-nw-resize', 'cursor-ne-resize', 'cursor-sw-resize', 'cursor-se-resize',
    
    // Resize handles
    'resize-x', 'resize-y', 'resize-none'
  ]
}
```

### Timezone Issues?

The calendar handles timezone conversions automatically and stores all events in UTC format. If you're experiencing timezone-related issues:

#### Common Timezone Problems

1. **Events showing wrong times**: The calendar stores events in UTC and displays them in the user's local timezone
2. **Drag-and-drop time changes**: Events should preserve their original time when dragged between dates
3. **Inconsistent time display**: Ensure your application is handling timezone conversions correctly

#### Timezone Best Practices

```typescript
// ✅ Correct: Store events in UTC
const event = {
  id: '1',
  title: 'Meeting',
  start: '2025-01-15T14:00:00Z', // UTC time
  end: '2025-01-15T15:00:00Z',   // UTC time
  tailwindColor: 'blue'
}

// ❌ Incorrect: Store events in local time
const event = {
  id: '1',
  title: 'Meeting',
  start: '2025-01-15T14:00:00', // Local time (missing Z)
  end: '2025-01-15T15:00:00',   // Local time (missing Z)
  tailwindColor: 'blue'
}
```

#### Debugging Timezone Issues

Enable debug logging to see timezone conversions:

```typescript
// In your main.ts or main.js
import { debug } from '@kodeglot/vue-calendar'

// Enable debug logging
debug.enable()
```

Look for these debug messages:
- `[Vue Calendar Debug] Store: Updating event date only` - Shows time preservation during drag-and-drop
- `[Vue Calendar Debug] Timezone: Converting to user timezone` - Shows timezone conversions
- `[CalendarView] event-updated fired:` - Shows event update emissions

#### Timezone Troubleshooting Checklist

- [ ] All event times are stored in UTC format (with 'Z' suffix)
- [ ] Your application handles timezone conversions correctly
- [ ] Debug logging shows correct time preservation during drag-and-drop
- [ ] Events maintain their original time when moved between dates
- [ ] No hardcoded timezone offsets in your application code
