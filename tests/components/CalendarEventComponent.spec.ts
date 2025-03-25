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

  it('formats time correctly', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        timeZone: 'UTC', // Explicitly set UTC for consistency
        event: {
          ...baseProps.event,
          start: '2025-03-25T14:30:00Z',
          end: '2025-03-25T15:45:00Z'
        }
      }
    })
    // Expect UTC time format
    expect(wrapper.text()).toContain('02:30 PM - 03:45 PM')
  })

  it('formats time correctly for Brussels timezone', () => {
    const wrapper = mount(CalendarEventComponent, {
      props: {
        ...baseProps,
        timeZone: 'Europe/Brussels',
        event: {
          ...baseProps.event,
          start: '2025-03-25T14:30:00Z',
          end: '2025-03-25T15:45:00Z'
        }
      }
    })
    // Expect Brussels time format (UTC+1)
    expect(wrapper.text()).toContain('03:30 PM - 04:45 PM')
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
    // Position calculations still use UTC for consistent layout
    expect(vm.position.top).toBe(630) // 9.5 hours * 60px (UTC time)
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
