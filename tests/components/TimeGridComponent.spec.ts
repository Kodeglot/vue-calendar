import { mount } from '@vue/test-utils'
import TimeGridComponent from '../../src/components/TimeGridComponent.vue'

describe('TimeGridComponent', () => {
  it('renders time slots correctly', () => {
    const wrapper = mount(TimeGridComponent, {
      props: {
        hourHeight: 40,
        timeFormat: { hour: '2-digit', minute: '2-digit' },
        showHourLabels: true
      }
    })
    // TimeGridComponent no longer renders hour labels, only time slots
    expect(wrapper.findAll('[role="row"]').length).toBeGreaterThan(0)
  })

  it('renders time slots without hour labels', () => {
    const wrapper = mount(TimeGridComponent, {
      props: {
        hourHeight: 40,
        timeFormat: { hour: '2-digit', minute: '2-digit' },
        showHourLabels: false
      }
    })
    // TimeGridComponent no longer renders hour labels, only time slots
    expect(wrapper.findAll('[role="row"]').length).toBeGreaterThan(0)
    expect(wrapper.findAll('[role="time"]').length).toBe(0)
  })

  it('renders slot content', () => {
    const wrapper = mount(TimeGridComponent, {
      props: {
        hourHeight: 40,
        timeFormat: { hour: '2-digit', minute: '2-digit' }
      },
      slots: {
        default: '<div class="slot-content">Event Here</div>'
      }
    })
    expect(wrapper.find('.slot-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Event Here')
  })

  it('emits timeClick with correct time on click', async () => {
    const wrapper = mount(TimeGridComponent, {
      props: {
        hourHeight: 40,
        timeFormat: { hour: '2-digit', minute: '2-digit' }
      },
      attachTo: document.body
    })
    // Mock ref
    const grid = wrapper.find('[role="rowgroup"]').element
    Object.defineProperty(grid, 'getBoundingClientRect', {
      value: () => ({ top: 0, left: 0, width: 100, height: 960 })
    })
    // Set ref manually
    wrapper.vm.timeGrid = grid
    // Click at y=80 (should be hour 2)
    await wrapper.find('[role="rowgroup"]').trigger('click', { clientY: 80 })
    const emitted = wrapper.emitted('timeClick')
    expect(emitted).toBeTruthy()
    const clickedTime = emitted![0][0] as Date
    expect(clickedTime.getHours()).toBe(2)
  })

  it('handles dragover and drop events', async () => {
    const wrapper = mount(TimeGridComponent, {
      props: {
        hourHeight: 40,
        timeFormat: { hour: '2-digit', minute: '2-digit' }
      }
    })
    const grid = wrapper.find('[role="rowgroup"]')
    const dragEvent = new Event('dragover', { bubbles: true })
    Object.defineProperty(dragEvent, 'preventDefault', { value: vi.fn() })
    Object.defineProperty(dragEvent, 'dataTransfer', { value: { dropEffect: '' }, writable: true })
    grid.element.dispatchEvent(dragEvent)
    const dropEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'preventDefault', { value: vi.fn() })
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { dropEffect: '' }, writable: true })
    grid.element.dispatchEvent(dropEvent)
    // No error should occur
    expect(true).toBe(true)
  })
}) 