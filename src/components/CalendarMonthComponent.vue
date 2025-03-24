<template>
  <!-- 
    Month View Layout
    - Displays a full month calendar grid
    - Shows 6 weeks (including partial weeks from previous/next month)
    - Supports drag-and-drop of events
    - Responsive design with Tailwind CSS
  -->
  <div class="grow flex flex-col w-full">
    <div class="grid grid-cols-7 gap-px bg-gray-200 border-t h-100">
      <!-- Day Headers -->
      <div v-for="day in days" :key="day" class="bg-white p-2 font-semibold text-center">
        {{ day }}
      </div>
    </div>

    <!-- Date Cells -->
    <!-- min-h-32 -->
    <div class="grow grid grid-cols-7 gap-px bg-gray-200 border-t h-100">
      <div
        v-for="date in visibleDates"
        :key="date.toISOString()"
        :class="`bg-white min-h-32 p-2 relative gap-y-2`"
        @dragover.prevent
        @drop="handleDrop(date, $event)"
      >
        <!-- Date Number Indicator -->
        <div class="text-right text-sm text-gray-500">
          {{ date.getDate() }}
          <span v-if="isToday(date)" class="text-blue-500 font-extrabold">•</span>
        </div>

        <!-- Events in Cell -->
        <CalendarEventComponent
          v-for="ce in getStackedEvents(date)"
          :key="ce.id"
          :event="ce"
          :resizable="false"
          :viewType="'month'"
          @dragstart="(e) => handleDragStart(e, ce)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCalendarStore, type CalendarEvent } from '../stores/calendarStore'
import CalendarEventComponent from "../components/CalendarEventComponent.vue";

interface MonthComponentProps {
  /**
   * The currently displayed month
   * @required
   */
  currentDate: Date
  
  /**
   * Custom CSS classes for different parts of the component
   */
  customClasses?: {
    container?: string
    header?: string
    dayHeader?: string
    dateCell?: string
    todayIndicator?: string
  }
  
  /**
   * Whether to show week numbers
   * @default false
   */
  showWeekNumbers?: boolean
  
  /**
   * First day of the week (0=Sunday, 1=Monday)
   * @default 0
   */
  firstDayOfWeek?: number
}

const props = withDefaults(defineProps<MonthComponentProps>(), {
  showWeekNumbers: false,
  firstDayOfWeek: 0
})

interface MonthComponentEmits {
  /**
   * Emitted when an event is dropped on a date
   * @param eventId - The ID of the dropped event
   * @param date - The target date
   */
  (e: 'event-dropped', eventId: string, date: Date): void
  
  /**
   * Emitted when a date is clicked
   * @param date - The clicked date
   */
  (e: 'date-clicked', date: Date): void
  
  /**
   * Emitted when month changes
   * @param newDate - The new month date
   */
  (e: 'month-changed', newDate: Date): void
}

const emit = defineEmits<MonthComponentEmits>()

// Weekday labels based on firstDayOfWeek prop
const days = computed(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return [...days.slice(props.firstDayOfWeek), ...days.slice(0, props.firstDayOfWeek)]
})
const store = useCalendarStore()

onMounted(() => {})

// Generate dates for month view (including previous/next month dates)
/**
 * Generates dates for the month view including:
 * - Dates from previous month to fill first week
 * - Dates from next month to fill last week
 * - Always shows 6 weeks (42 days) for consistent layout
 */
const visibleDates = computed<Date[]>(() => {
  try {
    const start = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth(), 1)
    // Adjust start to first day of week
    start.setDate(start.getDate() - ((start.getDay() - props.firstDayOfWeek + 7) % 7))

    const end = new Date(start)
    end.setDate(end.getDate() + 41) // Always show 6 weeks

    const dates: Date[] = []
    const date = new Date(start)
    while (date <= end) {
      dates.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return dates
  } catch (error) {
    console.error('Error generating visible dates:', error)
    return []
  }
})

// Stack events with small horizontal offset
// const getStackedEvents = (date: Date): CalendarEvent[] => {
//   const events = store.getEventsForDate(date)
//   return events.map((event, index) => ({
//     ...event,
//     width: 100,
//     left: 0,
//     marginLeft: index * 2, // 2% margin between stacked events
//   }))
// }

const getStackedEvents = computed(() => (date: Date) => {
  const events = store.getEventsForDate(date)
  const sortedEvents = events
    .map((event) => ({
      ...event,
      width: 100,
      left: 0,
      marginLeft: 0,
    }))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return sortedEvents
})

// Check if date is today
const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Drag Start Handler
const handleDragStart = (e: DragEvent, event: CalendarEvent) => {
  e.dataTransfer?.setData('text/plain', event.id)
}

// Drop Handler
const handleDrop = (date: Date, e: DragEvent) => {
  const eventId = e.dataTransfer?.getData('text/plain')
  if (eventId) emit('event-dropped', eventId, date)
}
</script>
