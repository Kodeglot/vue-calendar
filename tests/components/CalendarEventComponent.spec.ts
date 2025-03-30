import { mount } from '@vue/test-utils'
import CalendarEventComponent from '../../src/components/CalendarEventComponent.vue'

describe('CalendarEventComponent', () => {
  const baseProps = {
    viewType: 'week' as const,
    event: {
      id: '1',
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      color: '#3b82f6',
      width: 100,
      left: 0
    }
  }

  it('renders event title', () => {
    const wrapper = mount(CalendarEventComponent, { props: baseProps })
    expect(wrapper.text()).toContain('Test Event')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(CalendarEventComponent, { props: baseProps })
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

  it('emits dragstart event on drag', async () => {
    const wrapper = mount(CalendarEventComponent, { props: baseProps })
    await wrapper.find('[role="button"]').trigger('dragstart')
    expect(wrapper.emitted('dragstart')).toBeDefined()
  })

  it('does not emit click when resizing', async () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        resizable: true
      }
    })
    const vm = wrapper.vm as unknown as { isResizing: boolean }
    vm.isResizing = true
    await wrapper.find('[role="button"]').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  describe('Timezone handling', () => {
    const testCases = [
      {
        timeZone: 'UTC',
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '02:30 PM - 03:45 PM'
      },
      {
        timeZone: 'Europe/Brussels', // UTC+1
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '03:30 PM - 04:45 PM'
      },
      {
        timeZone: 'America/New_York', // UTC-4 (during DST)
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '10:30 AM - 11:45 AM'
      },
      {
        timeZone: 'Asia/Tokyo', // UTC+9
        start: '2025-03-25T14:30:00Z',
        end: '2025-03-25T15:45:00Z',
        expected: '11:30 PM - 12:45 AM' 
      }
    ]

    // Mock process.env.TZ for consistent testing
    const originalTZ = process.env.TZ
    beforeEach(() => {
      process.env.TZ = 'UTC' // Force UTC for all tests
    })
    afterEach(() => {
      process.env.TZ = originalTZ
    })

    testCases.forEach(({ timeZone, start, end, expected }) => {
      it(`formats time correctly for ${timeZone}`, () => {
        // Force the test timezone regardless of host environment
        process.env.TZ = timeZone
        const wrapper = mount(CalendarEventComponent, {
          props: {
            ...baseProps,
            timeZone,
            event: {
              ...baseProps.event,
              start,
              end
            }
          }
        })
        expect(wrapper.text()).toContain(expected)
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
      }
    })
    const vm = wrapper.vm as unknown as { position: { top: number; height: number } }
    // Position calculations always use UTC for consistent layout
    expect(vm.position.top).toBe(570) // 9.5 hours * 60px (UTC time)
    expect(vm.position.height).toBe(135) // 2.25 hours * 60px
  })

  it('shows resize handles when resizable', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        resizable: true
      }
    })
    expect(wrapper.find('.cursor-row-resize').exists()).toBe(true)
  })
})
