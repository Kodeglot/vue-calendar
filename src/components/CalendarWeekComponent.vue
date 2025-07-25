<template>
  <!-- Main Week View Container -->
  <div
    class="grow flex flex-col w-full"
    role="grid"
    aria-label="Week View Calendar"
  >
    <!-- Time Grid Container -->

    <div class="flex flex-row">
      <div class="w-20 min-h-10"></div>
      <div class="flex-1">
        <!-- Day Headers -->
        <div class="flex-1 grid grid-cols-7 bg-gray-200" role="row">
          <div
            v-for="date in visibleDates"
            :key="date.toISOString()"
            class="bg-white p-2 font-semibold text-center"
            role="columnheader"
            :aria-label="`${days[date.getDay()]} ${date.getDate()}`"
          >
            {{ days[date.getDay()] }} {{ date.getDate() }}
          </div>
        </div>

        <!-- All Day Events Section -->
        <div class="border-t" role="rowgroup" aria-label="All Day Events">
          <!-- Dynamic Rows for All Day Events -->
          <div
            v-for="row in allDayRows"
            :key="row"
            class="grid grid-cols-7 gap-px"
            role="row"
          >
            <div
              v-for="date in visibleDates"
              :key="date.toISOString()"
              class="p-2"
              role="gridcell"
            >
              <CalendarEventComponent
                v-for="(event, index) in getAllDayEventsForRow(date, row)"
                :key="event.id"
                :event="event"
                :resizable="false"
                :viewType="'week'"
                class="mb-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-row">
      <div class="w-20 flex-shrink-0" @dragover.prevent="handleDragOver">
        <!-- Hour Indicators -->
        <div
          v-for="hour in hours"
          :key="hour"
          class="relative text-center w-full"
          :style="{ height: `${hourHeight}px` }"
          role="row"
        >
          <div
            v-if="hour !== 0"
            class="absolute -top-3 left-2 text-sm text-gray-500 text-center w-full"
            role="time"
            :aria-label="formatHour(hour)"
          >
            {{ formatHour(hour) }}
          </div>
        </div>
      </div>

      <div
        class="flex-1 overflow-auto"
        role="rowgroup"
        aria-label="Time Slots"
        ref="weekGrid"
      >
        <!-- Day Columns -->
        <div class="grid grid-cols-7 gap-px bg-gray-200">
          <div
            v-for="(date, index) in visibleDates"
            :key="date.toISOString()"
            class="bg-white relative"
            @dragover.prevent="handleDragOver"
            role="gridcell"
          >
            <TimeGridComponent
              :hourHeight="hourHeight"
              :timeFormat="props.timeFormat === '24h' 
                ? { hour: '2-digit', minute: '2-digit', hour12: false }
                : { hour: 'numeric', minute: '2-digit', hour12: true }"
              :showHourLabels="false"
              :baseDate="date"
              @timeClick="handleTimeClick"
            >
              <!-- Calendar Events -->
              <template v-if="weekGrid">
                <CalendarEventComponent
                  v-for="event in getStackedEvents(date)"
                  :key="event.id"
                  :event="event"
                  :resizable="true"
                  :viewType="'week'"
                  :containerRef="weekGrid"
                  :timeFormat="props.timeFormat"
                  class="absolute"
                  role="article"
                  @click="handleWeekEventClick(event)"
                  @event-updated="onEventUpdated"
                >
                  <template v-if="$slots['event-content']" #default="slotProps">
                    <slot name="event-content" v-bind="slotProps" />
                  </template>
                </CalendarEventComponent>
              </template>
            </TimeGridComponent>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type PropType } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import CalendarEventComponent from "../components/CalendarEventComponent.vue";
import TimeGridComponent from "./TimeGridComponent.vue";
import { debug } from "@/utils/debug";
// import { useCalendarEventInteractions } from "@/composables/useCalendarEventInteractions";

// Declare global property for TypeScript
declare global {
  interface Window {
    __calendarEventModified?: boolean;
    __lastModifiedEventId?: string | null;
  }
}

