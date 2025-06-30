<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">Vue Calendar Demo</h1>
      <p class="text-gray-600">A fully-featured calendar component for Vue 3</p>
      <p class="text-sm text-gray-500 mt-2">Now with customizable controls and navigation!</p>
    </header>

    <!-- Demo Controls -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="bg-white rounded-lg shadow p-4 mb-4">
        <h3 class="text-lg font-semibold mb-3">Demo Controls</h3>
        <div class="flex flex-wrap gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Time Format</label>
            <select v-model="timeFormat" class="border px-3 py-1 rounded">
              <option value="24h">24-hour</option>
              <option value="12h">12-hour</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Calendar Height</label>
            <select v-model="selectedHeightOption" @change="onHeightDropdownChange" class="border px-3 py-1 rounded">
              <option value="">Select height...</option>
              <option v-for="option in heightOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Default Calendar -->
    <div class="max-w-4xl mx-auto mb-8">
      <h2 class="text-2xl font-bold mb-4">Default Calendar</h2>
      <div class="bg-white rounded-lg shadow-lg p-6">
        <CalendarView
          :initial-date="currentDate"
          :initial-view="'month'"
          :time-format="timeFormat"
          :height="calendarHeight"
          @event-created="handleEventCreated"
          @event-updated="handleEventUpdated"
          @event-deleted="handleEventDeleted"
        />
      </div>
    </div>

    <!-- Custom Controls Calendar -->
    <div class="max-w-4xl mx-auto mb-8">
      <h2 class="text-2xl font-bold mb-4">Custom Controls Calendar</h2>
      <div class="bg-white rounded-lg shadow-lg p-6">
        <CalendarView
          :initial-date="currentDate"
          :initial-view="'month'"
          :time-format="timeFormat"
          :height="calendarHeight"
          :show-controls="true"
          :show-event-button="false"
          @event-created="handleEventCreated"
          @event-updated="handleEventUpdated"
          @event-deleted="handleEventDeleted"
        >
          <!-- Custom Navigation -->
          <template #navigation="{ currentDate, currentView, previousPeriod, nextPeriod, headerDate }">
            <div class="flex items-center gap-4">
              <button 
                @click="previousPeriod"
                class="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                ← Previous
              </button>
              
              <div class="text-center">
                <h2 class="text-xl font-bold text-blue-600">{{ headerDate }}</h2>
                <p class="text-sm text-gray-500 capitalize">{{ currentView }} view</p>
              </div>
              
              <button 
                @click="nextPeriod"
                class="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Next →
              </button>
            </div>
          </template>

          <!-- Custom View Selector -->
          <template #view-selector="{ currentView, setView, currentDate }">
            <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                @click="setView('month')"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  currentView === 'month' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Month
              </button>
              <button
                @click="setView('week')"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  currentView === 'week' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Week
              </button>
              <button
                @click="setView('day')"
                :class="[
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  currentView === 'day' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Day
              </button>
            </div>
          </template>

          <!-- Custom Event Button -->
          <template #event-button="{ toggleNewEventForm, currentDate }">
            <button
              @click="handleCustomEventCreation"
              class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              ✨ Add Event
            </button>
          </template>
        </CalendarView>
      </div>
    </div>

    <!-- Minimal Calendar -->
    <div class="max-w-4xl mx-auto mb-8">
      <h2 class="text-2xl font-bold mb-4">Minimal Calendar (No Controls)</h2>
      <div class="bg-white rounded-lg shadow-lg p-6">
        <CalendarView
          :initial-date="currentDate"
          :initial-view="'month'"
          :time-format="timeFormat"
          :height="calendarHeight"
          :show-controls="false"
          :show-event-button="false"
          @event-created="handleEventCreated"
          @event-updated="handleEventUpdated"
          @event-deleted="handleEventDeleted"
        />
      </div>
    </div>

    <footer class="text-center mt-8 text-gray-500">
      <p>Built with Vue 3, TypeScript, and Tailwind CSS</p>
    </footer>
    <div class="text-center mt-2 text-xs text-gray-400">
      &copy; {{ new Date().getFullYear() }} Kodeglot. All rights reserved.
    </div>
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

function handleCustomEventCreation() {
  console.log('Custom event creation triggered')
  alert('Custom event creation button clicked! You can implement your own modal or form here.')
}
</script>

<style scoped>
/* Custom styles for the demo */
</style> 