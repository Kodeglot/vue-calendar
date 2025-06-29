<template>
  <header class="text-center mb-8">
    <h1 class="text-4xl font-bold text-gray-800 mb-2">Vue Calendar Demo</h1>
    <p class="text-gray-600">A fully-featured calendar component for Vue 3</p>
  </header>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Time Format:
      </label>
      <select 
        v-model="timeFormat" 
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
      >
        <option value="24h">24-Hour Format (14:30)</option>
        <option value="12h">12-Hour Format (2:30 PM)</option>
      </select>
    </div>
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Calendar Height:
      </label>
      <select
        v-model="selectedHeightOption"
        @change="onHeightDropdownChange"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
      >
        <option disabled value="">-- Select a preset --</option>
        <option v-for="option in heightOptions" :key="option" :value="option">{{ option }}</option>
      </select>
      <input
        v-model="calendarHeight"
        type="text"
        placeholder="e.g. 600px, 80vh, 100%"
        class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <CalendarView
      :initial-date="currentDate"
      :initial-view="'week'"
      :time-format="timeFormat"
      :show-controls="true"
      :show-event-button="true"
      :enable-drag-drop="true"
      :height="calendarHeight"
      @event-created="handleEventCreated"
      @event-updated="handleEventUpdated"
      @event-deleted="handleEventDeleted"
    />
  </div>
  <footer class="text-center mt-8 text-gray-500">
    <p>Built with Vue 3, TypeScript, and Tailwind CSS</p>
  </footer>
  <div class="text-center mt-2 text-xs text-gray-400">
    &copy; {{ new Date().getFullYear() }} Kodeglot. All rights reserved.
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CalendarView from '../src/views/CalendarView.vue'

const currentDate = ref(new Date())
const timeFormat = ref('24h')
const calendarHeight = ref('600px')
const heightOptions = [
  '400px',
  '600px',
  '800px',
  '100%',
  '80vh',
  '60vh',
  '40vh',
  '50rem',
]
const selectedHeightOption = ref('')

function onHeightDropdownChange() {
  if (selectedHeightOption.value) {
    calendarHeight.value = selectedHeightOption.value
  }
}

function handleEventCreated(event) {
  console.log('Event created:', event)
  alert('Event created: ' + event.title)
}
function handleEventUpdated(event) {
  console.log('Event updated:', event)
}
function handleEventDeleted(eventId) {
  console.log('Event deleted:', eventId)
}
</script>

<style scoped>
</style> 