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
    const wrapper = mount(CalendarEventComponent, { 
      props: baseProps,
      global: {
        plugins: [pinia]
      }
    })
    await wrapper.find('[role="button"]').trigger('click', {
      button: 0,
      stopPropagation: () => {}
    })
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
})
