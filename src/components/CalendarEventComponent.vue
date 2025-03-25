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
    role="button"
    aria-label="Calendar event"
    :aria-describedby="`event-${event.id}-description`"
    :class="[
      'text-sm p-2 rounded cursor-move absolute truncate hover:shadow-sm group event-transition focus:outline-none focus:ring-2 focus:ring-primary-500',
      viewType === 'month' ? 'mt-2' : '',
      viewType === 'day' ? 'ml-16' : '',
      customClasses?.eventContainer,
    ]"
    :style="{
      backgroundColor: event.color + '20',
      borderLeft: `4px solid ${event.color}`,
      top: `${position.top}px`,
      height: `${position.height}px`,
      width: `calc(${event.width}% - 2px)`,
      left: `${event.left}%`,
      ...customStyles?.eventContainer,
    }"
    :draggable="!isResizing"
    @dragstart="handleDragStart"
    @mousedown="handleMouseDown"
    @click="handleClick"
  >
    <!-- Event Content -->
    <div :class="['font-medium', customClasses?.eventTitle]">
      {{ event.title }}
    </div>
    <div :class="['text-xs text-gray-600', customClasses?.eventTime]">
      {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
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
import { onMounted } from "vue";
import type { CalendarEvent } from "../stores/calendarStore";
import { useCalendarEventInteractions } from "@/composables/useCalendarEventInteractions";

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
   * Timezone for displaying event times
   * @default 'UTC'
   */
  timeZone?: string;
}

const props = withDefaults(defineProps<EventComponentProps>(), {
  resizable: false,
  pxPerHour: 60,
  timeZone: "UTC",
});

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
    case "resize":
      console.log("=== emit resize");
      emit(
        emitKey,
        args[0] as CalendarEvent,
        args[1] as string,
        args[2] as string
      );
      break;
    case "resize-end":
      emit(
        emitKey,
        args[0] as CalendarEvent,
        args[1] as string,
        args[2] as string
      );
      break;
    case "dragstart":
      emit(emitKey, args[0] as DragEvent, args[1] as CalendarEvent);
      break;
    case "click":
      emit(emitKey, args[0] as CalendarEvent);
      break;
    default:
      throw new Error(`Unknown emit event: ${event}`);
  }
};

// Use composable for event interactions
const {
  position,
  isResizing,
  resizeDirection,
  startResize,
  handleDragStart,
  handleMouseDown,
  calculatePosition,
} = useCalendarEventInteractions(wrappedEmit, {
  event: props.event,
  containerRef: props.containerRef,
  pxPerHour: props.pxPerHour,
  snapInterval: 5,
  minHeight: 30,
  timeZone: props.timeZone,
});

// Calculate initial position on mount
onMounted(() => {
  // console.log(props.containerRef);
  calculatePosition(props.viewType, props.event.order);
});

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

// Format time display (HH:MM)
const formatTime = (dateString: string) => {
  try {
    if (!dateString) {
      throw new Error("Date string is required for formatting");
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string provided");
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: props.timeZone, // Always use UTC for consistent display
    });
  } catch (error) {
    console.error("Time formatting failed:", error);
    return "--:--";
  }
};
</script>
