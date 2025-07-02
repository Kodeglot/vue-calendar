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
  
  group: (label: string) => {
    if (getDebugFlag()) {
      console.group(`[Vue Calendar Debug] ${label}`);
    }
  },
  
  groupEnd: () => {
    if (getDebugFlag()) {
      console.groupEnd();
    }
  },
  
  time: (label: string) => {
    if (getDebugFlag()) {
      console.time(`[Vue Calendar Debug] ${label}`);
    }
  },
  
  timeEnd: (label: string) => {
    if (getDebugFlag()) {
      console.timeEnd(`[Vue Calendar Debug] ${label}`);
    }
  }
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