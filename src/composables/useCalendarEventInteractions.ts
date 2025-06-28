import { ref, onUnmounted, type Ref } from 'vue'
import { useCalendarStore, type CalendarEvent } from '../stores/calendarStore'

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

  /**
   * Timezone for time calculations (IANA timezone name)
   * Must be specified for accurate time calculations
   */
  timeZone: string

  /**
   * Current view type (day/week/month)
   */
  viewType: 'day' | 'week' | 'month'
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
   * Whether a drag is in progress
   */
  isDragging: Ref<boolean>

  /**
   * Current resize direction
   */
  resizeDirection: Ref<'top' | 'bottom'>

  /**
   * Start a resize operation
   */
  startResize: (direction: 'top' | 'bottom') => void

  /**
   * Handle mouse down event
   */
  handleMouseDown: (e: MouseEvent) => void

  /**
   * Handle resize movement
   */
  handleResizeMove: (e: MouseEvent) => void

  /**
   * Handle drag movement
   */
  handleDragMove: (e: MouseEvent) => void

  /**
   * Current event reference
   */
  event: CalendarEvent

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
    snapInterval = 5,
    minHeight = 30,
    containerRef
  } = options

  // Reactive State
  const position = ref({ top: 0, height: 0, left: 0 } as { top: number; height: number; left?: number })
  const isResizing = ref(false)
  const isDragging = ref(false)
  const resizeDirection = ref<'top' | 'bottom'>('bottom')
  const startY = ref(0)
  const startX = ref(0)
  const startTimeBeforeDrag = ref(new Date())
  const endTimeBeforeDrag = ref(new Date())
  const initialTop = ref(0)
  const initialHeight = ref(0)
  const dragThreshold = 5 // Minimum pixels to move before starting drag

  // Convert minutes to pixels based on pxPerHour
  const minutesToPixels = (minutes: number) => (minutes / 60) * pxPerHour

  // Calculate initial position based on event times
  const calculatePosition = (
    viewType: 'month' | 'week' | 'day',
    order?: number
  ) => {

    if (viewType === 'month') {
      position.value = {
        top: (order || 0) * 55, // 50px height + 5px margin
        height: 50
      }
    } else {
      // Convert times to specified timezone
      const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: options.timeZone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }

      const startTime = new Intl.DateTimeFormat('en-US', formatOptions)
        .format(new Date(event.start))
        .split(':')
        .map(Number)
      const startTotalHours = startTime[0] + (startTime[1] / 60)

      const endTime = new Intl.DateTimeFormat('en-US', formatOptions)
        .format(new Date(event.end))
        .split(':')
        .map(Number)
      const endTotalHours = endTime[0] + (endTime[1] / 60)
      const durationHours = endTotalHours - startTotalHours

      position.value = {
        top: Math.max(0, startTotalHours * pxPerHour),
        height: Math.max(minHeight, durationHours * pxPerHour)
      }
    }
  }

  // Resize Handlers
  const startResize = (direction: 'top' | 'bottom') => {
    isResizing.value = true
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

    // console.group('Calendar Event Resize')
    // console.log('Resizing event:', event.title || event.id)
    // console.log('Direction:', resizeDirection.value)
    // console.log('Original times:', {
    //   start: event.start,
    //   end: event.end
    // })

    const containerRect = containerRef.getBoundingClientRect()
    const mouseY = e.clientY - containerRect.top
    const deltaY = mouseY - (resizeDirection.value === 'top'
      ? initialTop.value
      : initialTop.value + initialHeight.value)

    let newTop = initialTop.value
    let newHeight = initialHeight.value

    if (resizeDirection.value === 'top') {
      // Calculate proposed new top position
      const proposedTop = initialTop.value + deltaY

      // Snap to nearest interval
      const snapPixels = minutesToPixels(snapInterval)
      newTop = Math.round(proposedTop / snapPixels) * snapPixels

      // Adjust height based on snapped top position
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

    // Update event times immediately during resize
    event.start = newStart.toISOString()
    event.end = newEnd.toISOString()

    console.log('New times:', {
      start: event.start,
      end: event.end
    })
    console.log('Position:', position.value)
    console.groupEnd()
  }

  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', stopResize)

  }

  // Drag Handlers
  const handleDragMove = (e: MouseEvent) => {
    if (!containerRef) {
      console.error('Container ref not available for drag')
      return
    }

    const containerRect = containerRef.getBoundingClientRect()
    const currentMouseY = e.clientY - containerRect.top
    const currentMouseX = e.clientX - containerRect.left
    const deltaY = currentMouseY - startY.value
    const deltaX = currentMouseX - startX.value

    // Check if we've passed the drag threshold (either vertical or horizontal)
    if (!isDragging.value && (Math.abs(deltaY) > dragThreshold ||
      (options.viewType === 'week' && Math.abs(deltaX) > dragThreshold))) {
      isDragging.value = true
      // emit('dragstart', e, event)
    }

    if (!isDragging.value) return

    // Calculate time change in snap interval increments
    const snapPixels = minutesToPixels(snapInterval)
    const snapSteps = Math.round(deltaY / snapPixels)

    // Skip if no vertical movement
    if (snapSteps === 0 && Math.abs(deltaX) < dragThreshold) {
      return
    }

    // Calculate new time in minutes since midnight
    const originalStart = startTimeBeforeDrag.value
    const originalMinutes = originalStart.getHours() * 60 + originalStart.getMinutes()
    const newTotalMinutes = originalMinutes + (snapSteps * snapInterval)

    // Calculate new hours and minutes (clamped to valid ranges)
    let newHours = Math.floor(newTotalMinutes / 60) % 24
    let newMinutes = Math.floor(newTotalMinutes % 60 / snapInterval) * snapInterval

    // Handle negative values (dragging above midnight)
    if (newTotalMinutes < 0) {
      newHours = 0
      newMinutes = 0
    }

    // Update event times
    const newStart = new Date(originalStart)
    newStart.setHours(newHours, newMinutes)

    const hoursDeltaForEnd = endTimeBeforeDrag.value.getHours() - startTimeBeforeDrag.value.getHours()
    const minutesDeltaForEnd = endTimeBeforeDrag.value.getMinutes() - startTimeBeforeDrag.value.getMinutes()

    const newEnd = new Date(endTimeBeforeDrag.value)
    newEnd.setHours(newHours + hoursDeltaForEnd, newMinutes + minutesDeltaForEnd)

    // Clamp end time to same day
    if (newStart.getDate() !== newEnd.getDate()) {
      newEnd.setDate(newStart.getDate())
      newEnd.setHours(23, 59, 0)
    }

    // Handle horizontal drag in week view
    if (options.viewType === 'week') {
      // For week view, containerRef should be the week container
      const weekRect = containerRef.getBoundingClientRect()
      const mouseXInWeek = e.clientX - weekRect.left
      const dayWidth = weekRect.width / 7
      const dayIndex = Math.floor(mouseXInWeek / dayWidth)
      
      // Calculate the original day index from the event start date
      const originalStartDate = startTimeBeforeDrag.value
      const originalDayOfWeek = originalStartDate.getDay()
      
      // Calculate day delta
      const dayDelta = dayIndex - originalDayOfWeek
      
      if (dayDelta !== 0) {
        newStart.setDate(newStart.getDate() + dayDelta)
        newEnd.setDate(newEnd.getDate() + dayDelta)
      }
    }

    // Update position and event data
    // position.value = {
    //   top: snappedTop,
    //   height: position.value.height
    // }

    // Store dates in UTC format
    event.start = newStart.toISOString()
    event.end = newEnd.toISOString()
    
    // Recalculate position based on updated times to ensure visual consistency
    calculatePosition(options.viewType)
  }

  const stopDrag = () => {
    const wasDragging = isDragging.value
    try {
      // Clean up listeners first to prevent any race conditions
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', stopDrag)

      if (isDragging.value) {
        // Recalculate final position based on updated event times
        calculatePosition(options.viewType)
        
        // Emit final drag event with updated times
        emit('dragend', event, event.start, event.end)
      } else {
        // Reset to initial position if we didn't actually drag
        position.value = {
          top: initialTop.value,
          height: position.value.height
        }
      }

      // Reset state
      isDragging.value = false
      startY.value = 0
      startX.value = 0
      initialTop.value = 0
    } catch (error) {
      console.error('Error stopping drag:', error)
      // Ensure cleanup happens even if error occurs
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', stopDrag)
      isDragging.value = false
    }
  }

  const handleMouseDown = (e: MouseEvent) => {
    try {
      // Prevent drag during resize
      if (isResizing.value) return

      // Check if clicking on a resize handle by checking element and ancestors
      const target = e.target as HTMLElement
      let currentElement: HTMLElement | null = target
      while (currentElement) {
        if (currentElement.classList.contains('cursor-row-resize') ||
          currentElement.dataset.resizeHandle === 'true') {
          e.stopPropagation()
          e.preventDefault()
          return // Prevent drag when clicking on resize handles
        }
        currentElement = currentElement.parentElement
      }

      e.stopPropagation()
      e.preventDefault()

      // Don't prevent default to allow dragstart
      if (!containerRef) return

      // Capture initial mouse position relative to container
      const containerRect = containerRef.getBoundingClientRect()
      startY.value = e.clientY - containerRect.top
      startX.value = e.clientX - containerRect.left
      initialTop.value = position.value.top
      isDragging.value = false

      startTimeBeforeDrag.value = new Date(event.start)
      endTimeBeforeDrag.value = new Date(event.end)

      // Setup drag listeners
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', stopDrag)

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
    isDragging,
    resizeDirection,
    startResize,
    handleMouseDown,
    handleResizeMove,
    handleDragMove,
    event,
    calculatePosition
  }
}
