export interface SubtitleBlock {
  id: string;
  index: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

export interface SubtitleFile {
  name: string;
  subtitles: SubtitleBlock[];
}

export interface VideoFile {
  name: string;
  url: string;
  duration: number; // in seconds
}

export type RightPanelTab = "preview" | "text-rules" | "time-rules";

export interface PreferencesState {
  theme: "light" | "dark" | "system";
  language: string;
  swapPanels: boolean;
  showIndex: boolean;
  showStartTime: boolean;
  showEndTime: boolean;
  showDuration: boolean;
  showTimelineNumber: boolean;
  showTimelineText: boolean;
  timelineMaxScale: number;
}

export const defaultPreferences: PreferencesState = {
  theme: "system",
  language: "en",
  swapPanels: false,
  showIndex: true,
  showStartTime: true,
  showEndTime: false,
  showDuration: true,
  showTimelineNumber: true,
  showTimelineText: false,
  timelineMaxScale: 30,
};
