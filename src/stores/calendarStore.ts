import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { debug } from '@/utils/debug'

/**
 * Calendar Event Interface
 * Defines the structure of calendar events
 */
export interface CalendarEvent {
  id: string          // Unique identifier for the event
  title: string       // Display title of the event
  description?: string // Optional event description
  location?: string   // Optional event location
  start: string       // ISO string of event start time
  end: string         // ISO string of event end time
  tailwindColor: string // Tailwind color name (e.g. 'blue', 'green', 'red')
  allDay?: boolean    // Flag for all-day events
  width?: number      // Width percentage for stacked events
  left?: number       // Left position percentage for stacking
  marginLeft?: number // Margin between stacked events
  order?: number      // Vertical stacking order for month view
  metadata?: Record<string, any> // Custom key-value pairs for user-defined data
}

/**
 * Interface for calendar store overrides
 * Users can provide custom implementations for specific methods
 */
export interface CalendarStoreOverrides {
  addEvent?: (event: CalendarEvent) => void
  addEvents?: (events: CalendarEvent[]) => void
  updateEvent?: (updatedEvent: CalendarEvent) => void
  deleteEvent?: (eventId: string) => void
  updateEventDate?: (eventId: string, newDate: Date) => void
  updateEventDateOnly?: (eventId: string, newDate: Date) => void
  updateEventDuration?: (eventId: string, newStart: Date, newEnd: Date) => void
  updateEventTime?: (eventId: string, newTime: Date) => void
  getEventsForDate?: (date: Date) => CalendarEvent[]
  getEventsForWeek?: (startDate: Date) => CalendarEvent[]
  getEventById?: (eventId: string) => CalendarEvent | undefined
}

