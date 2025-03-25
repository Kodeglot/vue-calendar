import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarView from '../../src/views/CalendarView.vue'
import { useCalendarStore } from '../../src/stores/calendarStore'
import { nextTick } from 'vue'

const pinia = createPinia()

describe('CalendarView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockDate = new Date(2025, 2, 25) // March 25, 2025

  it('renders with default props', () => {
    const wrapper = mount(CalendarView, {
      global: {
        plugins: [pinia]
      },
      props: {
        initialDate: mockDate
      }
    })
    
    expect(wrapper.find('h2').text()).toContain('March 2025')
    expect(wrapper.find('select').element.value).toBe('month')
    expect(wrapper.find('button[aria-label="Create new event"]').exists()).toBe(true)
  })

  it('renders without controls when showControls=false', () => {
    const wrapper = mount(CalendarView, {
      global: {
        plugins: [pinia]
      },
      props: {
        initialDate: mockDate,
        showControls: false
      }
    })
    
    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.find('select').exists()).toBe(false)
  })

  it('changes view when selecting different view', async () => {
    const wrapper = mount(CalendarView, {
      global: {
        plugins: [pinia]
      },
      props: {
        initialDate: mockDate
      }
    })

    await wrapper.find('select').setValue('week')
    await nextTick()
    expect(wrapper.find('h2').text()).toContain('Mar 23 - Mar 29, 2025')

    await wrapper.find('select').setValue('day')
    await nextTick()
    expect(wrapper.find('h2').text()).toContain('Tuesday, Mar 25, 2025')
  })

  it('navigates dates correctly', async () => {
    const wrapper = mount(CalendarView, {
      global: {
        plugins: [pinia]
      },
      props: {
        initialDate: mockDate
      }
    })

    // Test month navigation
    await wrapper.find('button[aria-label="Previous period"]').trigger('click')
    expect(wrapper.find('h2').text()).toBe('February 2025')

    await wrapper.find('button[aria-label="Next period"]').trigger('click')
    expect(wrapper.find('h2').text()).toBe('March 2025')

    // Test week navigation
    await wrapper.find('select').setValue('week')
    await wrapper.find('button[aria-label="Previous period"]').trigger('click')
    expect(wrapper.find('h2').text()).toBe('Mar 16 - Mar 22, 2025')

    // Test day navigation
    await wrapper.find('select').setValue('day')
    await wrapper.find('button[aria-label="Next period"]').trigger('click')
    expect(wrapper.find('h2').text()).toBe('Wednesday, Mar 19, 2025')
  })

  it('formats header date correctly for all views', async () => {
    const wrapper = mount(CalendarView, {
      global: {
        plugins: [pinia]
      },
      props: {
        initialDate: mockDate,
        initialView: 'month'
      }
    })

    expect(wrapper.find('h2').text()).toBe('March 2025')

    await wrapper.find('select').setValue('week')
    await nextTick()
    expect(wrapper.find('h2').text()).toBe('Mar 23 - Mar 29, 2025')

    await wrapper.find('select').setValue('day')
    await nextTick()
    expect(wrapper.find('h2').text()).toBe('Tuesday, Mar 25, 2025')
  })

  it('opens event modal when create button clicked', async () => {
    const wrapper = mount(CalendarView, {
      global: {
        plugins: [pinia]
      },
      props: {
        initialDate: mockDate
      }
    })

    await wrapper.find('button[aria-label="Create new event"]').trigger('click')
    expect(wrapper.emitted('openEventModal')).toBeTruthy()
    expect(wrapper.emitted('openEventModal')?.length).toBe(1)
  })

  it('handles event saving', async () => {
    const store = useCalendarStore()
    const wrapper = mount(CalendarView, {
      global: {
        plugins: [pinia]
      },
      props: {
        initialDate: mockDate
      }
    })

    const testEvent = {
      id: 'test-1',
      title: 'Test Event',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      color: '#3b82f6'
    }

    store.events = [] // Reset store
    store.addEvent(testEvent)
    await nextTick()
    expect(store.events).toHaveLength(1)
    expect(store.events[0].id).toBe('test-1')
  })
})
