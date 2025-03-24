<template>
  <div 
    :class="[
      'grow w-full flex flex-col h-full',
      'bg-white rounded-xl shadow-lg overflow-hidden',
      'border border-gray-200',
      customClasses?.container
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
      v-bind="props.enableDragDrop ? { 'onEvent-dropped': handleEventDrop } : {}"
    />

    <!-- Event Creation Modal -->
    <div
      v-if="showEventForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg w-96">
        <h3 class="text-xl font-bold mb-4">Create New Event</h3>
        <input
          v-model="newEvent.title"
          placeholder="Title"
          class="w-full mb-2 p-2 border rounded"
        />
        <input
          v-model="newEvent.start"
          type="datetime-local"
          class="w-full mb-2 p-2 border rounded"
        />
        <input
          v-model="newEvent.end"
          type="datetime-local"
          class="w-full mb-2 p-2 border rounded"
        />
        <input v-model="newEvent.color" type="color" class="w-full mb-4" />

        <div class="flex justify-end gap-2">
          <button
            @click="showEventForm = false"
            class="px-4 py-2 text-gray-600"
          >
            Cancel
          </button>
          <button
            @click="addEvent"
            class="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * CalendarView - Main calendar component with month/week/day views
 * 
 * @prop {Date} [initialDate=new Date()] - Initial date to display
 * @prop {string} [initialView="month"] - Initial view mode (month|week|day)
 * @prop {boolean} [showControls=true] - Whether to show navigation controls
 * @prop {boolean} [showEventButton=true] - Whether to show the create event button
 * @prop {boolean} [enableDragDrop=true] - Whether to enable drag and drop functionality
 * 
 * @event {Date} date-change - Emitted when the displayed date changes
 * @event {CalendarEvent} event-created - Emitted when a new event is created
 * @event {CalendarEvent} event-updated - Emitted when an event is updated
 * @event {string} event-deleted - Emitted when an event is deleted (event ID)
 */

import { ref, computed, watch, type Component } from "vue";
import { useCalendarStore, type CalendarEvent } from "../stores/calendarStore";

// Define component props with type safety and defaults
const props = defineProps({
  initialDate: {
    type: Date,
    default: () => new Date(), // Defaults to current date
    description: 'Initial date to display in the calendar'
  },
  initialView: {
    type: String as () => 'month' | 'week' | 'day',
    default: 'month', // Defaults to month view
    validator: (value: string) => ['month', 'week', 'day'].includes(value),
    description: 'Initial calendar view mode (month/week/day)'
  },
  showControls: {
    type: Boolean,
    default: true, // Show navigation controls by default
    description: 'Toggle visibility of navigation controls'
  },
  showEventButton: {
    type: Boolean,
    default: true, // Show create event button by default
    description: 'Toggle visibility of the create event button'
  },
  enableDragDrop: {
    type: Boolean,
    default: true, // Enable drag and drop by default
    description: 'Enable/disable drag and drop functionality for events'
  },
  customClasses: {
    type: Object as () => {
      container?: string;
      header?: string;
      controls?: string;
      viewSelector?: string;
      eventButton?: string;
    },
    default: () => ({}),
    description: 'Custom Tailwind classes for different calendar components'
  }
});

// Define strongly typed component events
const emit = defineEmits<{
  (e: 'date-change', date: Date): void // Emitted when current date changes
  (e: 'event-created', event: CalendarEvent): void // Emitted when new event is created
  (e: 'event-updated', event: CalendarEvent): void // Emitted when event is updated
  (e: 'event-deleted', eventId: string): void // Emitted when event is deleted
}>();
import CalendarMonthComponent from "../components/CalendarMonthComponent.vue";
import CalendarWeekComponent from "../components/CalendarWeekComponent.vue";
import CalendarDayComponent from "../components/CalendarDayComponent.vue";
import CalendarEventComponent from "@/components/CalendarEventComponent.vue";

type CalendarView = "month" | "week" | "day"; // Available view types

