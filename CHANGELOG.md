# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.2] - 2025-08-04

### Fixed
- **Critical Timezone Bug**: Fixed major timezone handling issue in month view drag-and-drop operations
  - **Root Cause**: Events were being forced to 22:00 UTC during drag-and-drop regardless of original time
  - **Solution**: Enhanced `updateEventDateOnly` method to properly preserve original time components
  - **Date Creation Fix**: Fixed `visibleDates` computed property to create dates with 00:00:00 time instead of current time
  - **Double Update Prevention**: Removed redundant store updates in `onEventUpdated` method to prevent time overrides
  - **Comprehensive Testing**: Added specific timezone tests to verify time preservation and edge cases
  - **Impact**: All events now correctly preserve their original time (hours, minutes, seconds) when dragged between dates
  - **Documentation**: Updated README with timezone handling examples and troubleshooting guide

### Technical Improvements
- **Enhanced Date Handling**: Improved date creation in month component to avoid timezone conversion issues
- **Store Optimization**: Streamlined event update flow to prevent double updates and ensure data consistency
- **Test Coverage**: Added comprehensive timezone tests to prevent future regressions

## [1.4.1] - 2025-08-04

### Changed
- **Code Quality**: Improved TimeGridComponent template structure and code formatting
  - Removed unused hour labels display logic from template
  - Improved code formatting consistency (using double quotes)
  - Better formatting of props destructuring
  - Cleaned up template structure for better maintainability

## [1.4.0] - 2025-07-27

### Added
- **Comprehensive Timezone Support**: Added full timezone handling with user timezone detection
  - New `useTimezone` composable with `formatTime`, `formatTime12`, `formatDate`, `formatDateTime` functions
  - Automatic user timezone detection and proper timezone conversions
  - Support for both 12-hour and 24-hour time formats
  - ISO storage with localized display for consistent timezone handling
- **CSS Class Prefixing**: Implemented comprehensive CSS class prefixing for better component isolation
  - All calendar styles now prefixed with `vc-calendar-` to prevent conflicts with host applications
  - Enhanced component isolation ensuring safe integration with any Vue application
  - Updated all components to use prefixed class names for better style encapsulation

### Fixed
- **Event Deletion Error Handling**: Fixed `TypeError: Cannot read properties of undefined (reading 'start')` error that occurred when trying to update deleted events
  - Updated `getEventById` method to return `CalendarEvent | undefined` instead of using non-null assertion
  - Added safety checks in `onEventUpdated` function to handle cases where events no longer exist
  - Added comprehensive test coverage for the edge case to prevent future regressions
- **Click Events During Resize**: Fixed issue where click events were being emitted during resize operations
  - Added `isResizing` check in `CalendarEventComponent` to prevent unwanted click emissions
  - Improved event interaction logic to distinguish between clicks and resize operations
  - Enhanced user experience by preventing modal opening during resize operations
- **TypeScript Compilation Errors**: Fixed TypeScript errors in debug utility
  - Removed non-standard console methods that don't exist in test environment
  - Updated debug implementation to use proper type assertions
  - Fixed test expectations to match the new debug implementation

### Changed
- **Test Coverage**: Significantly enhanced test coverage across all calendar components
  - Added comprehensive tests for event interactions, timezone handling, and edge cases
  - Improved test reliability with proper mocking and assertions
  - Enhanced test suite robustness with implementation-agnostic assertions

### Technical Improvements
- **Code Quality**: Improved overall code quality and maintainability
  - Better error handling and edge case management
  - Enhanced type safety with proper TypeScript definitions
  - Improved component isolation and style encapsulation

## [1.3.6] - 2025-07-26

### Added
- **Demo Events Control**: Added `showDemoEvents` prop to `CalendarView` component to control whether demo events are displayed
  - Defaults to `false` to prevent demo events from appearing in production applications
  - Can be set to `true` for development and testing purposes
  - Demo page updated to show demo events for testing functionality

### Fixed
- **Production Demo Events Issue**: Fixed issue where demo events (Team Meeting, Lunch Break, etc.) were automatically appearing in production applications
  - Demo events are now only loaded when explicitly enabled via the `showDemoEvents` prop
  - Ensures clean calendar display in production environments

### Documentation
- **Demo Events Guide**: Added comprehensive documentation in README about controlling demo events
  - Clear instructions on how to ensure no demo events appear in applications
  - Examples of how to enable demo events for development/testing
  - Troubleshooting guide for users experiencing unwanted demo events

## [1.3.5] - 2025-07-26

### Fixed
- **Drag-and-drop event update reliability**: Fixed issue where events were not updating correctly after being dropped in month view. Events now properly update with fresh data from the store and emit correct `newStart` and `newEnd` values.
- **Event emission consistency**: Ensured all `onEventUpdated` functions have consistent signatures across all calendar components (month, week, day views) to match the expected parameters from `CalendarEventComponent`.
- **Store data freshness**: Modified `onEventUpdated` functions to always fetch fresh event data from the store before emitting, ensuring the most up-to-date information is propagated.

