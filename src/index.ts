// Main entry point for the vue-calendar npm package

import './style.css'

// Export main components
export { default as CalendarView } from './views/CalendarView.vue'
export { default as CalendarMonthComponent } from './components/CalendarMonthComponent.vue'
export { default as CalendarWeekComponent } from './components/CalendarWeekComponent.vue'
export { default as CalendarDayComponent } from './components/CalendarDayComponent.vue'
export { default as CalendarEventComponent } from './components/CalendarEventComponent.vue'
export { default as EventModal } from './components/EventModal.vue'
export { default as TimeGridComponent } from './components/TimeGridComponent.vue'

// Export store and types
export { useCalendarStore, type CalendarEvent, type CalendarPlugin, type DateRange } from './stores/calendarStore'

// Export composables
export { useCalendarEventInteractions } from './composables/useCalendarEventInteractions'
export { useTimezone } from './composables/useTimezone'

// Default export for convenience
import CalendarView from './views/CalendarView.vue'
export default CalendarView 