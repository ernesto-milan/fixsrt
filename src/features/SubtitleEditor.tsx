"use client";

import { useEffect, useState } from 'react';
import { useApp } from '@/shared/contexts/AppContext';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { formatTimeDisplay } from "@/shared/utils/srtParser";

export function SubtitleEditor() {
  const { subtitles, selectedSubtitleId, updateSubtitle } = useApp();
  
  const selectedSubtitle = subtitles.find(s => s.id === selectedSubtitleId);
  
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (selectedSubtitle) {
      setStartTime(formatTimeDisplay(selectedSubtitle.startTime));
      setEndTime(formatTimeDisplay(selectedSubtitle.endTime));
      setText(selectedSubtitle.text);
    } else {
      setStartTime('');
      setEndTime('');
      setText('');
    }
  }, [selectedSubtitle]);

  const handleTextChange = (value: string) => {
    setText(value);
    if (selectedSubtitleId) {
      updateSubtitle(selectedSubtitleId, { text: value });
    }
  };

  // Parse time input like "1:23.45" to milliseconds
  const parseDisplayTime = (input: string): number | null => {
    const match = input.match(/^(\d+):(\d{1,2})\.(\d{1,2})$/);
    if (!match) return null;
    const [, min, sec, cs] = match;
    return parseInt(min) * 60000 + parseInt(sec) * 1000 + parseInt(cs.padEnd(2, '0')) * 10;
  };

  const handleStartTimeBlur = () => {
    const ms = parseDisplayTime(startTime);
    if (ms !== null && selectedSubtitleId) {
      updateSubtitle(selectedSubtitleId, { startTime: ms });
    } else if (selectedSubtitle) {
      setStartTime(formatTimeDisplay(selectedSubtitle.startTime));
    }
  };

  const handleEndTimeBlur = () => {
    const ms = parseDisplayTime(endTime);
    if (ms !== null && selectedSubtitleId) {
      updateSubtitle(selectedSubtitleId, { endTime: ms });
    } else if (selectedSubtitle) {
      setEndTime(formatTimeDisplay(selectedSubtitle.endTime));
    }
  };

  if (!selectedSubtitle) {
    return (
      <div className="p-4 border-t bg-panel">
        <p className="text-sm text-muted-foreground text-center">
          Select a subtitle to edit
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t bg-panel space-y-4">
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
}