// Base store without overrides
export const useCalendarStore = defineStore('calendar', () => {
  // State
  const currentDate = ref(new Date())
  const events = ref<Map<string, CalendarEvent>>(new Map())
  const plugins = ref<CalendarPlugin[]>([])

  // Cache for position recalculation to avoid excessive DOM queries
  let positionRecalculationTimeout: number | null = null

  // Helper function to trigger position recalculation with debouncing
  const triggerPositionRecalculation = () => {
    if (positionRecalculationTimeout) {
      clearTimeout(positionRecalculationTimeout)
    }

    positionRecalculationTimeout = setTimeout(() => {
      // Only run in browser environments
      if (typeof document === 'undefined') return;
      const eventElements = document.querySelectorAll('[data-event-id]');
      eventElements.forEach((element) => {
        element.dispatchEvent(new CustomEvent('recalculate-position'));
      });
      positionRecalculationTimeout = null;
    }, 16); // ~60fps debouncing
  };

  // Memoized date string for efficient comparison
  const getDateString = (date: Date) => date.toDateString()

  // Getters
  const currentMonth = computed(() => currentDate.value.getMonth())
  const monthEvents = computed(() => {
    const currentMonthValue = currentMonth.value
    const currentYear = currentDate.value.getFullYear()

    return Array.from(events.value.values()).filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.getMonth() === currentMonthValue &&
        eventDate.getFullYear() === currentYear
    })
  })

  const getEventById = (eventId: string): CalendarEvent | undefined => {
    return events.value.get(eventId)
  }



  // Reference implementations of all methods
  const referenceAddEvent = (event: CalendarEvent): void => {
    if (!event.id) {
      event.id = uuidv4()
    }
    debug.log('Store: Adding event', {
      eventId: event.id,
      title: event.title,
      start: event.start,
      end: event.end
    });
    events.value.set(event.id, event)
    plugins.value.forEach(plugin => plugin.onEventAdd?.(event))
  }

  const referenceAddEvents = (eventsToAdd: CalendarEvent[]): void => {
    debug.log('Store: Adding multiple events', {
      count: eventsToAdd.length,
      events: eventsToAdd.map(e => ({ id: e.id, title: e.title }))
    });
    
    eventsToAdd.forEach(event => {
      if (!event.id) {
        event.id = uuidv4()
      }
      events.value.set(event.id, event)
      plugins.value.forEach(plugin => plugin.onEventAdd?.(event))
    })
  }

  const referenceUpdateEventDateOnly = (eventId: string, newDate: Date): void => {
    const event = events.value.get(eventId)
    if (event) {
      const start = new Date(event.start)
      const end = new Date(event.end)
      const duration = end.getTime() - start.getTime()

      debug.log('Store: Updating event date only', {
        eventId,
        oldStart: event.start,
        newStart: newDate.toISOString(),
        oldEnd: event.end,
        newEnd: new Date(newDate.getTime() + duration).toISOString(),
        duration,
        preservedTime: `${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}`
      });

      // Create new start date with target date but preserve original time
      // Ensure we're working with a clean date object (00:00:00) to avoid timezone issues
      const cleanNewDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 0, 0, 0, 0);
      
      const newStart = new Date(cleanNewDate)
      newStart.setHours(start.getHours())
      newStart.setMinutes(start.getMinutes())
      newStart.setSeconds(start.getSeconds())
      newStart.setMilliseconds(start.getMilliseconds())

      const newEnd = new Date(newStart.getTime() + duration)

      event.start = newStart.toISOString()
      event.end = newEnd.toISOString()
      events.value.set(eventId, event)
      triggerPositionRecalculation()
    }
  }

  const referenceUpdateEventDate = (eventId: string, newDate: Date): void => {
    const event = events.value.get(eventId)
    if (event) {
      const start = new Date(event.start)
      const end = new Date(event.end)
      const duration = end.getTime() - start.getTime()

      const newStart = new Date(newDate)
      newStart.setHours(start.getHours())
      newStart.setMinutes(start.getMinutes())
      newStart.setSeconds(start.getSeconds())
      newStart.setMilliseconds(start.getMilliseconds())

      const newEnd = new Date(newStart.getTime() + duration)

      event.start = newStart.toISOString()
      event.end = newEnd.toISOString()
      events.value.set(eventId, event)
      triggerPositionRecalculation()
    }
  }

  const referenceUpdateEventDuration = (eventId: string, newStart: Date, newEnd: Date): void => {
    const event = events.value.get(eventId)
    if (event) {
      event.start = newStart.toISOString()
      event.end = newEnd.toISOString()
      events.value.set(eventId, event)
      triggerPositionRecalculation()
    }
  }

  const referenceUpdateEventTime = (eventId: string, newTime: Date): void => {
    const event = events.value.get(eventId)
    if (event) {
      const start = new Date(event.start)
      const end = new Date(event.end)
      const duration = end.getTime() - start.getTime()

      const newStart = new Date(start)
      newStart.setHours(newTime.getHours())
      newStart.setMinutes(newTime.getMinutes())
      newStart.setSeconds(newTime.getSeconds())
      newStart.setMilliseconds(newTime.getMilliseconds())

      const newEnd = new Date(newStart.getTime() + duration)

      event.start = newStart.toISOString()
      event.end = newEnd.toISOString()
      events.value.set(eventId, event)
      triggerPositionRecalculation()
    }
  }

  const referenceUpdateEvent = (updatedEvent: CalendarEvent): void => {
    const existingEvent = events.value.get(updatedEvent.id)
    if (existingEvent) {
      debug.log('Store: Updating event', {
        eventId: updatedEvent.id,
        oldTitle: existingEvent.title,
        newTitle: updatedEvent.title,
        oldStart: existingEvent.start,
        newStart: updatedEvent.start,
        oldEnd: existingEvent.end,
        newEnd: updatedEvent.end
      });
      events.value.set(updatedEvent.id, updatedEvent)
      triggerPositionRecalculation()
    } else {
      debug.warn('Store: Event not found for update', { eventId: updatedEvent.id });
    }
  }

  const referenceDeleteEvent = (eventId: string): void => {
    if (events.value.has(eventId)) {
      const event = events.value.get(eventId);
      debug.log('Store: Deleting event', {
        eventId,
        title: event?.title,
        start: event?.start,
        end: event?.end
      });
      events.value.delete(eventId)
      triggerPositionRecalculation();
    } else {
      debug.warn('Store: Event not found for deletion', { eventId });
    }
  }

  const referenceGetEventsForDate = (date: Date): CalendarEvent[] => {
    const targetDateString = getDateString(date)
    return Array.from(events.value.values()).filter(event =>
      getDateString(new Date(event.start)) === targetDateString
    )
  }

  const referenceGetEventsForWeek = (startDate: Date): CalendarEvent[] => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)

    return Array.from(events.value.values()).filter(event => {
      const eventStart = new Date(event.start)
      return eventStart >= startDate && eventStart <= endDate
    })
  }

  // Use reference implementations by default
  const addEvent = referenceAddEvent
  const addEvents = referenceAddEvents
  const updateEventDateOnly = referenceUpdateEventDateOnly
  const updateEventDate = referenceUpdateEventDate
  const updateEventDuration = referenceUpdateEventDuration
  const updateEventTime = referenceUpdateEventTime
  const updateEvent = referenceUpdateEvent
  const deleteEvent = referenceDeleteEvent
  const getEventsForDate = referenceGetEventsForDate
  const getEventsForWeek = referenceGetEventsForWeek

  function registerPlugin(plugin: CalendarPlugin) {
    plugins.value.push(plugin)
    plugin.onRegister?.({
      currentDate: currentDate.value,
      events: Array.from(events.value.values()),
      plugins: plugins.value,
      currentMonth: currentMonth.value,
      monthEvents: monthEvents.value,
      addEvent,
      addEvents,
      updateEvent,
      deleteEvent,
      updateEventDate,
      updateEventDateOnly,
      updateEventDuration,
      updateEventTime,
      getEventsForDate,
      getEventsForWeek,
      registerPlugin,
    })
  }

  return {
    currentDate,
    events,
    plugins,
    currentMonth,
    monthEvents,
    getEventById,
    addEvent,
    addEvents,
    updateEvent,
    deleteEvent,
    updateEventDate,
    updateEventDateOnly,
    updateEventDuration,
    updateEventTime,
    getEventsForDate,
    getEventsForWeek,
    registerPlugin
  }
})

