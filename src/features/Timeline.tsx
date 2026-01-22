"use client";

import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { FoldHorizontal, Minus, Plus, Search, UnfoldHorizontal, Waves } from "lucide-react";
import { formatTimeDisplay } from "@/shared/utils/srtParser";
import { cn } from "@/shared/lib/utils";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useUiStore } from "@/shared/store/uiStore";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Slider } from "@/shared/ui/slider";
import type { SubtitleBlock } from "@/shared/types/subtitle";

type DragMode = "move" | "start" | "end";

type DragTarget = {
  mode: DragMode;
  subtitleId: string;
};

type DragState = DragTarget & {
  startTime: number;
  endTime: number;
};

type TimelineBlockProps = {
  subtitle: SubtitleBlock;
  left: number;
  width: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

const parseDragId = (id: string): DragTarget | null => {
  const [mode, subtitleId] = id.split("::");
  if (!subtitleId) return null;
  if (mode !== "move" && mode !== "start" && mode !== "end") return null;
  return { mode, subtitleId } as DragTarget;
};

function TimelineBlock({ subtitle, left, width, isSelected, onSelect }: TimelineBlockProps) {
  const move = useDraggable({ id: `move::${subtitle.id}` });
  const start = useDraggable({ id: `start::${subtitle.id}` });
  const end = useDraggable({ id: `end::${subtitle.id}` });

  const handleMovePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-drag-handle="true"]')) return;
    onSelect(subtitle.id);
    move.listeners?.onPointerDown?.(event);
  };

  const handleStartPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(subtitle.id);
    start.listeners?.onPointerDown?.(event);
  };

  const handleEndPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(subtitle.id);
    end.listeners?.onPointerDown?.(event);
  };

  return (
    <div
      ref={move.setNodeRef}
      className={cn(
        "absolute top-3 h-24 rounded cursor-pointer transition-colors",
        isSelected
          ? "bg-timeline-block-active ring-2 ring-primary ring-offset-1"
          : "bg-timeline-block hover:bg-timeline-block-active/80",
      )}
      style={{ left: `${left}px`, width: `${Math.max(width, 4)}px` }}
      {...move.attributes}
      {...move.listeners}
      onPointerDown={handleMovePointerDown}
    >
      <div
        ref={start.setNodeRef}
        data-drag-handle="true"
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
        {...start.attributes}
        {...start.listeners}
        onPointerDown={handleStartPointerDown}
      />
      <div
        ref={end.setNodeRef}
        data-drag-handle="true"
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
        {...end.attributes}
        {...end.listeners}
        onPointerDown={handleEndPointerDown}
      />

      <div className="px-2 py-1 truncate text-xs text-primary-foreground">
        {subtitle.index}
      </div>
    </div>
  );
}

