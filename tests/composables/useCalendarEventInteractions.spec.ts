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
        event: mockEvent
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
})
