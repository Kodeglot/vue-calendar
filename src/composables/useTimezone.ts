import { ref, computed } from 'vue'
import { format, parseISO, formatISO } from 'date-fns'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { debug } from '@/utils/debug'

/**
 * Timezone utility composable for handling ISO date storage and localized display
 * 
 * This composable ensures that:
 * - All dates are stored in ISO format (UTC)
 * - Display times are shown in the user's local timezone
 * - Timezone conversions are handled properly
 */
export function useTimezone() {
  // Get user's timezone
  const userTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)
  
  // Common time formats
  const timeFormats = {
    time: 'HH:mm',
    time12: 'h:mm a',
    date: 'yyyy-MM-dd',
    dateTime: 'yyyy-MM-dd HH:mm',
    dateTime12: 'yyyy-MM-dd h:mm a',
    monthDay: 'MMM d',
    weekday: 'EEEE',
    weekdayShort: 'EEE',
    monthYear: 'MMMM yyyy',
    fullDate: 'EEEE, MMMM d, yyyy'
  }

  /**
   * Convert a date to the user's timezone for display
   * @param date - Date string in ISO format or Date object
   * @returns Date object in user's timezone
   */
  const toUserTimezone = (date: string | Date): Date => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const userDate = new Date(dateObj.toLocaleString("en-US", { timeZone: userTimezone.value }))
    debug.log('Timezone: Converting to user timezone', {
      input: dateObj.toISOString(),
      userTimezone: userTimezone.value,
      output: userDate.toISOString()
    });
    return userDate
  }

  /**
   * Convert a date from user's timezone to UTC for storage
   * @param date - Date object in user's timezone
   * @returns Date object in UTC
   */
  const toUTC = (date: Date): Date => {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: userTimezone.value }))
    debug.log('Timezone: Converting to UTC', {
      input: date.toISOString(),
      userTimezone: userTimezone.value,
      output: utcDate.toISOString()
    });
    return utcDate
  }

  /**
   * Format a date for display in user's timezone
   * @param date - Date string in ISO format or Date object
   * @param formatStr - Format string (see timeFormats)
   * @returns Formatted date string
   */
  const formatForDisplay = (date: string | Date, formatStr: string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatInTimeZone(dateObj, userTimezone.value, formatStr)
  }

  /**
   * Format time for display (HH:mm format)
   * @param date - Date string in ISO format or Date object
   * @returns Formatted time string
   */
  const formatTime = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.time)
  }

  /**
   * Format time for display (12-hour format)
   * @param date - Date string in ISO format or Date object
   * @returns Formatted time string
   */
  const formatTime12 = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.time12)
  }

  /**
   * Format date for display
   * @param date - Date string in ISO format or Date object
   * @returns Formatted date string
   */
  const formatDate = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.date)
  }

  /**
   * Format date and time for display
   * @param date - Date string in ISO format or Date object
   * @returns Formatted date and time string
   */
  const formatDateTime = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.dateTime)
  }

  /**
   * Format date and time for display (12-hour format)
   * @param date - Date string in ISO format or Date object
   * @returns Formatted date and time string
   */
  const formatDateTime12 = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.dateTime12)
  }

  /**
   * Format month and day for display
   * @param date - Date string in ISO format or Date object
   * @returns Formatted month and day string
   */
  const formatMonthDay = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.monthDay)
  }

  /**
   * Format weekday for display
   * @param date - Date string in ISO format or Date object
   * @returns Formatted weekday string
   */
  const formatWeekday = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.weekday)
  }

  /**
   * Format short weekday for display
   * @param date - Date string in ISO format or Date object
   * @returns Formatted short weekday string
   */
  const formatWeekdayShort = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.weekdayShort)
  }

  /**
   * Format month and year for display
   * @param date - Date string in ISO format or Date object
   * @returns Formatted month and year string
   */
  const formatMonthYear = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.monthYear)
  }

  /**
   * Format full date for display
   * @param date - Date string in ISO format or Date object
   * @returns Formatted full date string
   */
  const formatFullDate = (date: string | Date): string => {
    return formatForDisplay(date, timeFormats.fullDate)
  }

  /**
   * Convert a date to ISO string for storage
   * @param date - Date object
   * @returns ISO string
   */
  const toISOString = (date: Date): string => {
    const isoString = date.toISOString()
    debug.log('Timezone: Converting to ISO string', {
      input: date.toISOString(),
      output: isoString
    });
    return isoString
  }

  /**
   * Get current date in user's timezone
   * @returns Current date in user's timezone
   */
  const now = computed(() => {
    return new Date()
  })

  /**
   * Check if a date is today
   * @param date - Date string in ISO format or Date object
   * @returns True if the date is today
   */
  const isToday = (date: string | Date): boolean => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const today = new Date()
    return format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  }

  /**
   * Check if a date is in the same day as another date
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if both dates are in the same day
   */
  const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
    return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd')
  }

  /**
   * Get the start of day in user's timezone
   * @param date - Date string in ISO format or Date object
   * @returns Start of day in user's timezone
   */
  const startOfDay = (date: string | Date): Date => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
  }

  /**
   * Get the end of day in user's timezone
   * @param date - Date string in ISO format or Date object
   * @returns End of day in user's timezone
   */
  const endOfDay = (date: string | Date): Date => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999)
  }

  /**
   * Round time to the nearest interval (in minutes)
   * @param date - Date to round
   * @param interval - Interval in minutes (default: 5)
   * @returns Rounded date
   */
  const roundToNearestInterval = (date: Date, interval: number = 5): Date => {
    const rounded = new Date(date)
    const minutes = rounded.getMinutes()
    const roundedMinutes = Math.round(minutes / interval) * interval
    
    if (roundedMinutes === 60) {
      rounded.setHours(rounded.getHours() + 1, 0, 0, 0)
    } else {
      rounded.setMinutes(roundedMinutes, 0, 0)
    }
    
    return rounded
  }

  /**
   * Create a time range with default duration
   * @param startTime - Start time
   * @param durationMinutes - Duration in minutes (default: 60)
   * @returns Object with start and end times
   */
  const createTimeRange = (startTime: Date, durationMinutes: number = 60): { start: Date; end: Date } => {
    const start = new Date(startTime)
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
    return { start, end }
  }

  return {
    // Timezone info
    userTimezone,
    timeFormats,
    
    // Conversion functions
    toUserTimezone,
    toUTC,
    toISOString,
    
    // Formatting functions
    formatForDisplay,
    formatTime,
    formatTime12,
    formatDate,
    formatDateTime,
    formatDateTime12,
    formatMonthDay,
    formatWeekday,
    formatWeekdayShort,
    formatMonthYear,
    formatFullDate,
    
    // Utility functions
    now,
    isToday,
    isSameDay,
    startOfDay,
    endOfDay,
    roundToNearestInterval,
    createTimeRange
  }
} 