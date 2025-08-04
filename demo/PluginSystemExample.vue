<template>
  <div class="plugin-system-example">
    <h2 class="text-2xl font-bold mb-4">Plugin System Example</h2>
    <p class="mb-4 text-gray-600">
      This example demonstrates the powerful plugin system that allows you to extend calendar functionality
      without modifying the core code.
    </p>

    <!-- Plugin Controls -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Active Plugins</h3>
      <div class="space-y-2">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="activePlugins.eventLogger" 
            @change="togglePlugin('eventLogger')"
            class="mr-2"
          />
          Event Logger Plugin (logs to console)
        </label>
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="activePlugins.eventValidator" 
            @change="togglePlugin('eventValidator')"
            class="mr-2"
          />
          Event Validator Plugin (validates events)
        </label>
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="activePlugins.eventColorizer" 
            @change="togglePlugin('eventColorizer')"
            class="mr-2"
          />
          Event Colorizer Plugin (auto-assigns colors)
        </label>
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="activePlugins.eventStats" 
            @change="togglePlugin('eventStats')"
            class="mr-2"
          />
          Event Stats Plugin (tracks statistics)
        </label>
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="activePlugins.eventConflict" 
            @change="togglePlugin('eventConflict')"
            class="mr-2"
          />
          Event Conflict Plugin (detects overlaps)
        </label>
      </div>
    </div>

    <!-- Plugin Stats Display -->
    <div v-if="activePlugins.eventStats" class="mb-6 p-4 bg-green-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Event Statistics</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Total Events:</strong> {{ eventStats.totalEvents }}</div>
        <div><strong>Average Duration:</strong> {{ formatDuration(eventStats.averageEventDuration) }}</div>
        <div><strong>Events This Month:</strong> {{ eventStats.eventsByMonth.get(currentMonth) || 0 }}</div>
        <div><strong>Last Added:</strong> {{ eventStats.lastAdded || 'None' }}</div>
      </div>
    </div>

    <!-- Calendar with Plugins -->
    <CalendarView 
      :current-date="currentDate"
      :events="store.events"
      @event-added="handleEventAdded"
      @event-updated="handleEventUpdated"
      @event-deleted="handleEventDeleted"
      class="border rounded-lg"
    />

    <!-- Console Output -->
    <div class="mt-6 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
      <h3 class="text-lg font-semibold mb-2 text-white">Console Output</h3>
      <div class="max-h-40 overflow-y-auto">
        <div v-for="(log, index) in consoleLogs" :key="index" class="mb-1">
          <span class="text-gray-400">{{ log.timestamp }}</span>
          <span :class="log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-green-400'">
            {{ log.message }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Quick Actions</h3>
      <div class="space-x-2">
        <button 
          @click="addSampleEvents"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Sample Events
        </button>
        <button 
          @click="clearEvents"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Events
        </button>
        <button 
          @click="clearLogs"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CalendarView, useCalendarStore, type CalendarEvent, type CalendarPlugin } from '@/index'

// State
const currentDate = ref(new Date())
const store = useCalendarStore()
const currentMonth = computed(() => currentDate.value.getMonth())

const activePlugins = ref({
  eventLogger: false,
  eventValidator: false,
  eventColorizer: false,
  eventStats: false,
  eventConflict: false
})

const consoleLogs = ref<Array<{ timestamp: string; message: string; level: 'info' | 'warn' | 'error' }>>([])
const eventStats = ref({
  totalEvents: 0,
  eventsByMonth: new Map<number, number>(),
  averageEventDuration: 0,
  lastAdded: null as string | null
})

// Helper function to add logs
const addLog = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  consoleLogs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    message,
    level
  })
  
  // Keep only last 50 logs
  if (consoleLogs.value.length > 50) {
    consoleLogs.value.shift()
  }
}

// Helper function to format duration
const formatDuration = (ms: number) => {
  const minutes = Math.round(ms / (1000 * 60))
  return `${minutes} min`
}

// Plugin Definitions
const eventLoggerPlugin: CalendarPlugin = {
  onRegister: (store) => {
    addLog('🔵 Event Logger Plugin registered')
    addLog(`Current events: ${store.events.length}`)
  },
  
  onEventAdd: (event) => {
    addLog(`📅 Event added: ${event.title} (${event.start})`)
  }
}

const eventValidatorPlugin: CalendarPlugin = {
  onRegister: (store) => {
    addLog('✅ Event Validator Plugin registered')
    
    // Store the original addEvent method
    const originalAddEvent = store.addEvent
    
    // Override addEvent to add validation
    store.addEvent = (event) => {
      // Validate event
      if (!event.title || event.title.trim().length === 0) {
        addLog('❌ Event title is required', 'error')
        throw new Error('Event title is required')
      }
      
      if (new Date(event.start) >= new Date(event.end)) {
        addLog('❌ Event start time must be before end time', 'error')
        throw new Error('Event start time must be before end time')
      }
      
      addLog('✅ Event validation passed')
      
      // Call original method
      originalAddEvent(event)
    }
  }
}