export function Timeline() {
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const updateSubtitle = useSubtitlesStore((state) => state.updateSubtitle);
  const selectedSubtitleId = useUiStore((state) => state.selectedSubtitleId);
  const setSelectedSubtitleId = useUiStore((state) => state.setSelectedSubtitleId);
  const selectedGapId = useUiStore((state) => state.selectedGapId);
  const setSelectedGapId = useUiStore((state) => state.setSelectedGapId);
  const currentTime = useUiStore((state) => state.currentTime);
  const setCurrentTime = useUiStore((state) => state.setCurrentTime);
  const videoFile = useUiStore((state) => state.videoFile);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [secondsPerUnit, setSecondsPerUnit] = useState(10);
  const dragStateRef = useRef<DragState | null>(null);

  // Calculate total duration (seconds).
  const maxTime = Math.max(
    videoFile?.duration || 0,
    ...subtitles.map((subtitle) => subtitle.endTime),
    60, // Minimum 1 minute
  );

  const unitCount = 10;
  const visibleSeconds = unitCount * secondsPerUnit;
  const pxPerSecond = viewportWidth > 0 ? viewportWidth / visibleSeconds : 0.1;
  const trackWidth = Math.max(viewportWidth, maxTime * pxPerSecond);
  const markerCount = Math.ceil(maxTime / secondsPerUnit) + 1;

  const gaps = useMemo(() => {
    const ordered = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    const result: { id: string; start: number; end: number }[] = [];
    for (let i = 0; i < ordered.length - 1; i += 1) {
      const start = ordered[i].endTime;
      const end = ordered[i + 1].startTime;
      if (end <= start) continue;
      result.push({
        id: `gap-${i}-${Math.round(start * 1000)}-${Math.round(end * 1000)}`,
        start,
        end,
      });
    }
    return result;
  }, [subtitles]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
  );
  const playheadDragRef = useRef<{ startX: number; startTime: number; pointerId: number } | null>(
    null,
  );

  useEffect(() => {
    if (!scrollViewportRef.current) return;
    const viewport = scrollViewportRef.current;
    const updateWidth = () => {
      setViewportWidth(viewport.clientWidth || 0);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [subtitles.length]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragTarget = parseDragId(String(event.active.id));
    if (!dragTarget) return;
    const subtitle = subtitles.find((item) => item.id === dragTarget.subtitleId);
    if (!subtitle) return;
    dragStateRef.current = {
      ...dragTarget,
      startTime: subtitle.startTime,
      endTime: subtitle.endTime,
    };
    setSelectedSubtitleId(subtitle.id);
  }, [setSelectedSubtitleId, subtitles]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!dragStateRef.current || pxPerSecond <= 0) return;
    const deltaSeconds = event.delta.x / pxPerSecond;
    const { subtitleId, mode, startTime, endTime } = dragStateRef.current;

    if (mode === "start") {
      const nextStart = Math.min(endTime - 0.1, Math.max(0, startTime + deltaSeconds));
      updateSubtitle(subtitleId, { startTime: nextStart });
      return;
    }

    if (mode === "end") {
      const nextEnd = Math.max(startTime + 0.1, endTime + deltaSeconds);
      updateSubtitle(subtitleId, { endTime: nextEnd });
      return;
    }

    const duration = endTime - startTime;
    const nextStart = Math.max(0, startTime + deltaSeconds);
    updateSubtitle(subtitleId, { startTime: nextStart, endTime: nextStart + duration });
  }, [pxPerSecond, updateSubtitle]);

  const handleDragEnd = useCallback((_event: DragEndEvent) => {
    dragStateRef.current = null;
  }, []);

  const handlePlayheadPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pxPerSecond <= 0) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      playheadDragRef.current = {
        startX: event.clientX,
        startTime: currentTime,
        pointerId: event.pointerId,
      };
    },
    [currentTime, pxPerSecond],
  );

  const handlePlayheadPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = playheadDragRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId || pxPerSecond <= 0) return;
      const deltaSeconds = (event.clientX - dragState.startX) / pxPerSecond;
      const nextTime = Math.max(0, Math.min(maxTime, dragState.startTime + deltaSeconds));
      setCurrentTime(nextTime);
    },
    [maxTime, pxPerSecond, setCurrentTime],
  );

  const handlePlayheadPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = playheadDragRef.current;
    if (dragState && dragState.pointerId === event.pointerId) {
      playheadDragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div className="bg-panel border-t overflow-hidden mb-8 mx-4">
      <div className="flex items-center justify-center px-3 py-2 border-b text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <UnfoldHorizontal className="h-5 w-5" aria-hidden="true" />
            <FoldHorizontal className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="relative inline-flex h-5 w-5 items-center justify-center">
            <Waves className="h-5 w-5" aria-hidden="true" />
            <Search
              className="absolute -bottom-1 -right-1 h-3.5 w-3.5"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Minus className="h-4 w-4" aria-hidden="true" />
            <Slider
              value={[secondsPerUnit]}
              min={1}
              max={30}
              step={1}
              onValueChange={(value) => setSecondsPerUnit(value[0])}
              className="w-28"
            />
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-mono text-muted-foreground">
              {secondsPerUnit}s/unit
            </span>
          </div>
        </div>
      </div>

      {subtitles.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
          Timeline will appear when subtitles are loaded
        </div>
      ) : (
        <div className="h-40">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragEnd}
          >
            <ScrollArea
              type="always"
              scrollbarX
              scrollbarY={false}
              viewportRef={scrollViewportRef}
              className="h-full"
            >
              <div className="h-full select-none" style={{ width: `${trackWidth}px` }}>
              {/* Time markers */}
              <div className="relative h-8 border-b flex items-end px-2 text-xs text-muted-foreground overflow-hidden">
                {Array.from({ length: markerCount }, (_, i) => (
                  <span
                    key={i}
                    className="absolute font-mono"
                    style={{ left: `${i * secondsPerUnit * pxPerSecond}px` }}
                  >
                    {formatTimeDisplay(i * secondsPerUnit)}
                  </span>
                ))}
              </div>

              {/* Timeline blocks */}
                <div ref={containerRef} className="h-32 relative">
                  <div
                    className="absolute top-0 bottom-0 z-20 w-4 -translate-x-1/2 cursor-ew-resize group touch-none"
                    style={{ left: `${currentTime * pxPerSecond}px` }}
                    onPointerDown={handlePlayheadPointerDown}
                    onPointerMove={handlePlayheadPointerMove}
                    onPointerUp={handlePlayheadPointerUp}
                    onPointerCancel={handlePlayheadPointerUp}
                  >
                    <div
                      className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[8px] border-x-transparent border-t-[10px] border-t-primary/80 transition-colors group-hover:border-t-primary"
                    />
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-primary/70 transition-colors group-hover:bg-primary" />
                  </div>

                  {gaps.map((gap) => {
                    const left = gap.start * pxPerSecond;
                    const width = (gap.end - gap.start) * pxPerSecond;
                    if (width < 8) return null;
                    const isSelected = gap.id === selectedGapId;

                    return (
                      <button
                        key={gap.id}
                        type="button"
                        className={cn(
                          "absolute top-3 h-24 rounded border border-dashed transition-colors",
                          "text-left",
                          isSelected
                            ? "border-primary/50 bg-primary/10"
                            : "border-primary/15 hover:border-primary/40 hover:bg-primary/5",
                        )}
                        style={{ left: `${left}px`, width: `${width}px` }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedGapId(gap.id);
                        }}
                      />
                    );
                  })}

                  {/* Subtitle blocks */}
                  {subtitles.map((subtitle) => {
                    const left = subtitle.startTime * pxPerSecond;
                    const width = (subtitle.endTime - subtitle.startTime) * pxPerSecond;
                    const isSelected = subtitle.id === selectedSubtitleId;

                  return (
                    <TimelineBlock
                      key={subtitle.id}
                      subtitle={subtitle}
                      left={left}
                      width={width}
                      isSelected={isSelected}
                      onSelect={setSelectedSubtitleId}
                    />
                  );
                })}
              </div>
            </div>
            </ScrollArea>
          </DndContext>
        </div>
      )}
    </div>
  );
}