/**
 * CalendarWeekComponent - Displays a week view calendar with time slots and events
 *
 * Features:
 * - Responsive week view layout
 * - Drag and drop event handling (both date and time)
 * - Event resizing
 * - All-day events section
 * - Accessible markup
 *
 * @example
 * <CalendarWeekComponent :currentDate="new Date()" />
 */
interface EventPosition {
  top: string;
  height: string;
}

const props = defineProps({
  hourHeight: {
    type: Number,
    required: true,
    default: 60,
  },
  /**
   * The current date to display in the week view
   * @required
   * @type {Date}
   */
  currentDate: {
    type: Date,
    required: true,
    validator: (value: Date) => !isNaN(value.getTime()),
  },
  /**
   * Time format preference for displaying times
   * @default '24h'
   * @type {'12h' | '24h'}
   */
  timeFormat: {
    type: String as PropType<'12h' | '24h'>,
    default: '24h',
    validator: (value: string) => ['12h', '24h'].includes(value),
  },
});

const emit = defineEmits<{
  /**
   * Emitted when a day/time slot is clicked
   * @param date - The date/time that was clicked
   */
  (e: "dayClick", date: Date): void;

  /**
   * Emitted when an event is dropped on a new date/time
   * @param {string} eventId - The ID of the moved event
   * @param {Date} date - The new date/time the event was dropped on
   */
  (e: "event-dropped", eventId: string, date: Date): void;
  /**
   * Emitted when a time slot is clicked
   * @param {Date} time - The clicked time
   */
  (e: "time-click", time: Date): void;
  /**
   * Emitted when an event is clicked
   * @param {CalendarEvent} event - The clicked event
   */
  (e: "eventClick", event: CalendarEvent): void;
  /**
   * Emitted when an event is updated (resized or moved)
   * @param {CalendarEvent} event - The updated event
   * @param {string} newStart - The new start time of the event
   * @param {string} newEnd - The new end time of the event
   */
  (e: "event-updated", event: CalendarEvent, newStart: string, newEnd: string): void;
}>();

// Constants
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const hours = Array.from({ length: 24 }, (_, i) => i); // [0..23] hour array
const store = useCalendarStore();
const draggedEvent = ref<CalendarEvent | null>(null);

// Make events reactive by accessing the store's events directly
const allEvents = computed(() => Array.from(store.events.values()));

/**
 * Reference to the day grid container
 * @type {Ref<HTMLElement>}
 */
const weekGrid = ref<HTMLElement>();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

// Setup event interactions composable
const dummyEvent: CalendarEvent = {
  id: "dummy",
  title: "",
  start: props.currentDate.toISOString(),
  end: new Date(props.currentDate.getTime() + 3600000).toISOString(),
  tailwindColor: "bg-white",
  allDay: false,
};

// const eventInteractions = useCalendarEventInteractions(
//   (event: string, ...args: any[]) => {
//     if (event === "dayClick") {
//       emit("dayClick", args[0] as Date);
//     } else if (event === "resize" || event === "resize-end") {
//       const [event, newStart, newEnd] = args as [CalendarEvent, string, string];
//       // Handle resize events if needed
//     }
//   },
//   {
//     event: dummyEvent,
//     pxPerHour: props.hourHeight,
//     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     containerRef: weekGrid.value as HTMLElement,
//   }
// );

/**
 * Generates the visible dates for the current week
 * @returns {Date[]} Array of 7 dates representing the current week
 */
const visibleDates = computed<Date[]>(() => {
  const start = new Date(props.currentDate);
  start.setDate(start.getDate() - start.getDay()); // Start on Sunday

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return date;
  });
});

/**
 * Gets all-day events for a specific date
 * @param {Date} date - The date to get events for
 * @returns {CalendarEvent[]} Array of all-day events
 */
const getAllDayEvents = (date: Date) => {
  const targetDateString = date.toDateString();
  return allEvents.value.filter((event) => {
    const eventDateString = new Date(event.start).toDateString();
    if (eventDateString !== targetDateString) return false;
    
    const start = new Date(event.start)
    const end = new Date(event.end)
    // All-day events span exactly 24 hours (86400000 ms)
    return end.getTime() - start.getTime() === 86400000
  });
};

