# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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