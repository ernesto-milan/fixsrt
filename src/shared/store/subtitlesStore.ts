"use client";

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { SubtitleBlock } from "@/shared/types/subtitle";
import { transformSrtToSubtitles } from "@/shared/utils/srtParser";

type SubtitlesState = {
  originalSrtText: string | null;
  originalSubtitles: SubtitleBlock[];
  subtitles: SubtitleBlock[];
  timeRulesSnapshot: SubtitleBlock[] | null;
  subtitleFileName: string | null;
  loadSrtContent: (content: string, fileName?: string | null) => void;
  loadSubtitles: (
    subtitles: SubtitleBlock[],
    fileName?: string | null,
    originalSrtText?: string | null,
  ) => void;
  setSubtitles: (subtitles: SubtitleBlock[]) => void;
  setTimeRulesSnapshot: () => void;
  revertTimeRulesSnapshot: () => void;
  updateSubtitle: (id: string, updates: Partial<SubtitleBlock>) => void;
  resetToOriginal: () => void;
  setOriginalSrtText: (content: string | null) => void;
  setSubtitleFileName: (name: string | null) => void;
};

const storage =
  typeof window === "undefined"
    ? undefined
    : createJSONStorage<SubtitlesState>(() => window.localStorage);

export const useSubtitlesStore = create<SubtitlesState>()(
  devtools(
    persist(
      (set) => ({
        originalSrtText: null,
        originalSubtitles: [],
        subtitles: [],
        timeRulesSnapshot: null,
        subtitleFileName: null,
        loadSrtContent: (content, fileName = null) => {
          const subtitles = transformSrtToSubtitles(content);
          const baseline = subtitles.map((subtitle) => ({ ...subtitle }));
          const editable = subtitles.map((subtitle) => ({ ...subtitle }));
          set({
            originalSrtText: content,
            originalSubtitles: baseline,
            subtitles: editable,
            timeRulesSnapshot: null,
            subtitleFileName: fileName,
          });
        },
        loadSubtitles: (subtitles, fileName = null, originalSrtText = null) => {
          const baseline = subtitles.map((subtitle) => ({ ...subtitle }));
          const editable = subtitles.map((subtitle) => ({ ...subtitle }));
          set({
            originalSrtText,
            originalSubtitles: baseline,
            subtitles: editable,
            timeRulesSnapshot: null,
            subtitleFileName: fileName,
          });
        },
        setSubtitles: (subtitles) => set({ subtitles }),
        setTimeRulesSnapshot: () =>
          set((state) => ({
            timeRulesSnapshot: state.subtitles.map((subtitle) => ({ ...subtitle })),
          })),
        revertTimeRulesSnapshot: () =>
          set((state) => {
            if (!state.timeRulesSnapshot) return {};
            return {
              subtitles: state.timeRulesSnapshot.map((subtitle) => ({ ...subtitle })),
            };
          }),
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
        setOriginalSrtText: (content) => set({ originalSrtText: content }),
        setSubtitleFileName: (name) => set({ subtitleFileName: name }),
      }),
      {
        name: "fixsrt-subtitles",
        storage,
        version: 1,
        onRehydrateStorage: () => (state, error) => {
          if (process.env.NODE_ENV === "production") return;
          if (error) {
            console.error("FixSRT subtitles store failed to rehydrate.", error);
            return;
          }
          console.info("FixSRT subtitles store rehydrated.", {
            subtitleCount: state?.subtitles.length ?? 0,
            hasOriginalText: Boolean(state?.originalSrtText),
          });
        },
      },
    ),
    { name: "FixSRT/Subtitles", enabled: process.env.NODE_ENV !== "production" },
  ),
);
