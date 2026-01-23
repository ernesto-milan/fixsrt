"use client";

import { formatTimeDisplay, getDuration } from "@/shared/utils/srtParser";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useUiStore } from "@/shared/store/uiStore";

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

  if (subtitles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No subtitles loaded
      </div>
    );
  }

  return (
    <ScrollArea type="always" className="flex-1 min-h-0 scrollbar-thin">
      <div className="p-2 space-y-1">
        {subtitles.map((subtitle) => {
          const isSelected = subtitle.id === selectedSubtitleId;
          const isActive = subtitle.id === activeSubtitleId;
          
          return (
            <button
              key={subtitle.id}
              onClick={() => setSelectedSubtitleId(subtitle.id)}
              className={cn(
                "w-full text-left p-3 rounded-md transition-colors",
                "hover:bg-muted/50",
                isSelected && "bg-highlight border border-primary/20",
                isActive && !isSelected && "bg-primary/5 border border-primary/10"
              )}
            >
              <div className="flex items-start gap-2">
                {preferences.showIndex && (
                  <span className="text-xs text-muted-foreground font-mono min-w-[2rem]">
                    #{subtitle.index}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-wrap">{subtitle.text}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    {preferences.showStartTime && (
                      <span className="font-mono">{formatTimeDisplay(subtitle.startTime)}</span>
                    )}
                    {preferences.showStartTime && preferences.showEndTime && (
                      <span>→</span>
                    )}
                    {preferences.showEndTime && (
                      <span className="font-mono">{formatTimeDisplay(subtitle.endTime)}</span>
                    )}
                    {preferences.showDuration && (
                      <span className="text-primary/70">
                        ({getDuration(subtitle.startTime, subtitle.endTime)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
