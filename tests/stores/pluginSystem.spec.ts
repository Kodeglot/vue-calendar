import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalendarStore, type CalendarPlugin, type CalendarEvent } from '@/stores/calendarStore'

describe('Plugin System', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Plugin Registration', () => {
    it('should register a plugin and call onRegister', () => {
      const store = useCalendarStore()
      const mockPlugin: CalendarPlugin = {
        onRegister: vi.fn()
      }
      
      store.registerPlugin(mockPlugin)
      
      expect(mockPlugin.onRegister).toHaveBeenCalledWith({
        currentDate: store.currentDate,
        events: Array.from(store.events.values()),
        plugins: store.plugins,
        currentMonth: store.currentMonth,
        monthEvents: store.monthEvents,
        addEvent: store.addEvent,
        updateEvent: store.updateEvent,
        deleteEvent: store.deleteEvent,
        updateEventDate: store.updateEventDate,
        updateEventDateOnly: store.updateEventDateOnly,
        updateEventDuration: store.updateEventDuration,
        updateEventTime: store.updateEventTime,
        getEventsForDate: store.getEventsForDate,
        getEventsForWeek: store.getEventsForWeek,
        registerPlugin: store.registerPlugin
      })
      
      expect(store.plugins).toContain(mockPlugin)
    })

    it('should register multiple plugins', () => {
      const store = useCalendarStore()
      const plugin1: CalendarPlugin = { onRegister: vi.fn() }
      const plugin2: CalendarPlugin = { onRegister: vi.fn() }
      
      store.registerPlugin(plugin1)
      store.registerPlugin(plugin2)
      
      expect(store.plugins).toHaveLength(2)
      expect(store.plugins).toContain(plugin1)
      expect(store.plugins).toContain(plugin2)
    })

    it('should handle plugin without onRegister', () => {
      const store = useCalendarStore()
      const plugin: CalendarPlugin = {
        onEventAdd: vi.fn()
      }
      
      expect(() => store.registerPlugin(plugin)).not.toThrow()
      expect(store.plugins).toContain(plugin)
    })
  })

  describe('Plugin Event Hooks', () => {
    it('should call onEventAdd when event is added', () => {
      const store = useCalendarStore()
      const mockPlugin: CalendarPlugin = {
        onEventAdd: vi.fn()
      }
      
      store.registerPlugin(mockPlugin)
      
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      store.addEvent(testEvent)
      
      expect(mockPlugin.onEventAdd).toHaveBeenCalledWith(testEvent)
    })

    it('should call onEventAdd for multiple plugins', () => {
      const store = useCalendarStore()
      const plugin1: CalendarPlugin = { onEventAdd: vi.fn() }
      const plugin2: CalendarPlugin = { onEventAdd: vi.fn() }
      
      store.registerPlugin(plugin1)
      store.registerPlugin(plugin2)
      
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      store.addEvent(testEvent)
      
      expect(plugin1.onEventAdd).toHaveBeenCalledWith(testEvent)
      expect(plugin2.onEventAdd).toHaveBeenCalledWith(testEvent)
    })

    it('should handle plugin without onEventAdd', () => {
      const store = useCalendarStore()
      const plugin: CalendarPlugin = {
        onRegister: vi.fn()
      }
      
      store.registerPlugin(plugin)
      
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      expect(() => store.addEvent(testEvent)).not.toThrow()
    })
  })

  describe('Plugin Store Access', () => {
    it('should provide access to store state in onRegister', () => {
      const store = useCalendarStore()
      let capturedStore: any = null
      
      const plugin: CalendarPlugin = {
        onRegister: (storeContext) => {
          capturedStore = storeContext
        }
      }
      
      store.registerPlugin(plugin)
      
      expect(capturedStore).toBeDefined()
      expect(capturedStore.currentDate).toBe(store.currentDate)
      expect(capturedStore.events).toEqual(Array.from(store.events.values()))
      expect(capturedStore.plugins).toBe(store.plugins)
      expect(capturedStore.currentMonth).toBe(store.currentMonth)
      expect(capturedStore.monthEvents).toEqual(store.monthEvents)
    })

    it('should provide access to store methods in onRegister', () => {
      const store = useCalendarStore()
      let capturedStore: any = null
      
      const plugin: CalendarPlugin = {
        onRegister: (storeContext) => {
          capturedStore = storeContext
        }
      }
      
      store.registerPlugin(plugin)
      
      expect(capturedStore.addEvent).toBe(store.addEvent)
      expect(capturedStore.updateEvent).toBe(store.updateEvent)
      expect(capturedStore.deleteEvent).toBe(store.deleteEvent)
      expect(capturedStore.getEventsForDate).toBe(store.getEventsForDate)
      expect(capturedStore.registerPlugin).toBe(store.registerPlugin)
    })
  })

  describe('Plugin Method Override', () => {
    it('should allow plugins to override store methods', () => {
      const store = useCalendarStore()
      const originalAddEvent = store.addEvent
      let overrideCalled = false
      
      const plugin: CalendarPlugin = {
        onRegister: (storeContext) => {
          // Override addEvent method
          storeContext.addEvent = (event) => {
            overrideCalled = true
            originalAddEvent(event)
          }
        }
      }
      
      store.registerPlugin(plugin)
      
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      store.addEvent(testEvent)
      
      expect(overrideCalled).toBe(true)
      expect(store.events.get('test-1')).toEqual(testEvent)
    })

    it('should allow multiple plugins to chain method overrides', () => {
      const store = useCalendarStore()
      const callOrder: string[] = []
      
      const plugin1: CalendarPlugin = {
        onRegister: (storeContext) => {
          const originalAddEvent = storeContext.addEvent
          storeContext.addEvent = (event) => {
            callOrder.push('plugin1')
            originalAddEvent(event)
          }
        }
      }
      
      const plugin2: CalendarPlugin = {
        onRegister: (storeContext) => {
          const originalAddEvent = storeContext.addEvent
          storeContext.addEvent = (event) => {
            callOrder.push('plugin2')
            originalAddEvent(event)
          }
        }
      }
      
      store.registerPlugin(plugin1)
      store.registerPlugin(plugin2)
      
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      store.addEvent(testEvent)
      
      expect(callOrder).toEqual(['plugin2', 'plugin1'])
      expect(store.events.get('test-1')).toEqual(testEvent)
    })
  })

  describe('Plugin Error Handling', () => {
    it('should handle errors in onRegister gracefully', () => {
      const store = useCalendarStore()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const plugin: CalendarPlugin = {
        onRegister: () => {
          throw new Error('Plugin registration failed')
        }
      }
      
      expect(() => store.registerPlugin(plugin)).not.toThrow()
      
      consoleSpy.mockRestore()
    })

    it('should handle errors in onEventAdd gracefully', () => {
      const store = useCalendarStore()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const plugin: CalendarPlugin = {
        onEventAdd: () => {
          throw new Error('Event processing failed')
        }
      }
      
      store.registerPlugin(plugin)
      
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      expect(() => store.addEvent(testEvent)).not.toThrow()
      expect(store.events.get('test-1')).toEqual(testEvent)
      
      consoleSpy.mockRestore()
    })
  })

  describe('Plugin State Management', () => {
    it('should maintain plugin state across operations', () => {
      const store = useCalendarStore()
      let eventCount = 0
      
      const plugin: CalendarPlugin = {
        onRegister: () => {
          eventCount = 0
        },
        onEventAdd: () => {
          eventCount++
        }
      }
      
      store.registerPlugin(plugin)
      
      const testEvent1: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event 1',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      const testEvent2: CalendarEvent = {
        id: 'test-2',
        title: 'Test Event 2',
        start: '2025-01-01T12:00:00Z',
        end: '2025-01-01T13:00:00Z',
        tailwindColor: 'green',
        allDay: false
      }
      
      store.addEvent(testEvent1)
      store.addEvent(testEvent2)
      
      expect(eventCount).toBe(2)
    })
  })

  describe('Plugin Integration with Custom Store', () => {
    it('should work with useCustomCalendarStore', () => {
      const { useCustomCalendarStore } = require('@/stores/calendarStore')
      const customStore = useCustomCalendarStore()
      
      const mockPlugin: CalendarPlugin = {
        onRegister: vi.fn(),
        onEventAdd: vi.fn()
      }
      
      customStore.registerPlugin(mockPlugin)
      
      expect(mockPlugin.onRegister).toHaveBeenCalled()
      
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      customStore.addEvent(testEvent)
      
      expect(mockPlugin.onEventAdd).toHaveBeenCalledWith(testEvent)
    })
  })

  describe('Plugin Performance', () => {
    it('should handle many plugins efficiently', () => {
      const store = useCalendarStore()
      const plugins: CalendarPlugin[] = []
      
      // Create 100 plugins
      for (let i = 0; i < 100; i++) {
        plugins.push({
          onRegister: vi.fn(),
          onEventAdd: vi.fn()
        })
      }
      
      // Register all plugins
      const startTime = performance.now()
      plugins.forEach(plugin => store.registerPlugin(plugin))
      const registrationTime = performance.now() - startTime
      
      // Add an event
      const testEvent: CalendarEvent = {
        id: 'test-1',
        title: 'Test Event',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        tailwindColor: 'blue',
        allDay: false
      }
      
      const eventStartTime = performance.now()
      store.addEvent(testEvent)
      const eventTime = performance.now() - eventStartTime
      
      // Verify all plugins were called
      plugins.forEach(plugin => {
        expect(plugin.onRegister).toHaveBeenCalled()
        expect(plugin.onEventAdd).toHaveBeenCalledWith(testEvent)
      })
      
      // Performance should be reasonable (less than 100ms for registration, less than 50ms for event)
      expect(registrationTime).toBeLessThan(100)
      expect(eventTime).toBeLessThan(50)
    })
  })
}) 