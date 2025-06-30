// Type definitions for calendar component slots

export type CalendarView = "month" | "week" | "day";

// Type definitions for slot props
export interface NavigationSlotProps {
  currentDate: Date;
  currentView: CalendarView;
  setView: (view: CalendarView) => void;
  previousPeriod: () => void;
  nextPeriod: () => void;
  headerDate: string;
}

export interface ControlsSlotProps {
  currentDate: Date;
  currentView: CalendarView;
  setView: (view: CalendarView) => void;
  timeFormat: "12h" | "24h";
  toggleNewEventForm: () => void;
}

export interface ViewSelectorSlotProps {
  currentView: CalendarView;
  setView: (view: CalendarView) => void;
  currentDate: Date;
}

export interface EventButtonSlotProps {
  toggleNewEventForm: () => void;
  currentDate: Date;
} 