<template>
  <div
    :class="[
      'grow w-full flex flex-col h-full',
      'bg-white rounded-xl shadow-lg overflow-hidden',
      'border border-gray-200',
      customClasses?.container,
    ]"
  >
    <!-- Calendar Header -->
    <div
      v-if="props.showControls"
      class="p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-base/7"
    >
      <!-- Navigation Controls -->
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

      <!-- View Selection & New Event Button -->
      <div class="flex gap-2 text-base/7">
        <select
          v-model="currentView"
          class="border px-4 rounded-md"
          aria-label="Select calendar view"
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </select>
        <button
          v-if="props.showEventButton"
          @click="toggleNewEventForm"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-base/7"
          aria-label="Create new event"
        >
          + Create Event
        </button>
      </div>
    </div>

    <!-- Dynamic View Component -->
    <component
      :is="currentViewComponent"
      :current-date="currentDate"
      :hour-height="50"
      v-bind="
        props.enableDragDrop ? { 'onEvent-dropped': handleEventDrop } : {}
      "
      @dayClick="handleDayClick"
    />

    <!-- Event Modal -->
    <EventModal ref="eventModal" @save="handleEventSave" />
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
 *
 * @prop {Date} [initialDate=new Date()] - Initial date to display
 * @prop {string} [initialView="month"] - Initial view mode (month|week|day)
 * @prop {boolean} [showControls=true] - Whether to show navigation controls
 * @prop {boolean} [showEventButton=true] - Whether to show the create event button
 * @prop {boolean} [enableDragDrop=true] - Whether to enable drag and drop functionality
 * @prop {Object} [customClasses] - Custom CSS classes for styling
 *   @prop {string} [customClasses.container] - Class for the main container
 *   @prop {string} [customClasses.header] - Class for the header section
 *   @prop {string} [customClasses.controls] - Class for navigation controls
 *   @prop {string} [customClasses.viewSelector] - Class for view selector
 *   @prop {string} [customClasses.eventButton] - Class for event creation button
 *
 * @event {Date} date-change - Emitted when the displayed date changes
 * @event {CalendarEvent} event-created - Emitted when a new event is created
 * @event {CalendarEvent} event-updated - Emitted when an event is updated
 * @event {string} event-deleted - Emitted when an event is deleted (event ID)
 */

import { ref, computed, watch, type Component, PropType } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";
import CalendarMonthComponent from "../components/CalendarMonthComponent.vue";
import CalendarWeekComponent from "../components/CalendarWeekComponent.vue";
import CalendarDayComponent from "../components/CalendarDayComponent.vue";
import CalendarEventComponent from "@/components/CalendarEventComponent.vue";
import EventModal from "@/components/EventModal.vue";

type CalendarView = "month" | "week" | "day";

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
    type: String as PropType<'month' | 'week' | 'day'>,
    default: 'month',
    validator: (value: string) => ['month', 'week', 'day'].includes(value),
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
}>();

// Reactive state
const currentDate = ref<Date>(props.initialDate); // Currently displayed date
const currentView = ref<CalendarView>(props.initialView as CalendarView); // Current view mode
const store = useCalendarStore(); // Pinia store for calendar events
const eventModal = ref<InstanceType<typeof EventModal>>(); // Reference to event modal component

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
    return currentDate.value.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (currentView.value === "week") {
    const startOfWeek = new Date(currentDate.value);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return `${startOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${endOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  return currentDate.value.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
};

/**
 * Handles event drop operation when drag and drop is enabled
 * @param {string} eventId - ID of the dropped event
 * @param {Date} date - New date for the event
 */
const handleEventDrop = (eventId: string, date: Date) => {
  if (props.enableDragDrop) {
    store.updateEventDateOnly(eventId, date);
  }
};

/**
 * Handles day click events to open the event modal
 * @param {Date} date - The date that was clicked
 */
const handleDayClick = (date: Date) => {
  eventModal.value?.openModal(date);
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
 * Opens the event modal for creating a new event at the current time
 */
const toggleNewEventForm = () => {
  const date = new Date();
  eventModal.value?.openModal(date);
  emit('openEventModal', date);
};
</script>
