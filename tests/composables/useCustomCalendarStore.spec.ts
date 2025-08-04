import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomCalendarStore, type CalendarStoreOverrides } from '@/composables/useCustomCalendarStore'
import { type CalendarEvent } from '@/stores/calendarStore'

describe('useCustomCalendarStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should use default implementation when no overrides provided', () => {
    const store = useCustomCalendarStore()
    
    expect(store.addEvent).toBeDefined()
    expect(store.deleteEvent).toBeDefined()
    expect(store.updateEvent).toBeDefined()
    expect(store.getEventsForDate).toBeDefined()
  })

  it('should override addEvent method', () => {
    const mockAddEvent = vi.fn()
    const overrides: CalendarStoreOverrides = {
      addEvent: mockAddEvent
    }
    
    const store = useCustomCalendarStore(overrides)
    const testEvent: CalendarEvent = {
      id: 'test-1',
      title: 'Test Event',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }
    
    store.addEvent(testEvent)
    
    expect(mockAddEvent).toHaveBeenCalledWith(testEvent)
  })

  it('should override deleteEvent method', () => {
    const mockDeleteEvent = vi.fn()
    const overrides: CalendarStoreOverrides = {
      deleteEvent: mockDeleteEvent
    }
    
    const store = useCustomCalendarStore(overrides)
    store.deleteEvent('test-id')
    
    expect(mockDeleteEvent).toHaveBeenCalledWith('test-id')
  })

  it('should override getEventsForDate method', () => {
    const mockGetEventsForDate = vi.fn().mockReturnValue([])
    const overrides: CalendarStoreOverrides = {
      getEventsForDate: mockGetEventsForDate
    }
    
    const store = useCustomCalendarStore(overrides)
    const testDate = new Date('2025-01-01')
    const result = store.getEventsForDate(testDate)
    
    expect(mockGetEventsForDate).toHaveBeenCalledWith(testDate)
    expect(result).toEqual([])
  })

  it('should override updateEventDateOnly method', () => {
    const mockUpdateEventDateOnly = vi.fn()
    const overrides: CalendarStoreOverrides = {
      updateEventDateOnly: mockUpdateEventDateOnly
    }
    
    const store = useCustomCalendarStore(overrides)
    const testDate = new Date('2025-01-15')
    store.updateEventDateOnly('test-id', testDate)
    
    expect(mockUpdateEventDateOnly).toHaveBeenCalledWith('test-id', testDate)
  })

  it('should use default implementation for non-overridden methods', () => {
    const mockAddEvent = vi.fn()
    const overrides: CalendarStoreOverrides = {
      addEvent: mockAddEvent
    }
    
    const store = useCustomCalendarStore(overrides)
    
    // addEvent should be overridden
    expect(store.addEvent).toBe(mockAddEvent)
    
    // deleteEvent should be default implementation
    expect(store.deleteEvent).not.toBe(mockAddEvent)
    expect(typeof store.deleteEvent).toBe('function')
  })

  it('should share state with base store', () => {
    const store = useCustomCalendarStore()
    const testEvent: CalendarEvent = {
      id: 'test-1',
      title: 'Test Event',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }
    
    store.addEvent(testEvent)
    
    // Check that the event was added to the shared state
    expect(store.events.get('test-1')).toEqual(testEvent)
  })

  it('should work with multiple overrides', () => {
    const mockAddEvent = vi.fn()
    const mockDeleteEvent = vi.fn()
    const mockGetEventsForDate = vi.fn().mockReturnValue([])
    
    const overrides: CalendarStoreOverrides = {
      addEvent: mockAddEvent,
      deleteEvent: mockDeleteEvent,
      getEventsForDate: mockGetEventsForDate
    }
    
    const store = useCustomCalendarStore(overrides)
    
    expect(store.addEvent).toBe(mockAddEvent)
    expect(store.deleteEvent).toBe(mockDeleteEvent)
    expect(store.getEventsForDate).toBe(mockGetEventsForDate)
    
    // Other methods should still be default implementations
    expect(typeof store.updateEvent).toBe('function')
    expect(typeof store.updateEventDateOnly).toBe('function')
  })

  it('should preserve timezone handling in default updateEventDateOnly', () => {
    const store = useCustomCalendarStore()
    
    const testEvent: CalendarEvent = {
      id: 'timezone-test',
      title: 'Timezone Test',
      start: '2025-01-01T14:30:45Z', // 2:30:45 PM UTC
      end: '2025-01-01T16:45:30Z',   // 4:45:30 PM UTC
      tailwindColor: 'blue',
      allDay: false
    }
    
    store.addEvent(testEvent)
    
    // Update to a new date
    const newDate = new Date('2025-01-15T00:00:00Z')
    store.updateEventDateOnly('timezone-test', newDate)
    
    const updatedEvent = store.events.get('timezone-test')!
    
    // Verify the date changed
    expect(new Date(updatedEvent.start).getDate()).toBe(15)
    expect(new Date(updatedEvent.end).getDate()).toBe(15)
    
    // Verify the time was preserved
    expect(new Date(updatedEvent.start).getHours()).toBe(14)
    expect(new Date(updatedEvent.start).getMinutes()).toBe(30)
    expect(new Date(updatedEvent.start).getSeconds()).toBe(45)
    
    expect(new Date(updatedEvent.end).getHours()).toBe(16)
    expect(new Date(updatedEvent.end).getMinutes()).toBe(45)
    expect(new Date(updatedEvent.end).getSeconds()).toBe(30)
  })

  it('should handle plugin registration correctly', () => {
    const store = useCustomCalendarStore()
    const mockPlugin = {
      onRegister: vi.fn(),
      onEventAdd: vi.fn()
    }
    
    store.registerPlugin(mockPlugin)
    
    expect(mockPlugin.onRegister).toHaveBeenCalled()
    expect(store.plugins).toContain(mockPlugin)
  })

  it('should provide reactive state', () => {
    const store = useCustomCalendarStore()
    
    expect(store.currentDate).toBeDefined()
    expect(store.events).toBeDefined()
    expect(store.plugins).toBeDefined()
    expect(store.currentMonth).toBeDefined()
    expect(store.monthEvents).toBeDefined()
  })
}) 