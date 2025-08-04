# Plugin System Documentation

The vue-calendar package includes a powerful plugin system that allows you to extend the calendar's functionality without modifying the core code. This document provides a comprehensive guide to understanding and using the plugin system.

## Table of Contents

1. [Overview](#overview)
2. [Plugin Interface](#plugin-interface)
3. [Plugin Lifecycle](#plugin-lifecycle)
4. [Creating Plugins](#creating-plugins)
5. [Plugin Examples](#plugin-examples)
6. [Best Practices](#best-practices)
7. [Advanced Plugin Patterns](#advanced-plugin-patterns)

## Overview

The plugin system is built around the `CalendarPlugin` interface and provides two main integration points:

1. **Registration Hook** (`onRegister`): Called when the plugin is registered, providing access to the store
2. **Event Hook** (`onEventAdd`): Called whenever a new event is added to the calendar

### Key Benefits

- **Non-intrusive**: Plugins don't modify core calendar functionality
- **Composable**: Multiple plugins can work together
- **Type-safe**: Full TypeScript support with proper interfaces
- **Reactive**: Plugins can react to calendar state changes
- **Extensible**: Easy to add new plugin capabilities

## Plugin Interface

```typescript
export interface CalendarPlugin {
  // Called when the plugin is registered
  onRegister?: (store: {
    currentDate: Date
    events: CalendarEvent[]
    plugins: CalendarPlugin[]
    currentMonth: number
    monthEvents: CalendarEvent[]
    addEvent: (event: CalendarEvent) => void
    addEvents: (events: CalendarEvent[]) => void
    updateEvent: (event: CalendarEvent) => void
    deleteEvent: (eventId: string) => void
    updateEventDate: (eventId: string, newDate: Date) => void
    updateEventDateOnly: (eventId: string, newDate: Date) => void
    updateEventDuration: (eventId: string, newStart: Date, newEnd: Date) => void
    updateEventTime: (eventId: string, newTime: Date) => void
    getEventsForDate: (date: Date) => CalendarEvent[]
    getEventsForWeek: (startDate: Date) => CalendarEvent[]
    registerPlugin: (plugin: CalendarPlugin) => void
  }) => void
  
  // Called whenever a new event is added
  onEventAdd?: (event: CalendarEvent) => void
}
```

### Store Context

The `onRegister` callback receives a store context object that provides:

- **State Access**: `currentDate`, `events`, `plugins`, `currentMonth`, `monthEvents`
- **Action Methods**: All store methods for manipulating events
- **Plugin Management**: `registerPlugin` for dynamic plugin registration

## Plugin Lifecycle

### 1. Registration Phase

When a plugin is registered via `store.registerPlugin(plugin)`:

1. Plugin is added to the `plugins` array
2. `onRegister` callback is called with store context
3. Plugin can now access all store functionality

### 2. Runtime Phase

During normal calendar operation:

1. **Event Addition**: `onEventAdd` is called for each new event
2. **State Access**: Plugin can access current state via store context
3. **Action Execution**: Plugin can perform actions using store methods

### 3. Cleanup Phase

Plugins are automatically cleaned up when the store is destroyed (Vue component unmount).

## Creating Plugins

### Basic Plugin Structure

```typescript
import { type CalendarPlugin, type CalendarEvent } from '@kodeglot/vue-calendar'

const myPlugin: CalendarPlugin = {
  onRegister: (store) => {
    console.log('Plugin registered with', store.events.length, 'events')
    
    // Store reference for later use
    this.store = store
  },
  
  onEventAdd: (event) => {
    console.log('New event added:', event.title)
  }
}
```

### Plugin Registration

```typescript
import { useCalendarStore } from '@kodeglot/vue-calendar'

const store = useCalendarStore()
store.registerPlugin(myPlugin)
```

## Plugin Examples

### 1. Event Logger Plugin

A simple plugin that logs all calendar activities:

```typescript
const eventLoggerPlugin: CalendarPlugin = {
  onRegister: (store) => {
    console.log('🔵 Event Logger Plugin registered')
    console.log('Current events:', store.events.length)
  },
  
  onEventAdd: (event) => {
    console.log('📅 Event added:', {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end
    })
  }
}
```

### 2. Event Validation Plugin

A plugin that validates events before they're added:

```typescript
const eventValidationPlugin: CalendarPlugin = {
  onRegister: (store) => {
    // Store the original addEvent method
    const originalAddEvent = store.addEvent
    
    // Override addEvent to add validation
    store.addEvent = (event) => {
      // Validate event
      if (!event.title || event.title.trim().length === 0) {
        throw new Error('Event title is required')
      }
      
      if (new Date(event.start) >= new Date(event.end)) {
        throw new Error('Event start time must be before end time')
      }
      
      // Call original method
      originalAddEvent(event)
    }
  }
}
```

### 3. Event Statistics Plugin

A plugin that tracks event statistics:

```typescript
const eventStatsPlugin: CalendarPlugin = {
  stats: {
    totalEvents: 0,
    eventsByMonth: new Map(),
    averageEventDuration: 0
  },
  
  onRegister: (store) => {
    // Initialize stats from existing events
    store.events.forEach(event => {
      this.updateStats(event)
    })
    
    console.log('📊 Event Stats Plugin initialized:', this.stats)
  },
  
  onEventAdd: (event) => {
    this.updateStats(event)
    console.log('📈 Updated stats:', this.stats)
  },
  
  updateStats(event: CalendarEvent) {
    this.stats.totalEvents++
    
    const month = new Date(event.start).getMonth()
    this.stats.eventsByMonth.set(month, 
      (this.stats.eventsByMonth.get(month) || 0) + 1
    )
    
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime()
    this.stats.averageEventDuration = 
      (this.stats.averageEventDuration * (this.stats.totalEvents - 1) + duration) / this.stats.totalEvents
  }
}
```

### 4. Event Synchronization Plugin

A plugin that syncs events with an external API:

```typescript
const eventSyncPlugin: CalendarPlugin = {
  onRegister: (store) => {
    console.log('🔄 Event Sync Plugin registered')
  },
  
  onEventAdd: async (event) => {
    try {
      // Sync with external API
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
      
      console.log('✅ Event synced to API:', event.id)
    } catch (error) {
      console.error('❌ Failed to sync event:', error)
    }
  }
}
```

### 5. Event Color Management Plugin

A plugin that automatically assigns colors based on event type:

```typescript
const eventColorPlugin: CalendarPlugin = {
  colorMap: {
    'meeting': 'blue',
    'appointment': 'green',
    'reminder': 'yellow',
    'deadline': 'red'
  },
  
  onRegister: (store) => {
    console.log('🎨 Event Color Plugin registered')
  },
  
  onEventAdd: (event) => {
    // Auto-assign color based on title keywords
    const title = event.title.toLowerCase()
    
    for (const [keyword, color] of Object.entries(this.colorMap)) {
      if (title.includes(keyword)) {
        event.tailwindColor = color
        console.log(`🎨 Assigned color ${color} to event: ${event.title}`)
        break
      }
    }
  }
}
```

### 6. Event Conflict Detection Plugin

A plugin that detects overlapping events:

```typescript
const eventConflictPlugin: CalendarPlugin = {
  onRegister: (store) => {
    console.log('⚠️ Event Conflict Plugin registered')
  },
  
  onEventAdd: (event) => {
    const conflicts = this.findConflicts(event, store.events)
    
    if (conflicts.length > 0) {
      console.warn('⚠️ Event conflicts detected:', {
        event: event.title,
        conflicts: conflicts.map(c => c.title)
      })
      
      // Optionally highlight conflicting events
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
```

### 7. Bulk Event Import Plugin

A plugin that handles bulk event imports with validation:

```typescript
const bulkImportPlugin: CalendarPlugin = {
  onRegister: (store) => {
    console.log('📦 Bulk Import Plugin registered')
    
    // Override addEvents to add bulk validation
    const originalAddEvents = store.addEvents
    
    store.addEvents = (events) => {
      // Validate all events before adding
      const validEvents = events.filter(event => {
        if (!event.title || event.title.trim().length === 0) {
          console.warn('Skipping event without title:', event)
          return false
        }
        
        if (new Date(event.start) >= new Date(event.end)) {
          console.warn('Skipping event with invalid time range:', event.title)
          return false
        }
        
        return true
      })
      
      console.log(`📦 Bulk import: ${validEvents.length} of ${events.length} events valid`)
      
      // Call original method with validated events
      originalAddEvents(validEvents)
    }
  }
}
```

## Best Practices

### 1. Plugin Design Principles

- **Single Responsibility**: Each plugin should have one clear purpose
- **Non-blocking**: Avoid long-running operations in hooks
- **Error Handling**: Always handle potential errors gracefully
- **State Management**: Be careful when modifying store state

### 2. Performance Considerations

```typescript
// ❌ Bad: Expensive operation in onEventAdd
const badPlugin: CalendarPlugin = {
  onEventAdd: (event) => {
    // This runs for every event addition
    const expensiveCalculation = this.heavyComputation(event)
  }
}

// ✅ Good: Defer expensive operations
const goodPlugin: CalendarPlugin = {
  onRegister: (store) => {
    // Set up reactive watchers instead
    watch(() => store.events, this.handleEventsChange, { deep: true })
  },
  
  handleEventsChange() {
    // Debounce expensive operations
    this.debouncedCalculation()
  }
}
```

### 3. Plugin Communication

```typescript
// Plugins can communicate through the store
const communicationPlugin: CalendarPlugin = {
  onRegister: (store) => {
    // Store a reference for other plugins
    store.plugins.forEach(plugin => {
      if (plugin.name === 'targetPlugin') {
        plugin.notify('Hello from communication plugin!')
      }
    })
  }
}
```

### 4. Plugin Configuration

```typescript
// Make plugins configurable
const createConfigurablePlugin = (config: {
  logLevel: 'info' | 'warn' | 'error'
  enableValidation: boolean
}) => {
  return {
    config,
    
    onRegister: (store) => {
      if (config.enableValidation) {
        // Set up validation
      }
    },
    
    onEventAdd: (event) => {
      if (config.logLevel === 'info') {
        console.log('Event added:', event)
      }
    }
  } as CalendarPlugin
}

// Usage
const plugin = createConfigurablePlugin({
  logLevel: 'info',
  enableValidation: true
})
```

## Advanced Plugin Patterns

### 1. Plugin Composition

```typescript
// Combine multiple plugins into one
const createCompositePlugin = (...plugins: CalendarPlugin[]): CalendarPlugin => {
  return {
    onRegister: (store) => {
      plugins.forEach(plugin => plugin.onRegister?.(store))
    },
    
    onEventAdd: (event) => {
      plugins.forEach(plugin => plugin.onEventAdd?.(event))
    }
  }
}

// Usage
const compositePlugin = createCompositePlugin(
  eventLoggerPlugin,
  eventValidationPlugin,
  eventColorPlugin
)
```

### 2. Plugin Middleware

```typescript
// Create middleware for plugins
const createPluginMiddleware = (middleware: (event: CalendarEvent) => CalendarEvent) => {
  return (plugin: CalendarPlugin): CalendarPlugin => {
    return {
      onRegister: plugin.onRegister,
      
      onEventAdd: (event) => {
        const processedEvent = middleware(event)
        plugin.onEventAdd?.(processedEvent)
      }
    }
  }
}

// Usage
const loggingMiddleware = createPluginMiddleware((event) => {
  console.log('Processing event:', event.title)
  return event
})

const enhancedPlugin = loggingMiddleware(eventColorPlugin)
```

### 3. Plugin State Management

```typescript
// Plugins can maintain their own state
const statefulPlugin: CalendarPlugin = {
  state: reactive({
    processedEvents: 0,
    lastProcessed: null as CalendarEvent | null
  }),
  
  onRegister: (store) => {
    console.log('Stateful plugin initialized')
  },
  
  onEventAdd: (event) => {
    this.state.processedEvents++
    this.state.lastProcessed = event
    
    console.log('State updated:', this.state)
  }
}
```

### 4. Plugin Lifecycle Management

```typescript
// Plugins can manage their own lifecycle
const lifecyclePlugin: CalendarPlugin = {
  isActive: true,
  cleanup: null as (() => void) | null,
  
  onRegister: (store) => {
    console.log('Plugin activated')
    
    // Set up cleanup function
    this.cleanup = () => {
      console.log('Plugin deactivated')
      this.isActive = false
    }
  },
  
  onEventAdd: (event) => {
    if (!this.isActive) return
    
    console.log('Processing event:', event.title)
  },
  
  // Custom method for external control
  deactivate() {
    this.cleanup?.()
  }
}
```

## Integration with Unified Store System

The plugin system works seamlessly with both store approaches:

### Standard Store
```typescript
import { useCalendarStore } from '@kodeglot/vue-calendar'

const store = useCalendarStore()
store.registerPlugin(eventLoggerPlugin)
```

### Custom Store with Overrides
```typescript
import { useCustomCalendarStore } from '@kodeglot/vue-calendar'

const customStore = useCustomCalendarStore({
  addEvent: (event) => {
    // Custom addEvent logic
    console.log('Custom addEvent called')
  }
})

// Plugins work with custom stores too
customStore.registerPlugin(eventLoggerPlugin)
```

### Mixed Usage
```typescript
import { useCalendarStore, useCustomCalendarStore } from '@kodeglot/vue-calendar'

// Both stores share the same underlying state
const standardStore = useCalendarStore()
const customStore = useCustomCalendarStore({
  addEvent: (event) => {
    // Custom logic
  }
})

// Plugins work with both
standardStore.registerPlugin(plugin1)
customStore.registerPlugin(plugin2)

// Both stores see the same events
standardStore.addEvent(event)
console.log(customStore.events.has(event.id)) // true
```

## Testing Plugins

```typescript
import { describe, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalendarStore } from '@/stores/calendarStore'

describe('Plugin System', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('should register and call plugin hooks', () => {
    const store = useCalendarStore()
    const mockPlugin = {
      onRegister: vi.fn(),
      onEventAdd: vi.fn()
    }
    
    store.registerPlugin(mockPlugin)
    
    expect(mockPlugin.onRegister).toHaveBeenCalled()
    
    const testEvent = {
      id: 'test',
      title: 'Test Event',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue'
    }
    
    store.addEvent(testEvent)
    
    expect(mockPlugin.onEventAdd).toHaveBeenCalledWith(testEvent)
  })
})
```

## Conclusion

The plugin system provides a powerful and flexible way to extend the vue-calendar package. By following the patterns and best practices outlined in this document, you can create robust, maintainable plugins that enhance the calendar's functionality without modifying the core code.

Key takeaways:

1. **Use the registration hook** for setup and store access
2. **Use the event hook** for reacting to new events
3. **Follow single responsibility principle** for clean plugin design
4. **Handle errors gracefully** to prevent plugin failures
5. **Consider performance** when designing plugin logic
6. **Test your plugins** to ensure reliability

The plugin system is designed to be simple yet powerful, allowing you to build complex functionality while maintaining clean separation of concerns. 