// Reactive state initialized from props
const currentDate = ref<Date>(props.initialDate); // Currently displayed date
const currentView = ref<CalendarView>(props.initialView as CalendarView); // Current view mode
const showEventForm = ref(false); // Controls visibility of event creation modal
const store = useCalendarStore(); // Pinia store instance for calendar data

// Watch for date changes and emit event to parent
watch(currentDate, (newDate: Date) => {
  emit('date-change', newDate); // Notify parent of date change
});

// Watch for view mode changes and adjust date accordingly
watch(currentView, (newView: CalendarView) => {
  // Reset to start of period when view changes
  const date = new Date(currentDate.value);
  switch (newView) {
    case 'month':
      date.setDate(1); // Set to first day of month
      break;
    case 'week':
      date.setDate(date.getDate() - date.getDay()); // Set to start of week (Sunday)
      break;
    case 'day':
      // No change needed for day view
      break;
  }
  currentDate.value = date; // Update current date
});

// Toggle visibility of event creation modal
const toggleNewEventForm = () => {
  newRandomColor.value; // Generate new random color for event
  showEventForm.value = !showEventForm.value; // Toggle modal visibility
};

// Computed property to generate random color for new events
const newRandomColor = computed(() => {
  // Generate random hex color code
  const c = "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
  newEvent.value.color = c; // Set color on new event
  return c; // Return generated color
});

// Template for new event creation
const newEvent = ref<Omit<CalendarEvent, "id">>({
  title: "", // Event title
  start: "", // Event start date/time
  end: "", // Event end date/time
  color: "", // Event color (will be set by newRandomColor)
});

// Mapping of view modes to their corresponding components
const viewComponents: Record<CalendarView, Component> = {
  month: CalendarMonthComponent, // Month view component
  week: CalendarWeekComponent, // Week view component
  day: CalendarDayComponent, // Day view component
};

// Computed property to get current view component
const currentViewComponent = computed(() => viewComponents[currentView.value]);

// Computed property to format header date based on current view
const headerDate = computed(() => {
  if (currentView.value === "month") {
    // Format for month view: "Month Year"
    return currentDate.value.toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  }
  
  if (currentView.value === "week") {
    // Format for week view: "Start - End"
    const startOfWeek = new Date(currentDate.value);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // End of week (Saturday)
    
    return `${startOfWeek.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    })} - ${endOfWeek.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    })}`;
  }
  
  // Format for day view: "Weekday, Month Day, Year"
  return currentDate.value.toLocaleDateString("en-US", { 
    weekday: "long", 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
});

// Navigate to previous period based on current view
const previousPeriod = () => {
  const newDate = new Date(currentDate.value);
  switch (currentView.value) {
    case "month":
      newDate.setMonth(newDate.getMonth() - 1); // Previous month
      break;
    case "week":
      newDate.setDate(newDate.getDate() - 7); // Previous week
      break;
    case "day":
      newDate.setDate(newDate.getDate() - 1); // Previous day
      break;
  }
  currentDate.value = newDate; // Update current date
};

// Navigate to next period based on current view
const nextPeriod = () => {
  const newDate = new Date(currentDate.value);
  switch (currentView.value) {
    case "month":
      newDate.setMonth(newDate.getMonth() + 1); // Next month
      break;
    case "week":
      newDate.setDate(newDate.getDate() + 7); // Next week
      break;
    case "day":
      newDate.setDate(newDate.getDate() + 1); // Next day
      break;
  }
  currentDate.value = newDate; // Update current date
};

// Handle event drag-and-drop operations
const handleEventDrop = (eventId: string, date: Date) => {
  if (props.enableDragDrop) {
    store.updateEventDateOnly(eventId, date); // Update event date in store
  }
};

// Add new event to calendar
const addEvent = () => {
  store.addEvent({
    ...newEvent.value,
    id: Date.now().toString(), // Generate unique ID
  });
  showEventForm.value = false; // Hide modal
  newEvent.value = { title: "", start: "", end: "", color: "#3b82f6" }; // Reset form
};
</script>