### Changed
- **Code cleanup**: Removed unused variables, functions, and commented-out code across multiple components:
  - Removed unused `selectedDate` state and references from calendar store
  - Cleaned up unused imports and variables in `CalendarDayComponent`, `CalendarWeekComponent`, and `CalendarView`
  - Removed commented-out `useCalendarEventInteractions` code and unused `draggedEvent` references
  - Removed unused `isMounted` flags and `createTimeRange` import

### Technical Improvements
- **Function signature consistency**: All `onEventUpdated` functions now accept the same parameters (`event: CalendarEvent, newStart: string, newEnd: string`) across all components.
- **Store integration**: Enhanced store integration in month view to immediately update event dates on drop for better UI consistency.
- **Test coverage**: Added comprehensive tests for drag-and-drop functionality in month view to ensure events update correctly with time preservation.

## [1.3.4] - 2025-07-25

### Fixed
- **Event Emission Reliability:** Ensure `event-updated` is emitted from all view components (month, week, day) after drag or resize, and is always re-emitted from the root `CalendarView` with a debug log (`[CalendarView] event-updated fired:`) for troubleshooting integration issues.

## [1.3.3] - 2025-07-22

### Added
- **Event Emission:** `CalendarEventComponent` now emits an `event-updated` event to the parent when a calendar event is dragged or resized. The payload includes the updated event object and its new start/end times.
- **Resize Event:** `useCalendarEventInteractions` now emits a `resize-end` event with the updated event data after a resize operation completes.

### Fixed
- **Non-browser Environment Guard:** DOM access in `triggerPositionRecalculation` is now guarded to prevent errors in non-browser (Node.js/test) environments.

## [1.3.2] - 2025-07-12

### Added
- **CSS Style Isolation** - Implemented comprehensive CSS prefixing solution to prevent style leakage into host applications
  - All CSS selectors now prefixed with `.vc-calendar` to ensure calendar styles only apply within the component
  - Added `postcss-prefix-selector` dependency for automated CSS prefixing during build
  - Updated component structure to include `vc-calendar` class on root wrappers
  - Prevents conflicts with host app's Tailwind CSS or other styling frameworks
  - Complete style isolation ensures safe integration into any Vue application

### Changed
- **PostCSS Configuration** - Updated `postcss.config.js` to include CSS prefixing plugin with `.vc-calendar` prefix
- **Component Structure** - Added `vc-calendar` class to root wrappers in `CalendarView.vue` and `EventModal.vue`
- **Build Process** - CSS now automatically prefixed during build to prevent global style conflicts

### Documentation
- **CSS Prefixing Guide** - Added comprehensive documentation explaining the style isolation solution
- **Integration Safety** - Updated documentation to highlight safe integration with any Vue app

## [1.3.1] - 2025-07-03

### Changed
- **Timezone composable optimization** - Removed unused imports (`formatISO`, `fromZonedTime`, `toZonedTime`) from timezone utilities to reduce bundle size and improve code clarity
- **Enhanced contributing guidelines** - Comprehensive development documentation with detailed setup instructions, testing guidelines, and project structure overview

### Documentation
- **Development workflow** - Added detailed development commands, testing procedures, and code quality guidelines
- **Project structure** - Documented project layout and file organization for new contributors
- **Release process** - Added guidelines for versioning, changelog updates, and publishing procedures
- **README cleanup** - Removed changelog section from README.md to keep it focused on core documentation, changelog remains in separate CHANGELOG.md file

## [1.3.0] - 2025-07-03

### Added
- **Comprehensive Debug Logging System** - New debug utility with conditional logging that only shows during development (`npm run dev`) and can be toggled via browser console
  - Global browser console functions: `__enableCalendarDebug()`, `__disableCalendarDebug()`, `__getCalendarDebugStatus()`
  - Extensive debug logs throughout calendar lifecycle, user interactions, data operations, and performance
  - Debug logs cover navigation, event operations, drag-and-drop, modal actions, and timezone conversions
  - Production builds remain clean with no debug output by default

### Fixed
- **EventModal reference error** - Fixed `titleInput is not defined` error when opening event modal by adding missing template ref and proper focus handling
- **Month view event click vs date click conflict** - Fixed issue where clicking on events in month view would trigger both event click and date click handlers. Added event propagation stopping to ensure only event click is triggered
- **Edit modal opening on second click** - Fixed issue where edit modal required two clicks to open by changing modal rendering from `v-if` to `v-show` and adding proper watcher for selected events
- **Month view drag and drop time preservation** - Fixed issue where dragging events between days in month view would reset the time. Now preserves original time components (hours, minutes, seconds) when moving events between dates
- **Create event modal interference** - Fixed issue where the create event modal would incorrectly open after dragging or resizing events. Added global flag mechanism to prevent modal from opening immediately after event modifications
- **Event interaction conflicts** - Fixed interference between drag operations and click events in month view by conditionally attaching mousedown handlers only for week/day views

