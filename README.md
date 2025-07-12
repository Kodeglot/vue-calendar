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
- 🖱️ **Drag and drop support** for event management
- 🖱️ **Click to create events** - Click on empty space to create new events with automatic time rounding
- 🖱️ **Improved event interaction**: Edit modal only opens on single click, not on drag or resize
- 🔄 **Reactive event updates**: Calendar updates instantly when events are added/edited
- 🎨 **22 customizable event colors** using Tailwind color palette
- 🗓️ **Multiple view modes** (month, week, day)
- 🔄 **Event resizing** with time snapping
- 📅 **All-day event support**
- 🎯 **Time-based positioning** with 5-minute snap intervals
- 🛠️ **Plugin architecture** for extensibility
- 🧪 **Comprehensive testing** with Vitest (69 tests across all components)
- 🎨 **Enhanced visual hierarchy** with improved month view styling
- 📱 **Mobile-optimized modals** with fixed headers/footers and scrollable content

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

## Quick Start

### 1. Install Dependencies

```bash
npm install @kodeglot/vue-calendar pinia date-fns date-fns-tz
```

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
    
    // Resize handle and interaction classes
    'bg-gray-300', 'bg-gray-400', 'bg-gray-500',
    'cursor-row-resize', 'cursor-col-resize', 'cursor-move', 'cursor-pointer',
    'transition-opacity', 'transition-all', 'duration-200', 'opacity-0', 'opacity-100',
    'group-hover:opacity-100',
    
    // Common utility classes
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
    'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
    'min-h-screen', 'min-h-32', 'h-24', 'h-2', 'h-8', 'w-20', 'w-8', 'w-full',
    'gap-px', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-y-1', 'gap-y-2', 'gap-y-3', 'gap-y-4',
    'hover:bg-gray-100', 'hover:bg-blue-600', 'hover:bg-blue-700', 'hover:shadow-sm',
    'focus:outline-none', 'focus:ring-2', 'focus:ring-primary-500',
    'group-hover:opacity-100',
    'event-transition', 'bg-opacity-10', 'pointer-events-none', 'container', 'mx-auto'
  ],
  // ... rest of your config
}
```

#### Alternative: Disable CSS Purging (Development Only)

For development, you can temporarily disable CSS purging:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ... your content paths
  ],
  // Temporarily disable purging for development
  safelist: [
    {
      pattern: /.*/, // This will keep ALL classes (use only in development!)
    }
  ],
  // ... rest of your config
}
```

**⚠️ Warning**: The pattern approach should only be used in development as it will significantly increase your CSS bundle size.

### Common Issues

- **"Calendar looks broken"**: Missing CSS import
- **"Tailwind classes not working"**: CSS not imported or Tailwind not configured in consuming app
- **"Events not visible"**: Check that Pinia store is properly set up
- **"Missing colors"**: Add comprehensive safelist to your Tailwind config
- **"Resize handles not working"**: Add cursor and opacity classes to safelist
- **"Hover effects missing"**: Add group-hover and transition classes to safelist

## Timezone Support

Vue Calendar includes comprehensive timezone support:

- **ISO Storage**: All dates are stored in ISO format (UTC) for consistency
- **Localized Display**: Times are displayed in the user's local timezone
- **Automatic Detection**: User's timezone is automatically detected
- **Proper Conversions**: All timezone conversions are handled correctly

### Using Timezone Utilities

```vue
<script setup lang="ts">
import { useTimezone } from '@kodeglot/vue-calendar'

const { 
  formatTime, 
  formatTime12, 
  formatDate, 
  formatDateTime,
  toUserTimezone,
  toUTC,
  userTimezone 
} = useTimezone()

// Format times for display
const displayTime = formatTime('2024-01-15T10:30:00Z') // Shows in user's timezone
const displayTime12 = formatTime12('2024-01-15T10:30:00Z') // 12-hour format

// Convert between timezones
const localTime = toUserTimezone('2024-01-15T10:30:00Z')
const utcTime = toUTC(localTime)

console.log('User timezone:', userTimezone.value)
</script>
```

### Time Format Options

The calendar supports both 12-hour and 24-hour time formats:

```vue
<template>
  <!-- 24-hour format (default) -->
  <CalendarEventComponent 
    :event="event" 
    :time-format="'24h'" 
  />
  
  <!-- 12-hour format -->
  <CalendarEventComponent 
    :event="event" 
    :time-format="'12h'" 
  />
</template>
```

## Demo

### Demo Options

Vue Calendar provides multiple ways to try out the component:

#### 1. Development Demo (Recommended)
```bash
# Clone the repository
git clone https://github.com/Kodeglot/vue-calendar.git
cd vue-calendar

# Install dependencies
npm install

# Build the component
npm run build

# Start the interactive demo
npm run demo
```

The development demo will open at `http://localhost:3001` and provides:
- Hot reloading for development
- All calendar features including drag & drop
- Time format switching (12h/24h)
- Event creation and editing
- Responsive design testing

#### 2. Standalone Demo
For a production-like experience without build tools:
```bash
# After building the component
npm run build

# Open the standalone demo
open demo/standalone.html
```

**Note**: The standalone demo requires the component to be built first (`npm run build`).

### Demo Features

Both demos showcase:
- **Multiple Views**: Month, week, and day views
- **Event Management**: Create, edit, and delete events
- **Drag & Drop**: Move events between dates and times
- **Event Resizing**: Resize events to change duration
- **Color Customization**: 22 Tailwind color options
- **Time Format**: Switch between 12-hour and 24-hour formats
- **Responsive Design**: Works on all screen sizes
- **Timezone Support**: Proper timezone handling

### Troubleshooting Demo Issues

If you encounter issues with the demo:

1. **"devtoolsApi is not defined"**: This is a harmless warning from Pinia's devtools. The demo will work normally.

2. **"Cannot destructure property 'createPinia'"**: Make sure you've run `npm run build` before starting the demo.

3. **Component not loading**: Check that the UMD build was created successfully in the `dist/` folder.

4. **Tailwind CDN warning**: This is expected in development. For production, install Tailwind CSS as a PostCSS plugin.

5. **File not found errors**: Ensure you're running the demo from the project root directory.

## API Reference

### CalendarView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialDate` | `Date` | `new Date()` | Initial date to display |
| `initialView` | `'month' \| 'week' \| 'day'` | `'month'` | Initial view mode |
| `timeFormat` | `'12h' \| '24h'` | `'24h'` | Time format for displaying times |
| `showControls` | `boolean` | `true` | Show navigation controls |
| `showEventButton` | `boolean` | `true` | Show add event button |
| `enableDragDrop` | `boolean` | `true` | Enable drag and drop functionality |
| `customClasses` | `CustomClasses` | `{}` | Custom CSS classes for styling |

### CalendarView Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `date-change` | `date: Date` | Emitted when displayed date changes |
| `event-created` | `event: CalendarEvent` | Emitted when new event is created |
| `event-updated` | `event: CalendarEvent` | Emitted when event is updated |
| `event-deleted` | `eventId: string` | Emitted when event is deleted |
| `openEventModal` | `date: Date` | Emitted when event modal is opened |

### CalendarEvent Interface

```typescript
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
```

### Available Tailwind Colors

The calendar supports 22 Tailwind colors for events:
- `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`
- `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`
- `fuchsia`, `pink`, `rose`, `slate`, `gray`, `zinc`, `neutral`, `stone`

## Usage Examples

### Basic Calendar Setup

```vue
<template>
  <div class="h-screen p-4">
    <CalendarView
      :initial-date="new Date()"
      :initial-view="'month'"
      :time-format="'24h'"
      :show-controls="true"
      :show-event-button="true"
      :enable-drag-drop="true"
    />
  </div>
</template>

<script setup lang="ts">
import { CalendarView } from '@kodeglot/vue-calendar'
</script>
```

### Custom Styling

```vue
<template>
  <CalendarView
    :initial-date="new Date()"
    :initial-view="'month'"
    :custom-classes="{
      container: 'rounded-xl shadow-2xl border-2 border-blue-200',
      header: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
      controls: 'bg-gray-50 rounded-lg p-2',
      viewSelector: 'border-blue-300 focus:border-blue-500',
      eventButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold'
    }"
  />
</template>

<script setup lang="ts">
import { CalendarView } from '@kodeglot/vue-calendar'
</script>
```

### Custom Controls and Navigation

The calendar now supports fully customizable controls through slots. You can replace the default navigation, view selector, and event creation components with your own:

