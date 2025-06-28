<template>
  <!-- Day View Layout -->
  <div
    class="grow flex flex-col w-full"
    role="grid"
    aria-label="Day View Calendar"
  >
    <div class="flex flex-row">
      <div class="w-20 min-h-10"></div>
      <div class="flex-1">
        <!-- Day Headers -->
        <div class="bg-gray-200">
          <!-- Day Headers -->
          <div class="bg-white p-2 font-semibold text-center">
            {{ currentDay }}
          </div>
        </div>

        <!-- All Day Events Section -->
        <div class="border-t" role="rowgroup" aria-label="All Day Events">
          <!-- Dynamic Rows for All Day Events -->
          <div v-for="row in allDayRows" :key="row" class="relative gap-px">
            <div class="p-2" role="gridcell">
              <CalendarEventComponent
                v-for="(event, index) in getAllDayEventsForRow(
                  props.currentDate,
                  row
                )"
                :key="event.id"
                :event="event"
                :resizable="false"
                :viewType="'day'"
                class="mb-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-row">
      <div
        ref="dayGrid"
        @dragover.prevent
      
        class="w-20 h-24 text-center"
      >
        <!-- Hour Indicators -->
        <div
          v-for="hour in hours"
          :key="hour"
          class="relative text-center w-full"
          :style="{ height: `${hourHeight}px` }"
          role="row"
        >
          <div
            v-if="hour != 0"
            class="absolute -top-3 left-2 text-sm text-gray-500 text-center w-full"
            role="time"
            :aria-label="formatHour(hour)"
          >
            {{ formatHour(hour) }}
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-auto" role="rowgroup">
        <!-- Main Time Grid -->
        <TimeGridComponent 
          :hourHeight="hourHeight" 
          :timeFormat="props.timeFormat === '24h' 
            ? { hour: '2-digit', minute: '2-digit', hour12: false }
            : { hour: 'numeric', minute: '2-digit', hour12: true }"
        >
          <!-- Calendar Events -->
          <template v-if="dayGrid">
            <CalendarEventComponent
              v-for="event in stackedEvents"
              :key="event.id"
              :event="event"
              :resizable="true"
              :container-ref="dayGrid"
              :timeFormat="props.timeFormat"
              class="absolute"
              :viewType="'day'"
            />
          </template>
        </TimeGridComponent>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import CalendarEventComponent from "../components/CalendarEventComponent.vue";
import TimeGridComponent from "./TimeGridComponent.vue";
// import { useCalendarEventInteractions } from "../composables/useCalendarEventInteractions";

/**
 * Reference to the day grid container
 * @type {Ref<HTMLElement>}
 */
const dayGrid = ref<HTMLElement | null>(null);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});


/**
 * CalendarDayComponent - Displays a single day view with time slots and events
 *
 * Features:
 * - Responsive day view layout
 * - Drag and drop event handling
 * - Event resizing
 * - All-day events section
 * - Accessible markup
 * - Customizable time and date formats
 * - Configurable hour slot height
 *
 * @example
 * <CalendarDayComponent
 *   :currentDate="new Date()"
 *   :hourHeight="80"
 *   :timeFormat="{ hour: '2-digit', minute: '2-digit' }"
 *   :dateFormat="{ weekday: 'short', month: 'short', day: 'numeric' }"
 * />
 */
interface Props {
  /**
   * Current date to display
   * @required
   * @type {Date}
   */
  currentDate: Date;

  /**
   * Height of each hour slot in pixels
   * @default 60
   * @type {number}
   */
  hourHeight?: number;

  /**
   * Time format preference for displaying times
   * @default '24h'
   * @type {'12h' | '24h'}
   */
  timeFormat?: '12h' | '24h';

  /**
   * Time display format options
   * @default { hour: '2-digit', minute: '2-digit', hour12: false }
   * @type {Intl.DateTimeFormatOptions}
   */
  timeFormatOptions?: Intl.DateTimeFormatOptions;

  /**
   * Date display format options
   * @default { weekday: 'long', month: 'long', day: 'numeric' }
   * @type {Intl.DateTimeFormatOptions}
   */
  dateFormat?: Intl.DateTimeFormatOptions;

  /**
   * Whether to show the day header
   * @default true
   * @type {boolean}
   */
  showHeader?: boolean;
}

/**
 * Event Position Interface
 * @property {string} top - CSS top position in pixels
 * @property {string} height - CSS height in pixels
 */
interface EventPosition {
  top: string;
  height: string;
}

