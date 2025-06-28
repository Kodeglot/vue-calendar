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
      class="border-t relative"
      :style="{ height: `${hourHeight}px` }"
      role="row"
    >
      <!-- <div
        v-if="showHourLabels"
        class="absolute -top-3 left-2 text-sm text-gray-500"
        role="time"
        :aria-label="formatHour(hour)"
      >
        {{ formatHour(hour) }}
      </div> -->
    </div>

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
}

const { hourHeight, timeFormat, showHourLabels = true } = defineProps<Props>();

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
  e.dataTransfer!.dropEffect = "move";
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
};

const emit = defineEmits<{
  (e: 'timeClick', time: Date): void;
}>();

const handleClick = (e: MouseEvent) => {
  if (!timeGrid.value) return;
  
  const rect = timeGrid.value.getBoundingClientRect();
  const clickY = e.clientY - rect.top;
  const hour = Math.floor(clickY / hourHeight);
  const minutes = Math.floor((clickY % hourHeight) / (hourHeight / 60));
  
  const clickedTime = new Date();
  clickedTime.setHours(hour, minutes, 0, 0);
  
  emit('timeClick', clickedTime);
};
</script>
