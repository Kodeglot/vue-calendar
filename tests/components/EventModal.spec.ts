import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventModal from '../../src/components/EventModal.vue'
import { nextTick } from 'vue'

describe('EventModal', () => {
  let pinia: any
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  function getModal(wrapper) {
    return wrapper.find('.bg-white.rounded-lg')
  }

  it('opens in create mode and emits save', async () => {
    const wrapper = mount(EventModal)
    wrapper.vm.openModal(new Date('2025-01-01T10:00:00Z'))
    await nextTick()
    expect(getModal(wrapper).exists()).toBe(true)
    expect(wrapper.text()).toContain('Create New Event')
    // Fill form and submit
    await wrapper.find('input[type="text"]').setValue('My Event')
    await wrapper.find('input[type="datetime-local"]').setValue('2025-01-01T10:00')
    await wrapper.findAll('input[type="datetime-local"]')[1].setValue('2025-01-01T11:00')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('opens in edit mode and emits update', async () => {
    const wrapper = mount(EventModal)
    const event = {
      id: '1',
      title: 'Edit Me',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'blue'
    }
    wrapper.vm.openEditModal(event)
    await nextTick()
    expect(getModal(wrapper).exists()).toBe(true)
    expect(wrapper.text()).toContain('Edit Event')
    // Change title and submit
    await wrapper.find('input[type="text"]').setValue('Edited!')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('update')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits delete in edit mode', async () => {
    const wrapper = mount(EventModal)
    const event = {
      id: '2',
      title: 'Delete Me',
      start: '2025-01-01T10:00:00Z',
      end: '2025-01-01T11:00:00Z',
      tailwindColor: 'red'
    }
    wrapper.vm.openEditModal(event)
    await nextTick()
    // Find the Delete button by text
    const deleteBtn = wrapper.findAll('button').find(btn => btn.text() === 'Delete')
    await deleteBtn!.trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(EventModal)
    wrapper.vm.openModal(new Date('2025-01-01T10:00:00Z'))
    await nextTick()
    // Find the Cancel button by text
    const cancelBtn = wrapper.findAll('button').find(btn => btn.text() === 'Cancel')
    await cancelBtn!.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('changes color when color button is clicked', async () => {
    const wrapper = mount(EventModal)
    wrapper.vm.openModal(new Date('2025-01-01T10:00:00Z'))
    await nextTick()
    const colorBtn = wrapper.findAll('button[title="bg-green-500"]')[0]
    await colorBtn.trigger('click')
    expect(wrapper.vm.event.tailwindColor).toBe('green')
  })

  it('shows alert and does not emit save on invalid date', async () => {
    window.alert = vi.fn()
    const wrapper = mount(EventModal)
    wrapper.vm.openModal(new Date('2025-01-01T10:00:00Z'))
    await nextTick()
    await wrapper.find('input[type="text"]').setValue('My Event')
    await wrapper.find('input[type="datetime-local"]').setValue('invalid')
    await wrapper.find('form').trigger('submit.prevent')
    expect(window.alert).toHaveBeenCalled()
    expect(wrapper.emitted('save')).toBeFalsy()
  })
}) 