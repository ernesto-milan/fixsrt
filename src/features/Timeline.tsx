"use client";

import { useRef, useCallback, useState, useEffect, useMemo, type ElementRef } from "react";
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
import { Columns3, FoldHorizontal, Minus, Plus, Search, UnfoldHorizontal } from "lucide-react";
import { formatTimeDisplay } from "@/shared/utils/srtParser";
import { getSubtitleGaps } from "@/shared/utils/subtitleGaps";
import { cn } from "@/shared/lib/utils";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useUiStore } from "@/shared/store/uiStore";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Slider } from "@/shared/ui/slider";
import type { SubtitleBlock } from "@/shared/types/subtitle";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

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
  showNumber: boolean;
  showText: boolean;
  onSelect: (id: string) => void;
};

const splitSubtitleText = (text: string): { left: string; right: string } => {
  if (!text) return { left: "", right: "" };

  const newlineIndices: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") newlineIndices.push(i);
  }

  if (newlineIndices.length > 0) {
    const splitIndex = newlineIndices[Math.floor(newlineIndices.length / 2)];
    return {
      left: text.slice(0, splitIndex).trimEnd(),
      right: text.slice(splitIndex + 1).trimStart(),
    };
  }

  const mid = Math.floor(text.length / 2);
  let leftIndex = mid;
  let rightIndex = mid;

  while (leftIndex > 0 || rightIndex < text.length) {
    if (leftIndex > 0 && /\s/.test(text[leftIndex])) {
      return {
        left: text.slice(0, leftIndex).trimEnd(),
        right: text.slice(leftIndex).trimStart(),
      };
    }
    if (rightIndex < text.length && /\s/.test(text[rightIndex])) {
      return {
        left: text.slice(0, rightIndex).trimEnd(),
        right: text.slice(rightIndex).trimStart(),
      };
    }
    leftIndex -= 1;
    rightIndex += 1;
  }

  return {
    left: text.slice(0, mid).trimEnd(),
    right: text.slice(mid).trimStart(),
  };
};

const parseDragId = (id: string): DragTarget | null => {
  const [mode, subtitleId] = id.split("::");
  if (!subtitleId) return null;
  if (mode !== "move" && mode !== "start" && mode !== "end") return null;
  return { mode, subtitleId } as DragTarget;
};

const computeDragTimes = (state: DragState, deltaSeconds: number) => {
  const { mode, startTime, endTime } = state;
  if (mode === "start") {
    const nextStart = Math.min(endTime - 0.1, Math.max(0, startTime + deltaSeconds));
    return { startTime: nextStart, endTime };
  }

  if (mode === "end") {
    const nextEnd = Math.max(startTime + 0.1, endTime + deltaSeconds);
    return { startTime, endTime: nextEnd };
  }

  const duration = endTime - startTime;
  const nextStart = Math.max(0, startTime + deltaSeconds);
  return { startTime: nextStart, endTime: nextStart + duration };
};

function TimelineBlock({
  subtitle,
  left,
  width,
  isSelected,
  showNumber,
  showText,
  onSelect,
}: TimelineBlockProps) {
  const {
    setNodeRef: setMoveRef,
    attributes: moveAttributes,
    listeners: moveListeners,
  } = useDraggable({ id: `move::${subtitle.id}` });
  const {
    setNodeRef: setStartRef,
    attributes: startAttributes,
    listeners: startListeners,
  } = useDraggable({ id: `start::${subtitle.id}` });
  const {
    setNodeRef: setEndRef,
    attributes: endAttributes,
    listeners: endListeners,
  } = useDraggable({ id: `end::${subtitle.id}` });

  const handleMovePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-drag-handle="true"]')) return;
    onSelect(subtitle.id);
    moveListeners?.onPointerDown?.(event);
  };

  const handleStartPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(subtitle.id);
    startListeners?.onPointerDown?.(event);
  };

  const handleEndPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(subtitle.id);
    endListeners?.onPointerDown?.(event);
  };

  return (
    <div
      ref={setMoveRef}
      className={cn(
        "absolute top-3 h-24 cursor-pointer rounded-sm transition-colors",
        isSelected
          ? "bg-timeline-block-active ring-2 ring-primary ring-offset-1 ring-offset-timeline"
          : "bg-timeline-block/80 hover:bg-timeline-block",
      )}
      style={{ left: `${left}px`, width: `${Math.max(width, 4)}px` }}
      {...moveAttributes}
      {...moveListeners}
      onPointerDown={handleMovePointerDown}
    >
      <div
        ref={setStartRef}
        data-drag-handle="true"
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
        {...startAttributes}
        {...startListeners}
        onPointerDown={handleStartPointerDown}
      />
      <div
        ref={setEndRef}
        data-drag-handle="true"
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
        {...endAttributes}
        {...endListeners}
        onPointerDown={handleEndPointerDown}
      />

      <div className="px-1.5 py-1 text-2xs text-white">
        {showNumber && <div className="font-mono font-medium">#{subtitle.index}</div>}
        {showText && <div className="mt-0.5 truncate opacity-90">{subtitle.text}</div>}
      </div>
    </div>
  );
}

