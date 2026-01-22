"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PreferencesState, RightPanelTab, VideoFile } from "@/shared/types/subtitle";
import { defaultPreferences } from "@/shared/types/subtitle";

type UiState = {
  selectedSubtitleId: string | null;
  rightPanelTab: RightPanelTab;
  isPreferencesOpen: boolean;
  isUploadModalOpen: boolean;
  isExportModalOpen: boolean;
  preferences: PreferencesState;
  videoFile: VideoFile | null;
  currentTime: number;
  isPlaying: boolean;
  setSelectedSubtitleId: (id: string | null) => void;
  setRightPanelTab: (tab: RightPanelTab) => void;
  setIsPreferencesOpen: (open: boolean) => void;
  setIsUploadModalOpen: (open: boolean) => void;
  setIsExportModalOpen: (open: boolean) => void;
  updatePreferences: (updates: Partial<PreferencesState>) => void;
  setVideoFile: (file: VideoFile | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
};

const storage =
  typeof window === "undefined" ? undefined : createJSONStorage<UiState>(() => window.localStorage);

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      selectedSubtitleId: null,
      rightPanelTab: "preview",
      isPreferencesOpen: false,
      isUploadModalOpen: false,
      isExportModalOpen: false,
      preferences: { ...defaultPreferences },
      videoFile: null,
      currentTime: 0,
      isPlaying: false,
      setSelectedSubtitleId: (id) => set({ selectedSubtitleId: id }),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
      setIsPreferencesOpen: (open) => set({ isPreferencesOpen: open }),
      setIsUploadModalOpen: (open) => set({ isUploadModalOpen: open }),
      setIsExportModalOpen: (open) => set({ isExportModalOpen: open }),
      updatePreferences: (updates) =>
        set((state) => ({ preferences: { ...state.preferences, ...updates } })),
      setVideoFile: (file) => set({ videoFile: file }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
    }),
    {
      name: "fixsrt-ui",
      storage,
      version: 1,
      partialize: (state) => ({
        preferences: {
          theme: state.preferences.theme,
          language: state.preferences.language,
        },
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<UiState>;
        return {
          ...current,
          ...persistedState,
          preferences: {
            ...current.preferences,
            ...persistedState.preferences,
          },
        };
      },
    },
  ),
);
