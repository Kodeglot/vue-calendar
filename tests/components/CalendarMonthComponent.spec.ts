import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarMonthComponent from '../../src/components/CalendarMonthComponent.vue'
import { nextTick } from 'vue'
import CalendarEventComponent from '../../src/components/CalendarEventComponent.vue'

describe('CalendarMonthComponent', () => {
  let pinia: any
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const baseProps = {
    currentDate: new Date('2025-01-01T00:00:00Z'),
    showWeekNumbers: false,
    firstDayOfWeek: 0
  }

  it('renders weekday headers', () => {
    const wrapper = mount(CalendarMonthComponent, { props: baseProps })
    expect(wrapper.text()).toContain('Sun')
    expect(wrapper.text()).toContain('Mon')
    expect(wrapper.text()).toContain('Sat')
  })

  it('renders visible dates for 6 weeks', () => {
    const wrapper = mount(CalendarMonthComponent, { props: baseProps })
    // Should render 42 date cells (6 weeks)
    const dateCells = wrapper.findAll('[role="gridcell"]')
    expect(dateCells.length).toBeGreaterThanOrEqual(42)
  })

  it('renders all-day events in cells', async () => {
    const wrapper = mount(CalendarMonthComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    const store = wrapper.vm.store
    store.addEvent({
      id: '1',
      title: 'All Day',
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-02T00:00:00Z',
      tailwindColor: 'blue',
      allDay: true,
      width: 100,
      left: 0
    })
    await nextTick()
    expect(wrapper.text()).toContain('All Day')
  })

  it('renders stacked events in cells', async () => {
    const wrapper = mount(CalendarMonthComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    const store = wrapper.vm.store
    store.addEvent({
      id: '2',
      title: 'Event 1',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    })
    store.addEvent({
      id: '3',
      title: 'Event 2',
      start: '2025-01-01T12:00:00Z',
      end: '2025-01-01T13:00:00Z',
      tailwindColor: 'red',
      allDay: false,
      width: 100,
      left: 0
    })
    await nextTick()
    expect(wrapper.text()).toContain('Event 1')
    expect(wrapper.text()).toContain('Event 2')
  })

  it('emits eventClick when an event is clicked', async () => {
    const wrapper = mount(CalendarMonthComponent, {
      props: baseProps,
      global: {
        plugins: [pinia]
      }
    })
    const store = wrapper.vm.store
    store.addEvent({
      id: '4',
      title: 'Clickable Event',
      start: '2025-01-01T12:00:00Z',
      end: '2025-01-01T13:00:00Z',
      tailwindColor: 'green',
      allDay: false,
      width: 100,
      left: 0
    })
    await nextTick()
    // Find CalendarEventComponent with the correct event title
    const eventComps = wrapper.findAllComponents({ name: 'CalendarEventComponent' })
    const eventComp = eventComps.find(comp => comp.text().includes('Clickable Event'))
    // Trigger a native click event on the actual DOM element
    const eventElement = eventComp?.find('[role="button"]')
    await eventElement?.trigger('click')
    await nextTick()
    expect(wrapper.emitted('eventClick')).toBeTruthy()
  })

  it('emits event-dropped on drop', async () => {
    const wrapper = mount(CalendarMonthComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    const dateCell = wrapper.find('[role="gridcell"]')
    const dragEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dragEvent, 'dataTransfer', { value: { getData: () => 'event-id' }, writable: true })
    // Patch the handler directly
    wrapper.vm.handleDrop(new Date('2025-01-01T00:00:00Z'), dragEvent)
    await nextTick()
    expect(wrapper.emitted('event-dropped')).toBeTruthy()
  })
}) 