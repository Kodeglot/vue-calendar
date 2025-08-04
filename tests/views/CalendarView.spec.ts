import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarView from '../../src/views/CalendarView.vue'
import { useCalendarStore } from '../../src/stores/calendarStore'

describe('CalendarView', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const baseProps = {
    initialDate: new Date('2025-03-24T18:00:00Z'),
    initialView: 'month' as const,
    timeFormat: '24h' as const,
    height: '600px'
  }

  it('renders correctly with default props', () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('.vc-calendar').exists()).toBe(true)
    expect(wrapper.find('.vc-calendar-header').exists()).toBe(true)
    expect(wrapper.find('.vc-calendar-controls').exists()).toBe(true)
  })

  it('changes view when selecting different view', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    // Test view changes
    await wrapper.vm.setView('week')
    expect(wrapper.vm.currentView).toBe('week')

    await wrapper.vm.setView('day')
    expect(wrapper.vm.currentView).toBe('day')

    await wrapper.vm.setView('month')
    expect(wrapper.vm.currentView).toBe('month')
  })

  it('navigates dates correctly', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const initialDate = new Date(wrapper.vm.currentDate)

    // Test previous navigation
    await wrapper.vm.previousPeriod()
    expect(wrapper.vm.currentDate.getTime()).toBeLessThan(initialDate.getTime())

    // Test next navigation
    await wrapper.vm.nextPeriod()
    expect(wrapper.vm.currentDate.getTime()).toBeGreaterThanOrEqual(initialDate.getTime())
  })

  it('formats header date correctly for all views', () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    expect(wrapper.vm.headerDate).toBeTruthy()
    expect(typeof wrapper.vm.headerDate).toBe('string')
  })

  it('opens event modal when create button clicked', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    await wrapper.vm.toggleNewEventForm()
    expect(wrapper.emitted('openEventModal')).toBeTruthy()
  })

  it('handles event saving', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'test-1',
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      tailwindColor: 'blue',
      allDay: false
    }

    await wrapper.vm.handleEventSave(testEvent)
    expect(store.events.has('test-1')).toBe(true)
    expect(wrapper.emitted('event-created')).toBeTruthy()
  })

  it('updates event start and end correctly after drag and drop from month view', async () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        enableDragDrop: true
      },
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    store.addEvent({
      id: 'drop-test',
      title: 'Drop Test',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    })

    await wrapper.vm.handleEventDrop('drop-test', new Date('2025-01-03T00:00:00Z'))
    
    const updated = store.events.get('drop-test')
    expect(updated).toBeDefined()
    expect(updated!.start).toBe('2025-01-03T10:00:00.000Z')
    expect(updated!.end).toBe('2025-01-03T11:00:00.000Z')
  })

  it('handles event updates correctly', async () => {
    const wrapper = mount(CalendarView, {
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
    
    // Use the onEventUpdated method which emits the event with the provided times
    await wrapper.vm.onEventUpdated(testEvent, '2025-01-01T12:00:00Z', '2025-01-01T13:00:00Z')
    
    expect(wrapper.emitted('event-updated')).toBeTruthy()
    const emitted = wrapper.emitted('event-updated')![0]
    
    // Expect the original event (not updated in store) with the provided times
    expect(emitted[0]).toMatchObject(testEvent)
    expect(emitted[1]).toBe('2025-01-01T12:00:00Z')
    expect(emitted[2]).toBe('2025-01-01T13:00:00Z')
  })

  it('handles event deletion correctly', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    const testEvent = {
      id: 'delete-test',
      title: 'Delete Test',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    store.addEvent(testEvent)
    await wrapper.vm.handleEventDelete('delete-test')
    
    expect(store.events.has('delete-test')).toBe(false)
    expect(wrapper.emitted('event-deleted')).toBeTruthy()
    expect(wrapper.emitted('event-deleted')![0]).toEqual(['delete-test'])
  })

  it('does not show demo events when showDemoEvents is false', async () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        showDemoEvents: false
      },
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    await wrapper.vm.$nextTick()
    
    // Check that no demo events were added
    const demoEventIds = ['sample-1', 'sample-2', 'sample-3', 'sample-4']
    demoEventIds.forEach(id => {
      expect(store.events.has(id)).toBe(false)
    })
  })

  it('shows demo events when showDemoEvents is true', async () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        showDemoEvents: true
      },
      global: { plugins: [pinia] }
    })

    const store = useCalendarStore()
    await wrapper.vm.$nextTick()
    
    // Check that demo events were added
    const demoEventIds = ['sample-1', 'sample-2', 'sample-3', 'sample-4']
    demoEventIds.forEach(id => {
      expect(store.events.has(id)).toBe(true)
    })
  })

  it('handles custom classes correctly', () => {
    const customClasses = {
      container: 'custom-container',
      header: 'custom-header',
      controls: 'custom-controls'
    }

    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        customClasses
      },
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('.custom-container').exists()).toBe(true)
    expect(wrapper.find('.custom-header').exists()).toBe(true)
    expect(wrapper.find('.custom-controls').exists()).toBe(true)
  })

  it('emits date-change when navigating', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    await wrapper.vm.nextPeriod()
    expect(wrapper.emitted('date-change')).toBeTruthy()
  })

  it('handles time format changes correctly', async () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        timeFormat: '12h'
      },
      global: { plugins: [pinia] }
    })

    expect(wrapper.vm.timeFormat).toBe('12h')
    
    // Test switching time format
    await wrapper.setProps({ timeFormat: '24h' })
    expect(wrapper.vm.timeFormat).toBe('24h')
  })

  it('handles height prop correctly', () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        height: '800px'
      },
      global: { plugins: [pinia] }
    })

    const calendarElement = wrapper.find('.vc-calendar')
    expect(calendarElement.attributes('style')).toContain('height: 800px')
  })

  it('handles showControls prop correctly', () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        showControls: false
      },
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('.vc-calendar-controls').exists()).toBe(false)
  })

  it('handles showEventButton prop correctly', () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        showEventButton: false
      },
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('.vc-calendar-event-button').exists()).toBe(false)
  })

  it('handles enableDragDrop prop correctly', () => {
    const wrapper = mount(CalendarView, {
      props: {
        ...baseProps,
        enableDragDrop: false
      },
      global: { plugins: [pinia] }
    })

    // The drag drop functionality should be disabled
    expect(wrapper.vm.enableDragDrop).toBe(false)
  })

  it('handles event click correctly', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const testEvent = {
      id: 'click-test',
      title: 'Click Test',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    await wrapper.vm.handleEventClick(testEvent)
    expect(wrapper.emitted('event-click')).toBeTruthy()
    expect(wrapper.emitted('event-click')![0]).toEqual([testEvent])
  })

  it('handles day click correctly', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const testDate = new Date('2025-01-01T10:00:00Z')
    await wrapper.vm.handleDayClick(testDate)
    expect(wrapper.emitted('openEventModal')).toBeTruthy()
    expect(wrapper.emitted('openEventModal')![0]).toEqual([testDate])
  })

  it('clears selected event correctly', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] }
    })

    const testEvent = {
      id: 'clear-test',
      title: 'Clear Test',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false
    }

    wrapper.vm.selectedEvent = testEvent
    await wrapper.vm.clearSelectedEvent()
    expect(wrapper.vm.selectedEvent).toBe(null)
  })

  it('handles slot content correctly', () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] },
      slots: {
        navigation: '<div class="custom-navigation">Custom Nav</div>',
        'view-selector': '<div class="custom-view-selector">Custom View</div>',
        'event-button': '<button class="custom-event-button">Custom Button</button>'
      }
    })

    expect(wrapper.find('.custom-navigation').exists()).toBe(true)
    expect(wrapper.find('.custom-view-selector').exists()).toBe(true)
    expect(wrapper.find('.custom-event-button').exists()).toBe(true)
  })

  it('handles event modal slot correctly', async () => {
    const wrapper = mount(CalendarView, {
      props: baseProps,
      global: { plugins: [pinia] },
      slots: {
        'event-modal': `
          <template #default="{ event, update, delete: deleteEvent, close }">
            <div class="custom-event-modal">
              <span>{{ event?.title }}</span>
              <button @click="update">Update</button>
              <button @click="deleteEvent">Delete</button>
              <button @click="close">Close</button>
            </div>
          </template>
        `
      }
    })

    expect(wrapper.find('.custom-event-modal').exists()).toBe(true)
  })
})
