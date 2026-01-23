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
      <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No video loaded</p>
          <p className="text-xs mt-1">Upload a video file to preview subtitles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Video container */}
      <div className="relative flex-1 min-h-0 bg-black rounded-lg overflow-hidden flex items-center justify-center">
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
          <div className="absolute bottom-12 left-0 right-0 text-center px-4">
            <p className="inline-block bg-black/80 text-white px-4 py-2 rounded text-lg">
              {currentSubtitle.text}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 space-y-2 shrink-0">
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <span className="text-xs text-muted-foreground font-mono">
              {formatTimeDisplay(currentTime)} / {formatTimeDisplay(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
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
