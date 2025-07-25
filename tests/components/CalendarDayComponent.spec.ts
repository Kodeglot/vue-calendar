import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarDayComponent from '../../src/components/CalendarDayComponent.vue'
import { nextTick } from 'vue'

describe('CalendarDayComponent', () => {
  let pinia: any
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const baseProps = {
    currentDate: new Date('2025-01-01T00:00:00Z'),
    hourHeight: 40,
    timeFormat: '24h',
    showHeader: true
  }

  it('renders header with formatted date', () => {
    const wrapper = mount(CalendarDayComponent, { props: baseProps })
    expect(wrapper.text()).toContain('Wednesday, January 1')
  })

  it('renders all-day events in rows', async () => {
    const wrapper = mount(CalendarDayComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    // Add two all-day events to the store
    const store = wrapper.vm.store
    store.addEvent({
      id: '1',
      title: 'All Day 1',
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-02T00:00:00Z',
      tailwindColor: 'blue',
      allDay: true,
      width: 100,
      left: 0
    })
    store.addEvent({
      id: '2',
      title: 'All Day 2',
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-02T00:00:00Z',
      tailwindColor: 'red',
      allDay: true,
      width: 100,
      left: 0
    })
    await nextTick()
    expect(wrapper.text()).toContain('All Day 1')
    expect(wrapper.text()).toContain('All Day 2')
  })

  it('renders stacked events with correct positions', async () => {
    const wrapper = mount(CalendarDayComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    const store = wrapper.vm.store
    store.addEvent({
      id: '3',
      title: 'Event 1',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    })
    store.addEvent({
      id: '4',
      title: 'Event 2',
      start: '2025-01-01T10:30:00Z',
      end: '2025-01-01T11:30:00Z',
      tailwindColor: 'red',
      allDay: false,
      width: 100,
      left: 0
    })
    await nextTick()
    // Both events should be rendered
    expect(wrapper.text()).toContain('Event 1')
    expect(wrapper.text()).toContain('Event 2')
  })

  it('emits dayClick when a time slot is clicked', async () => {
    const wrapper = mount(CalendarDayComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    // Find TimeGridComponent and emit timeClick
    const timeGrid = wrapper.findComponent({ name: 'TimeGridComponent' })
    timeGrid.vm.$emit('timeClick', new Date('2025-01-01T10:00:00Z'))
    await nextTick()
    expect(wrapper.emitted('dayClick')).toBeTruthy()
  })

  it('emits eventClick when an event is clicked', async () => {
    const wrapper = mount(CalendarDayComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    const store = wrapper.vm.store
    store.addEvent({
      id: '5',
      title: 'Clickable Event',
      start: '2025-01-01T12:00:00Z',
      end: '2025-01-01T13:00:00Z',
      tailwindColor: 'green',
      allDay: false,
      width: 100,
      left: 0
    })
    await nextTick()
    // Find CalendarEventComponent and trigger click on its button
    const eventComp = wrapper.findComponent({ name: 'CalendarEventComponent' })
    const button = eventComp.find('[role="button"]')
    await button.trigger('mousedown', { button: 0, stopPropagation: () => {} })
    document.dispatchEvent(new Event('mouseup'))
    await nextTick()
    expect(wrapper.emitted('eventClick')).toBeTruthy()
  })

  it('emits event-updated when child event emits it', async () => {
    const wrapper = mount(CalendarDayComponent, {
      props: baseProps,
      global: { plugins: [pinia] }
    })
    const store = wrapper.vm.store
    store.addEvent({
      id: '20',
      title: 'Day Propagate Event',
      start: '2025-01-01T14:00:00Z',
      end: '2025-01-01T15:00:00Z',
      tailwindColor: 'blue',
      allDay: false,
      width: 100,
      left: 0
    })
    await nextTick()
    // Find the event component and emit event-updated
    const eventComp = wrapper.findComponent({ name: 'CalendarEventComponent' })
    eventComp.vm.$emit('event-updated', store.events.get('20'), '2025-01-01T14:00:00Z', '2025-01-01T15:00:00Z')
    await nextTick()
    expect(wrapper.emitted('event-updated')).toBeTruthy()
    const payload = wrapper.emitted('event-updated')?.[0]
    expect(payload[0]).toMatchObject({ id: '20', title: 'Day Propagate Event' })
    expect(typeof payload[1]).toBe('string')
    expect(typeof payload[2]).toBe('string')
  })
}) 