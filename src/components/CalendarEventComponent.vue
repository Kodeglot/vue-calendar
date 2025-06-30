<template>
  <!-- 
    Event Container
    - Renders a draggable/resizable calendar event
    - Supports custom styling through props
    - Handles drag/resize interactions
    - Responsive to different view types (month/week/day)
  -->
  <div
    :key="event.id"
    :data-event-id="event.id"
    role="button"
    aria-label="Calendar event"
    :aria-describedby="`event-${event.id}-description`"
    :class="[
      'text-sm p-2 rounded cursor-move absolute truncate hover:shadow-sm group event-transition focus:outline-none focus:ring-2 focus:ring-primary-500',
      viewType === 'month' ? 'mt-2' : '',
      viewType === 'day' ? 'ml-16' : '',
      `${getPastelColor(event.id)}`,
      `border-l-4 ${getPastelColorBorder(event.id)}`,
      customClasses?.eventContainer,
      ...($attrs.class as string[] || [])
    ]"
    :style="{
      top: `${position.top}px`,
      height: `${position.height}px`,
      width: `calc(${event.width}% - 2px)`,
      left: `${event.left}%`,
      ...customStyles?.eventContainer,
    }"
    :draggable="!isResizing"
    @mousedown="handleMouseDown"
    @click="handleClick"
  >
    <!-- Event Content -->
    <div :class="['font-medium', customClasses?.eventTitle]">
      {{ event.title }}
    </div>
    <div :class="['text-xs text-gray-600', customClasses?.eventTime]">
      {{ formatEventTime() }}
    </div>

    <!-- Resize Handles -->
    <div
      v-if="resizable"
      :class="[
        'absolute top-0 left-0 right-0 h-2 cursor-row-resize bg-gray-300 transition-opacity',
        isResizing && resizeDirection === 'top'
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100',
        customClasses?.resizeHandle,
      ]"
      @mousedown.stop="startResize('top')"
    ></div>
    <div
      v-if="resizable"
      :class="[
        'absolute bottom-0 left-0 right-0 h-2 cursor-row-resize bg-gray-300 transition-opacity',
        isResizing && resizeDirection === 'bottom'
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100',
        customClasses?.resizeHandle,
      ]"
      @mousedown.stop="startResize('bottom')"
    ></div>

    <!-- Resize Indicator -->
    <div
      v-if="isResizing"
      class="absolute inset-0 bg-opacity-10 pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, onUnmounted } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import { useCalendarEventInteractions } from "@/composables/useCalendarEventInteractions";
import { useTimezone } from "@/composables/useTimezone";

interface EventComponentProps {
  /**
   * Current view type (month/week/day)
   * @required
   */
  viewType: "month" | "week" | "day";

  /**
   * Event data object containing:
   * - id: Unique event identifier
   * - title: Event title
   * - start: ISO date string for start time
   * - end: ISO date string for end time
   * - color: Event color in hex format
   * - width: Event width percentage (0-100)
   * - left: Event left position percentage (0-100)
   * @required
   */
  event: CalendarEvent;

  /**
   * Whether resize handles are enabled
   * @default false
   */
  resizable?: boolean;

  /**
   * Container reference for position calculations
   * Required for resizable events
   */
  containerRef?: HTMLElement;

  /**
   * Custom CSS classes for different parts of the component
   * - eventContainer: Styles for the event container
   * - eventTitle: Styles for the event title
   * - eventTime: Styles for the event time display
   * - resizeHandle: Styles for resize handles
   */
  customClasses?: {
    eventContainer?: string;
    eventTitle?: string;
    eventTime?: string;
    resizeHandle?: string;
  };

  /**
   * Custom inline styles for different parts of the component
   * - eventContainer: Inline styles for the event container
   */
  customStyles?: {
    eventContainer?: Record<string, string>;
  };

  /**
   * Pixels per hour for time calculations
   * Determines the vertical scale of the calendar
   * @default 60
   */
  pxPerHour?: number;

  /**
   * Time format preference (12h or 24h)
   * @default '24h'
   */
  timeFormat?: "12h" | "24h";
}

const props = withDefaults(defineProps<EventComponentProps>(), {
  resizable: false,
  pxPerHour: 60,
  timeFormat: "24h",
});

const calendarStore = useCalendarStore();
const { formatTime, formatTime12, formatDate, isToday } = useTimezone();

interface EventComponentEmits {
  /**
   * Emitted when event is resized
   * @param event - The calendar event
   * @param newStart - New start time as ISO string
   * @param newEnd - New end time as ISO string
   */
  (e: "resize", event: CalendarEvent, newStart: string, newEnd: string): void;

  /**
   * Emitted when resize operation completes
   * @param event - The calendar event
   * @param newStart - Final start time as ISO string
   * @param newEnd - Final end time as ISO string
   */
  (
    e: "resize-end",
    event: CalendarEvent,
    newStart: string,
    newEnd: string
  ): void;

  /**
   * Emitted when drag starts
   * @param dragEvent - Native drag event
   * @param event - The calendar event
   */
  (e: "dragstart", dragEvent: DragEvent, event: CalendarEvent): void;