```vue
<template>
  <CalendarView
    :initial-date="new Date()"
    :initial-view="'month'"
    :show-controls="true"
    :show-event-button="false"
  >
    <!-- Custom Navigation -->
    <template #navigation="{ currentDate, currentView, previousPeriod, nextPeriod, headerDate }">
      <div class="flex items-center gap-4">
        <button 
          @click="previousPeriod"
          class="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        
        <div class="text-center">
          <h2 class="text-xl font-bold">{{ headerDate }}</h2>
          <p class="text-sm text-gray-500">{{ currentView }} view</p>
        </div>
        
        <button 
          @click="nextPeriod"
          class="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <ChevronRightIcon class="w-5 h-5" />
        </button>
      </div>
    </template>

    <!-- Custom View Selector -->
    <template #view-selector="{ currentView, setView, currentDate }">
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          @click="setView('month')"
          :class="[
            'px-3 py-1 rounded text-sm font-medium transition-colors',
            currentView === 'month' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Month
        </button>
        <button
          @click="setView('week')"
          :class="[
            'px-3 py-1 rounded text-sm font-medium transition-colors',
            currentView === 'week' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Week
        </button>
        <button
          @click="setView('day')"
          :class="[
            'px-3 py-1 rounded text-sm font-medium transition-colors',
            currentView === 'day' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Day
        </button>
      </div>
    </template>

    <!-- Custom Event Button -->
    <template #event-button="{ toggleNewEventForm, currentDate }">
      <button
        @click="handleCustomEventCreation"
        class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
      >
        <PlusIcon class="w-4 h-4" />
        Add Event
      </button>
    </template>
  </CalendarView>
</template>

<script setup lang="ts">
import { CalendarView, type CalendarEvent } from '@kodeglot/vue-calendar'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/vue/24/outline'

function handleCustomEventCreation() {
  // Your custom event creation logic
  console.log('Custom event creation triggered')
  // You could open your own modal, navigate to a form, etc.
}
</script>
```

### TypeScript Support for Custom Controls

The calendar provides full TypeScript support for slot props:

```typescript
import type { 
  NavigationSlotProps, 
  ControlsSlotProps, 
  ViewSelectorSlotProps, 
  EventButtonSlotProps 
} from '@kodeglot/vue-calendar'

// Navigation slot props
interface NavigationSlotProps {
  currentDate: Date
  currentView: 'month' | 'week' | 'day'
  previousPeriod: () => void
  nextPeriod: () => void
  headerDate: string
}

// Controls slot props
interface ControlsSlotProps {
  currentDate: Date
  currentView: 'month' | 'week' | 'day'
  timeFormat: '12h' | '24h'
  toggleNewEventForm: () => void
}

// View selector slot props
interface ViewSelectorSlotProps {
  currentView: 'month' | 'week' | 'day'
  currentDate: Date
}

// Event button slot props
interface EventButtonSlotProps {
  toggleNewEventForm: () => void
  currentDate: Date
}
```

### Minimal Calendar (No Default Controls)

You can create a minimal calendar with no default controls:

```vue
<template>
  <CalendarView
    :initial-date="new Date()"
    :initial-view="'month'"
    :show-controls="false"
    :show-event-button="false"
  />
</template>

<script setup lang="ts">
import { CalendarView } from '@kodeglot/vue-calendar'
</script>
```

### Custom Controls Only

Or provide only specific custom controls while keeping others default:

```vue
<template>
  <CalendarView
    :initial-date="new Date()"
    :initial-view="'month'"
    :show-controls="true"
    :show-event-button="false"
  >
    <!-- Only customize the event button, keep default navigation and view selector -->
    <template #event-button="{ toggleNewEventForm, currentDate }">
      <button
        @click="openMyCustomModal"
        class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
      >
        Create New Event
      </button>
    </template>
  </CalendarView>
</template>

<script setup lang="ts">
import { CalendarView } from '@kodeglot/vue-calendar'

function openMyCustomModal() {
  // Your custom modal logic
  console.log('Opening custom modal')
}
</script>
```

### Event Handling

