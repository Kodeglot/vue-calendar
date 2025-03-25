<template>
  <!-- 
    Event Container
    - Renders a draggable/resizable calendar event
    - Supports custom styling through props
    - Handles drag/resize interactions
    - Responsive to different view types (month/week/day)
  -->
  <div
    :key="event.id"
    role="button"
    aria-label="Calendar event"
    :aria-describedby="`event-${event.id}-description`"
    :class="[
      'text-sm p-2 rounded cursor-move absolute truncate hover:shadow-sm group event-transition focus:outline-none focus:ring-2 focus:ring-primary-500',
      viewType === 'month' ? 'mt-2' : '',
      viewType === 'day' ? 'ml-16' : '',
      customClasses?.eventContainer
    ]"
    :style="{
      backgroundColor: event.color + '20',
      borderLeft: `4px solid ${event.color}`,
      top: `${position.top}px`,
      height: `${position.height}px`,
      width: `calc(${event.width}% - 2px)`,
      left: `${event.left}%`,
      ...customStyles?.eventContainer
    }"
    draggable="true"
    @dragstart="handleDragStart"
    @mousedown="handleMouseDown"
    @click="handleClick"
  >
    <!-- Event Content -->
    <div :class="['font-medium', customClasses?.eventTitle]">
      {{ event.title }}
    </div>
    <div :class="['text-xs text-gray-600', customClasses?.eventTime]">
      {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
    </div>

    <!-- Resize Handles -->
    <div
      v-if="resizable"
      :class="[
        'absolute top-0 left-0 right-0 h-2 cursor-row-resize bg-gray-300 transition-opacity',
        isResizing && resizeDirection === 'top' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        customClasses?.resizeHandle
      ]"
      @mousedown.stop="startResize('top')"
    ></div>
    <div
      v-if="resizable"
      :class="[
        'absolute bottom-0 left-0 right-0 h-2 cursor-row-resize bg-gray-300 transition-opacity',
        isResizing && resizeDirection === 'bottom' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        customClasses?.resizeHandle
      ]"
      @mousedown.stop="startResize('bottom')"
    ></div>

    <!-- Resize Indicator -->
    <div
      v-if="isResizing"
      class="absolute inset-0 bg-opacity-10 pointer-events-none"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { CalendarEvent } from '../stores/calendarStore'

interface EventComponentProps {
  /**
   * Current view type (month/week/day)
   * @required
   */
  viewType: 'month' | 'week' | 'day'
  
  /**
   * Event data object containing:
   * - id: Unique event identifier
   * - title: Event title
   * - start: ISO date string for start time
   * - end: ISO date string for end time
   * - color: Event color in hex format
   * - width: Event width percentage (0-100)
   * - left: Event left position percentage (0-100)
   * @required
   */
  event: CalendarEvent
  
  /**
   * Whether resize handles are enabled
   * @default false
   */
  resizable?: boolean
  
  /**
   * Container reference for position calculations
   * Required for resizable events
   */
  containerRef?: HTMLElement
  
  /**
   * Custom CSS classes for different parts of the component
   * - eventContainer: Styles for the event container
   * - eventTitle: Styles for the event title
   * - eventTime: Styles for the event time display
   * - resizeHandle: Styles for resize handles
   */
  customClasses?: {
    eventContainer?: string
    eventTitle?: string
    eventTime?: string
    resizeHandle?: string
  }
  
  /**
   * Custom inline styles for different parts of the component
   * - eventContainer: Inline styles for the event container
   */
  customStyles?: {
    eventContainer?: Record<string, string>
  }
  
  /**
   * Pixels per hour for time calculations
   * Determines the vertical scale of the calendar
   * @default 60
   */
  pxPerHour?: number
}

const props = withDefaults(defineProps<EventComponentProps>(), {
  resizable: false,
  pxPerHour: 60
})

interface EventComponentEmits {
  /**
   * Emitted when event is resized
   * @param event - The calendar event
   * @param newStart - New start time as ISO string
   * @param newEnd - New end time as ISO string
   */
  (e: 'resize', event: CalendarEvent, newStart: string, newEnd: string): void
  
  /**
   * Emitted when drag starts
   * @param dragEvent - Native drag event
   * @param event - The calendar event
   */
  (e: 'dragstart', dragEvent: DragEvent, event: CalendarEvent): void
  
  /**
   * Emitted when event is clicked
   * @param event - The calendar event
   */
  (e: 'click', event: CalendarEvent): void
}

const emit = defineEmits<EventComponentEmits>()

// Reactive State
const position = ref({ top: 0, height: 0 }) // Pixel position and size of event
const isDragging = ref(false) // Track drag state for accessibility

// Resize State
const isResizing = ref(false) // Resize in progress flag
const resizeDirection = ref<'top' | 'bottom'>('bottom') // Current resize direction
const startY = ref(0) // Initial mouse Y position
const initialTop = ref(0) // Initial top position
const initialHeight = ref(100) // Initial height

