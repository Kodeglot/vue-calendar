import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { debug, isDebugEnabled } from '@/utils/debug'

describe('debug', () => {
  let consoleSpy: any

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    // Reset debug state
    if (typeof window !== 'undefined') {
      window.__calendarDebug = undefined
    }
  })

  it('logs when debug is enabled', () => {
    debug.enabled = true
    debug.log('test message')
    
    expect(consoleSpy).toHaveBeenCalledWith('[Vue Calendar Debug]', 'test message')
  })

  it('does not log when debug is disabled', () => {
    // Disable debug by setting window flag
    if (typeof window !== 'undefined') {
      window.__calendarDebug = false
    }
    debug.log('test message')
    
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('handles warn method', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    debug.enabled = true
    debug.warn('warning message')
    
    expect(warnSpy).toHaveBeenCalledWith('[Vue Calendar Debug]', 'warning message')
    warnSpy.mockRestore()
  })

  it('handles error method', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    debug.enabled = true
    debug.error('error message')
    
    expect(errorSpy).toHaveBeenCalledWith('[Vue Calendar Debug]', 'error message')
    errorSpy.mockRestore()
  })

  it('handles info method', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    debug.enabled = true
    debug.info('info message')
    
    expect(infoSpy).toHaveBeenCalledWith('[Vue Calendar Debug]', 'info message')
    infoSpy.mockRestore()
  })

  it('handles table method', () => {
    const tableSpy = vi.spyOn(console, 'table').mockImplementation(() => {})
    debug.enabled = true
    debug.table({ test: 'data' })
    
    expect(tableSpy).toHaveBeenCalledWith({ test: 'data' })
    tableSpy.mockRestore()
  })

  it('handles trace method', () => {
    const traceSpy = vi.spyOn(console, 'trace').mockImplementation(() => {})
    debug.enabled = true
    debug.trace('trace message')
    
    expect(traceSpy).toHaveBeenCalledWith('[Vue Calendar Debug]', 'trace message')
    traceSpy.mockRestore()
  })

  it('handles count method', () => {
    const countSpy = vi.spyOn(console, 'count').mockImplementation(() => {})
    debug.enabled = true
    debug.count('count label')
    
    expect(countSpy).toHaveBeenCalledWith('[Vue Calendar Debug] count label')
    countSpy.mockRestore()
  })

  it('handles countReset method', () => {
    const countResetSpy = vi.spyOn(console, 'countReset').mockImplementation(() => {})
    debug.enabled = true
    debug.countReset('count label')
    
    expect(countResetSpy).toHaveBeenCalledWith('[Vue Calendar Debug] count label')
    countResetSpy.mockRestore()
  })

  it('handles assert method', () => {
    const assertSpy = vi.spyOn(console, 'assert').mockImplementation(() => {})
    debug.enabled = true
    debug.assert(true, 'assert message')
    
    expect(assertSpy).toHaveBeenCalledWith(true, '[Vue Calendar Debug]', 'assert message')
    assertSpy.mockRestore()
  })

  it('handles dir method', () => {
    const dirSpy = vi.spyOn(console, 'dir').mockImplementation(() => {})
    debug.enabled = true
    debug.dir({ test: 'object' })
    
    expect(dirSpy).toHaveBeenCalledWith({ test: 'object' })
    dirSpy.mockRestore()
  })

  it('handles dirxml method', () => {
    const dirxmlSpy = vi.spyOn(console, 'dirxml').mockImplementation(() => {})
    debug.enabled = true
    debug.dirxml('<div>test</div>')
    
    expect(dirxmlSpy).toHaveBeenCalledWith('<div>test</div>')
    dirxmlSpy.mockRestore()
  })

  it('handles group method', () => {
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    debug.enabled = true
    debug.group('group label')
    
    expect(groupSpy).toHaveBeenCalledWith('[Vue Calendar Debug]', 'group label')
    groupSpy.mockRestore()
  })

  it('handles groupCollapsed method', () => {
    const groupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {})
    debug.enabled = true
    debug.groupCollapsed('group label')
    
    expect(groupCollapsedSpy).toHaveBeenCalledWith('[Vue Calendar Debug]', 'group label')
    groupCollapsedSpy.mockRestore()
  })

  it('handles groupEnd method', () => {
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
    debug.enabled = true
    debug.groupEnd()
    
    expect(groupEndSpy).toHaveBeenCalled()
    groupEndSpy.mockRestore()
  })

  it('handles time method', () => {
    const timeSpy = vi.spyOn(console, 'time').mockImplementation(() => {})
    debug.enabled = true
    debug.time('time label')
    
    expect(timeSpy).toHaveBeenCalledWith('[Vue Calendar Debug] time label')
    timeSpy.mockRestore()
  })

  it('handles timeEnd method', () => {
    const timeEndSpy = vi.spyOn(console, 'timeEnd').mockImplementation(() => {})
    debug.enabled = true
    debug.timeEnd('time label')
    
    expect(timeEndSpy).toHaveBeenCalledWith('[Vue Calendar Debug] time label')
    timeEndSpy.mockRestore()
  })

  it('handles clear method', () => {
    const clearSpy = vi.spyOn(console, 'clear').mockImplementation(() => {})
    debug.enabled = true
    debug.clear()
    
    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })

  it('handles unsupported console methods gracefully', () => {
    debug.enabled = true
    
    // These methods don't exist in test environment but should not throw
    expect(() => debug.profile('profile label')).not.toThrow()
    expect(() => debug.profileEnd('profile label')).not.toThrow()
    expect(() => debug.memory()).not.toThrow()
    expect(() => debug.markTimeline('timeline label')).not.toThrow()
    expect(() => debug.timeline('timeline label')).not.toThrow()
    expect(() => debug.timelineEnd('timeline label')).not.toThrow()
    expect(() => debug.timeStamp('timestamp label')).not.toThrow()
  })

  it('respects window.__calendarDebug flag', () => {
    if (typeof window !== 'undefined') {
      window.__calendarDebug = true
      debug.log('test message')
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockClear()
      window.__calendarDebug = false
      debug.log('test message')
      expect(consoleSpy).not.toHaveBeenCalled()
    }
  })

  it('exports isDebugEnabled function', () => {
    expect(typeof isDebugEnabled).toBe('function')
    expect(isDebugEnabled()).toBe(true) // Should be true in test environment
  })
}) 