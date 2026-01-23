"use client";

import { useEffect, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { formatTimeDisplay } from "@/shared/utils/srtParser";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useUiStore } from "@/shared/store/uiStore";

export function SubtitleEditor() {
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const updateSubtitle = useSubtitlesStore((state) => state.updateSubtitle);
  const selectedSubtitleId = useUiStore((state) => state.selectedSubtitleId);

  const selectedSubtitle = subtitles.find((subtitle) => subtitle.id === selectedSubtitleId);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (selectedSubtitle) {
      setStartTime(formatTimeDisplay(selectedSubtitle.startTime));
      setEndTime(formatTimeDisplay(selectedSubtitle.endTime));
      setText(selectedSubtitle.text);
    } else {
      setStartTime("");
      setEndTime("");
      setText("");
    }
  }, [selectedSubtitle]);

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

  const editorFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start-time" className="text-xs">Start Time</Label>
          <Input
            id="start-time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            onBlur={handleStartTimeBlur}
            className="font-mono text-sm h-9"
            placeholder="0:00.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-time" className="text-xs">End Time</Label>
          <Input
            id="end-time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            onBlur={handleEndTimeBlur}
            className="font-mono text-sm h-9"
            placeholder="0:00.00"
          />
        </div>
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="subtitle-text" className="text-xs">Text</Label>
        <Textarea
          id="subtitle-text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="min-h-[80px] text-sm resize-none"
          placeholder="Subtitle text..."
        />
      </div>
    </div>
  );

  if (!selectedSubtitle) {
    return (
      <div className="p-4 border-t bg-panel relative">
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
    <div className="p-4 border-t bg-panel">
      {editorFields}
    </div>
  );
}
