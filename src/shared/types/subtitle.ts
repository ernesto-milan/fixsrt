export interface Subtitle {
  id: string;
  index: number;
  startTime: number; // in milliseconds
  endTime: number; // in milliseconds
  text: string;
}

export interface SubtitleFile {
  name: string;
  subtitles: Subtitle[];
}

export interface VideoFile {
  name: string;
  url: string;
  duration: number;
}

export type RightPanelTab = 'preview' | 'text-rules' | 'time-rules';

export interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  swapPanels: boolean;
  showIndex: boolean;
  showStartTime: boolean;
  showEndTime: boolean;
  showDuration: boolean;
}

export const defaultPreferences: PreferencesState = {
  theme: 'system',
  language: 'en',
  swapPanels: false,
  showIndex: true,
  showStartTime: true,
  showEndTime: false,
  showDuration: true,
};