export function Timeline() {
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const updateSubtitle = useSubtitlesStore((state) => state.updateSubtitle);
  const setSubtitles = useSubtitlesStore((state) => state.setSubtitles);
  const selectedSubtitleId = useUiStore((state) => state.selectedSubtitleId);
  const setSelectedSubtitleId = useUiStore((state) => state.setSelectedSubtitleId);
  const selectedGapId = useUiStore((state) => state.selectedGapId);
  const setSelectedGapId = useUiStore((state) => state.setSelectedGapId);
  const currentTime = useUiStore((state) => state.currentTime);
  const setCurrentTime = useUiStore((state) => state.setCurrentTime);
  const videoFile = useUiStore((state) => state.videoFile);
  const preferences = useUiStore((state) => state.preferences);
  const timelineMaxScale = Math.max(1, preferences.timelineMaxScale ?? 30);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<ElementRef<typeof ScrollAreaPrimitive.Viewport>>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [secondsPerUnit, setSecondsPerUnit] = useState(10);
  // Clamp the zoom when the max-scale preference drops below the current value.
  const [prevMaxScale, setPrevMaxScale] = useState(timelineMaxScale);
  if (timelineMaxScale !== prevMaxScale) {
    setPrevMaxScale(timelineMaxScale);
    setSecondsPerUnit((current) => Math.min(current, timelineMaxScale));
  }
  const dragStateRef = useRef<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    subtitleId: string;
    mode: DragMode;
    deltaSeconds: number;
  } | null>(null);

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
  const ticks = useMemo(() => {
    const ticksPerUnit = 10;
    const spacing = secondsPerUnit / ticksPerUnit;
    const totalTicks = Math.ceil(maxTime / spacing);
    const items: { time: number; size: "major" | "mid" | "minor" }[] = [];
    const midMark = ticksPerUnit % 2 === 0 ? ticksPerUnit / 2 : null;

    for (let i = 0; i <= totalTicks; i += 1) {
      const time = i * spacing;
      if (time > maxTime) break;
      const mod = ticksPerUnit > 0 ? i % ticksPerUnit : 0;
      const size =
        mod === 0 ? "major" : midMark !== null && mod === midMark ? "mid" : "minor";
      items.push({ time, size });
    }

    return items;
  }, [maxTime, secondsPerUnit]);

  const isPlayheadVisible = useMemo(() => {
    if (pxPerSecond <= 0 || viewportWidth <= 0) return true;
    if (trackWidth <= viewportWidth) return true;
    const playheadX = currentTime * pxPerSecond;
    return playheadX >= scrollLeft && playheadX <= scrollLeft + viewportWidth;
  }, [currentTime, pxPerSecond, scrollLeft, trackWidth, viewportWidth]);

  const gaps = useMemo(() => getSubtitleGaps(subtitles), [subtitles]);

  const activeSubtitle = useMemo(
    () =>
      subtitles.find(
        (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime,
      ),
    [currentTime, subtitles],
  );

  const canSplit =
    Boolean(activeSubtitle) &&
    currentTime > (activeSubtitle?.startTime ?? 0) + 0.1 &&
    currentTime < (activeSubtitle?.endTime ?? 0) - 0.1;
  const canCenterPlayhead = !isPlayheadVisible;

  const handleMergeSelectedGap = useCallback(() => {
    if (!selectedGapId) return;
    const gap = gaps.find((item) => item.id === selectedGapId);
    if (!gap) return;
    const left = subtitles.find((item) => item.id === gap.leftId);
    const right = subtitles.find((item) => item.id === gap.rightId);
    if (!left || !right) return;

    const merged: SubtitleBlock = {
      id: `merge-${left.id}-${right.id}-${Date.now()}`,
      index: Math.min(left.index, right.index),
      startTime: left.startTime,
      endTime: right.endTime,
      text: [left.text, right.text].filter(Boolean).join("\n"),
    };

    const next = subtitles.filter((item) => item.id !== left.id && item.id !== right.id);
    next.push(merged);
    next.sort((a, b) => a.startTime - b.startTime);
    const reindexed = next.map((item, idx) => ({ ...item, index: idx + 1 }));

    setSubtitles(reindexed);
    setSelectedGapId(null);
    setSelectedSubtitleId(merged.id);
  }, [gaps, selectedGapId, setSelectedGapId, setSelectedSubtitleId, setSubtitles, subtitles]);

  const handleSplitAtPlayhead = useCallback(() => {
    if (!activeSubtitle || !canSplit) return;
    const splitTime = currentTime;
    const { left: leftText, right: rightText } = splitSubtitleText(activeSubtitle.text);
    const stamp = Date.now();

    const first: SubtitleBlock = {
      id: `split-${activeSubtitle.id}-a-${stamp}`,
      index: activeSubtitle.index,
      startTime: activeSubtitle.startTime,
      endTime: splitTime,
      text: leftText,
    };

    const second: SubtitleBlock = {
      id: `split-${activeSubtitle.id}-b-${stamp}`,
      index: activeSubtitle.index + 1,
      startTime: splitTime,
      endTime: activeSubtitle.endTime,
      text: rightText,
    };

    const next = subtitles.filter((item) => item.id !== activeSubtitle.id);
    next.push(first, second);
    next.sort((a, b) => a.startTime - b.startTime);
    const reindexed = next.map((item, idx) => ({ ...item, index: idx + 1 }));

    setSubtitles(reindexed);
    setSelectedGapId(null);
    setSelectedSubtitleId(second.id);
  }, [
    activeSubtitle,
    canSplit,
    currentTime,
    setSelectedGapId,
    setSelectedSubtitleId,
    setSubtitles,
    subtitles,
  ]);

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

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;
    const handleScroll = () => setScrollLeft(viewport.scrollLeft);
    handleScroll();
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
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
    setDragPreview({
      subtitleId: subtitle.id,
      mode: dragTarget.mode,
      deltaSeconds: 0,
    });
    setSelectedSubtitleId(subtitle.id);
  }, [setSelectedSubtitleId, subtitles]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!dragStateRef.current || pxPerSecond <= 0) return;
    const deltaSeconds = event.delta.x / pxPerSecond;
    setDragPreview({
      subtitleId: dragStateRef.current.subtitleId,
      mode: dragStateRef.current.mode,
      deltaSeconds,
    });
  }, [pxPerSecond]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (dragStateRef.current && pxPerSecond > 0) {
      const deltaSeconds = event.delta.x / pxPerSecond;
      const nextTimes = computeDragTimes(dragStateRef.current, deltaSeconds);
      updateSubtitle(dragStateRef.current.subtitleId, nextTimes);
    }
    dragStateRef.current = null;
    setDragPreview(null);
  }, [pxPerSecond, updateSubtitle]);

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

  const handleCenterPlayhead = useCallback(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport || viewportWidth <= 0) return;
    if (trackWidth <= viewportWidth) return;
    const playheadX = currentTime * pxPerSecond;
    const targetLeft = Math.max(0, Math.min(trackWidth - viewportWidth, playheadX - viewportWidth / 2));
    viewport.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [currentTime, pxPerSecond, trackWidth, viewportWidth]);

  return (
    <div className="overflow-hidden border-t bg-panel pb-3">
      <div className="flex h-9 items-center justify-center border-b px-3 text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSplitAtPlayhead}
              disabled={!canSplit}
              className={cn(
                "rounded p-1 transition-colors",
                canSplit
                  ? "text-foreground hover:bg-surface hover:cursor-pointer"
                  : "text-faint",
              )}
              aria-label="Split subtitle at playhead"
            >
              <UnfoldHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleMergeSelectedGap}
              disabled={!selectedGapId}
              className={cn(
                "rounded p-1 transition-colors",
                selectedGapId
                  ? "text-foreground hover:bg-surface hover:cursor-pointer"
                  : "text-faint",
              )}
              aria-label="Merge subtitles across selected gap"
            >
              <FoldHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleCenterPlayhead}
            disabled={!canCenterPlayhead}
            className={cn(
              "relative inline-flex items-center justify-center rounded p-1 transition-colors",
              canCenterPlayhead
                ? "text-foreground hover:bg-surface hover:cursor-pointer"
                : "text-faint",
            )}
            aria-label="Center playhead"
          >
            <Columns3 className="h-4 w-4" aria-hidden="true" />
            <Search
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3"
              strokeWidth={3}
              aria-hidden="true"
            />
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            <Slider
              value={[secondsPerUnit]}
              min={1}
              max={timelineMaxScale}
              step={1}
              onValueChange={(value) => setSecondsPerUnit(value[0])}
              size="sm"
              className="w-28"
            />
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="w-7 font-mono text-2xs text-muted-foreground">
              {secondsPerUnit}s
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
                <div className="relative h-8 border-b px-2 text-xs text-muted-foreground overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    {ticks.map((tick) => (
                      <span
                        key={`${tick.size}-${tick.time}`}
                        className={cn(
                          "absolute bottom-0 w-px bg-muted-foreground/40",
                          tick.size === "major" && "h-4 bg-muted-foreground/60",
                          tick.size === "mid" && "h-3 bg-muted-foreground/50",
                          tick.size === "minor" && "h-2 bg-muted-foreground/30",
                        )}
                        style={{ left: `${tick.time * pxPerSecond}px` }}
                      />
                    ))}
                  </div>
                  {Array.from({ length: markerCount }, (_, i) => (
                    <span
                      key={i}
                      className="absolute bottom-1 z-10 font-mono"
                      style={{ left: `${i * secondsPerUnit * pxPerSecond}px` }}
                    >
                      {formatTimeDisplay(i * secondsPerUnit)}
                    </span>
                ))}
              </div>

              {/* Timeline blocks */}
                <div ref={containerRef} className="h-32 relative">
                  <div
                    className="absolute top-0 bottom-2.5 z-20 w-4 -translate-x-1/2 cursor-ew-resize group touch-none"
                    style={{ left: `${currentTime * pxPerSecond}px` }}
                    onPointerDown={handlePlayheadPointerDown}
                    onPointerMove={handlePlayheadPointerMove}
                    onPointerUp={handlePlayheadPointerUp}
                    onPointerCancel={handlePlayheadPointerUp}
                  >
                    <div
                      className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[8px] border-x-transparent border-t-[10px] border-t-primary/80 transition-colors group-hover:border-t-primary"
                    />
                    <div className="absolute -top-2 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-primary/70 transition-colors group-hover:bg-primary" />
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
                  // The dragged subtitle keeps its pre-drag times in the store
                  // until drag end, so derive the live preview from those plus
                  // the in-flight delta rather than reading the drag ref here.
                  const preview =
                    dragPreview && dragPreview.subtitleId === subtitle.id
                      ? computeDragTimes(
                          {
                            mode: dragPreview.mode,
                            subtitleId: subtitle.id,
                            startTime: subtitle.startTime,
                            endTime: subtitle.endTime,
                          },
                          dragPreview.deltaSeconds,
                        )
                      : null;
                  const startTime = preview?.startTime ?? subtitle.startTime;
                  const endTime = preview?.endTime ?? subtitle.endTime;
                  const left = startTime * pxPerSecond;
                  const width = (endTime - startTime) * pxPerSecond;
                  const isSelected = subtitle.id === selectedSubtitleId;

                    return (
                      <TimelineBlock
                        key={subtitle.id}
                        subtitle={subtitle}
                        left={left}
                        width={width}
                        isSelected={isSelected}
                        showNumber={preferences.showTimelineNumber}
                        showText={preferences.showTimelineText}
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
