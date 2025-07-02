<template>
  <div
    :class="[
      'grow w-full flex flex-col',
      'bg-white rounded-xl shadow-lg overflow-hidden',
      'border border-gray-200',
      customClasses?.container,
    ]"
    :style="{ height: height }"
  >
    <!-- Calendar Header -->
    <div
      v-if="props.showControls"
      class="p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-base/7"
    >
      <!-- Custom Navigation Controls Slot -->
      <slot name="navigation" :current-date="currentDate" :current-view="currentView" :set-view="setView" :previous-period="previousPeriod" :next-period="nextPeriod" :header-date="headerDate">
        <!-- Default Navigation Controls -->
        <div class="flex items-center gap-2">
          <button
            @click="previousPeriod"
            class="px-2 hover:bg-gray-100 rounded"
            aria-label="Previous period"
          >
            ←
          </button>
          <h2 class="text-base/7 font-bold whitespace-nowrap">
            {{ headerDate }}
          </h2>
          <button
            @click="nextPeriod"
            class="px-2 hover:bg-gray-100 rounded"
            aria-label="Next period"
          >
            →
          </button>
        </div>
      </slot>

      <!-- Custom Controls Slot -->
      <slot name="controls" :current-date="currentDate" :current-view="currentView" :set-view="setView" :time-format="timeFormat" :toggle-new-event-form="toggleNewEventForm">
        <!-- Default View Selection & New Event Button -->
        <div class="flex gap-2 text-base/7">
          <!-- Custom View Selector Slot -->
          <slot name="view-selector" :current-view="currentView" :set-view="setView" :current-date="currentDate">
            <select
              v-model="currentView"
              class="border px-4 rounded-md"
              aria-label="Select calendar view"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </slot>
          
          <!-- Custom Event Button Slot -->
          <slot name="event-button" :toggle-new-event-form="toggleNewEventForm" :current-date="currentDate">
            <button
              v-if="props.showEventButton"
              @click="toggleNewEventForm"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-base/7"
              aria-label="Create new event"
            >
              + Create Event
            </button>
          </slot>
        </div>
      </slot>
    </div>

    <!-- Scrollable Calendar Content -->
    <div class="flex-1 overflow-auto">
      <component
        :is="currentViewComponent"
        :current-date="currentDate"
        :hour-height="60"
        :time-format="timeFormat"
        v-bind="
          props.enableDragDrop ? { 'onEvent-dropped': handleEventDrop } : {}
        "
        @dayClick="handleDayClick"
        @date-clicked="handleDateClick"
        @eventClick="onEventClick"
      >
        <!--
          Custom Event Content Slot:
          Usage example:
          <template #event-content="{ event }">
            <div>
              <strong>{{ event.title }}</strong>
              <span>{{ event.start }}</span>
            </div>
          </template>
        -->
        <template v-if="$slots['event-content']" #event-content="slotProps">
          <slot name="event-content" v-bind="slotProps" />
        </template>
      </component>
    </div>

    <!--
      Custom Event Modal Slot:
      Usage example:
      <template #event-modal="{ event, update, delete: deleteEvent, close }">
        <MyCustomEventModal :event="event" @save="update" @delete="deleteEvent" @close="close" />
      </template>
    -->
    <slot name="event-modal" :event="selectedEvent" :update="handleEventUpdate" :delete="handleEventDelete" :close="clearSelectedEvent" />

    <!-- Fallback Modal -->
    <EventModal
      v-if="!slots['event-modal'] && selectedEvent"
      ref="fallbackModalRef"
      @update="handleEventUpdate"
      @delete="handleEventDelete"
      @close="clearSelectedEvent"
    />

    <!-- Default Event Creation Modal -->
    <EventModal
      ref="eventModal"
      @save="handleEventSave"
      @close="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * CalendarView - Main calendar component with month/week/day views
 *
 * Features:
 * - Multiple view modes (month, week, day)
 * - Customizable controls and event creation
 * - Drag and drop support for events
 * - Responsive design
 * - Customizable styling through props
 * - Custom slots for navigation, view selector, and event creation
 *
 * @prop {Date} [initialDate=new Date()] - Initial date to display
 * @prop {string} [initialView="month"] - Initial view mode (month|week|day)
 * @prop {string} [timeFormat='24h'] - Time format preference for displaying times
 * @prop {boolean} [showControls=true] - Whether to show navigation controls
 * @prop {boolean} [showEventButton=true] - Whether to show the create event button
 * @prop {boolean} [enableDragDrop=true] - Whether to enable drag and drop functionality
 * @prop {Object} [customClasses] - Custom CSS classes for styling
 *   @prop {string} [customClasses.container] - Class for the main container
 *   @prop {string} [customClasses.header] - Class for the header section
 *   @prop {string} [customClasses.controls] - Class for navigation controls
 *   @prop {string} [customClasses.viewSelector] - Class for view selector
 *   @prop {string} [customClasses.eventButton] - Class for event creation button
 * @prop {string} [height='100%'] - Height of the calendar (e.g. '600px', '80vh', '100%')
 *
 * @slot navigation - Custom navigation controls
 *   @param {Date} currentDate - Currently displayed date
 *   @param {string} currentView - Current view mode (month|week|day)
 *   @param {Function} previousPeriod - Function to navigate to previous period
 *   @param {Function} nextPeriod - Function to navigate to next period
 *   @param {string} headerDate - Formatted header date string
 *
 * @slot controls - Custom controls container
 *   @param {Date} currentDate - Currently displayed date
 *   @param {string} currentView - Current view mode (month|week|day)
 *   @param {string} timeFormat - Current time format (12h|24h)
 *   @param {Function} toggleNewEventForm - Function to open event creation modal
 *
 * @slot view-selector - Custom view selector component
 *   @param {string} currentView - Current view mode (month|week|day)
 *   @param {Date} currentDate - Currently displayed date
 *
 * @slot event-button - Custom event creation button
 *   @param {Function} toggleNewEventForm - Function to open event creation modal
 *   @param {Date} currentDate - Currently displayed date
 *
 * @slot event-modal - Custom event modal component
 *   @param {CalendarEvent} event - The clicked event
 *   @param {Function} update - Function to update the event
 *   @param {Function} delete - Function to delete the event
 *   @param {Function} close - Function to close the modal
 *
 * @event {Date} date-change - Emitted when the displayed date changes
 * @event {CalendarEvent} event-created - Emitted when a new event is created
 * @event {CalendarEvent} event-updated - Emitted when an event is updated
 * @event {string} event-deleted - Emitted when an event is deleted (event ID)
 * @event {Date} openEventModal - Emitted when event modal is opened
 * @event {CalendarEvent} event-click - Emitted when an event is clicked
 */