const eventColorizerPlugin: CalendarPlugin = {
  colorMap: {
    'meeting': 'blue',
    'appointment': 'green',
    'reminder': 'yellow',
    'deadline': 'red',
    'lunch': 'orange',
    'call': 'purple'
  },
  
  onRegister: (store) => {
    addLog('🎨 Event Colorizer Plugin registered')
  },
  
  onEventAdd: (event) => {
    const title = event.title.toLowerCase()
    
    for (const [keyword, color] of Object.entries(this.colorMap)) {
      if (title.includes(keyword)) {
        event.tailwindColor = color
        addLog(`🎨 Assigned color ${color} to event: ${event.title}`)
        break
      }
    }
  }
}

const eventStatsPlugin: CalendarPlugin = {
  onRegister: (store) => {
    addLog('📊 Event Stats Plugin registered')
    
    // Initialize stats from existing events
    store.events.forEach(event => {
      this.updateStats(event)
    })
  },
  
  onEventAdd: (event) => {
    this.updateStats(event)
    addLog(`📈 Stats updated: ${eventStats.value.totalEvents} total events`)
  },
  
  updateStats(event: CalendarEvent) {
    eventStats.value.totalEvents++
    
    const month = new Date(event.start).getMonth()
    eventStats.value.eventsByMonth.set(month, 
      (eventStats.value.eventsByMonth.get(month) || 0) + 1
    )
    
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime()
    eventStats.value.averageEventDuration = 
      (eventStats.value.averageEventDuration * (eventStats.value.totalEvents - 1) + duration) / eventStats.value.totalEvents
    
    eventStats.value.lastAdded = event.title
  }
}

const eventConflictPlugin: CalendarPlugin = {
  onRegister: (store) => {
    addLog('⚠️ Event Conflict Plugin registered')
  },
  
  onEventAdd: (event) => {
    const conflicts = this.findConflicts(event, store.events)
    
    if (conflicts.length > 0) {
      addLog(`⚠️ Conflicts detected for "${event.title}": ${conflicts.map(c => c.title).join(', ')}`, 'warn')
      
      // Highlight conflicting events
      conflicts.forEach(conflict => {
        conflict.tailwindColor = 'red'
      })
    }
  },
  
  findConflicts(newEvent: CalendarEvent, allEvents: CalendarEvent[]): CalendarEvent[] {
    const newStart = new Date(newEvent.start)
    const newEnd = new Date(newEvent.end)
    
    return Array.from(allEvents.values()).filter(event => {
      if (event.id === newEvent.id) return false
      
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      
      // Check for overlap
      return newStart < eventEnd && newEnd > eventStart
    })
  }
}

// Plugin management
const pluginInstances = new Map<string, CalendarPlugin>()

const togglePlugin = (pluginName: string) => {
  if (activePlugins.value[pluginName]) {
    // Register plugin
    const plugin = getPluginByName(pluginName)
    if (plugin) {
      store.registerPlugin(plugin)
      pluginInstances.set(pluginName, plugin)
      addLog(`🔌 Plugin "${pluginName}" activated`)
    }
  } else {
    // Note: In a real implementation, you might want to add plugin removal functionality
    addLog(`🔌 Plugin "${pluginName}" deactivated (removal not implemented)`)
  }
}

const getPluginByName = (pluginName: string): CalendarPlugin | null => {
  switch (pluginName) {
    case 'eventLogger': return eventLoggerPlugin
    case 'eventValidator': return eventValidatorPlugin
    case 'eventColorizer': return eventColorizerPlugin
    case 'eventStats': return eventStatsPlugin
    case 'eventConflict': return eventConflictPlugin
    default: return null
  }
}

// Event handlers
const handleEventAdded = (event: CalendarEvent) => {
  addLog(`Event added via UI: ${event.title}`)
}

const handleEventUpdated = (event: CalendarEvent, newStart: string, newEnd: string) => {
  addLog(`Event updated: ${event.title}`)
}

const handleEventDeleted = (eventId: string) => {
  addLog(`Event deleted: ${eventId}`)
}

// Quick actions
const addSampleEvents = () => {
  const sampleEvents = [
    {
      id: 'sample-1',
      title: 'Team Meeting',
      start: '2025-01-15T10:00:00Z',
      end: '2025-01-15T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    },
    {
      id: 'sample-2',
      title: 'Doctor Appointment',
      start: '2025-01-15T14:00:00Z',
      end: '2025-01-15T15:00:00Z',
      tailwindColor: 'green',
      allDay: false
    },
    {
      id: 'sample-3',
      title: 'Project Deadline',
      start: '2025-01-15T16:00:00Z',
      end: '2025-01-15T17:00:00Z',
      tailwindColor: 'red',
      allDay: false
    },
    {
      id: 'sample-4',
      title: 'Lunch with Client',
      start: '2025-01-15T12:00:00Z',
      end: '2025-01-15T13:00:00Z',
      tailwindColor: 'orange',
      allDay: false
    }
  ]
  
  sampleEvents.forEach(event => {
    try {
      store.addEvent(event)
    } catch (error) {
      addLog(`Failed to add event: ${error.message}`, 'error')
    }
  })
}

const clearEvents = () => {
  store.events.clear()
  eventStats.value = {
    totalEvents: 0,
    eventsByMonth: new Map(),
    averageEventDuration: 0,
    lastAdded: null
  }
  addLog('🗑️ All events cleared')
}

const clearLogs = () => {
  consoleLogs.value = []
}

// Initialize
onMounted(() => {
  addLog('🚀 Plugin System Example initialized')
  addLog('Toggle plugins above to see them in action')
})
</script>

<style scoped>
.plugin-system-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style> 