### Technical Improvements
- **Modal rendering optimization** - Changed fallback modal from conditional `v-if` to `v-show` for better performance and immediate method availability
- **Event click handling enhancement** - Improved event click detection with proper event propagation control and debug logging
- **Event interaction state management** - Improved event interaction handling with global flag to track recent drag/resize operations
- **Modal behavior consistency** - Enhanced user experience by preventing unwanted modal triggers during event manipulation
- **Debug infrastructure** - Added comprehensive debug logging system with conditional output and browser console controls
- **Event time preservation logic** - Enhanced `updateEventDateOnly` function to properly preserve time components when changing dates

## [1.2.1] - 2025-07-02

### Added
- **Click to create events** - Click on empty space in any calendar view to create a new event
  - Month view: Click on date cells to create events at 9 AM on that date
  - Week/Day view: Click on time slots to create events at the clicked time (rounded to nearest 5 minutes)
  - All new events default to 1-hour duration
- **Time rounding utility** - Added `roundToNearestInterval` function to round times to nearest 5-minute intervals
- **Development server with styles** - `npm run dev` now includes Tailwind CSS and works like the demo
- **Enhanced demo experience** - Added comprehensive "Try it out!" sections for all demo examples
- **Project links in demo** - Added links to npm, CI/CD, license, coverage, and GitHub repository
- **Kodeglot branding** - Added company branding to demo headers and page titles

### Fixed
- **Month view event click reliability** - Fixed issue where clicking events in month view would not reliably emit click events due to drag/resize logic interference. Added dedicated click handler for month view that bypasses drag/resize logic.
- **Test reliability** - Fixed CalendarMonthComponent test to properly trigger click events on the correct DOM element, ensuring consistent test behavior.
- **Week view date accuracy** - Fixed issue where clicking in week view would use current date instead of the clicked date
- **Month view visual hierarchy** - Fixed event layout so events appear below day numbers instead of overlapping
- **Demo modal responsiveness** - Fixed modal sizing to fit properly on mobile devices with proper margins and scrolling

### Changed
- **Event interaction logic** - Improved event click handling in month view by adding a dedicated `handleClick` method that emits events directly for month view
- **TimeGridComponent** - Added `baseDate` prop to ensure correct date calculation for clicked times in week/day views
- **Development experience** - Updated main Vite config to include Tailwind CSS and proper HTML setup for development
- **Month view styling** - Added gray background for dates from previous/next months to improve visual hierarchy
- **Event spacing** - Reduced spacing between events on the same day in month view for more compact layout
- **Demo modals** - Restructured modals with fixed headers/footers and scrollable content areas for better UX

## [1.2.0] - 2025-07-02

### Added
- Comprehensive test coverage for CalendarDayComponent, CalendarMonthComponent, CalendarEventComponent, EventModal, TimeGridComponent, and store.
- New tests for event emission, all-day events, stacked events, and edge cases in all major views.

### Fixed
- Ensured `eventClick` is reliably emitted from month view events by adding an explicit click handler to `CalendarEventComponent`.
- Fixed event emission and forwarding logic for robust parent-child communication.
- TypeScript build error due to unused variable in event interactions composable.

### Changed
- Minor refactors to event emission and test logic for reliability and maintainability.

## [1.1.0] - 2025-01-27

### Fixed
- **Event click behavior** - Fixed issue where edit modal would trigger during drag/resize operations. Now only triggers on single clicks without drag or resize.
- **Event creation modal** - Fixed default event creation modal not working in demo examples. Now properly opens when clicking "Create Event" buttons.
- **Event reactivity** - Fixed calendar components not updating when new events are added to the store. Components now properly react to store changes.
- **Build configuration** - Fixed TypeScript build errors in deployment process by separating demo and library builds.

### Added
- **Customizable event content**: You can now use the `#event-content` slot to fully control how each event is rendered in all calendar views.
- **Customizable event modal**: You can now use the `#event-modal` slot to provide your own event editing UI. The slot receives the event, update, delete, and close handlers.
- **Fallback modal and content**: If you do not provide a custom modal or event content, the calendar will always show a built-in modal and default event display.
- **Event metadata support**: Added optional `metadata` field to `CalendarEvent` interface for storing custom key-value pairs.
- **Event description and location**: Added optional `description` and `location` fields to `CalendarEvent` interface for common event information.
- **GitHub Pages deployment** - Added automated deployment to GitHub Pages with proper base path configuration.
- **Custom event creation demo** - Enhanced demo with full custom event creation modal including metadata fields (priority, attendees, notes).
- **Deployment scripts** - Added `build:demo`, `predeploy`, and `deploy` scripts for easy GitHub Pages publishing.
- **Demo and README**: Updated with clear examples for custom event content and modal usage.

