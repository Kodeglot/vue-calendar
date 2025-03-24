# Vue Calendar Date Picker 🗓️

[![npm version](https://img.shields.io/npm/v/vue-calendar-date-picker.svg)](https://www.npmjs.com/package/vue-calendar-date-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/Kodeglot/vue-calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/Kodeglot/vue-calendar/actions)
[![Coverage](https://img.shields.io/codecov/c/github/Kodeglot/vue-calendar)](https://codecov.io/gh/Kodeglot/vue-calendar)

A fully-featured, customizable calendar date picker component for Vue 3 with built-in Tailwind CSS support. Perfect for building scheduling applications, event calendars, and date pickers.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Customization](#customization)
- [Development](#development)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [Roadmap](#roadmap)
- [License](#license)

## Installation

### Using npm
```bash
npm install vue-calendar-date-picker
```

### Using yarn
```bash
yarn add vue-calendar-date-picker
```

### Using pnpm
```bash
pnpm add vue-calendar-date-picker
```

### CDN
Add the following script tag to your HTML:
```html
<script src="https://unpkg.com/vue-calendar-date-picker/dist/vue-calendar-date-picker.umd.js"></script>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | Array | `[]` | Array of calendar events |
| `initialDate` | Date | `new Date()` | Initial date to display |
| `initialView` | String | `'month'` | Initial view mode (`day`, `week`, `month`) |
| `locale` | String | `'en-US'` | Locale for date formatting |
| `timeFormat` | String | `'12h'` | Time format (`12h` or `24h`) |
| `showControls` | Boolean | `true` | Show navigation controls |
| `showEventButton` | Boolean | `true` | Show add event button |
| `enableDragDrop` | Boolean | `true` | Enable drag and drop functionality |

### Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `event-created` | `event: CalendarEvent` | Fired when new event is created |
| `event-updated` | `event: CalendarEvent` | Fired when event is updated |
| `event-deleted` | `eventId: string` | Fired when event is deleted |
| `date-select` | `date: Date` | Fired when date is selected |
| `view-change` | `view: string` | Fired when view mode changes |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `event` | `{ event: CalendarEvent }` | Custom event template |
| `header` | `{ date: Date, view: string }` | Custom header content |
| `footer` | `{ date: Date, view: string }` | Custom footer content |

First, create and configure your calendar store using Pinia:

```typescript
// stores/calendarStore.ts
import { defineStore } from 'pinia'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  color: string
}

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    events: [] as CalendarEvent[],
  }),
  actions: {
    addEvent(event: CalendarEvent) {
      this.events.push(event)
    },
    updateEvent(event: CalendarEvent) {
      const index = this.events.findIndex(e => e.id === event.id)
      if (index !== -1) {
        this.events[index] = event
      }
    },
    updateEventDateOnly(eventId: string, newDate: Date) {
      const event = this.events.find(e => e.id === eventId)
      if (event) {
        const duration = new Date(event.end).getTime() - new Date(event.start).getTime()
        event.start = newDate.toISOString()
        event.end = new Date(newDate.getTime() + duration).toISOString()
      }
    },
    deleteEvent(eventId: string) {
      this.events = this.events.filter(e => e.id !== eventId)
    }
  }
})
```

## Basic Usage

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueCalendar from 'vue-calendar'
import 'vue-calendar/dist/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(VueCalendar)
app.mount('#app')
```

In your component:

```vue
<template>
  <VueCalendar
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
import { useCalendarStore } from './stores/calendarStore'

const store = useCalendarStore()

function handleEventCreated(event) {
  console.log('Event created:', event)
}

function handleEventUpdated(event) {
  console.log('Event updated:', event)
}

function handleEventDeleted(eventId) {
  console.log('Event deleted:', eventId)
}
</script>
```

## Advanced Usage

### Customizing Appearance with Tailwind

```vue
<template>
  <VueCalendar
    class="custom-calendar"
    :initial-date="new Date()"
    :initial-view="'month'"
    :show-controls="true"
    :show-event-button="true"
    :enable-drag-drop="true"
  />
</template>

<style>
.custom-calendar {
  /* Customize calendar container */
  @apply rounded-lg shadow-lg border border-gray-200;
  
  /* Customize header */
  .calendar-header {
    @apply bg-blue-500 text-white rounded-t-lg p-4;
  }
  
  /* Customize event cards */
  .calendar-event {
    @apply bg-blue-50 border border-blue-200 rounded-md p-2;
  }
  
  /* Customize today's date */
  .today {
    @apply bg-blue-100 text-blue-800 font-bold;
  }
}
</style>
```

### Handling Recurring Events

```typescript
// In your calendar store
function createRecurringEvent(baseEvent: CalendarEvent, recurrence: {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  endDate?: Date,
  count?: number
}) {
  const events: CalendarEvent[] = []
  let currentDate = new Date(baseEvent.start)
  
  while (true) {
    // Add the event
    events.push({
      ...baseEvent,
      start: currentDate.toISOString(),
      end: new Date(currentDate.getTime() + 
        (new Date(baseEvent.end).getTime() - 
        new Date(baseEvent.start).getTime()
    ).toISOString()
    })
    
    // Calculate next occurrence
    switch (recurrence.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + 1)
        break
    }
    
    // Check termination conditions
    if (recurrence.endDate && currentDate > recurrence.endDate) break
    if (recurrence.count && events.length >= recurrence.count) break
  }
  
  return events
}
```

### Integrating with External APIs

```typescript
// Example: Sync with Google Calendar
async function syncWithGoogleCalendar() {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    headers: {
      'Authorization': `Bearer ${googleAccessToken}`
    }
  })
  
  const events = await response.json()
  const store = useCalendarStore()
  
  events.items.forEach((event: any) => {
    store.addEvent({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      color: event.colorId ? `#${event.colorId}` : '#3b82f6'
    })
  })
}
```

### Advanced Event Filtering

```vue
<template>
  <VueCalendar
    :initial-date="new Date()"
    :initial-view="'month'"
    :event-filter="filterEvents"
  />
