/**
 * Debug utility for conditional logging
 * Only logs when debug mode is enabled
 * 
 * USAGE:
 * 
 * 1. In development (npm run dev): Debug logs are enabled by default
 * 2. In production: Debug logs are disabled by default
 * 
 * To enable debug mode in production or demo:
 * - Open browser console
 * - Run: __enableCalendarDebug()
 * 
 * To disable debug mode:
 * - Open browser console  
 * - Run: __disableCalendarDebug()
 * 
 * To check debug status:
 * - Open browser console
 * - Run: __getCalendarDebugStatus()
 * 
 * Example usage in code:
 * import { debug } from '@/utils/debug'
 * debug.log('This will only show when debug is enabled')
 * debug.warn('Warning message')
 * debug.error('Error message')
 */

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Debug flag - can be overridden by setting window.__calendarDebug = true
const getDebugFlag = (): boolean => {
  // Check if explicitly set on window
  if (typeof window !== 'undefined' && window.__calendarDebug !== undefined) {
    return window.__calendarDebug;
  }
  
  // For tests, enable debug by default to allow testing
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') {
    return true;
  }
  
  // Default to true in development, false otherwise
  return isDevelopment;
};

// Debug logger
export const debug = {
  log: (...args: any[]) => {
    if (getDebugFlag()) {
      console.log('[Vue Calendar Debug]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (getDebugFlag()) {
      console.warn('[Vue Calendar Debug]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (getDebugFlag()) {
      console.error('[Vue Calendar Debug]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (getDebugFlag()) {
      console.info('[Vue Calendar Debug]', ...args);
    }
  },
  table: (...args: any[]) => {
    if (getDebugFlag()) {
      console.table(...args);
    }
  },
  trace: (...args: any[]) => {
    if (getDebugFlag()) {
      console.trace('[Vue Calendar Debug]', ...args);
    }
  },
  count: (label?: string) => {
    if (getDebugFlag()) {
      console.count(`[Vue Calendar Debug] ${label || ''}`);
    }
  },
  countReset: (label?: string) => {
    if (getDebugFlag()) {
      console.countReset(`[Vue Calendar Debug] ${label || ''}`);
    }
  },
  assert: (condition: any, ...args: any[]) => {
    if (getDebugFlag()) {
      console.assert(condition, '[Vue Calendar Debug]', ...args);
    }
  },
  dir: (...args: any[]) => {
    if (getDebugFlag()) {
      console.dir(...args);
    }
  },
  dirxml: (...args: any[]) => {
    if (getDebugFlag()) {
      if (console.dirxml) console.dirxml(...args);
    }
  },
  group: (...args: any[]) => {
    if (getDebugFlag()) {
      console.group('[Vue Calendar Debug]', ...args);
    }
  },
  groupCollapsed: (...args: any[]) => {
    if (getDebugFlag()) {
      if (console.groupCollapsed) console.groupCollapsed('[Vue Calendar Debug]', ...args);
    }
  },
  groupEnd: () => {
    if (getDebugFlag()) {
      console.groupEnd();
    }
  },
  time: (label?: string) => {
    if (getDebugFlag()) {
      console.time(`[Vue Calendar Debug] ${label || ''}`);
    }
  },
  timeEnd: (label?: string) => {
    if (getDebugFlag()) {
      console.timeEnd(`[Vue Calendar Debug] ${label || ''}`);
    }
  },
  clear: () => {
    if (getDebugFlag()) {
      console.clear();
    }
  },
  // Stubs for unsupported methods
  profile: (...args: any[]) => {
    if (getDebugFlag()) {
      const extendedConsole = console as any;
      if (typeof extendedConsole.profile === 'function') {
        extendedConsole.profile(...args);
      }
    }
  },
  profileEnd: (...args: any[]) => {
    if (getDebugFlag()) {
      const extendedConsole = console as any;
      if (typeof extendedConsole.profileEnd === 'function') {
        extendedConsole.profileEnd(...args);
      }
    }
  },
  memory: (...args: any[]) => {
    if (getDebugFlag()) {
      const extendedConsole = console as any;
      if (typeof extendedConsole.memory === 'function') {
        extendedConsole.memory(...args);
      }
    }
  },
  markTimeline: (...args: any[]) => {
    if (getDebugFlag()) {
      const extendedConsole = console as any;
      if (typeof extendedConsole.markTimeline === 'function') {
        extendedConsole.markTimeline(...args);
      }
    }
  },
  timeline: (...args: any[]) => {
    if (getDebugFlag()) {
      const extendedConsole = console as any;
      if (typeof extendedConsole.timeline === 'function') {
        extendedConsole.timeline(...args);
      }
    }
  },
  timelineEnd: (...args: any[]) => {
    if (getDebugFlag()) {
      const extendedConsole = console as any;
      if (typeof extendedConsole.timelineEnd === 'function') {
        extendedConsole.timelineEnd(...args);
      }
    }
  },
  timeStamp: (...args: any[]) => {
    if (getDebugFlag()) {
      const extendedConsole = console as any;
      if (typeof extendedConsole.timeStamp === 'function') {
        extendedConsole.timeStamp(...args);
      }
    }
  },
};

// Declare global types for TypeScript
declare global {
  interface Window {
    __calendarDebug?: boolean;
    __enableCalendarDebug?: () => void;
    __disableCalendarDebug?: () => void;
    __getCalendarDebugStatus?: () => boolean;
  }
}

// Add global functions for browser console access
if (typeof window !== 'undefined') {
  window.__enableCalendarDebug = () => {
    window.__calendarDebug = true;
    console.log('[Vue Calendar] Debug mode enabled. You can now see debug logs.');
  };
  
  window.__disableCalendarDebug = () => {
    window.__calendarDebug = false;
    console.log('[Vue Calendar] Debug mode disabled.');
  };
  
  window.__getCalendarDebugStatus = () => {
    const status = getDebugFlag();
    console.log(`[Vue Calendar] Debug mode is currently ${status ? 'enabled' : 'disabled'}`);
    return status;
  };
}

// Export the debug flag getter for external use
export const isDebugEnabled = getDebugFlag; 