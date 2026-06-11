"use client";

import { useMemo, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { formatTimeDisplay } from "@/shared/utils/srtParser";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useUiStore } from "@/shared/store/uiStore";
import { getSubtitleGaps } from "@/shared/utils/subtitleGaps";

export function SubtitleEditor() {
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const updateSubtitle = useSubtitlesStore((state) => state.updateSubtitle);
  const selectedSubtitleId = useUiStore((state) => state.selectedSubtitleId);
  const selectedGapId = useUiStore((state) => state.selectedGapId);

  const selectedSubtitle = subtitles.find((subtitle) => subtitle.id === selectedSubtitleId);
  const selectedGap = useMemo(() => {
    if (!selectedGapId) return null;
    return getSubtitleGaps(subtitles).find((gap) => gap.id === selectedGapId) ?? null;
  }, [selectedGapId, subtitles]);

  const [startTime, setStartTime] = useState(() =>
    selectedSubtitle ? formatTimeDisplay(selectedSubtitle.startTime) : "",
  );
  const [endTime, setEndTime] = useState(() =>
    selectedSubtitle ? formatTimeDisplay(selectedSubtitle.endTime) : "",
  );
  const [text, setText] = useState(() => selectedSubtitle?.text ?? "");

  // Re-sync the form fields whenever the selected subtitle changes (including
  // when its times are updated elsewhere, e.g. by dragging on the timeline).
  const [prevSelected, setPrevSelected] = useState(selectedSubtitle);
  if (selectedSubtitle !== prevSelected) {
    setPrevSelected(selectedSubtitle);
    setStartTime(selectedSubtitle ? formatTimeDisplay(selectedSubtitle.startTime) : "");
    setEndTime(selectedSubtitle ? formatTimeDisplay(selectedSubtitle.endTime) : "");
    setText(selectedSubtitle?.text ?? "");
  }

  const handleTextChange = (value: string) => {
    setText(value);
    if (selectedSubtitleId) {
      updateSubtitle(selectedSubtitleId, { text: value });
    }
  };

  // Parse time input like "1:23.45" to seconds.
  const parseDisplayTime = (input: string): number | null => {
    const match = input.match(/^(\d+):(\d{1,2})\.(\d{1,2})$/);
    if (!match) return null;
    const [, min, sec, cs] = match;
    return parseInt(min, 10) * 60 + parseInt(sec, 10) + parseInt(cs.padEnd(2, "0"), 10) / 100;
  };

  const handleStartTimeBlur = () => {
    const seconds = parseDisplayTime(startTime);
    if (seconds !== null && selectedSubtitleId) {
      updateSubtitle(selectedSubtitleId, { startTime: seconds });
    } else if (selectedSubtitle) {
      setStartTime(formatTimeDisplay(selectedSubtitle.startTime));
    }
  };

  const handleEndTimeBlur = () => {
    const seconds = parseDisplayTime(endTime);
    if (seconds !== null && selectedSubtitleId) {
      updateSubtitle(selectedSubtitleId, { endTime: seconds });
    } else if (selectedSubtitle) {
      setEndTime(formatTimeDisplay(selectedSubtitle.endTime));
    }
  };

  const timeFields = (
    <div className="flex flex-col gap-1 w-[150px]">
      <div className="flex items-center gap-2">
        <Label htmlFor="start-time" className="text-xs w-12 text-right">
          Start
        </Label>
        <Input
          id="start-time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          onBlur={handleStartTimeBlur}
          className="font-mono text-sm h-7 min-w-[110px]"
          placeholder="0:00.00"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="end-time" className="text-xs w-12 text-right">
          End
        </Label>
        <Input
          id="end-time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          onBlur={handleEndTimeBlur}
          className="font-mono text-sm h-7 min-w-[110px]"
          placeholder="0:00.00"
        />
      </div>
    </div>
  );

  const editorFields = (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">{timeFields}</div>
      <Textarea
        id="subtitle-text"
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        className="min-h-[60px] text-sm resize-none flex-1 min-w-0"
        placeholder="Subtitle text..."
      />
    </div>
  );

  if (!selectedSubtitle && selectedGap) {
    const gapDuration = Math.max(0, selectedGap.end - selectedGap.start);
    return (
      <div className="border-t bg-card px-2.5 py-2.5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex flex-col gap-1 w-[150px]">
              <div className="flex items-center gap-2">
                <Label htmlFor="gap-start" className="text-xs w-12 text-right">
                  Start
                </Label>
                <Input
                  id="gap-start"
                  value={formatTimeDisplay(selectedGap.start)}
                  className="font-mono text-sm h-7 min-w-[110px]"
                  disabled
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="gap-end" className="text-xs w-12 text-right">
                  End
                </Label>
                <Input
                  id="gap-end"
                  value={formatTimeDisplay(selectedGap.end)}
                  className="font-mono text-sm h-7 min-w-[110px]"
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Label htmlFor="gap-duration" className="text-xs w-16 text-right">
              Length
            </Label>
            <Input
              id="gap-duration"
              value={formatTimeDisplay(gapDuration)}
              className="font-mono text-sm h-7 min-w-[110px]"
              disabled
            />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSubtitle) {
    return (
      <div className="relative border-t bg-card px-2.5 py-2.5">
        <div className="opacity-0 pointer-events-none">
          {editorFields}
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <p className="text-sm text-muted-foreground text-center">
            Select a subtitle to edit
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t bg-card px-2.5 py-2.5">
      {editorFields}
    </div>
  );
}
