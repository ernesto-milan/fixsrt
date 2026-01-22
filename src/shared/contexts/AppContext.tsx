"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  Subtitle,
  VideoFile,
  RightPanelTab,
  PreferencesState,
  defaultPreferences,
} from "@/shared/types/subtitle";

interface AppContextType {
  // Subtitles
  subtitles: Subtitle[];
  setSubtitles: (subtitles: Subtitle[]) => void;
  selectedSubtitleId: string | null;
  setSelectedSubtitleId: (id: string | null) => void;
  updateSubtitle: (id: string, updates: Partial<Subtitle>) => void;
  
  // Video
  videoFile: VideoFile | null;
  setVideoFile: (file: VideoFile | null) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  
  // File names
  subtitleFileName: string | null;
  setSubtitleFileName: (name: string | null) => void;
  
  // UI State
  rightPanelTab: RightPanelTab;
  setRightPanelTab: (tab: RightPanelTab) => void;
  isPreferencesOpen: boolean;
  setIsPreferencesOpen: (open: boolean) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  
  // Preferences
  preferences: PreferencesState;
  updatePreferences: (updates: Partial<PreferencesState>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Subtitles state
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null);
  
  // Video state
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // File names
  const [subtitleFileName, setSubtitleFileName] = useState<string | null>(null);
  
  // UI State
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("preview");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Preferences
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences);

  useEffect(() => {
    const saved = window.localStorage.getItem("fixsrt-preferences");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Partial<PreferencesState>;
      setPreferences((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore malformed local storage data.
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    window.localStorage.setItem("fixsrt-preferences", JSON.stringify(preferences));
  }, [preferences]);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (preferences.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(preferences.theme);
    }
  }, [preferences.theme]);

  const updateSubtitle = useCallback((id: string, updates: Partial<Subtitle>) => {
    setSubtitles((prev) => prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)));
  }, []);

  const updatePreferences = useCallback((updates: Partial<PreferencesState>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <AppContext.Provider value={{
      subtitles,
      setSubtitles,
      selectedSubtitleId,
      setSelectedSubtitleId,
      updateSubtitle,
      videoFile,
      setVideoFile,
      currentTime,
      setCurrentTime,
      isPlaying,
      setIsPlaying,
      subtitleFileName,
      setSubtitleFileName,
      rightPanelTab,
      setRightPanelTab,
      isPreferencesOpen,
      setIsPreferencesOpen,
      isUploadModalOpen,
      setIsUploadModalOpen,
      isExportModalOpen,
      setIsExportModalOpen,
      preferences,
      updatePreferences,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