</template>

<script setup lang="ts">
import { useCalendarStore } from './stores/calendarStore'

const store = useCalendarStore()

function filterEvents(event: CalendarEvent, viewType: 'month' | 'week' | 'day') {
  // Example: Only show events longer than 1 hour in month view
  if (viewType === 'month') {
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime()
    return duration > 3600000
  }
  return true
}
</script>
```

### Custom Event Templates

```vue
<template>
  <VueCalendar
    :initial-date="new Date()"
    :initial-view="'month'"
  >
    <template #event="{ event }">
      <div class="custom-event">
        <div class="event-icon">📅</div>
        <div class="event-content">
          <h3>{{ event.title }}</h3>
          <p>{{ formatTime(event.start) }} - {{ formatTime(event.end) }}</p>
        </div>
      </div>
    </template>
  </VueCalendar>
</template>

<style>
.custom-event {
  @apply flex items-center p-2 bg-white rounded-lg shadow-sm;
}

.event-icon {
  @apply text-2xl mr-2;
}

.event-content {
  @apply flex-1;
}

.event-content h3 {
  @apply font-semibold text-sm;
}

.event-content p {
  @apply text-xs text-gray-500;
}
</style>
```

### Drag and Drop Configuration

```vue
<template>
  <VueCalendar
    :initial-date="new Date()"
    :initial-view="'month'"
    :enable-drag-drop="true"
    @event-dropped="handleEventDrop"
  />
</template>

<script setup lang="ts">
import { useCalendarStore } from './stores/calendarStore'

const store = useCalendarStore()

function handleEventDrop(eventId: string, newDate: Date) {
  store.updateEventDateOnly(eventId, newDate)
}
</script>
```

## Features

- 🎨 Fully customizable with Tailwind CSS
- ⚡️ Lightweight and performant
- 🧩 TypeScript support
- 📱 Responsive design
- 🔌 Easy to integrate
- 🖱️ Drag and drop support
- 🎨 Customizable event colors
- 🗓️ Multiple view modes (month, week, day)
- 🌐 Internationalization support
- 📅 Recurring events
- 🔍 Advanced filtering
- 📊 Customizable views
- 🛠️ Developer friendly API

## Development

### Project Setup
```bash
# Install dependencies
npm install

# Compile and hot-reload for development
npm run dev

# Compile and minify for production
npm run build

# Run unit tests
npm run test:unit

# Run end-to-end tests
npm run test:e2e

# Lint and fix files
npm run lint
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes and releases.

## Roadmap

- [ ] Add year view
- [ ] Add resource view
- [ ] Add timeline view
- [ ] Add built-in timezone support
- [ ] Add built-in recurrence rules
- [ ] Add built-in export/import functionality

## Documentation

For full documentation and examples, visit [GitHub](https://github.com/Kodeglot/vue-calendar)

## License

MIT © [Kodeglot](https://github.com/Kodeglot)
