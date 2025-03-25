import { ref, onUnmounted, type Ref } from 'vue'
import type { CalendarEvent } from '../stores/calendarStore'

interface UseCalendarEventInteractionsOptions {
  /**
   * Calendar event data
   */
  event: CalendarEvent
  
  /**
   * Container reference for position calculations
   */
  containerRef?: HTMLElement
  
  /**
   * Pixels per hour for time calculations
   * @default 60
   */
  pxPerHour?: number
  
  /**
   * Snap interval in minutes
   * @default 15
   */
  snapInterval?: number
  
  /**
   * Minimum event height in pixels
   * @default 30
   */
  minHeight?: number
}

interface UseCalendarEventInteractionsReturn {
  /**
   * Current position and dimensions
   */
  position: Ref<{ top: number; height: number }>
  
  /**
   * Whether a resize is in progress
   */
  isResizing: Ref<boolean>
  
  /**
   * Current resize direction
   */
  resizeDirection: Ref<'top' | 'bottom'>
  
  /**
   * Start a resize operation
   */
  startResize: (direction: 'top' | 'bottom') => void
  
  /**
   * Handle drag start event
   */
  handleDragStart: (e: DragEvent) => void
  
  /**
   * Handle mouse down event
   */
  handleMouseDown: (e: MouseEvent) => void
  
  /**
   * Calculate initial position based on event times
   */
  calculatePosition: (viewType: 'month' | 'week' | 'day', order?: number) => void
}

export function useCalendarEventInteractions(
  emit: (event: string, ...args: any[]) => void,
  options: UseCalendarEventInteractionsOptions
): UseCalendarEventInteractionsReturn {
  const {
    event,
    pxPerHour = 60,
    snapInterval = 15,
    minHeight = 30,
    containerRef
  } = options

  // Reactive State
  const position = ref({ top: 0, height: 0 })
  const isResizing = ref(false)
  const resizeDirection = ref<'top' | 'bottom'>('bottom')
  const startY = ref(0)
  const initialTop = ref(0)
  const initialHeight = ref(0)

  // Convert minutes to pixels based on pxPerHour
  const minutesToPixels = (minutes: number) => (minutes / 60) * pxPerHour

  // Calculate initial position based on event times
  const calculatePosition = (
    viewType: 'month' | 'week' | 'day',
    order?: number
  ) => {
    const start = new Date(event.start)
    const end = new Date(event.end)
    
    if (viewType === 'month') {
      position.value = {
        top: (order || 0) * 55, // 50px height + 5px margin
        height: 50
      }
    } else {
      const startHours = start.getHours() + (start.getMinutes() / 60)
      const durationHours = (end.getTime() - start.getTime()) / 3600000
      
      position.value = {
        top: Math.max(0, startHours * pxPerHour),
        height: Math.max(minHeight, durationHours * pxPerHour)
      }
    }
  }

  // Resize Handlers
  const startResize = (direction: 'top' | 'bottom') => {
    if (!containerRef) return
    
    resizeDirection.value = direction
    isResizing.value = true
    initialTop.value = position.value.top
    initialHeight.value = position.value.height
    
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', stopResize)
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.value || !containerRef) return

    const containerRect = containerRef.getBoundingClientRect()
    const mouseY = e.clientY - containerRect.top
    const deltaY = mouseY - (resizeDirection.value === 'top' 
      ? initialTop.value 
      : initialTop.value + initialHeight.value)

    let newTop = initialTop.value
    let newHeight = initialHeight.value

    if (resizeDirection.value === 'top') {
      newHeight = Math.max(minHeight, initialHeight.value - deltaY)
      newTop = initialTop.value + deltaY
      
      // Snap to interval
      const snapPixels = minutesToPixels(snapInterval)
      newTop = Math.round(newTop / snapPixels) * snapPixels
      newHeight = Math.max(minHeight, initialHeight.value - (newTop - initialTop.value))
    } else {
      newHeight = Math.max(minHeight, initialHeight.value + deltaY)
      const snapPixels = minutesToPixels(snapInterval)
      newHeight = Math.round(newHeight / snapPixels) * snapPixels
    }

    // Convert to time values
    const newStart = new Date(event.start)
    const newEnd = new Date(event.end)

    if (resizeDirection.value === 'top') {
      const minutes = (newTop / pxPerHour) * 60
      newStart.setHours(Math.floor(minutes / 60))
      newStart.setMinutes(Math.floor(minutes % 60 / snapInterval) * snapInterval)
    } else {
      const totalMinutes = ((newTop + newHeight) / pxPerHour) * 60
      newEnd.setHours(Math.floor(totalMinutes / 60))
      newEnd.setMinutes(Math.floor(totalMinutes % 60 / snapInterval) * snapInterval)
    }

    // Prevent midnight overlaps
    if (newStart.getDate() !== newEnd.getDate()) {
      if (resizeDirection.value === 'top') {
        newStart.setDate(newEnd.getDate())
        newStart.setHours(0)
        newStart.setMinutes(0)
      } else {
        newEnd.setDate(newStart.getDate())
        newEnd.setHours(23)
        newEnd.setMinutes(59)
      }
    }

    position.value = { top: newTop, height: newHeight }
    emit('resize', event, newStart.toISOString(), newEnd.toISOString())
  }

  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', stopResize)
  }

  // Drag Handlers
  const handleDragStart = (e: DragEvent) => {
    try {
      if (!event.id) throw new Error('Event ID is required for drag operation')
      e.dataTransfer?.setData('text/plain', event.id)
      emit('dragstart', e, event)
    } catch (error) {
      console.error('Drag start failed:', error)
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    try {
      // Prevent drag during resize
      if (isResizing.value) return
      
      // Check if clicking on a resize handle by checking parent element
      const target = e.target as HTMLElement
      if (target.classList.contains('cursor-row-resize') || 
          target.parentElement?.querySelector('.cursor-row-resize') === target) {
        e.stopPropagation()
        return // Prevent drag when clicking on resize handles
      }
      
      // Only handle drag if not resizing and not clicking on a resize handle
      e.stopPropagation()
      emit('click', event)
    } catch (error) {
      console.error('Mouse down event failed:', error)
    }
  }

  // Cleanup
  onUnmounted(stopResize)

  return {
    position,
    isResizing,
    resizeDirection,
    startResize,
    handleDragStart,
    handleMouseDown,
    calculatePosition
  }
}
