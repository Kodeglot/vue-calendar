<template>
  <!-- Day View Layout -->
  <div class="grid grid-cols-1 gap-px bg-gray-200">
    <!-- Day Header -->
    <div class="bg-white p-2 font-semibold text-center">
      {{ currentDay }}
    </div>

    <!-- Main Time Grid -->
    <div
      ref="dayGrid"
      class="min-h-screen bg-white p-2 relative"
      @dragover.prevent="handleDragOver"
      @drop="handleDrop"
    >
      <!-- Hour Indicators -->
      <div v-for="hour in hours" :key="hour" class="h-16 border-t relative">
        <div class="absolute -top-3 left-2 text-sm text-gray-500">
          {{ formatHour(hour) }}
        </div>
      </div>

      <!-- Calendar Events -->
      <CalendarEventComponent
        v-for="event in stackedEvents"
        :key="event.id"
        :event="event"
        :resizable="true"
        :container-ref="dayGrid"
        @resize="handleResize"
        @dragstart="handleEventDragStart"
        class="absolute"
        :viewType="'day'"
        :style="eventPosition(event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import CalendarEventComponent from "../components/CalendarEventComponent.vue";

/**
 * Component Props Interface
 */
interface Props {
  currentDate: Date; // Currently displayed date
  hourHeight?: number; // Height in pixels for each hour slot (default: 63px)
  timeFormat?: Intl.DateTimeFormatOptions; // Time display format
  dateFormat?: Intl.DateTimeFormatOptions; // Date display format
  showHeader?: boolean; // Whether to show the day header
}

/**
 * Event Position Interface
 */
interface EventPosition {
  top: string;
  height: string;
}

/**
 * Component Props with Defaults
 */
const props = withDefaults(defineProps<Props>(), {
  hourHeight: 63,
  timeFormat: () => ({
    hour: "numeric",
    minute: "2-digit"
  }),
  dateFormat: () => ({
    weekday: "long",
    month: "long",
    day: "numeric"
  }),
  showHeader: true
});

/**
 * Component State
 */
const store = useCalendarStore();
const hours = Array.from({ length: 24 }, (_, i) => i); // 24-hour array
const dayGrid = ref<HTMLElement>(); // Grid container ref
const draggedEvent = ref<CalendarEvent | null>(null); // Dragged event state

/**
 * Computed Properties
 */

// Get and stack events for current date
const stackedEvents = computed(() => {
  try {
    const events = store.getEventsForDate(props.currentDate);
    return calculateEventPositions(events);
  } catch (error) {
    console.error("Error loading events:", error);
    return [];
  }
});

// Formatted current day string
const currentDay = computed(() => {
  return props.currentDate.toLocaleDateString("en-US", props.dateFormat);
});

/**
 * Event Positioning Logic
 */

// Calculate event top position and height
const eventPosition = (event: CalendarEvent): EventPosition => {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startHours = start.getHours() + start.getMinutes() / 60;
  const durationHours = (end.getTime() - start.getTime()) / 3600000;

  return {
    top: `${startHours * props.hourHeight}px`,
    height: `${durationHours * props.hourHeight}px`
  };
};

// Calculate event positions and prevent overlaps
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
 * Formatting Functions
 */

// Format hour display (e.g., 2 PM)
const formatHour = (hour: number) => {
  return new Date(2023, 0, 1, hour).toLocaleTimeString("en-US", props.timeFormat);
};

/**
 * Event Handlers
 */

// Event Drag Start Handler
const handleEventDragStart = (e: DragEvent, event: CalendarEvent) => {
  draggedEvent.value = event;
  e.dataTransfer!.effectAllowed = "move";
};

// Drag Over Handler
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (!draggedEvent.value) return;
  e.dataTransfer!.dropEffect = "move";
};

// Drop Handler - Update event time
const handleDrop = (e: DragEvent) => {
  if (!draggedEvent.value || !dayGrid.value) return;

  try {
    // Calculate drop position
    const rect = dayGrid.value.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hours = y / props.hourHeight; // Convert pixels to hours

    // Update event time
    const newDate = new Date(props.currentDate);
    newDate.setHours(Math.floor(hours));
    newDate.setMinutes((hours % 1) * 60);

    store.updateEventDate(draggedEvent.value.id, newDate);
    draggedEvent.value = null;
  } catch (error) {
    console.error("Error handling drop:", error);
  }
};

// Resize Handler - Update event duration
const handleResize = (event: CalendarEvent, newStart: Date, newEnd: Date) => {
  try {
    store.updateEventDuration(event.id, newStart, newEnd);
  } catch (error) {
    console.error("Error resizing event:", error);
  }
};
</script>
