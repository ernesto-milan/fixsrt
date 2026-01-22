"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Subtitle } from "@/shared/types/subtitle";

type SubtitlesState = {
  originalSubtitles: Subtitle[];
  subtitles: Subtitle[];
  subtitleFileName: string | null;
  loadSubtitles: (subtitles: Subtitle[], fileName?: string | null) => void;
  setSubtitles: (subtitles: Subtitle[]) => void;
  updateSubtitle: (id: string, updates: Partial<Subtitle>) => void;
  resetToOriginal: () => void;
  setSubtitleFileName: (name: string | null) => void;
};

const storage =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage<SubtitlesState>(() => window.localStorage);

export const useSubtitlesStore = create<SubtitlesState>()(
  persist(
    (set) => ({
      originalSubtitles: [],
      subtitles: [],
      subtitleFileName: null,
      loadSubtitles: (subtitles, fileName = null) => {
        const baseline = subtitles.map((subtitle) => ({ ...subtitle }));
        const editable = subtitles.map((subtitle) => ({ ...subtitle }));
        set({
          originalSubtitles: baseline,
          subtitles: editable,
          subtitleFileName: fileName,
        });
      },
      setSubtitles: (subtitles) => set({ subtitles }),
      updateSubtitle: (id, updates) =>
        set((state) => ({
          subtitles: state.subtitles.map((subtitle) =>
            subtitle.id === id ? { ...subtitle, ...updates } : subtitle,
          ),
        })),
      resetToOriginal: () =>
        set((state) => ({
          subtitles: state.originalSubtitles.map((subtitle) => ({ ...subtitle })),
        })),
      setSubtitleFileName: (name) => set({ subtitleFileName: name }),
    }),
    {
      name: "fixsrt-subtitles",
      storage,
      version: 1,
    },
  ),
);