```vue
<template>
  <CalendarView
    :initial-date="new Date()"
    :initial-view="'week'"
    @event-created="handleEventCreated"
    @event-updated="handleEventUpdated"
    @event-deleted="handleEventDeleted"
  />
</template>

<script setup lang="ts">
import { CalendarView, useCalendarStore, type CalendarEvent } from '@kodeglot/vue-calendar'

const store = useCalendarStore()

function handleEventCreated(event: CalendarEvent) {
  // Add to your backend
  store.addEvent(event)
  console.log('New event:', event)
}

function handleEventUpdated(event: CalendarEvent) {
  // Update in your backend
  console.log('Updated event:', event)
}

function handleEventDeleted(eventId: string) {
  // Delete from your backend
  console.log('Deleted event:', eventId)
}
</script>
```

### Drag and Drop with Custom Logic

```vue
<template>
  <CalendarView
    :initial-date="new Date()"
    :initial-view="'week'"
    :enable-drag-drop="true"
    @event-dropped="handleEventDrop"
  />
</template>

<script setup lang="ts">
import { CalendarView, useCalendarStore } from '@kodeglot/vue-calendar'

const store = useCalendarStore()

function handleEventDrop(eventId: string, newDate: Date) {
  // Update event date in store
  store.updateEventDateOnly(eventId, newDate)
  
  // Sync with backend
  console.log(`Event ${eventId} moved to ${newDate}`)
}
</script>
```

### Using Individual Components

```vue
<template>
  <div>
    <CalendarMonthComponent :current-date="currentDate" />
    <CalendarWeekComponent :current-date="currentDate" :hour-height="60" />
    <CalendarDayComponent :current-date="currentDate" :hour-height="60" />
  </div>
</template>

<script setup lang="ts">
import { 
  CalendarMonthComponent, 
  CalendarWeekComponent, 
  CalendarDayComponent 
} from '@kodeglot/vue-calendar'

const currentDate = new Date()
</script>
```

### Time Format Options

```vue
<template>
  <div>
    <!-- 24-hour format (default) -->
    <CalendarView
      :initial-date="new Date()"
      :initial-view="'week'"
      :time-format="'24h'"
    />
    
    <!-- 12-hour format with AM/PM -->
    <CalendarView
      :initial-date="new Date()"
      :initial-view="'week'"
      :time-format="'12h'"
    />
  </div>
</template>

<script setup lang="ts">
import { CalendarView } from '@kodeglot/vue-calendar'
</script>
```

### Customizing Event Content

You can customize how each event is rendered using the `#event-content` slot. The slot receives the event as a prop:

```vue
<CalendarView>
  <template #event-content="{ event }">
    <div>
      <strong>{{ event.title }}</strong>
      <span>{{ event.start }}</span>
      <!-- Add any custom markup here -->
    </div>
  </template>
</CalendarView>
```

#### Using Custom Metadata

You can store and display custom data using the `metadata` field:

```vue
<CalendarView>
  <template #event-content="{ event }">
    <div class="flex items-center gap-2">
      <span class="font-bold">{{ event.title }}</span>
      <!-- Show priority badge -->
      <span v-if="event.metadata?.priority" 
            class="text-xs px-1 py-0.5 rounded"
            :class="{
              'bg-red-100 text-red-700': event.metadata.priority === 'high',
              'bg-yellow-100 text-yellow-700': event.metadata.priority === 'medium',
              'bg-green-100 text-green-700': event.metadata.priority === 'low'
            }">
        {{ event.metadata.priority }}
      </span>
      <!-- Show location -->
      <span v-if="event.metadata?.location" class="text-xs text-gray-500">
        📍 {{ event.metadata.location }}
      </span>
    </div>
  </template>
</CalendarView>
```

### Customizing the Event Edit Modal

You can provide your own modal UI for editing events using the `#event-modal` slot. The slot receives the following props:
- `event`: The event being edited
- `update`: Call this function with the updated event to save changes
- `delete`: Call this function with the event id to delete
- `close`: Call this function to close the modal

```vue
<CalendarView>
  <template #event-modal="{ event, update, delete: deleteEvent, close }">
    <MyCustomEventModal
      v-if="event"
      :event="event"
      @save="update"
      @delete="deleteEvent"
      @close="close"
    />
  </template>
</CalendarView>
```

#### Editing Custom Metadata

You can edit custom metadata fields in your modal:

```vue
<CalendarView>
  <template #event-modal="{ event, update, delete: deleteEvent, close }">
    <div v-if="event" class="modal">
      <!-- Basic fields -->
      <input v-model="event.title" placeholder="Event title" />
      <input v-model="event.start" type="datetime-local" />
      <input v-model="event.end" type="datetime-local" />
      
      <!-- Custom metadata fields -->
      <select v-model="event.metadata.priority">
        <option value="">No priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      
      <input v-model="event.metadata.location" placeholder="Location" />
      <input v-model="event.metadata.attendees" placeholder="Attendees" />
      <textarea v-model="event.metadata.notes" placeholder="Notes"></textarea>
      
      <button @click="() => update({ ...event })">Save</button>
      <button @click="() => deleteEvent(event.id)">Delete</button>
      <button @click="close">Cancel</button>
    </div>
  </template>
</CalendarView>
```

### Creating Events with Metadata

When creating events, you can include custom metadata:

```typescript
const newEvent: CalendarEvent = {
  id: crypto.randomUUID(),
  title: "Team Meeting",
  start: "2024-01-15T10:00:00.000Z",
  end: "2024-01-15T11:00:00.000Z",
  tailwindColor: "blue",
  metadata: {
    priority: "high",
    location: "Conference Room A",
    attendees: "John, Jane, Bob",
    notes: "Quarterly planning discussion",
    category: "work",
    reminder: true
  }
}
```

## Customization

### Custom CSS Classes

You can customize the appearance using the `customClasses` prop:

```typescript
interface CustomClasses {
  container?: string    // Main container
  header?: string       // Header section
  controls?: string     // Navigation controls
  viewSelector?: string // View selector dropdown
  eventButton?: string  // Event creation button
}
```

### Event Colors

Events can be colored using any of the 22 Tailwind colors:

```typescript
const event: CalendarEvent = {
  id: '1',
  title: 'Meeting',
  start: '2024-01-15T10:00:00Z',
  end: '2024-01-15T11:00:00Z',
  tailwindColor: 'blue' // Will use blue-100 background and blue-500 border
}
```

### Time Formatting

The calendar automatically formats times based on the user's locale and timezone settings.

### Event Content: Use the `#event-content` slot to fully control how each event is rendered.
### Event Modal: Use the `#event-modal` slot to provide your own event editing UI. The calendar will always show a fallback modal if you do not provide one.
### Other Slots: You can also customize navigation, controls, and view selectors using the provided slots.

## Development

### Project Setup
```bash
# Clone the repository
git clone https://github.com/Kodeglot/vue-calendar.git
cd vue-calendar

# Install dependencies
npm install

# Start development server
npm run dev

# Start demo server
npm run demo

# Build for production
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Test Suite Robustness
#
# - The test suite covers all major features, including timezone handling, drag and drop, resizing, and edge cases.
# - Tests use robust, implementation-agnostic assertions and mock Pinia and timezones for reliable, reproducible results.
# - Contributions should include tests for new features and edge cases.
```

### Project Structure
```
src/
├── components/           # Reusable components
│   ├── CalendarDayComponent.vue
│   ├── CalendarEventComponent.vue
│   ├── CalendarMonthComponent.vue
│   ├── CalendarWeekComponent.vue
│   ├── EventModal.vue
│   └── TimeGridComponent.vue
├── composables/          # Vue composables
│   └── useCalendarEventInteractions.ts
├── stores/              # Pinia stores
│   └── calendarStore.ts
├── views/               # Main view components
│   └── CalendarView.vue
├── index.ts             # Package entry point
└── main.ts              # App entry point
demo/
└── index.html           # Demo page
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

### Development Guidelines
- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Write tests for new features
- Use Tailwind CSS for styling
- Follow the existing code structure

## Roadmap

- [ ] **Year View** - Add yearly calendar view
- [ ] **Resource View** - Support for resource scheduling
- [ ] **Timeline View** - Horizontal timeline layout
- [ ] **Recurring Events** - Built-in recurrence rules
- [x] **Timezone Support** - Enhanced timezone handling
- [ ] **Export/Import** - Calendar data persistence
- [ ] **Event Templates** - Predefined event templates
- [ ] **Advanced Filtering** - Event filtering and search
- [ ] **Performance Optimization** - Virtual scrolling for large datasets

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