import { ref, computed, watch, type Component, PropType, useSlots, onMounted, nextTick } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import { useTimezone } from "../composables/useTimezone";
import CalendarMonthComponent from "../components/CalendarMonthComponent.vue";
import CalendarWeekComponent from "../components/CalendarWeekComponent.vue";
import CalendarDayComponent from "../components/CalendarDayComponent.vue";
import CalendarEventComponent from "@/components/CalendarEventComponent.vue";
import EventModal from "@/components/EventModal.vue";
import type { 
  CalendarView, 
  NavigationSlotProps, 
  ControlsSlotProps, 
  ViewSelectorSlotProps, 
  EventButtonSlotProps 
} from "../types/calendar";

interface CustomClasses {
  /** Custom class for the main container */
  container?: string;
  /** Custom class for the header section */
  header?: string;
  /** Custom class for navigation controls */
  controls?: string;
  /** Custom class for view selector dropdown */
  viewSelector?: string;
  /** Custom class for event creation button */
  eventButton?: string;
}

const props = defineProps({
  /**
   * Height of the calendar (e.g. '600px', '80vh', '100%')
   * @default '100%'
   */
  height: {
    type: String,
    default: "100%",
  },
  /**
   * Initial date to display in the calendar
   * @default Current date
   */
  initialDate: {
    type: Date,
    default: () => new Date(),
  },
  /**
   * Initial view mode for the calendar
   * @default 'month'
   * @type {'month' | 'week' | 'day'}
   */
  initialView: {
    type: String as PropType<"month" | "week" | "day">,
    default: "month",
    validator: (value: string) => ["month", "week", "day"].includes(value),
  },
  /**
   * Time format preference for displaying times
   * @default '24h'
   * @type {'12h' | '24h'}
   */
  timeFormat: {
    type: String as PropType<"12h" | "24h">,
    default: "24h",
    validator: (value: string) => ["12h", "24h"].includes(value),
  },
  /**
   * Whether to show navigation controls (previous/next buttons, view selector)
   * @default true
   */
  showControls: {
    type: Boolean,
    default: true,
  },
  /**
   * Whether to show the create event button
   * @default true
   */
  showEventButton: {
    type: Boolean,
    default: true,
  },
  /**
   * Whether to enable drag and drop functionality for events
   * @default true
   */
  enableDragDrop: {
    type: Boolean,
    default: true,
  },
  /**
   * Custom CSS classes for styling different parts of the calendar
   * @default {}
   */
  customClasses: {
    type: Object as PropType<CustomClasses>,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: "date-change", date: Date): void;
  (e: "event-created", event: CalendarEvent): void;
  (e: "event-updated", event: CalendarEvent): void;
  (e: "event-deleted", eventId: string): void;
  (e: "openEventModal", date: Date): void;
  (e: "event-click", event: CalendarEvent): void;
}>();

// Reactive state
const currentDate = ref<Date>(props.initialDate); // Currently displayed date
const currentView = ref<CalendarView>(props.initialView as CalendarView); // Current view mode
const store = useCalendarStore(); // Pinia store for calendar events
const eventModal = ref<InstanceType<typeof EventModal>>(); // Reference to event modal component
const { formatMonthYear, formatWeekdayShort, formatFullDate, roundToNearestInterval, createTimeRange } = useTimezone(); // Timezone utilities
const selectedEvent = ref<CalendarEvent | null>(null);
const fallbackModalRef = ref<InstanceType<typeof EventModal> | null>(null);
const slots = useSlots();

// Mapping of view modes to their corresponding components
const viewComponents: Record<CalendarView, Component> = {
  month: CalendarMonthComponent,
  week: CalendarWeekComponent,
  day: CalendarDayComponent,
};

/**
 * Returns the current view component based on selected view mode
 * @returns {Component} The component for the current view
 */
const currentViewComponent = computed(() => viewComponents[currentView.value]);

/**
 * Generates formatted header text based on current view mode
 * @returns {string} Formatted date string for the header
 *
 * For month view: "March 2025"
 * For week view: "Mar 23 - Mar 29, 2025"
 * For day view: "Monday, March 24, 2025"
 */
const headerDate = computed(() => {
  if (currentView.value === "month") {
    return formatMonthYear(currentDate.value);
  }

  if (currentView.value === "week") {
    const startOfWeek = new Date(currentDate.value);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const startFormatted =
      formatWeekdayShort(startOfWeek) + " " + startOfWeek.getDate();
    const endFormatted =
      formatWeekdayShort(endOfWeek) +
      " " +
      endOfWeek.getDate() +
      ", " +
      endOfWeek.getFullYear();

    return `${startFormatted} - ${endFormatted}`;
  }

  return formatFullDate(currentDate.value);
});

/**
 * Navigates to the previous period based on current view
 * - Month view: Previous month
 * - Week view: Previous week
 * - Day view: Previous day
 */
const previousPeriod = () => {
  const newDate = new Date(currentDate.value);
  switch (currentView.value) {
    case "month":
      newDate.setMonth(newDate.getMonth() - 1);
      break;
    case "week":
      newDate.setDate(newDate.getDate() - 7);
      break;
    case "day":
      newDate.setDate(newDate.getDate() - 1);
      break;
  }
  currentDate.value = newDate;
  emit("date-change", newDate);
};

/**
 * Navigates to the next period based on current view
 * - Month view: Next month
 * - Week view: Next week
 * - Day view: Next day
 */
const nextPeriod = () => {
  const newDate = new Date(currentDate.value);
  switch (currentView.value) {
    case "month":
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case "week":
      newDate.setDate(newDate.getDate() + 7);
      break;
    case "day":
      newDate.setDate(newDate.getDate() + 1);
      break;
  }
  currentDate.value = newDate;
  emit("date-change", newDate);
};

/**
 * Handles event drop operation when drag and drop is enabled
 * @param {string} eventId - ID of the dropped event
 * @param {Date} date - New date for the event
 */
const handleEventDrop = (eventId: string, date: Date) => {
  if (props.enableDragDrop) {
    // The store will automatically trigger position recalculation
    store.updateEventDateOnly(eventId, date);
  }
};

/**
 * Handles day click events to open the event modal
 * @param {Date} date - The date that was clicked
 */
const handleDayClick = (date: Date) => {
  if (window.__calendarEventModified) {
    window.__calendarEventModified = false;
    return;
  }
  // Round the time to the nearest 5 minutes
  const roundedTime = roundToNearestInterval(date, 5)
  eventModal.value?.openModal(roundedTime);
};

/**
 * Handles date click events from month view to open the event modal
 * @param {Date} date - The date that was clicked
 */
const handleDateClick = (date: Date) => {
  // For month view, set the time to 9 AM by default
  const defaultTime = new Date(date);
  defaultTime.setHours(9, 0, 0, 0);
  eventModal.value?.openModal(defaultTime);
};

/**
 * Handles saving new events to the store
 * @param {CalendarEvent} event - The event to save
 */
const handleEventSave = (event: CalendarEvent) => {
  store.addEvent(event);
  emit("event-created", event);
};

/**
 * Handles updating existing events in the store
 * @param {CalendarEvent} event - The updated event
 */
const handleEventUpdate = (event: CalendarEvent) => {
  store.updateEvent(event);
  emit("event-updated", event);
  clearSelectedEvent();
};

/**
 * Handles deleting events from the store
 * @param {string} eventId - The ID of the event to delete
 */
const handleEventDelete = (eventId: string) => {
  store.deleteEvent(eventId);
  emit("event-deleted", eventId);
  clearSelectedEvent();
};

/**
 * Handles event click to open edit modal
 * @param {CalendarEvent} event - The clicked event
 */
const onEventClick = (event: CalendarEvent) => {
  selectedEvent.value = event;
  emit("event-click", event);
  nextTick(() => {
    // Open fallback modal if no slot is provided
    if (!slots["event-modal"] && fallbackModalRef.value) {
      fallbackModalRef.value.openEditModal(event);
    }
  });
};

/**
 * Opens the event modal for creating a new event at the current time
 */
const toggleNewEventForm = () => {
  const date = new Date();
  eventModal.value?.openModal(date);
  emit("openEventModal", date);
};

const setView = (view: CalendarView) => {
  currentView.value = view;
};

function clearSelectedEvent() {
  selectedEvent.value = null;
}

// Watch for changes in currentDate and emit events
watch(currentDate, (newDate) => {
  emit("date-change", newDate);
});

// Watch for changes in currentView and emit events
watch(currentView, (newView) => {
  // Re-emit date change when view changes to ensure proper updates
  emit("date-change", currentDate.value);
});

// Add sample events on component mount
onMounted(() => {
  // Add sample events for testing drag and drop
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sampleEvents: CalendarEvent[] = [
    {
      id: "sample-1",
      title: "Team Meeting",
      start: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        9,
        0
      ).toISOString(),
      end: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        10,
        30
      ).toISOString(),
      tailwindColor: "blue",
      allDay: false,
    },
    {
      id: "sample-2",
      title: "Lunch Break",
      start: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        12,
        0
      ).toISOString(),
      end: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        13,
        0
      ).toISOString(),
      tailwindColor: "green",
      allDay: false,
    },
    {
      id: "sample-3",
      title: "Project Review",
      start: new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        14,
        0
      ).toISOString(),
      end: new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        15,
        30
      ).toISOString(),
      tailwindColor: "purple",
      allDay: false,
    },
    {
      id: "sample-4",
      title: "All Day Event",
      start: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0
      ).toISOString(),
      end: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59
      ).toISOString(),
      tailwindColor: "orange",
      allDay: true,
    },
  ];

  // Add events to store
  sampleEvents.forEach((event) => {
    store.addEvent(event);
  });
});

declare global {
  interface Window {
    __calendarEventModified?: boolean;
  }
}
</script>
