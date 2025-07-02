# v1.2.1 - Click to Create Events & Enhanced UX

## What's New in v1.2.1

### ✨ New Features
- **Click to Create Events** - Click on empty space in any calendar view to create a new event
  - Month view: Click on date cells to create events at 9 AM on that date
  - Week/Day view: Click on time slots to create events at the clicked time (rounded to nearest 5 minutes)
  - All new events default to 1-hour duration
- **Time rounding utility** - Added automatic time rounding to nearest 5-minute intervals
- **Enhanced demo experience** - Added comprehensive "Try it out!" sections for all demo examples
- **Project links in demo** - Added links to npm, CI/CD, license, coverage, and GitHub repository
- **Kodeglot branding** - Added company branding to demo headers and page titles

### 🔧 Improvements
- **Development server with styles** - `npm run dev` now includes Tailwind CSS and works like the demo
- **Month view visual hierarchy** - Added gray background for dates from previous/next months
- **Event spacing** - Reduced spacing between events on the same day in month view
- **Demo modal responsiveness** - Fixed modal sizing with fixed headers/footers and scrollable content

### 🐛 Bug Fixes
- **Month view event click reliability** - Fixed issue where clicking events in month view would not reliably emit click events
- **Week view date accuracy** - Fixed issue where clicking in week view would use current date instead of the clicked date
- **Month view visual hierarchy** - Fixed event layout so events appear below day numbers instead of overlapping

### 📦 Technical Changes
- **Event interaction logic** - Improved event click handling in month view
- **TimeGridComponent** - Added `baseDate` prop for correct date calculation
- **Development experience** - Updated main Vite config to include Tailwind CSS

---
**Release Date:** 2025-07-02 