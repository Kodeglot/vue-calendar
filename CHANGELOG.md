# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2025-06-30

### Added
- **Custom controls/navigation slots**: You can now fully customize the calendar's navigation, view selector, and event creation button using named slots (`navigation`, `controls`, `view-selector`, `event-button`).
- **TypeScript slot prop interfaces**: All slot props are strictly typed and exported for use in TypeScript projects.

### Fixed
- **Custom view selector bug**: Added a `setView(view)` function to slot props so custom controls can change the calendar view correctly.

### Changed
- **README and demo**: Updated with clear examples for using the new slot API and `setView` function.

## [1.0.5] - 2025-06-30

### Fixed
- **Tailwind CSS packaging** - Fixed issue where Tailwind styles were not properly included in the package
- **Build system reliability** - Replaced standalone Tailwind CLI dependency with Vite + PostCSS processing
- **CSS import requirements** - Added proper CSS exports and import instructions for consumers
- **Dynamic class inclusion** - Enhanced Tailwind safelist to ensure all dynamic classes are included in the build

### Changed
- **Build process** - Now uses Vite + PostCSS instead of standalone Tailwind CLI for more reliable builds
- **Package exports** - Added `./style.css` export for easier CSS imports
- **Documentation** - Updated README with clear CSS import instructions and troubleshooting guide
- **Tailwind configuration** - Enhanced safelist to include all necessary utility classes used by components

### Added
- **PostCSS configuration** - Added `postcss.config.js` for proper Tailwind CSS processing
- **Troubleshooting guide** - Added comprehensive troubleshooting section in README
- **Alternative import paths** - Documented multiple ways to import CSS for different bundler configurations

### Technical Improvements
- **Self-contained builds** - No longer depends on external Tailwind CLI binaries
- **Better error handling** - Clear error messages when CSS is not imported
- **Improved developer experience** - More reliable build process and clearer documentation

## [1.0.0] - 2025-01-27

### Added
- **Configurable time format support** - Choose between 12-hour (AM/PM) and 24-hour formats
- **Timezone-aware date handling** - ISO storage with localized display using date-fns-tz
- **Library build configuration** - Proper npm package distribution with ES modules and UMD builds
- **Interactive demo page** - Live demo with time format selector and sample events
- **Enhanced drag and drop** - Fixed horizontal and vertical movement in week view
- **Sample events** - Pre-populated events for testing and demonstration
- **Comprehensive timezone utilities** - useTimezone composable for date conversions
- **Plugin system** - Extensible architecture for calendar functionality
- **Advanced event positioning** - Improved stacking algorithms with width/left properties
- **Standalone demo and new demo files** - Added `demo/App.vue`, `demo/main.js`, and `demo/standalone.html` for improved demo and standalone usage
- **Configurable calendar height** - New `height` prop for `CalendarView` allows setting custom calendar height (e.g., `600px`, `8vh`, `100%`)

### Changed
- **Default time format** - Now defaults to 24-hour format with option to switch to 12-hour
- **Drag and drop behavior** - Improved coordinate system and position calculations
- **Event positioning** - Uses timezone-aware calculations for accurate visual placement
- **Build system** - Separate Vite configs for library, demo, and types
- **Package exports** - Proper entry points for ES modules and CommonJS
- **Documentation** - Updated README with time format examples and API reference
- **Sticky headers** - Day and month headers are now sticky for improved navigation in calendar views
- **Vite config improvements** - Added alias support, improved file naming, and set publicDir for demo builds

### Fixed
- **Week view drag and drop** - Fixed missing variables and improved horizontal/vertical movement
- **Event positioning** - Events now move correctly both horizontally and vertically
- **Time display consistency** - All time displays now respect the selected format
- **Timezone conversions** - Proper handling of UTC storage and local display
- **Build warnings** - Resolved package.json export condition warnings
- **Timezone composable cleanup** - Removed unused nowUTC computed and related export

### Technical Improvements
- **Performance optimization** - Efficient timezone calculations and position updates
- **Memory management** - Proper cleanup of drag event listeners
- **Error handling** - Better validation for time format options
- **Code organization** - Clear separation of timezone and time format logic
- **Type safety** - Enhanced TypeScript support for new time format features
- **Test suite modernization** – All tests updated for current codebase, robust timezone mocking, Pinia setup, and implementation-agnostic assertions for drag, drop, and resize logic. Improved reliability and coverage for all core features.

## [0.2.0] - 2025-01-15

### Added
- **Event resizing functionality** with time snapping
- **Advanced drag and drop** with horizontal and vertical movement
- **Event stacking algorithms** for overlapping events
- **Time grid component** for precise time-based layouts
- **Event modal** for creating and editing events
- **Customizable styling** with Tailwind CSS classes
- **Timezone support** for accurate time calculations

### Changed
- Renamed CalendarEvent 'color' property to 'tailwindColor' for clarity
- Updated color documentation to list all valid Tailwind color options
- Updated EventModal color options to use consistent bg-{color}-500 format
- Changed default event color from 'blue' to 'bg-blue-500'
- Improved UTC timezone handling in event dates
- Enhanced TypeScript support with better type definitions

### Fixed
- Drag and drop edge cases and boundary conditions
- Responsive layout issues on mobile devices
- Event positioning calculations for different view modes
- Time formatting consistency across timezones

## [0.1.0] - 2024-12-01

### Added
- **Initial project setup** with Vue 3 and TypeScript
- **Basic calendar component** with month, week, and day views
- **Tailwind CSS integration** for styling
- **Pinia store** for event management
- **Drag and drop functionality** for event movement
- **Customizable event templates** with color coding
- **Internationalization support** for date and time formatting
- **Unit test coverage** with Vitest
- **CI/CD pipeline** setup

### Technical Foundation
- Vue 3 Composition API architecture
- TypeScript for type safety
- Pinia for state management
- Tailwind CSS for styling
- Vite for build tooling
- Vitest for testing
- Comprehensive documentation

## [0.0.1] - 2024-11-15

### Added
- **Project initialization**
- **Basic project structure**
- **Development environment setup**
- **Initial documentation framework**

---

## Version History Summary

### Current Status (v1.0.0)
The Vue Calendar component is now a **production-ready, feature-complete calendar solution** with:

- ✅ **Three view modes** (month, week, day)
- ✅ **Full drag and drop support** with time snapping
- ✅ **Event resizing** capabilities
- ✅ **22 customizable colors** using Tailwind
- ✅ **Responsive design** for all devices
- ✅ **TypeScript support** with full type definitions
- ✅ **Comprehensive testing** with good coverage
- ✅ **Plugin architecture** for extensibility
- ✅ **Accessibility features** with ARIA support
- ✅ **Configurable time formats** (12h/24h)
- ✅ **Timezone-aware date handling**
- ✅ **Library build system** for npm distribution
- ✅ **NPM package** - Published as @kodeglot/vue-calendar

### Planned for Next Release (v1.1.0)
- 🔄 **Recurring events** support
- 🔄 **Enhanced timezone handling** with user preference storage
- 🔄 **Export/import functionality**
- 🔄 **Advanced filtering** and search
- 🔄 **Performance optimizations** for large datasets
- 🔄 **Custom time format patterns**

### Future Roadmap (v2.0.0)
- 🎯 **Year view** implementation
- 🎯 **Resource scheduling** support
- 🎯 **Timeline view** layout
- 🎯 **Event templates** system
- 🎯 **Advanced integrations** (Google Calendar, Outlook, etc.)
- 🎯 **Multi-language support** with i18n