/**
 * Calculates number of rows needed for all-day events
 * @returns {number} Number of rows needed (2 events per row)
 */
const allDayRows = computed(() => {
  const maxEvents = Math.max(
    ...visibleDates.value.map((date) => getAllDayEvents(date).length)
  );
  return Math.max(1, Math.ceil(maxEvents / 2));
});

/**
 * Gets events for a specific row
 * @param {Date} date - The date to get events for
 * @param {number} row - The row number (1-based)
 * @returns {CalendarEvent[]} Array of events for the row
 */
const getAllDayEventsForRow = (date: Date, row: number) => {
  const events = getAllDayEvents(date);
  return events.slice((row - 1) * 2, row * 2);
};

/**
 * Gets stacked events with calculated positions
 * @param {Date} date - The date to get events for
 * @returns {CalendarEvent[]} Array of events with position data
 */
const getStackedEvents = (date: Date) => {
  const targetDateString = date.toDateString();
  const events = allEvents.value.filter((event) => {
    const eventDateString = new Date(event.start).toDateString();
    return eventDateString === targetDateString;
  });
  return calculateEventPositions(events);
};

/**
 * Calculates event positions to prevent overlap - Optimized version
 * @param {CalendarEvent[]} events - Array of events to position
 * @returns {CalendarEvent[]} Events with position data
 */
const calculateEventPositions = (events: CalendarEvent[]): CalendarEvent[] => {
  if (events.length === 0) return events;
  
  // Pre-sort events by start time for better performance
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const columns: CalendarEvent[][] = [];
  const eventStartTimes = new Map<string, number>();
  const eventEndTimes = new Map<string, number>();

  // Pre-calculate start and end times to avoid repeated Date object creation
  sortedEvents.forEach(event => {
    eventStartTimes.set(event.id, new Date(event.start).getTime());
    eventEndTimes.set(event.id, new Date(event.end).getTime());
  });

  sortedEvents.forEach((event) => {
    const eventStart = eventStartTimes.get(event.id)!;
    let placed = false;
    
    for (const column of columns) {
      const lastEvent = column[column.length - 1];
      const lastEventEnd = eventEndTimes.get(lastEvent.id)!;
      
      if (eventStart >= lastEventEnd) {
        column.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
    }
  });

  // Calculate width and positions in a single pass
  const totalColumns = columns.length;
  columns.forEach((column, colIndex) => {
    const columnWidth = 100 / totalColumns;
    column.forEach((event) => {
      event.width = columnWidth;
      event.left = colIndex * columnWidth;
      event.marginLeft = 0.5;
    });
  });

  return sortedEvents;
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (!draggedEvent.value) return;
  e.dataTransfer!.dropEffect = "move";
};

// Handle event clicks with protection against drag/resize
const handleWeekEventClick = (event: CalendarEvent) => {
  debug.log('Week: Event clicked', {
    eventTitle: event.title,
    eventId: event.id,
    globalFlag: window.__calendarEventModified,
    lastModifiedEventId: window.__lastModifiedEventId
  });
  
  // Check if this event was recently modified
  if (window.__calendarEventModified || window.__lastModifiedEventId === event.id) {
    debug.log('Week: Preventing event click - event was recently modified');
    return;
  }
  
  debug.log('Week: Emitting eventClick for week view');
  emit('eventClick', event);
};

const handleTimeClick = (time: Date) => {
  debug.log('Week: Time clicked', {
    time: time.toISOString(),
    currentDate: props.currentDate.toISOString()
  });
  emit("dayClick", time);
};

/**
 * Formats hour for display
 * @param {number} hour - The hour to format (0-23)
 * @returns {string} Formatted time string in selected format (e.g., "14:00" or "2 PM")
 */
const formatHour = (hour: number) => {
  return new Date(2023, 0, 1, hour).toLocaleTimeString([], {
    hour: props.timeFormat === '24h' ? "2-digit" : "numeric",
    minute: "2-digit",
    hour12: props.timeFormat === '12h',
  });
};

function onEventUpdated(event: CalendarEvent, newStart: string, newEnd: string) {
  emit('event-updated', event, newStart, newEnd);
}
</script>
