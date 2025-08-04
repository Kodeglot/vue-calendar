import { setActivePinia, createPinia } from 'pinia'
import { useCalendarStore, type CalendarEvent } from '../../src/stores/calendarStore'

describe('calendarStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds an event', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '1',
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    expect(store.events.has('1')).toBe(true)
    expect(store.events.get('1')).toMatchObject({ title: 'Test Event' })
  })

  it('updates an event', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '2',
      title: 'Old Title',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      tailwindColor: 'red',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    store.updateEvent({ ...event, title: 'New Title' })
    expect(store.events.get('2')?.title).toBe('New Title')
  })

  it('deletes an event', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '3',
      title: 'To Delete',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      tailwindColor: 'green',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    store.deleteEvent('3')
    expect(store.events.has('3')).toBe(false)
  })

  it('does not update a non-existent event', () => {
    const store = useCalendarStore()
    expect(() => store.updateEvent({
      id: 'nonexistent',
      title: 'Should Not Exist',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      tailwindColor: 'gray',
      allDay: false,
      width: 100,
      left: 0
    })).not.toThrow()
    expect(store.events.has('nonexistent')).toBe(false)
  })

  it('does not delete a non-existent event', () => {
    const store = useCalendarStore()
    expect(() => store.deleteEvent('nonexistent')).not.toThrow()
    expect(store.events.has('nonexistent')).toBe(false)
  })

  it('gets events for a specific date', () => {
    const store = useCalendarStore()
    const today = new Date()
    const event: CalendarEvent = {
      id: '4',
      title: 'Today Event',
      start: today.toISOString(),
      end: new Date(today.getTime() + 3600000).toISOString(),
      tailwindColor: 'yellow',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    const events = store.getEventsForDate(today)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].id).toBe('4')
  })

  it('handles metadata, description, and location fields', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '5',
      title: 'Meta Event',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      tailwindColor: 'purple',
      allDay: false,
      width: 100,
      left: 0,
      metadata: { foo: 'bar' },
      description: 'desc',
      location: 'loc'
    }
    store.addEvent(event)
    expect(store.events.get('5')?.metadata?.foo).toBe('bar')
    expect(store.events.get('5')?.description).toBe('desc')
    expect(store.events.get('5')?.location).toBe('loc')
  })

  it('updates event date only while preserving time', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '6',
      title: 'Time Preserved',
      start: '2025-01-01T14:30:45Z', // 2:30:45 PM UTC
      end: '2025-01-01T16:45:30Z',   // 4:45:30 PM UTC
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    const newDate = new Date('2025-01-15T00:00:00Z') // New date, time should be ignored
    store.updateEventDateOnly('6', newDate)
    const updated = store.events.get('6')!
    
    // Verify the date changed
    expect(new Date(updated.start).getDate()).toBe(15)
    expect(new Date(updated.end).getDate()).toBe(15)
    
    // Verify the time components are preserved
    expect(new Date(updated.start).getUTCHours()).toBe(14)
    expect(new Date(updated.start).getUTCMinutes()).toBe(30)
    expect(new Date(updated.start).getUTCSeconds()).toBe(45)
    
    expect(new Date(updated.end).getUTCHours()).toBe(16)
    expect(new Date(updated.end).getUTCMinutes()).toBe(45)
    expect(new Date(updated.end).getUTCSeconds()).toBe(30)
    
    // Verify the duration is preserved
    const originalDuration = new Date(event.end).getTime() - new Date(event.start).getTime()
    const newDuration = new Date(updated.end).getTime() - new Date(updated.start).getTime()
    expect(newDuration).toBe(originalDuration)
  })

  it('updates event date only with timezone edge case', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: 'timezone-test',
      title: 'Timezone Test',
      start: '2025-01-01T09:00:00Z', // 9:00 AM UTC
      end: '2025-01-01T17:00:00Z',   // 5:00 PM UTC
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    
    // Create a date with a specific time that should be ignored
    const newDate = new Date('2025-01-20T22:00:00Z') // 10:00 PM UTC - this time should be ignored
    store.updateEventDateOnly('timezone-test', newDate)
    const updated = store.events.get('timezone-test')!
    
    // Verify the date changed
    expect(new Date(updated.start).getDate()).toBe(20)
    expect(new Date(updated.end).getDate()).toBe(20)
    
    // Verify the original time is preserved (not 22:00)
    expect(new Date(updated.start).getUTCHours()).toBe(9) // Should still be 9:00 AM, not 22:00
    expect(new Date(updated.end).getUTCHours()).toBe(17)  // Should still be 5:00 PM, not 22:00
  })

  it('updates event date', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '7',
      title: 'Date',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    const newDate = new Date('2025-01-03T00:00:00Z')
    store.updateEventDate('7', newDate)
    const updated = store.events.get('7')!
    expect(new Date(updated.start).getDate()).toBe(3)
    expect(new Date(updated.end).getDate()).toBe(3)
  })

  it('updates event duration', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '8',
      title: 'Duration',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    const newStart = new Date('2025-01-01T12:00:00Z')
    const newEnd = new Date('2025-01-01T14:00:00Z')
    store.updateEventDuration('8', newStart, newEnd)
    const updated = store.events.get('8')!
    expect(new Date(updated.start).getUTCHours()).toBe(12)
    expect(new Date(updated.end).getUTCHours()).toBe(14)
  })

  it('updates event time', () => {
    const store = useCalendarStore()
    const event: CalendarEvent = {
      id: '9',
      title: 'Time',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    const newTime = new Date('2025-01-01T15:30:00Z')
    store.updateEventTime('9', newTime)
    const updated = store.events.get('9')!
    expect(new Date(updated.start).getUTCHours()).toBe(15)
    expect(new Date(updated.start).getUTCMinutes()).toBe(30)
  })

  it('gets events for a week', () => {
    const store = useCalendarStore()
    const weekStart = new Date('2025-01-01T00:00:00Z')
    const event: CalendarEvent = {
      id: '10',
      title: 'Week Event',
      start: '2025-01-03T10:00:00Z',
      end: '2025-01-03T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    const weekEvents = store.getEventsForWeek(weekStart)
    expect(weekEvents.some(e => e.id === '10')).toBe(true)
  })

  it('registers a plugin and calls onRegister/onEventAdd', () => {
    const store = useCalendarStore()
    const onRegister = vi.fn()
    const onEventAdd = vi.fn()
    const plugin = { onRegister, onEventAdd }
    store.registerPlugin(plugin)
    expect(onRegister).toHaveBeenCalled()
    const event: CalendarEvent = {
      id: '11',
      title: 'Plugin Event',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    }
    store.addEvent(event)
    expect(onEventAdd).toHaveBeenCalledWith(event)
  })
}) 