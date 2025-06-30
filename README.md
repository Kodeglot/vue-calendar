# Vue Calendar 🗓️

[![npm version](https://img.shields.io/npm/v/@kodeglot/vue-calendar.svg)](https://www.npmjs.com/package/@kodeglot/vue-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/Kodeglot/vue-calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/Kodeglot/vue-calendar/actions)
[![Coverage](https://img.shields.io/codecov/c/github/Kodeglot/vue-calendar)](https://codecov.io/gh/Kodeglot/vue-calendar)

A fully-featured, customizable calendar component for Vue 3 with built-in Tailwind CSS support. Perfect for building scheduling applications, event calendars, and date management systems.

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
- [Changelog](#changelog)
- [Roadmap](#roadmap)
- [License](#license)

## Features

- 🎨 **Fully customizable** with Tailwind CSS
- ⚡️ **Lightweight and performant** Vue 3 component
- 🧩 **TypeScript support** with full type definitions
- 📱 **Responsive design** for all screen sizes
- 🔌 **Easy to integrate** with any Vue 3 project
- 🖱️ **Drag and drop support** for event management
- 🎨 **22 customizable event colors** using Tailwind color palette
- 🗓️ **Multiple view modes** (month, week, day)
- 🔄 **Event resizing** with time snapping
- 📅 **All-day event support**
- 🎯 **Time-based positioning** with 5-minute snap intervals
- 🛠️ **Plugin architecture** for extensibility
- 🧪 **Comprehensive testing** with Vitest

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

## Quick Start

### 1. Install Dependencies

```bash
npm install @kodeglot/vue-calendar pinia date-fns date-fns-tz
```

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
  start: string        // ISO date string (UTC)
  end: string          // ISO date string (UTC)
  tailwindColor: string // Tailwind color name (e.g., 'blue', 'red', 'green')
  allDay?: boolean
  width?: number       // For event stacking
  left?: number        // For event positioning
  marginLeft?: number  // For event spacing
  order?: number       // Vertical stacking order
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
import { CalendarView, useCalendarStore, type CalendarEvent } from '@kodeglot/vue-calendar'

const store = useCalendarStore()

function handleEventCreated(event: CalendarEvent) {
  console.log('Event created:', event)
}

function handleEventUpdated(event: CalendarEvent) {
  console.log('Event updated:', event)
}

function handleEventDeleted(eventId: string) {
  console.log('Event deleted:', eventId)
}
</script>

## Troubleshooting

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

### Common Issues

- **"Calendar looks broken"**: Missing CSS import
- **"Tailwind classes not working"**: CSS not imported or Tailwind not configured in consuming app
- **"Events not visible"**: Check that Pinia store is properly set up

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
interface CalendarEvent {
  id: string                    // Unique identifier
  title: string                 // Event title
  start: string                 // ISO date string for start time
  end: string                   // ISO date string for end time
  tailwindColor: string         // Tailwind color name
  allDay?: boolean              // Whether event is all-day
  width?: number                // Width percentage for stacking
  left?: number                 // Left position percentage
  marginLeft?: number           // Margin between stacked events
  order?: number                // Vertical stacking order
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

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes and releases.

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
