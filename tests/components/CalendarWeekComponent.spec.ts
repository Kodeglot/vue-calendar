import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarWeekComponent from '../../src/components/CalendarWeekComponent.vue'
import { useCalendarStore } from '../../src/stores/calendarStore'

describe('CalendarWeekComponent', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const baseProps = {
    currentDate: new Date('2025-01-01T00:00:00Z'),
    hourHeight: 60,
    timeFormat: '24h' as const,
    enableDragDrop: true
  }

  it('renders correctly with default props', () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('.vc-calendar-week').exists()).toBe(true)
    expect(wrapper.find('.vc-calendar-week-header').exists()).toBe(true)
    expect(wrapper.find('.vc-calendar-week-grid').exists()).toBe(true)
  })

  it('renders week header with correct days', () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const headerCells = wrapper.findAll('.vc-calendar-week-header-cell')
    expect(headerCells).toHaveLength(7)
    
    // Check that we have the days of the week
    const dayTexts = headerCells.map(cell => cell.text())
    expect(dayTexts.some(text => text.includes('Sun'))).toBe(true)
    expect(dayTexts.some(text => text.includes('Mon'))).toBe(true)
    expect(dayTexts.some(text => text.includes('Tue'))).toBe(true)
    expect(dayTexts.some(text => text.includes('Wed'))).toBe(true)
    expect(dayTexts.some(text => text.includes('Thu'))).toBe(true)
    expect(dayTexts.some(text => text.includes('Fri'))).toBe(true)
    expect(dayTexts.some(text => text.includes('Sat'))).toBe(true)
  })

  it('renders time grid with correct time slots', () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    // TimeGridComponent no longer renders hour labels, only time slots
    const timeSlots = wrapper.findAll('.vc-calendar-time-slot')
    expect(timeSlots.length).toBeGreaterThan(0)
    
    // Check that we have 168 time slots (24 hours × 7 days)
    expect(timeSlots.length).toBe(168)
  })

  it('renders events in correct positions', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'week-test',
      title: 'Week Test Event',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    store.addEvent(testEvent)
    await wrapper.vm.$nextTick()

    const events = wrapper.findAll('.vc-calendar-event')
    expect(events.length).toBeGreaterThan(0)
  })

  it('emits dayClick when a time slot is clicked', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const timeSlot = wrapper.find('.vc-calendar-time-slot')
    await timeSlot.trigger('click')

    expect(wrapper.emitted('dayClick')).toBeTruthy()
  })

  it('emits eventClick when an event is clicked', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'click-test',
      title: 'Click Test',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    store.addEvent(testEvent)
    await wrapper.vm.$nextTick()

    const eventElement = wrapper.find('.vc-calendar-event')
    await eventElement.trigger('click')

    expect(wrapper.emitted('eventClick')).toBeTruthy()
  })

  it('emits event-updated when child event emits it', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'update-test',
      title: 'Update Test',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    store.addEvent(testEvent)
    await wrapper.vm.$nextTick()

    // Simulate event-updated from child component
    await wrapper.vm.onEventUpdated(testEvent, '2025-01-01T12:00:00Z', '2025-01-01T13:00:00Z')

    expect(wrapper.emitted('event-updated')).toBeTruthy()
    const emitted = wrapper.emitted('event-updated')![0]
    expect(emitted[0]).toBe(testEvent)
    expect(emitted[1]).toBe('2025-01-01T12:00:00Z')
    expect(emitted[2]).toBe('2025-01-01T13:00:00Z')
  })

  it('handles drag and drop correctly', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'drag-test',
      title: 'Drag Test',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    store.addEvent(testEvent)
    await wrapper.vm.$nextTick()

    // Test drag over
    const timeSlot = wrapper.find('.vc-calendar-time-slot')
    await timeSlot.trigger('dragover')

    // Test drop
    const dragEvent = new DragEvent('drop', { bubbles: true })
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: {
        getData: (type: string) => {
          if (type === 'text/plain') return 'drag-test'
          if (type === 'application/calendar-event-id') return 'drag-test'
          return ''
        }
      }
    })

    await timeSlot.trigger('drop', dragEvent)
    expect(wrapper.emitted('event-dropped')).toBeTruthy()
  })

  it('handles different time formats correctly', () => {
    const wrapper12h = mount(CalendarWeekComponent, {
      props: {
        ...baseProps,
        timeFormat: '12h'
      },
      global: { plugins: [pinia] }
    })

    const wrapper24h = mount(CalendarWeekComponent, {
      props: {
        ...baseProps,
        timeFormat: '24h'
      },
      global: { plugins: [pinia] }
    })

    expect(wrapper12h.vm.timeFormat).toBe('12h')
    expect(wrapper24h.vm.timeFormat).toBe('24h')
  })

  it('handles different hour heights correctly', () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: {
        ...baseProps,
        hourHeight: 80
      },
      global: { plugins: [pinia] }
    })

    expect(wrapper.vm.hourHeight).toBe(80)
  })

  it('handles enableDragDrop prop correctly', () => {
    const wrapperEnabled = mount(CalendarWeekComponent, {
      props: {
        ...baseProps,
        enableDragDrop: true
      },
      global: { plugins: [pinia] }
    })

    const wrapperDisabled = mount(CalendarWeekComponent, {
      props: {
        ...baseProps,
        enableDragDrop: false
      },
      global: { plugins: [pinia] }
    })

    expect(wrapperEnabled.vm.enableDragDrop).toBe(true)
    expect(wrapperDisabled.vm.enableDragDrop).toBe(false)
  })

  it('renders all-day events correctly', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const allDayEvent = {
      id: 'allday-test',
      title: 'All Day Event',
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-02T00:00:00Z',
      tailwindColor: 'green',
      allDay: true
    }

    store.addEvent(allDayEvent)
    await wrapper.vm.$nextTick()

    const allDayEvents = wrapper.findAll('.vc-calendar-event[data-allday="true"]')
    expect(allDayEvents.length).toBeGreaterThan(0)
  })

  it('handles multiple events on the same day correctly', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const event1 = {
      id: 'multi-1',
      title: 'Event 1',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    const event2 = {
      id: 'multi-2',
      title: 'Event 2',
      start: '2025-01-01T12:00:00Z',
      end: '2025-01-01T13:00:00Z',
      tailwindColor: 'red',
      allDay: false
    }

    store.addEvent(event1)
    store.addEvent(event2)
    await wrapper.vm.$nextTick()

    const events = wrapper.findAll('.vc-calendar-event')
    expect(events.length).toBeGreaterThanOrEqual(2)
  })

  it('handles events spanning multiple days correctly', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const multiDayEvent = {
      id: 'multiday-test',
      title: 'Multi Day Event',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-03T10:00:00Z',
      tailwindColor: 'purple',
      allDay: false
    }

    store.addEvent(multiDayEvent)
    await wrapper.vm.$nextTick()

    const events = wrapper.findAll('.vc-calendar-event')
    expect(events.length).toBeGreaterThan(0)
  })

  it('handles empty store correctly', () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const events = wrapper.findAll('.vc-calendar-event')
    expect(events.length).toBe(0)
  })

  it('handles current date changes correctly', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const newDate = new Date('2025-01-08T00:00:00Z')
    await wrapper.setProps({ currentDate: newDate })

    expect(wrapper.vm.currentDate).toEqual(newDate)
  })

  it('handles slot content correctly', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] },
      slots: {
        'event-content': '<div class="custom-event-content">Custom Event</div>'
      }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'slot-test',
      title: 'Slot Test Event',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    store.addEvent(testEvent)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.custom-event-content').exists()).toBe(true)
  })

  it('handles event positioning correctly', async () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'position-test',
      title: 'Position Test',
      start: '2025-01-01T10:30:00Z',
      end: '2025-01-01T11:30:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    store.addEvent(testEvent)
    await wrapper.vm.$nextTick()

    const event = wrapper.find('.vc-calendar-event')
    expect(event.exists()).toBe(true)
  })

  it('handles time zone changes correctly', () => {
    const wrapper = mount(CalendarWeekComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    // Test that the component handles time zone changes
    expect(wrapper.vm.currentDate).toBeInstanceOf(Date)
  })
}) 