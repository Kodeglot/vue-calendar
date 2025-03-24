# Vue Calendar

A customizable calendar date picker component for Vue 3 with Tailwind CSS support.

## Installation

```bash
npm install vue-calendar
```

## Store Setup

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

- Fully customizable with Tailwind CSS
- Lightweight and performant
- TypeScript support
- Responsive design
- Easy to integrate
- Drag and drop support
- Customizable event colors
- Multiple view modes (month, week, day)

## Documentation

For full documentation and examples, visit [GitHub](https://github.com/Kodeglot/vue-calendar)

## License

MIT