// Calculate initial position based on event times
  const calculatePosition = () => {
    const start = new Date(props.event.start)
    const end = new Date(props.event.end)
    
    // Calculate start time in hours since midnight
    const startHours = start.getHours() + (start.getMinutes() / 60)
    const durationHours = (end.getTime() - start.getTime()) / 3600000

    // Handle different view types
    if (props.viewType === 'month') {
      // For month view, stack events vertically with fixed height
      position.value = {
        top: (props.event.order || 0) * 60, // 60px height
        height: 0
      }
    } else {
      // For week/day views, calculate position based on time
      position.value = {
        top: Math.max(0, startHours * props.pxPerHour),
        height: Math.max(30, durationHours * props.pxPerHour) // Minimum 30px height (30 minutes)
      }
    }
  }

// Resize Handlers
const startResize = (direction: 'top' | 'bottom') => {
  resizeDirection.value = direction
  isResizing.value = true
  initialTop.value = position.value.top
  initialHeight.value = position.value.height
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', stopResize)
}

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.value || !props.containerRef) return

    // Calculate mouse position relative to container
    const containerRect = props.containerRef.getBoundingClientRect()
    const mouseY = e.clientY - containerRect.top
    const deltaY =
      mouseY -
      (resizeDirection.value === 'top' ? initialTop.value : initialTop.value + initialHeight.value)

    let newTop = initialTop.value
    let newHeight = initialHeight.value

    // Calculate new dimensions based on resize direction
    if (resizeDirection.value === 'top') {
      newHeight = Math.max(5, initialHeight.value - deltaY) // Minimum 5px (5 minutes)
      newTop = initialTop.value + deltaY
      
      // Snap to 5 minute intervals
      const snapInterval = (5 / 60) * props.pxPerHour
      newTop = Math.round(newTop / snapInterval) * snapInterval
      newHeight = Math.max(5, initialHeight.value - (newTop - initialTop.value))
    } else {
      newHeight = Math.max(5, initialHeight.value + deltaY)
      
      // Snap to 5 minute intervals
      const snapInterval = (5 / 60) * props.pxPerHour
      newHeight = Math.round(newHeight / snapInterval) * snapInterval
    }

    // Convert pixel positions to time values
    const newStart = new Date(props.event.start)
    const newEnd = new Date(props.event.end)

    if (resizeDirection.value === 'top') {
      const minutes = (newTop / props.pxPerHour) * 60
      newStart.setHours(Math.floor(minutes / 60))
      newStart.setMinutes(Math.floor(minutes % 60 / 5) * 5) // Snap to 5 minutes
    } else {
      const totalMinutes = ((newTop + newHeight) / props.pxPerHour) * 60
      newEnd.setHours(Math.floor(totalMinutes / 60))
      newEnd.setMinutes(Math.floor(totalMinutes % 60 / 5) * 5) // Snap to 5 minutes
    }

    // Prevent events from overlapping midnight
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

    // Update visual position and emit changes
    position.value = { top: newTop, height: newHeight }
    emit('resize', props.event, newStart.toISOString(), newEnd.toISOString())
  }

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', stopResize)
}

// Drag Handlers
const handleDragStart = (e: DragEvent) => {
  try {
    if (!props.event.id) {
      throw new Error('Event ID is required for drag operation')
    }
    e.dataTransfer?.setData('text/plain', props.event.id)
    isDragging.value = true
    emit('dragstart', e, props.event)
  } catch (error) {
    console.error('Drag start failed:', error)
  }
}

const handleClick = (e: MouseEvent) => {
  try {
    // Prevent click during resize or when clicking on resize handles
    if (isResizing.value) return
    
    // Check if clicking on a resize handle by checking parent element
    const target = e.target as HTMLElement
    if (target.classList.contains('cursor-row-resize') || 
        target.parentElement?.querySelector('.cursor-row-resize') === target) {
      e.stopPropagation()
      return
    }
    
    emit('click', props.event)
  } catch (error) {
    console.error('Click event failed:', error)
  }
}

const handleMouseDown = (e: MouseEvent) => {
  try {
    // Prevent drag during resize or when clicking on resize handles
    if (isResizing.value) return
    
    // Check if clicking on a resize handle by checking parent element
    const target = e.target as HTMLElement
    if (target.classList.contains('cursor-row-resize') || 
        target.parentElement?.querySelector('.cursor-row-resize') === target) {
      e.stopPropagation()
      return
    }
    
    // Only handle drag if not resizing and not clicking on a resize handle
    e.stopPropagation()
  } catch (error) {
    console.error('Mouse down event failed:', error)
  }
}

// Format time display (HH:MM)
const formatTime = (dateString: string) => {
  try {
    if (!dateString) {
      throw new Error('Date string is required for formatting')
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string provided')
    }
    // Use UTC timezone for consistent formatting across environments
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC'
    })
  } catch (error) {
    console.error('Time formatting failed:', error)
    return '--:--'
  }
}

// Lifecycle Hooks
onMounted(() => {
  // console.log('Event mounted', props.event)
  calculatePosition()
}) // Initial position calculation
onUnmounted(stopResize) // Cleanup event listeners
</script>
