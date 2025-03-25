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
        'absolute top-0 left-0 right-0 h-2 cursor-row-resize bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity',
        customClasses?.resizeHandle
      ]"
      @mousedown.stop="startResize('top')"
    ></div>
    <div
      v-if="resizable"
      :class="[
        'absolute bottom-0 left-0 right-0 h-2 cursor-row-resize bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity',
        customClasses?.resizeHandle
      ]"
      @mousedown.stop="startResize('bottom')"
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
   * @default 63
   */
  pxPerHour?: number
}

const props = withDefaults(defineProps<EventComponentProps>(), {
  resizable: false,
  pxPerHour: 63
})

interface EventComponentEmits {
  /**
   * Emitted when event is resized
   * @param event - The calendar event
   * @param newStart - New start time
   * @param newEnd - New end time
   */
  (e: 'resize', event: CalendarEvent, newStart: Date, newEnd: Date): void
  
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
  const startHours = start.getHours() + start.getMinutes() / 60
  const durationHours = (end.getTime() - start.getTime()) / 3600000

  position.value = {
    top: startHours * props.pxPerHour,
    height: durationHours * props.pxPerHour,
  }

  // Stick to top if viewType is Month & static height 50px
  if (props.viewType === 'month') {
    position.value.top = 0
    position.value.height = 50
  }

  // console.log(position.value)
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
    newHeight = Math.max(20, initialHeight.value - deltaY) // Minimum 20px (15min)
    newTop = initialTop.value + deltaY
  } else {
    newHeight = Math.max(20, initialHeight.value + deltaY)
  }

  // Convert pixel positions to time values
  const newStart = new Date(props.event.start)
  const newEnd = new Date(props.event.end)

  if (resizeDirection.value === 'top') {
    const minutes = (newTop / props.pxPerHour) * 60
    newStart.setHours(Math.floor(minutes / 60))
    newStart.setMinutes(minutes % 60)
  } else {
    const totalMinutes = ((newTop + newHeight) / props.pxPerHour) * 60
    newEnd.setHours(Math.floor(totalMinutes / 60))
    newEnd.setMinutes(totalMinutes % 60)
  }

  // Update visual position and emit changes
  position.value = { top: newTop, height: newHeight }
  console.log(position.value)
  emit('resize', props.event, newStart, newEnd)
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

const handleMouseDown = (e: MouseEvent) => {
  try {
    if (props.resizable) return // Prevent drag during resize
    e.stopPropagation() // Prevent text selection
    emit('click', props.event)
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
