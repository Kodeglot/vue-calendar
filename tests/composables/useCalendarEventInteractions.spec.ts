import { ref } from 'vue'
import { describe, it, expect, vi } from 'vitest'
import { useCalendarEventInteractions } from '../../src/composables/useCalendarEventInteractions'
import type { CalendarEvent } from '../../src/stores/calendarStore'

describe('useCalendarEventInteractions', () => {
  const mockEvent: CalendarEvent = {
    id: '1',
    title: 'Test Event',
    start: '2025-03-25T14:30:00Z', // 2:30 PM UTC
    end: '2025-03-25T15:45:00Z',   // 3:45 PM UTC
    color: 'blue'
  }

  const mockEmit = vi.fn()
  const mockContainer = document.createElement('div')
  mockContainer.style.height = '1000px'

  it('calculates position correctly for day/week view', () => {
    const { position, calculatePosition } = useCalendarEventInteractions(mockEmit, {
      event: mockEvent,
      containerRef: mockContainer,
      pxPerHour: 60
    })

    calculatePosition('day')
    
    // UTC+1 timezone (Brussels)
    expect(position.value.top).toBe(930) // 3:30 PM local time (2:30 PM UTC)
    expect(position.value.height).toBe(75)   // 1.25 hours * 60px/hour
  })

  it('calculates position correctly for month view', () => {
    const { position, calculatePosition } = useCalendarEventInteractions(mockEmit, {
      event: mockEvent
    })

    calculatePosition('month', 2)
    expect(position.value.top).toBe(110) // 2 * 55px
    expect(position.value.height).toBe(50)
  })

  it('handles drag start correctly', () => {
    const { handleDragStart, isResizing } = useCalendarEventInteractions(mockEmit, {
      event: mockEvent
    })

    const mockDragEvent = new Event('dragstart') as DragEvent
    Object.defineProperty(mockDragEvent, 'dataTransfer', {
      value: {
        setData: vi.fn()
      }
    })

    // Should emit when not resizing
    isResizing.value = false
    handleDragStart(mockDragEvent)
    expect(mockEmit).toHaveBeenCalledWith('dragstart', mockDragEvent, mockEvent)

    // Should not emit when resizing
    isResizing.value = true
    mockEmit.mockClear()
    handleDragStart(mockDragEvent)
    expect(mockEmit).not.toHaveBeenCalled()
  })

  it('handles resize operations', async () => {
    const { startResize, isResizing, resizeDirection } = useCalendarEventInteractions(mockEmit, {
      event: mockEvent,
      containerRef: mockContainer,
      pxPerHour: 60,
      snapInterval: 15
    })

    // Test top resize
    startResize('top')
    expect(isResizing.value).toBe(true)
    expect(resizeDirection.value).toBe('top')

    // Test bottom resize
    startResize('bottom')
    expect(isResizing.value).toBe(true)
    expect(resizeDirection.value).toBe('bottom')
  })

  it('handles timezone differences correctly', () => {
    const { position, calculatePosition } = useCalendarEventInteractions(mockEmit, {
      event: {
        ...mockEvent,
        start: '2025-03-25T00:00:00Z', // Midnight UTC
        end: '2025-03-25T01:00:00Z'    // 1 AM UTC
      },
      containerRef: mockContainer,
      pxPerHour: 60
    })

    calculatePosition('day')
    
    // Should be 1 AM local time (UTC+1)
    expect(position.value.top).toBe(60) // 1 * 60px
    expect(position.value.height).toBe(60) // 1 hour
  })
})
