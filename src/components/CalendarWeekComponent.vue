<template>
  <!-- Week Grid Layout -->
  <div class="grid grid-cols-7 gap-px bg-gray-200">
    <!-- Day Headers -->
    <div
      v-for="date in visibleDates"
      :key="date.toISOString()"
      class="bg-white p-2 font-semibold text-center"
    >
      {{ days[date.getDay()] }} {{ date.getDate() }}
    </div>

    <!-- Day Columns -->
    <div
      v-for="(date, index) in visibleDates"
      :key="date.toISOString()"
      class="min-h-screen bg-white relative"
      @dragover.prevent="handleDragOver"
      @drop="handleDrop(date)"
    >
      <!-- Hour Grid -->
      <div v-for="hour in hours" :key="hour" class="h-16 border-t relative">
        <div
          v-if="index == 0 && hour != 0"
          class="absolute -top-3 left-2 text-sm text-gray-500"
        >
          {{ formatHour(hour) }}
        </div>
      </div>

      <!-- Events -->
      <CalendarEventComponent
        v-for="event in getStackedEvents(date)"
        :key="event.id"
        :event="event"
        :resizable="true"
        :viewType="'week'"
        @resize="handleResize"
        @dragstart="handleEventDragStart"
        class="absolute"
        :style="eventPosition(event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import CalendarEventComponent from "../components/CalendarEventComponent.vue";

interface EventPosition {
  top: string;
  height: string;
}

const props = defineProps<{
  currentDate: Date; // Focus date for the week
}>();

const emit = defineEmits<{
  (e: "event-dropped", eventId: string, date: Date): void;
}>();

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const store = useCalendarStore();
const hours = Array.from({ length: 24 }, (_, i) => i); // [0..23] hour array
const draggedEvent = ref<CalendarEvent | null>(null); // Currently dragged event

// Generate dates for the current week
const visibleDates = computed<Date[]>(() => {
  const start = new Date(props.currentDate);
  start.setDate(start.getDate() - start.getDay()); // Start on Sunday

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }

  return dates;
});

// Calculate event stacking positions
const getStackedEvents = computed(() => (date: Date) => {
  const events = store.getEventsForDate(date);
  return calculateEventPositions(events);
});

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

// Calculate event top position and height
const eventPosition = (event: CalendarEvent): EventPosition => {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const startHours = start.getHours() + start.getMinutes() / 60;
  const durationHours = (end.getTime() - start.getTime()) / 3600000;

  console.log(start.getHours());

  const p = {
    top: `${startHours * 63}px`, // 80px per hour
    height: `${durationHours * 63}px`,
  };

  console.log(p);

  return p;
};

// Event Handlers
const handleEventDragStart = (e: DragEvent, event: CalendarEvent) => {
  draggedEvent.value = event;
  e.dataTransfer!.effectAllowed = "move";
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (!draggedEvent.value) return;
  e.dataTransfer!.dropEffect = "move";
};

const handleDrop = (date: Date) => {
  if (!draggedEvent.value) return;

  const newStart = new Date(date);
  console.log(newStart);
  store.updateEventDateOnly(draggedEvent.value.id, newStart);
  draggedEvent.value = null;
};

const handleResize = (event: CalendarEvent, newStart: Date, newEnd: Date) => {
  store.updateEventDuration(event.id, newStart, newEnd);
};

// Format hour display (e.g., 2 PM)
const formatHour = (hour: number) => {
  return new Date(2023, 0, 1, hour).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};
</script>
