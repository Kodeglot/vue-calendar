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
              @click="toggleNewEventForm"
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

    <!-- Custom Event Content & Modal Demo -->
    <div class="max-w-4xl mx-auto mb-8">
      <h2 class="text-2xl font-bold mb-4">Custom Event Content & Modal</h2>
      <div class="bg-white rounded-lg shadow-lg p-6">
        <CalendarView
          :initial-date="currentDate"
          :initial-view="'month'"
          :time-format="timeFormat"
          :height="calendarHeight"
          @event-created="handleEventCreated"
          @event-updated="handleEventUpdated"
          @event-deleted="handleEventDeleted"
        >
          <!-- Custom event button slot -->
          <template #event-button>
            <button 
              @click="openCreateModal"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors font-medium"
            >
              ✨ Create Custom Event
            </button>
          </template>

          <!-- Custom event content slot -->
          <template #event-content="{ event }">
            <div class="flex items-center gap-2">
              <span class="inline-block w-2 h-2 rounded-full" :class="`bg-${event.tailwindColor}-500`"></span>
              <span class="font-bold">{{ event.title }}</span>
              <span class="text-xs text-gray-400">({{ event.start.slice(11, 16) }})</span>
              <!-- Show custom metadata if available -->
              <span v-if="getEventMetadata(event).priority" class="text-xs px-1 py-0.5 rounded" :class="{
                'bg-red-100 text-red-700': getEventMetadata(event).priority === 'high',
                'bg-yellow-100 text-yellow-700': getEventMetadata(event).priority === 'medium',
                'bg-green-100 text-green-700': getEventMetadata(event).priority === 'low'
              }">
                {{ getEventMetadata(event).priority }}
              </span>
              <span v-if="event.location" class="text-xs text-gray-500">
                📍 {{ event.location }}
              </span>
            </div>
          </template>

          <!-- Custom event modal slot -->
          <template #event-modal="{ event, update, delete: deleteEvent, close }">
            <div v-if="event" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button @click="close" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
                <h2 class="text-xl font-semibold mb-4">Custom Modal: {{ event.title }}</h2>
                
                <!-- Basic event fields -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Title</label>
                  <input v-model="event.title" class="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Description</label>
                  <textarea v-model="event.description" class="w-full px-3 py-2 border rounded-lg" rows="2" placeholder="Event description..."></textarea>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Location</label>
                  <input v-model="event.location" class="w-full px-3 py-2 border rounded-lg" placeholder="Meeting room, address, etc." />
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Start</label>
                  <input v-model="event.start" class="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">End</label>
                  <input v-model="event.end" class="w-full px-3 py-2 border rounded-lg" />
                </div>

                <!-- Custom metadata fields -->
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Priority</label>
                  <select v-model="getEventMetadata(event).priority" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">No priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Attendees</label>
                  <input v-model="getEventMetadata(event).attendees" class="w-full px-3 py-2 border rounded-lg" placeholder="John, Jane, Bob" />
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Notes</label>
                  <textarea v-model="getEventMetadata(event).notes" class="w-full px-3 py-2 border rounded-lg" rows="3" placeholder="Additional notes..."></textarea>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                  <button @click="close" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button @click="() => update({ ...event })" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                  <button @click="() => deleteEvent(event.id)" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                </div>
              </div>
            </div>
          </template>
        </CalendarView>

        <!-- Custom Event Creation Modal -->
        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button @click="closeCreateModal" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
            <h2 class="text-xl font-semibold mb-4">Create New Event</h2>
            
            <form @submit.prevent="createNewEvent">
              <!-- Basic event fields -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Title</label>
                <input v-model="newEvent.title" required class="w-full px-3 py-2 border rounded-lg" placeholder="Event title" />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea v-model="newEvent.description" class="w-full px-3 py-2 border rounded-lg" rows="2" placeholder="Event description..."></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Location</label>
                <input v-model="newEvent.location" class="w-full px-3 py-2 border rounded-lg" placeholder="Meeting room, address, etc." />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Start Date & Time</label>
                <input v-model="newEvent.start" type="datetime-local" required class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">End Date & Time</label>
                <input v-model="newEvent.end" type="datetime-local" required class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Color</label>
                <select v-model="newEvent.tailwindColor" class="w-full px-3 py-2 border rounded-lg">
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="pink">Pink</option>
                  <option value="indigo">Indigo</option>
                  <option value="yellow">Yellow</option>
                </select>
              </div>

              <!-- Custom metadata fields -->
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Priority</label>
                <select v-model="newEvent.metadata.priority" class="w-full px-3 py-2 border rounded-lg">
                  <option value="">No priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Attendees</label>
                <input v-model="newEvent.metadata.attendees" class="w-full px-3 py-2 border rounded-lg" placeholder="John, Jane, Bob" />
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Notes</label>
                <textarea v-model="newEvent.metadata.notes" class="w-full px-3 py-2 border rounded-lg" rows="3" placeholder="Additional notes..."></textarea>
              </div>

              <div class="flex justify-end gap-2 mt-6">
                <button type="button" @click="closeCreateModal" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Event</button>
              </div>
            </form>
          </div>
        </div>
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

// Custom event creation modal state
const showCreateModal = ref(false)
const newEvent = ref({
  title: '',
  description: '',
  location: '',
  start: '',
  end: '',
  tailwindColor: 'blue',
  metadata: {
    priority: '',
    attendees: '',
    notes: ''
  }
})

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



function getEventMetadata(event) {
  if (!event.metadata) {
    event.metadata = {}
  }
  return event.metadata
}

// Custom event creation functions
function openCreateModal() {
  // Set default start and end times (current time + 1 hour)
  const now = new Date()
  const endTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later
  
  newEvent.value = {
    title: '',
    description: '',
    location: '',
    start: formatDateTimeLocal(now),
    end: formatDateTimeLocal(endTime),
    tailwindColor: 'blue',
    metadata: {
      priority: '',
      attendees: '',
      notes: ''
    }
  }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function createNewEvent() {
  // Create the event object
  const event = {
    id: crypto.randomUUID(),
    title: newEvent.value.title,
    description: newEvent.value.description,
    location: newEvent.value.location,
    start: new Date(newEvent.value.start).toISOString(),
    end: new Date(newEvent.value.end).toISOString(),
    tailwindColor: newEvent.value.tailwindColor,
    metadata: { ...newEvent.value.metadata }
  }
  
  // Call the event created handler
  handleEventCreated(event)
  
  // Close the modal
  closeCreateModal()
}

function formatDateTimeLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
</script>

<style scoped>
/* Custom styles for the demo */
</style> 