  /**
   * Emitted when event is clicked
   * @param event - The calendar event
   */
  (e: "click", event: CalendarEvent): void;
}

const emit = defineEmits<EventComponentEmits>();

// Create a wrapper emit function that matches composable signature
const wrappedEmit = (event: string, ...args: any[]) => {
  const emitKey = event as keyof EventComponentEmits;
  switch (emitKey) {
    case "dragstart":
      emit(emitKey, args[0] as DragEvent, args[1] as CalendarEvent);
      break;
    case "click":
      emit(emitKey, args[0] as CalendarEvent);
      break;
    default:
      // No longer emitting resize events - handled by component directly
      break;
  }
};

// Use composable for event interactions
const {
  isResizing,
  position,
  resizeDirection,
  startResize,
  handleMouseDown,
  calculatePosition,
  forceRecalculatePosition,
} = useCalendarEventInteractions(wrappedEmit, {
  event: props.event,
  containerRef: props.containerRef,
  pxPerHour: props.pxPerHour,
  snapInterval: 5,
  minHeight: 30,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  viewType: props.viewType,
});

// Calculate initial position on mount
onMounted(() => {
  calculatePosition(props.viewType, props.event.order);

  // Listen for external position recalculation requests
  const handleRecalculatePosition = () => {
    forceRecalculatePosition();
  };

  // Add event listener to the component element
  const element = document.querySelector(`[data-event-id="${props.event.id}"]`);
  if (element) {
    element.addEventListener("recalculate-position", handleRecalculatePosition);
  }

  // Store cleanup function
  const cleanup = () => {
    if (element) {
      element.removeEventListener(
        "recalculate-position",
        handleRecalculatePosition
      );
    }
  };

  // Clean up on unmount
  onUnmounted(cleanup);
});

// Watch for changes in event data and recalculate position
watch(
  () => [props.event.start, props.event.end, props.event.order],
  () => {
    // Force recalculation when event times change
    forceRecalculatePosition();
  },
  { deep: true }
);

// Watch for view type changes and recalculate position
watch(
  () => props.viewType,
  (newViewType) => {
    calculatePosition(newViewType, props.event.order);
  }
);

// Handle click events
const handleClick = (e: MouseEvent) => {
  try {
    // Only handle click if not resizing
    if (!isResizing.value) {
      emit("click", props.event);
    }
  } catch (error) {
    console.error("Click event failed:", error);
  }
};

// Format event time for display based on view type and time format
const formatEventTime = () => {
  try {
    const startTime =
      props.timeFormat === "12h"
        ? formatTime12(props.event.start)
        : formatTime(props.event.start);

    const endTime =
      props.timeFormat === "12h"
        ? formatTime12(props.event.end)
        : formatTime(props.event.end);

    // For month view, show date if it's not today
    if (props.viewType === "month" && !isToday(props.event.start)) {
      const date = formatDate(props.event.start);
      return `${date} ${startTime} - ${endTime}`;
    }

    return `${startTime} - ${endTime}`;
  } catch (error) {
    console.error("Time formatting failed:", error);
    return "--:-- - --:--";
  }
};

// Format time display (HH:MM) - Memoized for better performance
const getPastelColor = (id: string) => {
  // Use tailwindColor if available, otherwise generate consistent pastel color
  if (props.event.tailwindColor) {
    return `bg-${props.event.tailwindColor}-100`;
  }

  // Memoized color array to avoid recreation
  const colors = [
    "bg-red-100",
    "bg-orange-100",
    "bg-amber-100",
    "bg-yellow-100",
    "bg-lime-100",
    "bg-green-100",
    "bg-emerald-100",
    "bg-teal-100",
    "bg-cyan-100",
    "bg-sky-100",
    "bg-blue-100",
    "bg-indigo-100",
    "bg-violet-100",
    "bg-purple-100",
    "bg-fuchsia-100",
    "bg-pink-100",
    "bg-rose-100",
    "bg-slate-100",
    "bg-gray-100",
    "bg-zinc-100",
    "bg-neutral-100",
    "bg-stone-100",
  ];

  // Optimized hash calculation
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

const getPastelColorBorder = (id: string) => {
  if (props.event.tailwindColor) {
    return `border-l-${props.event.tailwindColor}-500`;
  }

  // Memoized border color array
  const borderColors = [
    "border-l-red-500",
    "border-l-orange-500",
    "border-l-amber-500",
    "border-l-yellow-500",
    "border-l-lime-500",
    "border-l-green-500",
    "border-l-emerald-500",
    "border-l-teal-500",
    "border-l-cyan-500",
    "border-l-sky-500",
    "border-l-blue-500",
    "border-l-indigo-500",
    "border-l-violet-500",
    "border-l-purple-500",
    "border-l-fuchsia-500",
    "border-l-pink-500",
    "border-l-rose-500",
    "border-l-slate-500",
    "border-l-gray-500",
    "border-l-zinc-500",
    "border-l-neutral-500",
    "border-l-stone-500",
  ];

  // Use same hash as background color for consistency
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) & 0xffffffff;
  }
  return borderColors[Math.abs(hash) % borderColors.length];
};
</script>
