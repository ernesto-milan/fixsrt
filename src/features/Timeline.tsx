"use client";

import { useRef, useCallback, useState, useEffect } from 'react';
import { useApp } from '@/shared/contexts/AppContext';
import { formatTimeDisplay } from '@/shared/utils/srtParser';
import { cn } from '@/shared/lib/utils';

export function Timeline() {
  const { 
    subtitles, 
    selectedSubtitleId, 
    setSelectedSubtitleId,
    updateSubtitle,
    currentTime,
    setCurrentTime,
    videoFile,
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; edge: 'start' | 'end' | 'move'; initialX: number; initialTime: number } | null>(null);

  // Calculate total duration
  const maxTime = Math.max(
    videoFile?.duration || 0,
    ...subtitles.map(s => s.endTime),
    60000 // Minimum 1 minute
  );

  // Pixels per millisecond
  const pxPerMs = containerRef.current ? containerRef.current.clientWidth / maxTime : 0.1;

  const getTimeFromX = useCallback((x: number): number => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = x - rect.left;
    return Math.max(0, Math.min(maxTime, relativeX / pxPerMs));
  }, [maxTime, pxPerMs]);

  // Handle drag
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newTime = getTimeFromX(e.clientX);
      const subtitle = subtitles.find(s => s.id === dragging.id);
      if (!subtitle) return;

      if (dragging.edge === 'start') {
        const newStart = Math.min(newTime, subtitle.endTime - 100);
        updateSubtitle(dragging.id, { startTime: Math.max(0, newStart) });
      } else if (dragging.edge === 'end') {
        const newEnd = Math.max(newTime, subtitle.startTime + 100);
        updateSubtitle(dragging.id, { endTime: newEnd });
      } else if (dragging.edge === 'move') {
        const delta = newTime - dragging.initialTime;
        const duration = subtitle.endTime - subtitle.startTime;
        const newStart = Math.max(0, subtitle.startTime + delta);
        updateSubtitle(dragging.id, { 
          startTime: newStart,
          endTime: newStart + duration 
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, subtitles, getTimeFromX, updateSubtitle]);

  // Handle click on timeline background
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      const time = getTimeFromX(e.clientX);
      setCurrentTime(time);
    }
  }, [getTimeFromX, setCurrentTime]);

  if (subtitles.length === 0) {
    return (
      <div className="h-20 bg-panel border-t flex items-center justify-center text-muted-foreground text-sm">
        Timeline will appear when subtitles are loaded
      </div>
    );
  }

  return (
    <div className="h-20 bg-panel border-t">
      {/* Time markers */}
      <div className="h-5 border-b flex items-end px-2 text-xs text-muted-foreground">
        {Array.from({ length: Math.ceil(maxTime / 10000) + 1 }, (_, i) => (
          <span 
            key={i} 
            className="absolute font-mono"
            style={{ left: `${(i * 10000) * pxPerMs}px` }}
          >
            {formatTimeDisplay(i * 10000)}
          </span>
        ))}
      </div>

      {/* Timeline blocks */}
      <div 
        ref={containerRef}
        className="h-14 relative cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Current time indicator */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 pointer-events-none"
          style={{ left: `${currentTime * pxPerMs}px` }}
        />

        {/* Subtitle blocks */}
        {subtitles.map((subtitle) => {
          const left = subtitle.startTime * pxPerMs;
          const width = (subtitle.endTime - subtitle.startTime) * pxPerMs;
          const isSelected = subtitle.id === selectedSubtitleId;

          return (
            <div
              key={subtitle.id}
              className={cn(
                "absolute top-2 h-10 rounded cursor-pointer transition-colors",
                isSelected 
                  ? "bg-timeline-block-active ring-2 ring-primary ring-offset-1" 
                  : "bg-timeline-block hover:bg-timeline-block-active/80"
              )}
              style={{ left: `${left}px`, width: `${Math.max(width, 4)}px` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSubtitleId(subtitle.id);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedSubtitleId(subtitle.id);
                setDragging({ 
                  id: subtitle.id, 
                  edge: 'move', 
                  initialX: e.clientX,
                  initialTime: getTimeFromX(e.clientX)
                });
              }}
            >
              {/* Resize handles */}
              <div
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDragging({ 
                    id: subtitle.id, 
                    edge: 'start', 
                    initialX: e.clientX,
                    initialTime: getTimeFromX(e.clientX)
                  });
                }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDragging({ 
                    id: subtitle.id, 
                    edge: 'end', 
                    initialX: e.clientX,
                    initialTime: getTimeFromX(e.clientX)
                  });
                }}
              />
              
              {/* Block content */}
              <div className="px-2 py-1 truncate text-xs text-primary-foreground">
                {subtitle.text.substring(0, 20)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