### Changed
- **Event interaction logic** - Improved event interaction handling to distinguish between clicks, drags, and resizes.
- **Store reactivity** - Updated calendar components to use reactive store access instead of non-reactive function calls.
- **Demo structure** - Enhanced demo with better examples of custom event content and modal usage.
- **Build process** - Separated demo build from library build for cleaner deployment.

### Technical Improvements
- **Performance optimization** - Better event filtering and reactivity in calendar components.
- **User experience** - More intuitive event interaction behavior with proper click vs drag detection.
- **Development workflow** - Streamlined deployment process with automated GitHub Pages publishing.

## [1.0.11] - 2025-01-27

### Changed
- **Week view time column styling** - Updated time labels to match day view styling for consistency
- **Time label appearance** - Added `text-center w-full` classes for better text alignment and width
- **Removed border lines** - Eliminated `border-t` class that was creating unwanted lines through time labels

### Visual Improvements
- **Consistent styling** - Week view time column now matches day view appearance
- **Better text alignment** - Time labels are now properly centered and span full width
- **Cleaner appearance** - Removed border lines that were visually distracting

## [1.0.10] - 2025-01-27

### Fixed
- **CSS purging compatibility** - Replaced pattern-based safelist with explicit class names for better compatibility with consuming apps
- **Tailwind safelist reliability** - Explicit class names ensure all color variants are properly included in builds

### Changed
- **Tailwind configuration** - Updated safelist from regex patterns to explicit class names for all color variants
- **Build reliability** - More predictable CSS output that works better with different bundler configurations

### Technical Improvements
- **Explicit class coverage** - All 22 color variants with 10 shades each are now explicitly listed
- **Better bundler compatibility** - Explicit class names work more reliably across different build tools
- **Reduced build complexity** - Eliminates potential regex pattern matching issues

## [1.0.9] - 2025-01-27

### Added
- **Comprehensive troubleshooting guide** - Added detailed documentation for CSS purging issues
- **Missing colors troubleshooting** - Step-by-step guide to fix missing event colors (orange, purple, etc.)
- **Resize handles troubleshooting** - Instructions to fix invisible resize handles and hover effects
- **Tailwind safelist examples** - Complete safelist configuration for implementing apps
- **Development vs production solutions** - Different approaches for development and production environments

### Changed
- **Enhanced README troubleshooting section** - Expanded with comprehensive CSS purging solutions
- **Better user guidance** - Clear instructions for fixing common styling issues in consuming applications

### Documentation
- **CSS purging solutions** - Added complete Tailwind safelist examples for all color variants
- **Interactive elements troubleshooting** - Guide for fixing cursor changes, hover effects, and opacity transitions
- **Alternative development approaches** - Temporary solutions for development environments

## [1.0.8] - 2025-01-27

### Fixed
- **Week view time grid duplication** - Fixed issue where hour labels were showing twice in week view (left column and first day column)
- **Time column layout** - Improved time column structure with proper flex-shrink-0 and border styling for better alignment
- **Hour labels visibility** - Restored hour labels functionality in TimeGridComponent that was accidentally removed

### Changed
- **Week view layout** - Set showHourLabels to false for all day columns since the left time column already shows hour labels
- **Time column styling** - Enhanced time column with better CSS classes for consistent layout and alignment

### Technical Improvements
- **Layout consistency** - Fixed flex layout issues in week view time column
- **Visual alignment** - Improved hour label positioning and time column borders

## [1.0.7] - 2025-01-27

### Fixed
- **Hour labels visibility** - Restored hour labels functionality in TimeGridComponent that was accidentally removed
- **Resize handles styling** - Enhanced resize handle visibility and interaction feedback with improved hover states
- **Color availability** - Comprehensive Tailwind safelist update ensures all color classes are properly included in builds

### Changed
- **Tailwind configuration** - Enhanced safelist with extensive color patterns and utility classes for better CSS coverage
- **Performance optimizations** - Cached date formatter and hours array to improve rendering performance
- **Resize handle UX** - Improved visual feedback during resize operations with better opacity transitions

### Technical Improvements
- **CSS class coverage** - Added comprehensive safelist patterns for all Tailwind color variants and utility classes
- **Event interaction feedback** - Better visual states for resize handles and drag operations
- **Memory optimization** - Reduced object recreation in time formatting and hour calculations

## [1.0.6] - 2025-06-30

### Added
- **Custom controls/navigation slots**: You can now fully customize the calendar's navigation, view selector, and event creation button using named slots (`navigation`, `controls`, `view-selector`, `event-button`