/**
 * Component Props with Defaults
 * @type {Props}
 */
interface Emits {
  /**
   * Emitted when a day/time slot is clicked
   * @param date - The date/time that was clicked
   */
  (e: "dayClick", date: Date): void;

  /**
   * Emitted when an event is dropped on the calendar
   * @param eventId - The ID of the dropped event
   * @param date - The date/time the event was dropped on
   */
  (e: "eventDrop", eventId: string, date: Date): void;
}

const emit = defineEmits<Emits>();

const props = withDefaults(defineProps<Props>(), {
  hourHeight: 60,
  timeFormat: '24h',
  timeFormatOptions: () => ({
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }),
  dateFormat: () => ({
    weekday: "long",
    month: "long",
    day: "numeric",
  }),
  showHeader: true,
});

/**
 * Component State
 * @type {Object}
 */
const store = useCalendarStore();

/**
 * Array of hours from 0 to 23
 * @type {number[]}
 */
const hours = Array.from({ length: 24 }, (_, i) => i);

// Setup event interactions composable
const dummyEvent: CalendarEvent = {
  id: 'dummy',
  title: '',
  start: props.currentDate.toISOString(),
  end: new Date(props.currentDate.getTime() + 3600000).toISOString(),
  tailwindColor: 'bg-white',
  allDay: false
};

// const eventInteractions = useCalendarEventInteractions(
//   (event: string, ...args: any[]) => {
//     if (event === 'dayClick') {
//       emit('dayClick', args[0] as Date);
//     } else if (event === 'resize' || event === 'resize-end') {
//       const [event, newStart, newEnd] = args as [
//         CalendarEvent,
//         string,
//         string
//       ];
//       // Handle resize events if needed
//     }
//   },
//   {
//     event: dummyEvent,
//     pxPerHour: props.hourHeight,
//     timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     containerRef: dayGrid.value as HTMLElement,
//     viewType: 'day'
//   }
// );

/**
 * Get all-day events for a specific date
 * @param {Date} date - The date to get events for
 * @returns {CalendarEvent[]} Array of all-day events
 */
const getAllDayEvents = (date: Date) => {
  return store.getEventsForDate(date).filter((event) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    // All-day events span exactly 24 hours
    return end.getTime() - start.getTime() === 86400000;
  });
};

/**
 * Calculates number of rows needed for all-day events
 * @returns {number} Number of rows needed (2 events per row)
 */
const allDayRows = computed(() => {
  const maxEvents = getAllDayEvents(props.currentDate).length;
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
 * Get stacked events with calculated positions
 * @returns {CalendarEvent[]} Array of events with position data
 */
const stackedEvents = computed(() => {
  try {
    const events = store.getEventsForDate(props.currentDate);
    return calculateEventPositions(events);
  } catch (error) {
    console.error("Error loading events:", error);
    return [];
  }
});

/**
 * Formatted current day string
 * @returns {string} Formatted date string
 */
const currentDay = computed(() => {
  return props.currentDate.toLocaleDateString("en-US", props.dateFormat);
});

/**
 * Calculate event positions and prevent overlaps
 * @param {CalendarEvent[]} events - Array of events to position
 * @returns {CalendarEvent[]} Events with position data
 */
const calculateEventPositions = (events: CalendarEvent[]): CalendarEvent[] => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const columns: CalendarEvent[][] = [];

  // Arrange events into columns to prevent overlap
  sortedEvents.forEach((event) => {
    let placed = false;
    for (const column of columns) {
      const lastEvent = column[column.length - 1];
      if (new Date(event.start) >= new Date(lastEvent.end)) {
        column.push(event);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
    }
  });

  // Calculate width and positions for each event
  columns.forEach((column, colIndex) => {
    column.forEach((event) => {
      const totalColumns = columns.length;
      event.width = 100 / totalColumns; // Equal width for all columns
      event.left = colIndex * event.width; // Left position based on column index
      event.marginLeft = 0.5; // Small gap between events
    });
  });

  return sortedEvents;
};

/**
 * Format hour display
 * @param {number} hour - The hour to format (0-23)
 * @returns {string} Formatted time string in selected format (e.g., "14:00" or "2 PM")
 */
const formatHour = (hour: number) => {
  return new Date(2023, 0, 1, hour).toLocaleTimeString(
    "en-US",
    {
      hour: props.timeFormat === '24h' ? "2-digit" : "numeric",
      minute: "2-digit",
      hour12: props.timeFormat === '12h',
    }
  );
};

</script>
