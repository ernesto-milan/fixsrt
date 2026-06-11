"use client";

import { useMemo } from "react";
import { formatTimeDisplay, getDuration } from "@/shared/utils/srtParser";
import { getSubtitleHealth, type CueHealth } from "@/shared/utils/subtitleHealth";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useUiStore } from "@/shared/store/uiStore";

const healthDotClass: Record<CueHealth, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const healthLabel: Record<CueHealth, string> = {
  ok: "Clean cue",
  warning: "Tight timing",
  danger: "Overlap",
};

export function SubtitleList() {
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const selectedSubtitleId = useUiStore((state) => state.selectedSubtitleId);
  const setSelectedSubtitleId = useUiStore((state) => state.setSelectedSubtitleId);
  const preferences = useUiStore((state) => state.preferences);
  const currentTime = useUiStore((state) => state.currentTime);

  // Find subtitle that matches current time
  const activeSubtitleId = subtitles.find(
    (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime,
  )?.id;

  const health = useMemo(() => getSubtitleHealth(subtitles), [subtitles]);

  if (subtitles.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
        No subtitles loaded
      </div>
    );
  }

  return (
    <ScrollArea type="always" className="min-h-0 flex-1 scrollbar-thin">
      <div className="space-y-0.5 p-1.5">
        {subtitles.map((subtitle) => {
          const isSelected = subtitle.id === selectedSubtitleId;
          const isActive = subtitle.id === activeSubtitleId;
          const status = health[subtitle.id] ?? "ok";

          return (
            <button
              key={subtitle.id}
              onClick={() => setSelectedSubtitleId(subtitle.id)}
              className={cn(
                "w-full rounded-md border border-transparent p-2 text-left transition-colors",
                "hover:bg-surface",
                isActive && !isSelected && "border-accent/15 bg-accent/5",
                isSelected && "border-accent/40 bg-accent-soft",
              )}
            >
              <div className="flex items-start gap-2">
                {preferences.showIndex && (
                  <span className="min-w-[2rem] font-mono text-xs text-faint">
                    #{String(subtitle.index).padStart(2, "0")}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-sm leading-snug">{subtitle.text}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 font-mono text-2xs text-muted-foreground">
                    {preferences.showStartTime && (
                      <span>{formatTimeDisplay(subtitle.startTime)}</span>
                    )}
                    {preferences.showStartTime && preferences.showEndTime && (
                      <span className="text-faint">→</span>
                    )}
                    {preferences.showEndTime && (
                      <span>{formatTimeDisplay(subtitle.endTime)}</span>
                    )}
                    {preferences.showDuration && (
                      <span className="text-accent">
                        ({getDuration(subtitle.startTime, subtitle.endTime)})
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn("mt-1 size-2 shrink-0 rounded-full", healthDotClass[status])}
                  title={healthLabel[status]}
                  aria-label={healthLabel[status]}
                />
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
