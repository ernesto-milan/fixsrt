"use client";

import { Badge } from "@/shared/ui/badge";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { SubtitleList } from "./SubtitleList";
import { SubtitleEditor } from "./SubtitleEditor";

export function LeftPanel() {
  const subtitlesCount = useSubtitlesStore((state) => state.subtitles.length);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-r bg-panel">
      <div className="flex h-10 shrink-0 items-center justify-between border-b px-3">
        <h2 className="text-base font-semibold">Subtitles</h2>
        <Badge variant="accent" className="font-mono">
          {subtitlesCount} cues
        </Badge>
      </div>
      <SubtitleList />
      <SubtitleEditor />
    </div>
  );
}
