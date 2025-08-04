<template>
  <div class="custom-store-example">
    <h2 class="text-2xl font-bold mb-4">Custom Store Example</h2>
    <p class="mb-4 text-gray-600">
      This example demonstrates how to use <code>useCustomCalendarStore</code> to override specific methods
      while keeping the reference implementation for others.
    </p>

    <!-- Custom Store Controls -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Custom Store Overrides</h3>
      <div class="space-y-2">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="overrides.addEvent" 
            class="mr-2"
          />
          Override <code>addEvent</code> (logs to console)
        </label>
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="overrides.deleteEvent" 
            class="mr-2"
          />
          Override <code>deleteEvent</code> (confirmation dialog)
        </label>
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="overrides.getEventsForDate" 
            class="mr-2"
          />
          Override <code>getEventsForDate</code> (filters out events with "private" in title)
        </label>
      </div>
    </div>

    <!-- Calendar with Custom Store -->
    <CalendarView 
      :current-date="currentDate"
      :events="customStore.events"
      @event-added="handleEventAdded"
      @event-updated="handleEventUpdated"
      @event-deleted="handleEventDeleted"
      class="border rounded-lg"
    />

    <!-- Debug Info -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Debug Information</h3>
      <div class="text-sm space-y-1">
        <div><strong>Active Overrides:</strong> {{ activeOverrides.join(', ') || 'None' }}</div>
        <div><strong>Total Events:</strong> {{ Array.from(customStore.events.values()).length }}</div>
        <div><strong>Current Date:</strong> {{ currentDate.toDateString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarView } from '@/index'
import { useCalendarStore, useCustomCalendarStore, type CalendarStoreOverrides, type CalendarEvent } from '@/index'

// State
const currentDate = ref(new Date())
const overrides = ref({
  addEvent: false,
  deleteEvent: false,
  getEventsForDate: false
})

// Custom implementations
const customAddEvent = (event: CalendarEvent): void => {
  console.log('🔵 Custom addEvent called:', {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end
  })
  
  // Call the default implementation
  const baseStore = useCalendarStore()
  baseStore.addEvent(event)
}

const customDeleteEvent = (eventId: string): void => {
  console.log('🔴 Custom deleteEvent called for event:', eventId)
  
  // Show confirmation dialog
  if (confirm(`Are you sure you want to delete event "${eventId}"?`)) {
    const baseStore = useCalendarStore()
    baseStore.deleteEvent(eventId)
  } else {
    console.log('Delete cancelled by user')
  }
}

const customGetEventsForDate = (date: Date): CalendarEvent[] => {
  console.log('🟡 Custom getEventsForDate called for:', date.toDateString())
  
  // Get all events for the date using default implementation
  const baseStore = useCalendarStore()
  const allEvents = baseStore.getEventsForDate(date)
  
  // Filter out events with "private" in the title
  const filteredEvents = allEvents.filter(event => 
    !event.title.toLowerCase().includes('private')
  )
  
  console.log('Filtered events:', filteredEvents.length, 'of', allEvents.length)
  return filteredEvents
}

// Create custom store with conditional overrides
const customStore = computed(() => {
  const overridesConfig: CalendarStoreOverrides = {}
  
  if (overrides.value.addEvent) {
    overridesConfig.addEvent = customAddEvent
  }
  
  if (overrides.value.deleteEvent) {
    overridesConfig.deleteEvent = customDeleteEvent
  }
  
  if (overrides.value.getEventsForDate) {
    overridesConfig.getEventsForDate = customGetEventsForDate
  }
  
  return useCustomCalendarStore(overridesConfig)
})

// Computed properties
const activeOverrides = computed(() => {
  const active: string[] = []
  if (overrides.value.addEvent) active.push('addEvent')
  if (overrides.value.deleteEvent) active.push('deleteEvent')
  if (overrides.value.getEventsForDate) active.push('getEventsForDate')
  return active
})

// Event handlers
const handleEventAdded = (event: CalendarEvent) => {
  console.log('Event added:', event)
}

const handleEventUpdated = (event: CalendarEvent, newStart: string, newEnd: string) => {
  console.log('Event updated:', event, newStart, newEnd)
}

const handleEventDeleted = (eventId: string) => {
  console.log('Event deleted:', eventId)
}

// Add some sample events
const addSampleEvents = () => {
  const store = customStore.value
  
  const sampleEvents = [
    {
      id: 'sample-1',
      title: 'Regular Meeting',
      start: '2025-01-15T10:00:00Z',
      end: '2025-01-15T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    },
    {
      id: 'sample-2',
      title: 'Private Discussion',
      start: '2025-01-15T14:00:00Z',
      end: '2025-01-15T15:00:00Z',
      tailwindColor: 'red',
      allDay: false
    },
    {
      id: 'sample-3',
      title: 'Team Lunch',
      start: '2025-01-15T12:00:00Z',
      end: '2025-01-15T13:00:00Z',
      tailwindColor: 'green',
      allDay: false
    }
  ]
  
  // Use addEvents for bulk addition
  store.addEvents(sampleEvents)
}

const addBulkEvents = () => {
  const store = customStore.value
  
  const bulkEvents = [
    {
      title: 'Bulk Event 1',
      start: '2025-01-16T09:00:00Z',
      end: '2025-01-16T10:00:00Z',
      tailwindColor: 'purple',
      allDay: false
    },
    {
      title: 'Bulk Event 2',
      start: '2025-01-16T11:00:00Z',
      end: '2025-01-16T12:00:00Z',
      tailwindColor: 'orange',
      allDay: false
    },
    {
      title: 'Bulk Event 3',
      start: '2025-01-16T13:00:00Z',
      end: '2025-01-16T14:00:00Z',
      tailwindColor: 'pink',
      allDay: false
    }
  ]
  
  store.addEvents(bulkEvents)
}

// Add sample events on mount
addSampleEvents()
</script>

<style scoped>
.custom-store-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
</style> 