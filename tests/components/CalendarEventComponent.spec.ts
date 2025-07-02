import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarEventComponent from '../../src/components/CalendarEventComponent.vue'
import type { CalendarEvent } from '../../src/stores/calendarStore'

describe('CalendarEventComponent', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const baseProps = {
    viewType: 'week' as const,
    event: {
      id: '1',
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    } as CalendarEvent
  }

  it('renders event title', () => {
    const wrapper = mount(CalendarEventComponent, { 
      props: baseProps,
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.text()).toContain('Test Event')
  })

  it('emits click event when clicked', async () => {
    const mockContainer = document.createElement('div')
    mockContainer.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => {} })
    const wrapper = mount(CalendarEventComponent, { 
      props: { ...baseProps, containerRef: mockContainer },
      global: {
        plugins: [pinia]
      }
    })
    const button = wrapper.find('[role="button"]')
    await button.trigger('mousedown', {
      button: 0,
      stopPropagation: () => {}
    })
    document.dispatchEvent(new Event('mouseup'))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('click')).toBeDefined()
    expect(wrapper.emitted('click')?.[0][0]).toMatchObject({
      id: '1',
      title: 'Test Event'
    })
  })

  it('does not emit click when resizing', async () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        resizable: true
      },
      global: {
        plugins: [pinia]
      }
    })
    
    // Trigger a resize by clicking on a resize handle
    await wrapper.find('.cursor-row-resize').trigger('mousedown')
    
    // Now try to click the event
    await wrapper.find('[role="button"]').trigger('click')
    
    // Should not emit click when resizing
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  describe('Timezone handling', () => {
    const testCases = [
      {
        timeZone: 'UTC',
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '14:30 - 15:45' // 24h format default
      },
      {
        timeZone: 'Europe/Brussels', // UTC+1
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '15:30 - 16:45' // 24h format default
      },
      {
        timeZone: 'America/New_York', // UTC-4 (during DST)
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '10:30 - 11:45' // 24h format default
      },
      {
        timeZone: 'Asia/Tokyo', // UTC+9
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '23:30 - 00:45' // 24h format default
      }
    ]

    testCases.forEach(({ timeZone, start, end, expected }) => {
      it(`formats time correctly for ${timeZone}`, () => {
        // Mock the timezone for this test
        const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions
        Intl.DateTimeFormat.prototype.resolvedOptions = () => ({
          timeZone,
          locale: 'en-US'
        } as any)
        
        const wrapper = mount(CalendarEventComponent, {
          props: {
            ...baseProps,
            timeFormat: '24h',
            event: {
              ...baseProps.event,
              start,
              end
            }
          },
          global: {
            plugins: [pinia]
          }
        })
        
        expect(wrapper.text()).toContain(expected)
        
        // Restore original function
        Intl.DateTimeFormat.prototype.resolvedOptions = originalResolvedOptions
      })
    })
  })

  it('calculates position correctly for day view', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        viewType: 'day',
        pxPerHour: 60,
        event: {
          ...baseProps.event,
          start: '2025-03-25T09:30:00Z',
          end: '2025-03-25T11:45:00Z'
        }
      },
      global: {
        plugins: [pinia]
      }
    })
    
    // Check that the component renders with proper positioning
    const eventElement = wrapper.find('[role="button"]')
    expect(eventElement.exists()).toBe(true)
    
    // Check that the element has positioning styles
    const style = eventElement.attributes('style')
    expect(style).toContain('top:')
    expect(style).toContain('height:')
  })

  it('shows resize handles when resizable', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        resizable: true
      },
      global: {
        plugins: [pinia]
      }
    })
    expect(wrapper.find('.cursor-row-resize').exists()).toBe(true)
  })

  it('renders custom slot content', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: baseProps,
      slots: {
        default: '<div class="custom-slot">Custom Content</div>'
      },
      global: { plugins: [pinia] }
    })
    expect(wrapper.find('.custom-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom Content')
  })

  it('applies custom classes and styles', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        customClasses: { eventContainer: 'test-class' },
        customStyles: { eventContainer: { background: 'red' } }
      },
      global: { plugins: [pinia] }
    })
    const eventEl = wrapper.find('[role="button"]')
    expect(eventEl.classes()).toContain('test-class')
    expect(eventEl.attributes('style')).toContain('background: red')
  })

  it('renders correctly in month view and uses pastel color', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        viewType: 'month',
        event: { ...baseProps.event, id: 'unique-id', tailwindColor: '' }
      },
      global: { plugins: [pinia] }
    })
    const eventEl = wrapper.find('[role="button"]')
    // Should have a pastel color class
    const classes = eventEl.classes().join(' ')
    expect(classes).toMatch(/bg-\w+-100/)
    expect(classes).toMatch(/border-l-\w+-500/)
  })

  it('renders all-day event', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        event: { ...baseProps.event, allDay: true }
      },
      global: { plugins: [pinia] }
    })
    expect(wrapper.text()).toContain('Test Event')
  })

  it('handles error in formatEventTime gracefully', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        event: { ...baseProps.event, start: 'invalid', end: 'invalid' }
      },
      global: { plugins: [pinia] }
    })
    // Should not throw and should show fallback
    expect(wrapper.text()).toContain('--:-- - --:--')
  })
})