/**
 * Factory function to create a calendar store with custom overrides
 * This provides the same interface as useCalendarStore but with optional method overrides
 */
export function useCustomCalendarStore(overrides?: CalendarStoreOverrides) {
  const baseStore = useCalendarStore()
  
  // Create a proxy that uses custom implementations when provided
  return {
    // State (always from base store)
    currentDate: baseStore.currentDate,
    events: baseStore.events,
    plugins: baseStore.plugins,
    currentMonth: baseStore.currentMonth,
    monthEvents: baseStore.monthEvents,
    
    // Methods (custom or default)
    getEventById: overrides?.getEventById || baseStore.getEventById,
    addEvent: overrides?.addEvent || baseStore.addEvent,
    addEvents: overrides?.addEvents || baseStore.addEvents,
    updateEvent: overrides?.updateEvent || baseStore.updateEvent,
    deleteEvent: overrides?.deleteEvent || baseStore.deleteEvent,
    updateEventDate: overrides?.updateEventDate || baseStore.updateEventDate,
    updateEventDateOnly: overrides?.updateEventDateOnly || baseStore.updateEventDateOnly,
    updateEventDuration: overrides?.updateEventDuration || baseStore.updateEventDuration,
    updateEventTime: overrides?.updateEventTime || baseStore.updateEventTime,
    getEventsForDate: overrides?.getEventsForDate || baseStore.getEventsForDate,
    getEventsForWeek: overrides?.getEventsForWeek || baseStore.getEventsForWeek,
    registerPlugin: baseStore.registerPlugin
  }
}

export interface CalendarPlugin {
  onRegister?: (store: {
    currentDate: Date
    events: CalendarEvent[]
    plugins: CalendarPlugin[]
    currentMonth: number
    monthEvents: CalendarEvent[]
    addEvent: (event: CalendarEvent) => void
    addEvents: (events: CalendarEvent[]) => void
    updateEvent: (event: CalendarEvent) => void
    deleteEvent: (eventId: string) => void
    updateEventDate: (eventId: string, newDate: Date) => void
    updateEventDateOnly: (eventId: string, newDate: Date) => void
    updateEventDuration: (eventId: string, newStart: Date, newEnd: Date) => void
    updateEventTime: (eventId: string, newTime: Date) => void
    getEventsForDate: (date: Date) => CalendarEvent[]
    getEventsForWeek: (startDate: Date) => CalendarEvent[]
    registerPlugin: (plugin: CalendarPlugin) => void
  }) => void
  onEventAdd?: (event: CalendarEvent) => void
}

export interface DateRange {
  start: Date
  end: Date
}
