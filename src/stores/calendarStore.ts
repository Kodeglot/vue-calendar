import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

/**
 * Calendar Event Interface
 * Defines the structure of calendar events
 */
export interface CalendarEvent {
  id: string          // Unique identifier for the event
  title: string       // Display title of the event
  start: string       // ISO string of event start time
  end: string         // ISO string of event end time
  tailwindColor: string // Tailwind color name (e.g. 'blue', 'green', 'red')
  allDay?: boolean    // Flag for all-day events
  width?: number      // Width percentage for stacked events
  left?: number       // Left position percentage for stacking
  marginLeft?: number // Margin between stacked events
  order?: number      // Vertical stacking order for month view
}

export const useCalendarStore = defineStore('calendar', () => {
  // State
  const currentDate = ref(new Date())
  const selectedDate = ref<Date | null>(null)
  const events = ref<Map<string, CalendarEvent>>(new Map())
  const plugins = ref<CalendarPlugin[]>([])

  // Getters
  const currentMonth = computed(() => currentDate.value.getMonth())
  const monthEvents = computed(() => {
    return Array.from(events.value.values()).filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.getMonth() === currentMonth.value &&
        eventDate.getFullYear() === currentDate.value.getFullYear()
    })
  })

  // Actions
  const addEvent = (event: CalendarEvent): void => {
    if (!event.id) {
      event.id = uuidv4()
    }
    events.value.set(event.id, event)
    plugins.value.forEach(plugin => plugin.onEventAdd?.(event))
  }

  const updateEventDateOnly = (eventId: string, newDate: Date): void => {
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

  const updateEventDate = (eventId: string, newDate: Date): void => {
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

  const updateEventDuration = (eventId: string, newStart: Date, newEnd: Date): void => {
    const event = events.value.get(eventId)
    if (event) {
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

  const getEventsForWeek = (startDate: Date): CalendarEvent[] => {
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    return Array.from(events.value.values()).filter(event => {
      const eventStart = new Date(event.start)
      return eventStart >= startDate && eventStart <= endDate
    })
  }

  function registerPlugin(plugin: CalendarPlugin) {
    plugins.value.push(plugin)
    plugin.onRegister?.({
      currentDate: currentDate.value,
      selectedDate: selectedDate.value,
      events: Array.from(events.value.values()),
      plugins: plugins.value,
      currentMonth: currentMonth.value,
      monthEvents: monthEvents.value,
      addEvent,
      updateEventDate,
      updateEventDateOnly,
      updateEventDuration,
      getEventsForDate,
      getEventsForWeek,
      registerPlugin
    })
  }

  return {
    currentDate,
    selectedDate,
    events,
    plugins,
    currentMonth,
    monthEvents,
    addEvent,
    updateEventDate,
    updateEventDateOnly,
    updateEventDuration,
    getEventsForDate,
    getEventsForWeek,
    registerPlugin
  }
})

export interface CalendarPlugin {
  onRegister?: (store: {
    currentDate: Date
    selectedDate: Date | null
    events: CalendarEvent[]
    plugins: CalendarPlugin[]
    currentMonth: number
    monthEvents: CalendarEvent[]
    addEvent: (event: CalendarEvent) => void
    updateEventDate: (eventId: string, newDate: Date) => void
    updateEventDateOnly: (eventId: string, newDate: Date) => void
    updateEventDuration: (eventId: string, newStart: Date, newEnd: Date) => void
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
