import { describe, it, expect, beforeEach } from 'vitest'
import { useTimezone } from '../../src/composables/useTimezone'

describe('useTimezone', () => {
  let timezone: ReturnType<typeof useTimezone>

  beforeEach(() => {
    timezone = useTimezone()
  })

  it('formats month and year correctly', () => {
    const date = new Date('2025-01-15T10:00:00Z')
    const formatted = timezone.formatMonthYear(date)
    
    expect(formatted).toBe('January 2025')
  })

  it('formats weekday short correctly', () => {
    const date = new Date('2025-01-15T10:00:00Z') // Wednesday
    const formatted = timezone.formatWeekdayShort(date)
    
    expect(formatted).toBe('Wed')
  })

  it('formats full date correctly', () => {
    const date = new Date('2025-01-15T10:00:00Z')
    const formatted = timezone.formatFullDate(date)
    
    expect(formatted).toMatch(/^[A-Za-z]+, [A-Za-z]+ \d{1,2}, 2025$/)
  })

  it('formats time correctly in 24h format', () => {
    const date = new Date('2025-01-15T14:30:00Z')
    const formatted = timezone.formatTime(date, '24h')
    
    expect(formatted).toMatch(/^\d{2}:\d{2}$/)
  })

  it('formats time correctly in 12h format', () => {
    const date = new Date('2025-01-15T14:30:00Z')
    const formatted = timezone.formatTime(date, '12h')
    
    expect(formatted).toMatch(/^\d{1,2}:\d{2} [AP]M$/)
  })

  it('rounds to nearest interval correctly', () => {
    const date = new Date('2025-01-15T10:23:45Z')
    const rounded = timezone.roundToNearestInterval(date, 5)
    
    expect(rounded.getMinutes() % 5).toBe(0)
  })

  it('rounds to nearest 15-minute interval', () => {
    const date = new Date('2025-01-15T10:23:45Z')
    const rounded = timezone.roundToNearestInterval(date, 15)
    
    expect(rounded.getMinutes() % 15).toBe(0)
  })

  it('rounds to nearest 30-minute interval', () => {
    const date = new Date('2025-01-15T10:23:45Z')
    const rounded = timezone.roundToNearestInterval(date, 30)
    
    expect(rounded.getMinutes() % 30).toBe(0)
  })

  it('handles edge case rounding up', () => {
    const date = new Date('2025-01-15T10:28:00Z')
    const rounded = timezone.roundToNearestInterval(date, 5)
    
    expect(rounded.getMinutes()).toBe(30)
  })

  it('handles edge case rounding down', () => {
    const date = new Date('2025-01-15T10:22:00Z')
    const rounded = timezone.roundToNearestInterval(date, 5)
    
    expect(rounded.getMinutes()).toBe(20)
  })

  it('formats event time correctly', () => {
    const start = new Date('2025-01-15T10:00:00Z')
    const end = new Date('2025-01-15T11:30:00Z')
    const formatted = timezone.formatEventTime(start, end, '24h')
    
    expect(formatted).toMatch(/^\d{2}:\d{2} - \d{2}:\d{2}$/)
  })

  it('formats event time in 12h format', () => {
    const start = new Date('2025-01-15T10:00:00Z')
    const end = new Date('2025-01-15T11:30:00Z')
    const formatted = timezone.formatEventTime(start, end, '12h')
    
    expect(formatted).toMatch(/^\d{1,2}:\d{2} [AP]M - \d{1,2}:\d{2} [AP]M$/)
  })

  it('handles same start and end time', () => {
    const time = new Date('2025-01-15T10:00:00Z')
    const formatted = timezone.formatEventTime(time, time, '24h')
    
    expect(formatted).toMatch(/^\d{2}:\d{2}$/)
  })

  it('handles all-day events', () => {
    const start = new Date('2025-01-15T00:00:00Z')
    const end = new Date('2025-01-16T00:00:00Z')
    const formatted = timezone.formatEventTime(start, end, '24h')
    
    expect(formatted).toBe('All day')
  })

  it('handles multi-day events', () => {
    const start = new Date('2025-01-15T00:00:00Z')
    const end = new Date('2025-01-17T00:00:00Z')
    const formatted = timezone.formatEventTime(start, end, '24h')
    
    expect(formatted).toBe('All day')
  })

  it('formats week range correctly', () => {
    const start = new Date('2025-01-13T00:00:00Z') // Monday
    const end = new Date('2025-01-19T23:59:59Z') // Sunday
    const formatted = timezone.formatWeekRange(start, end)
    
    expect(formatted).toMatch(/^[A-Za-z]{3} \d{1,2} - [A-Za-z]{3} \d{1,2}, \d{4}$/)
  })

  it('formats day header correctly', () => {
    const date = new Date('2025-01-15T10:00:00Z')
    const formatted = timezone.formatDayHeader(date)
    
    expect(formatted).toMatch(/^[A-Za-z]+, [A-Za-z]+ \d{1,2}$/)
  })

  it('handles different time zones', () => {
    const date = new Date('2025-01-15T10:00:00Z')
    
    // Test with different timezone
    const originalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Mock timezone to UTC
    Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
      value: () => ({ timeZone: 'UTC' }),
      configurable: true
    })
    
    const formatted = timezone.formatTime(date, '24h')
    expect(formatted).toBeTruthy()
    
    // Restore original timezone
    Object.defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
      value: () => ({ timeZone: originalTimezone }),
      configurable: true
    })
  })

  it('handles invalid dates gracefully', () => {
    const invalidDate = new Date('invalid')
    
    expect(() => timezone.formatMonthYear(invalidDate)).not.toThrow()
    expect(() => timezone.formatWeekdayShort(invalidDate)).not.toThrow()
    expect(() => timezone.formatFullDate(invalidDate)).not.toThrow()
    expect(() => timezone.formatTime(invalidDate, '24h')).not.toThrow()
  })

  it('handles null dates gracefully', () => {
    expect(() => timezone.formatMonthYear(null as any)).not.toThrow()
    expect(() => timezone.formatWeekdayShort(null as any)).not.toThrow()
    expect(() => timezone.formatFullDate(null as any)).not.toThrow()
    expect(() => timezone.formatTime(null as any, '24h')).not.toThrow()
  })

  it('handles undefined dates gracefully', () => {
    expect(() => timezone.formatMonthYear(undefined as any)).not.toThrow()
    expect(() => timezone.formatWeekdayShort(undefined as any)).not.toThrow()
    expect(() => timezone.formatFullDate(undefined as any)).not.toThrow()
    expect(() => timezone.formatTime(undefined as any, '24h')).not.toThrow()
  })

  it('handles edge case dates', () => {
    const edgeCases = [
      new Date('2025-01-01T00:00:00Z'), // Start of year
      new Date('2025-12-31T23:59:59Z'), // End of year
      new Date('2025-02-28T00:00:00Z'), // February (non-leap year)
      new Date('2025-06-15T12:00:00Z'), // Mid-year
    ]

    edgeCases.forEach(date => {
      expect(() => timezone.formatMonthYear(date)).not.toThrow()
      expect(() => timezone.formatWeekdayShort(date)).not.toThrow()
      expect(() => timezone.formatFullDate(date)).not.toThrow()
      expect(() => timezone.formatTime(date, '24h')).not.toThrow()
    })
  })

  it('handles leap year dates', () => {
    const leapYearDate = new Date('2024-02-29T10:00:00Z') // Leap year
    const formatted = timezone.formatMonthYear(leapYearDate)
    
    expect(formatted).toBe('February 2024')
  })

  it('formats time with seconds correctly', () => {
    const date = new Date('2025-01-15T10:30:45Z')
    const formatted = timezone.formatTime(date, '24h', true)
    
    expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('formats time without seconds by default', () => {
    const date = new Date('2025-01-15T10:30:45Z')
    const formatted = timezone.formatTime(date, '24h')
    
    expect(formatted).toMatch(/^\d{2}:\d{2}$/)
    expect(formatted).not.toMatch(/:\d{2}:\d{2}$/)
  })

  it('handles midnight correctly', () => {
    const midnight = new Date('2025-01-15T00:00:00Z')
    const formatted24h = timezone.formatTime(midnight, '24h')
    const formatted12h = timezone.formatTime(midnight, '12h')
    
    expect(formatted24h).toBe('00:00')
    expect(formatted12h).toBe('12:00 AM')
  })

  it('handles noon correctly', () => {
    const noon = new Date('2025-01-15T12:00:00Z')
    const formatted24h = timezone.formatTime(noon, '24h')
    const formatted12h = timezone.formatTime(noon, '12h')
    
    expect(formatted24h).toBe('12:00')
    expect(formatted12h).toBe('12:00 PM')
  })

  it('handles 11:59 PM correctly', () => {
    const lateNight = new Date('2025-01-15T23:59:00Z')
    const formatted24h = timezone.formatTime(lateNight, '24h')
    const formatted12h = timezone.formatTime(lateNight, '12h')
    
    expect(formatted24h).toBe('23:59')
    expect(formatted12h).toBe('11:59 PM')
  })

  it('handles 1:00 AM correctly', () => {
    const earlyMorning = new Date('2025-01-15T01:00:00Z')
    const formatted24h = timezone.formatTime(earlyMorning, '24h')
    const formatted12h = timezone.formatTime(earlyMorning, '12h')
    
    expect(formatted24h).toBe('01:00')
    expect(formatted12h).toBe('1:00 AM')
  })

  it('handles 1:00 PM correctly', () => {
    const afternoon = new Date('2025-01-15T13:00:00Z')
    const formatted24h = timezone.formatTime(afternoon, '24h')
    const formatted12h = timezone.formatTime(afternoon, '12h')
    
    expect(formatted24h).toBe('13:00')
    expect(formatted12h).toBe('1:00 PM')
  })
}) 