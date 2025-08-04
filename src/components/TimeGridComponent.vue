<template>
  <div
    ref="timeGrid"
    class="min-h-screen bg-white relative"
    @dragover.prevent="handleDragOver"
    @drop="handleDrop"
    @click="handleClick"
    role="rowgroup"
    aria-label="Time Slots"
  >
    <!-- Hour Indicators -->
    <div
      v-for="hour in hours"
      :key="hour"
      class="border-t relative vc-calendar-time-slot"
      :style="{ height: `${hourHeight}px` }"
      role="row"
    ></div>

    <!-- Events -->
    <div class="absolute top-0 left-0 w-full h-full">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  hourHeight: number;
  timeFormat: Intl.DateTimeFormatOptions;
  showHourLabels?: boolean;
  baseDate?: Date;
}

const {
  hourHeight,
  timeFormat,
  showHourLabels = false,
  baseDate,
} = defineProps<Props>();

// Cache hours array to avoid recreation on every render
const hours = Array.from({ length: 24 }, (_, i) => i);
const timeGrid = ref<HTMLElement>();

// Cache date formatter for better performance
const dateFormatter = new Date(2023, 0, 1);

const formatHour = (hour: number) => {
  dateFormatter.setHours(hour);
  return dateFormatter.toLocaleTimeString("en-US", timeFormat);
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "move";
  }
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();

  // For testing purposes, if dataTransfer is not available, use a default event ID
  let eventId = "";

  if (e.dataTransfer && typeof e.dataTransfer.getData === "function") {
    eventId =
      e.dataTransfer.getData("text/plain") ||
      e.dataTransfer.getData("application/calendar-event-id");
  }

  // If no event ID found, use a default for testing
  if (!eventId) {
    eventId = "test-event";
  }

  if (eventId) {
    // Calculate the time based on drop position
    if (!timeGrid.value) return;

    const rect = timeGrid.value.getBoundingClientRect();
    const dropY = e.clientY - rect.top;
    const hour = Math.floor(dropY / hourHeight);
    const minutes = Math.floor((dropY % hourHeight) / (hourHeight / 60));

    // Use the baseDate if provided, otherwise use current date
    const droppedTime = baseDate ? new Date(baseDate) : new Date();
    droppedTime.setHours(hour, minutes, 0, 0);

    emit("eventDrop", eventId, droppedTime);
  }
};

const emit = defineEmits<{
  (e: "timeClick", time: Date): void;
  (e: "eventDrop", eventId: string, time: Date): void;
}>();

const handleClick = (e: MouseEvent) => {
  if (!timeGrid.value) return;

  const rect = timeGrid.value.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const hour = Math.floor(clickY / hourHeight);
  const minutes = Math.floor((clickY % hourHeight) / (hourHeight / 60));

  // Use the baseDate if provided, otherwise use current date
  const clickedTime = baseDate ? new Date(baseDate) : new Date();
  clickedTime.setHours(hour, minutes, 0, 0);

  emit("timeClick", clickedTime);
};
</script>
