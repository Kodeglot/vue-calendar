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
    color: 'blue',
  }

  const mockEmit = vi.fn()
  const mockContainer = document.createElement('div')
  mockContainer.style.height = '1000px'

  describe('Position calculations', () => {
    it('calculates position in UTC for day/week view', () => {
      const { position, calculatePosition } = useCalendarEventInteractions(mockEmit, {
        event: mockEvent,
        containerRef: mockContainer,
        pxPerHour: 60,
        timeZone: 'UTC' // Explicit UTC
      })

      calculatePosition('day')
      
      // UTC timezone
      expect(position.value.top).toBe(870) // 14.5 hours * 60px
      expect(position.value.height).toBe(75) // 1.25 hours * 60px
    })

    it('calculates position in local timezone for display', () => {
      const { position, calculatePosition } = useCalendarEventInteractions(mockEmit, {
        event: mockEvent,
        containerRef: mockContainer,
        pxPerHour: 60,
        timeZone: 'Europe/Brussels' // UTC+1
      })

      calculatePosition('day')
      
      // Brussels timezone (UTC+1)
      expect(position.value.top).toBe(930) // 15.5 hours * 60px (3:30 PM local)
      expect(position.value.height).toBe(75) // 1.25 hours * 60px
    })

    it('calculates position correctly for month view', () => {
      const { position, calculatePosition } = useCalendarEventInteractions(mockEmit, {
        event: mockEvent,
        timeZone: 'UTC'
      })

      calculatePosition('month', 2)
      expect(position.value.top).toBe(110) // 2 * 55px
      expect(position.value.height).toBe(50)
    })
  })

  describe('Timezone handling', () => {
    const timezoneTestCases = [
      {
        timeZone: 'UTC',
        start: '2025-03-25T00:00:00Z', // Midnight UTC
        end: '2025-03-25T01:00:00Z',   // 1 AM UTC
        expectedTop: 0,                // 0 hours * 60px
        expectedHeight: 60             // 1 hour * 60px
      },
      {
        timeZone: 'America/New_York', // UTC-4 (DST)
        start: '2025-03-25T04:00:00Z', // Midnight EDT
        end: '2025-03-25T05:00:00Z',   // 1 AM EDT
        expectedTop: 0,                // 0 hours * 60px (local time)
        expectedHeight: 60             // 1 hour * 60px
      },
      {
        timeZone: 'Asia/Tokyo',       // UTC+9
        start: '2025-03-25T15:00:00Z', // Midnight JST
        end: '2025-03-25T16:00:00Z',   // 1 AM JST
        expectedTop: 0,                // 0 hours * 60px (local time)
        expectedHeight: 60             // 1 hour * 60px
      }
    ]

    timezoneTestCases.forEach(({ timeZone, start, end, expectedTop, expectedHeight }) => {
      it(`handles ${timeZone} timezone correctly`, () => {
        const { position, calculatePosition } = useCalendarEventInteractions(mockEmit, {
          event: {
            ...mockEvent,
            start,
            end
          },
          containerRef: mockContainer,
          pxPerHour: 60,
          timeZone
        })

        calculatePosition('day')
        expect(position.value.top).toBe(expectedTop)
        expect(position.value.height).toBe(expectedHeight)
      })
    })
  })

  it('handles drag start correctly', () => {
    const { handleDragStart, isResizing } = useCalendarEventInteractions(mockEmit, {
      event: mockEvent,
      timeZone: 'UTC'
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
      snapInterval: 15,
      timeZone: 'UTC'
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

  describe('Resize movement handling', () => {
    beforeEach(() => {
      Object.defineProperty(mockContainer, 'getBoundingClientRect', {
        value: () => ({ top: 0 }),
        configurable: true
      })
    })

    it('handles top resize movement with snapping', () => {
      const { startResize, handleResizeMove, position, event, calculatePosition } = useCalendarEventInteractions(mockEmit, {
        event: mockEvent,
        containerRef: mockContainer,
        pxPerHour: 60,
        snapInterval: 15,
        minHeight: 30,
        timeZone: 'UTC'
      })

      // Set initial position
      calculatePosition('day')
      const initialTop = position.value.top // Should be 870 (14.5 hours * 60px)

      startResize('top')
      // Simulate mouse moving up by 30px (half hour)
      const mockMouseEvent = {
        clientY: initialTop - 30, // Move up by 30px
        preventDefault: vi.fn()
      } as unknown as MouseEvent

      handleResizeMove(mockMouseEvent)
      // Should snap to 15 minute intervals (45px change)
      expect(position.value.top).toBe(initialTop - 45)
      expect(event.start).not.toBe(mockEvent.start) // Should update event time
    })

    it('handles bottom resize movement with snapping', () => {
      const { startResize, handleResizeMove, position, event } = useCalendarEventInteractions(mockEmit, {
        event: mockEvent,
        containerRef: mockContainer,
        pxPerHour: 60,
        snapInterval: 15,
        minHeight: 30,
        timeZone: 'UTC'
      })

      startResize('bottom')
      const mockMouseEvent = {
        clientY: 200,
        preventDefault: vi.fn()
      } as unknown as MouseEvent

      handleResizeMove(mockMouseEvent)
      expect(position.value.height).toBe(120) // Snapped to 15 min interval
      expect(event.end).not.toBe(mockEvent.end) // Should update event time
    })

    it('prevents midnight overlaps during resize', () => {
      const midnightEvent = {
        ...mockEvent,
        start: '2025-03-25T23:30:00Z',
        end: '2025-03-26T00:30:00Z'
      }
      const { startResize, handleResizeMove, position, event } = useCalendarEventInteractions(mockEmit, {
        event: midnightEvent,
        containerRef: mockContainer,
        pxPerHour: 60,
        snapInterval: 15,
        timeZone: 'UTC'
      })

      // Try to resize top past midnight
      startResize('top')
      const mockMouseEvent = {
        clientY: 1500, // Would push start into next day
        preventDefault: vi.fn()
      } as unknown as MouseEvent
      Object.defineProperty(mockContainer, 'getBoundingClientRect', {
        value: () => ({ top: 0 })
      })

      handleResizeMove(mockMouseEvent)
      const eventDate = new Date(event.start)
      expect(eventDate.getUTCHours()).toBe(0)
      expect(eventDate.getUTCMinutes()).toBe(0)
    })
  })

  describe('Mouse event handling', () => {
    it('handles mouse down on non-resize elements', () => {
      const { handleMouseDown } = useCalendarEventInteractions(mockEmit, {
        event: mockEvent,
        timeZone: 'UTC'
      })

      const mockMouseEvent = {
        target: document.createElement('div'),
        stopPropagation: vi.fn()
      } as unknown as MouseEvent

      handleMouseDown(mockMouseEvent)
      expect(mockEmit).toHaveBeenCalledWith('click', mockEvent)
    })

    it('ignores mouse down on resize handles', () => {
      const { handleMouseDown } = useCalendarEventInteractions(mockEmit, {
        event: mockEvent,
        timeZone: 'UTC'
      })

      const resizeHandle = document.createElement('div')
      resizeHandle.classList.add('cursor-row-resize')
      const mockMouseEvent = {
        target: resizeHandle,
        stopPropagation: vi.fn()
      } as unknown as MouseEvent

      handleMouseDown(mockMouseEvent)
      expect(mockEmit).not.toHaveBeenCalled()
    })
  })

  it('cleans up event listeners on unmount', () => {
    const { startResize, isResizing } = useCalendarEventInteractions(mockEmit, {
      event: mockEvent,
      containerRef: mockContainer,
      timeZone: 'UTC'
    })

    startResize('top')
    expect(isResizing.value).toBe(true)

    // Simulate unmount
    document.dispatchEvent(new Event('mouseup'))
    expect(isResizing.value).toBe(false)
  })
})
