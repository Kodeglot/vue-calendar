# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Renamed CalendarEvent 'color' property to 'tailwindColor' for clarity
- Updated color documentation to list all valid Tailwind color options
- Updated EventModal color options to use consistent bg-{color}-500 format
- Changed default event color from 'blue' to 'bg-blue-500'

### Added
- Initial project setup
- Basic calendar component with month, week, and day views
- Tailwind CSS integration
- Pinia store for event management
- Drag and drop functionality
- Customizable event templates
- Internationalization support

### Changed
- Improved README documentation
- Enhanced TypeScript support
- Optimized performance for large event sets

### Fixed
- Improved UTC timezone handling in event dates
- Drag and drop edge cases
- Responsive layout issues

## [1.0.0] - 2025-03-24

### Added
- Initial release of Vue Calendar
- Complete documentation
- Example implementations
- Unit test coverage
- CI/CD pipeline
