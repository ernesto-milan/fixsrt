"use client";

import { useCallback, useState } from "react";
import { FileText, Film, Upload, Check } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { parseSRT } from "@/shared/utils/srtParser";
import { cn } from "@/shared/lib/utils";
import type { Subtitle } from "@/shared/types/subtitle";
import { useUiStore } from "@/shared/store/uiStore";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";

interface DropZoneProps {
  label: string;
  accept: string;
  icon: React.ReactNode;
  required?: boolean;
  fileName: string | null;
  onFileSelect: (file: File) => void;
}

function DropZone({ label, accept, icon, required, fileName, onFileSelect }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        fileName && "border-primary/30 bg-highlight",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept={accept} className="hidden" onChange={handleChange} />
      
      {fileName ? (
        <>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">Click or drop to replace</p>
          </div>
        </>
      ) : (
        <>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {icon}
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {required ? "Required" : "Optional"} • Drag & drop or click to browse
            </p>
          </div>
        </>
      )}
    </label>
  );
}

export function UploadModal() {
  const isUploadModalOpen = useUiStore((state) => state.isUploadModalOpen);
  const setIsUploadModalOpen = useUiStore((state) => state.setIsUploadModalOpen);
  const setVideoFile = useUiStore((state) => state.setVideoFile);
  const videoFile = useUiStore((state) => state.videoFile);
  const setSelectedSubtitleId = useUiStore((state) => state.setSelectedSubtitleId);
  const loadSubtitles = useSubtitlesStore((state) => state.loadSubtitles);

  const [pendingSrtFile, setPendingSrtFile] = useState<{
    name: string;
    subtitles: Subtitle[];
  } | null>(null);
  const [pendingVideoFile, setPendingVideoFile] = useState<{ name: string; url: string } | null>(null);

  const handleSrtSelect = useCallback(async (file: File) => {
    const content = await file.text();
    const subtitles = parseSRT(content);
    setPendingSrtFile({ name: file.name, subtitles });
  }, []);

  const handleVideoSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPendingVideoFile({ name: file.name, url });
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingSrtFile) {
      loadSubtitles(pendingSrtFile.subtitles, pendingSrtFile.name);
      setSelectedSubtitleId(null);
    }
    if (pendingVideoFile) {
      setVideoFile({
        name: pendingVideoFile.name,
        url: pendingVideoFile.url,
        duration: 0,
      });
    }
    setPendingSrtFile(null);
    setPendingVideoFile(null);
    setIsUploadModalOpen(false);
  }, [
    pendingSrtFile,
    pendingVideoFile,
    loadSubtitles,
    setIsUploadModalOpen,
    setSelectedSubtitleId,
    setVideoFile,
  ]);

  const handleClose = () => {
    setPendingSrtFile(null);
    setPendingVideoFile(null);
    setIsUploadModalOpen(false);
  };

  return (
    <Dialog open={isUploadModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <DropZone
            label="Subtitle File (.srt)"
            accept=".srt"
            icon={<FileText className="h-6 w-6 text-muted-foreground" />}
            required
            fileName={pendingSrtFile?.name || null}
            onFileSelect={handleSrtSelect}
          />
          
          <DropZone
            label="Video File"
            accept="video/*"
            icon={<Film className="h-6 w-6 text-muted-foreground" />}
            fileName={pendingVideoFile?.name || videoFile?.name || null}
            onFileSelect={handleVideoSelect}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!pendingSrtFile}>
            <Upload className="h-4 w-4 mr-2" />
            Load Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
