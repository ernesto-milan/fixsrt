"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Slider } from "@/shared/ui/slider";
import { formatTimeDisplay } from "@/shared/utils/srtParser";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useUiStore } from "@/shared/store/uiStore";

export function VideoPreview() {
  const videoFile = useUiStore((state) => state.videoFile);
  const setVideoFile = useUiStore((state) => state.setVideoFile);
  const currentTime = useUiStore((state) => state.currentTime);
  const setCurrentTime = useUiStore((state) => state.setCurrentTime);
  const isPlaying = useUiStore((state) => state.isPlaying);
  const setIsPlaying = useUiStore((state) => state.setIsPlaying);
  const subtitles = useSubtitlesStore((state) => state.subtitles);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  // Dark, cool "video stage" backdrop — a subtle violet top-glow over a
  // diagonal hatch. Used behind the preview in both themes.
  const stageBackground = {
    background:
      "radial-gradient(120% 80% at 50% 0%, hsl(274 38% 16%) 0%, transparent 55%), repeating-linear-gradient(135deg, hsl(230 14% 7%) 0 26px, hsl(230 14% 9%) 26px 52px)",
  };

  useEffect(() => {
    setDuration(videoFile?.duration ?? 0);
  }, [videoFile]);

  // Get current subtitle
  const currentSubtitle = subtitles.find(
    (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime,
  );

  // Sync video playback with state
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Update current time during playback
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [setCurrentTime]);

  // Handle video loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const nextDuration = videoRef.current.duration;
      setDuration(nextDuration);
      setDimensions({
        w: videoRef.current.videoWidth,
        h: videoRef.current.videoHeight,
      });
      if (videoFile) {
        setVideoFile({ ...videoFile, duration: nextDuration });
      }
    }
  }, [setVideoFile, videoFile]);

  // Seek to position
  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  }, [setCurrentTime]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, []);

  if (!videoFile) {
    return (
      <div
        className="relative flex flex-1 flex-col items-center justify-end overflow-hidden rounded-lg pb-8"
        style={stageBackground}
      >
        <span className="absolute left-3 top-3 rounded-sm bg-black/40 px-2 py-1 font-mono text-2xs text-white/70">
          no video
        </span>
        <p className="rounded-sm bg-black/80 px-4 py-1.5 text-md font-medium text-white">
          Drop in your .srt —
        </p>
        <p className="mt-3 text-xs text-white/50">Upload a video file to preview subtitles</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Video container */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg"
        style={stageBackground}
      >
        {dimensions && (
          <span className="absolute left-3 top-3 z-10 rounded-sm bg-black/40 px-2 py-1 font-mono text-2xs text-white/70">
            {dimensions.w} × {dimensions.h}
          </span>
        )}
        <video
          ref={videoRef}
          src={videoFile.url}
          className="block max-h-full max-w-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Subtitle overlay */}
        {currentSubtitle && (
          <div className="absolute bottom-8 left-0 right-0 px-4 text-center">
            <p className="inline-block max-w-[80%] rounded-sm bg-black/80 px-4 py-1.5 text-md font-medium leading-snug text-white">
              {currentSubtitle.text}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 shrink-0 space-y-2">
        {/* Timeline slider */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={togglePlay}>
              {isPlaying ? <Pause /> : <Play />}
            </Button>

            <span className="font-mono text-2xs text-muted-foreground">
              {formatTimeDisplay(currentTime)} / {formatTimeDisplay(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? <VolumeX /> : <Volume2 />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
