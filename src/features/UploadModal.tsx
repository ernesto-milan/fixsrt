"use client";

import { useCallback, useState } from "react";
import { FileText, Film, Upload, Check } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/uiStore";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";

interface DropZoneProps {
  label: string;
  accept: string;
  icon: React.ReactNode;
  required?: boolean;
  fileName: string | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

function DropZone({ label, accept, icon, required, fileName, onFileSelect, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [disabled, onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  }, [disabled, onFileSelect]);

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-5 transition-colors",
        isDragOver ? "border-primary bg-accent/5" : "border-border hover:border-primary/40",
        fileName && "border-primary/40 bg-accent-soft/40",
        disabled && "cursor-not-allowed opacity-60",
      )}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
    onDrop={handleDrop}
  >
      <input type="file" accept={accept} className="hidden" onChange={handleChange} disabled={disabled} />
      
      {fileName ? (
        <>
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Check className="h-4 w-4" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{fileName}</p>
            <p className="mt-0.5 text-2xs text-muted-foreground">Click or drop to replace</p>
          </div>
        </>
      ) : (
        <>
          <div className="flex size-9 items-center justify-center rounded-full bg-surface text-muted-foreground">
            {icon}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-0.5 text-2xs text-muted-foreground">
              {required ? "Required" : "Optional"} · drag &amp; drop or click to browse
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
  const loadSrtContent = useSubtitlesStore((state) => state.loadSrtContent);

  const [pendingSrtFile, setPendingSrtFile] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [pendingVideoFile, setPendingVideoFile] = useState<{ name: string; url: string } | null>(null);

  const handleSrtSelect = useCallback(async (file: File) => {
    const content = await file.text();
    setPendingSrtFile({ name: file.name, content });
    setPendingVideoFile(null);
  }, []);

  const handleVideoSelect = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPendingVideoFile({ name: file.name, url });
    setPendingSrtFile(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingSrtFile) {
      loadSrtContent(pendingSrtFile.content, pendingSrtFile.name);
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
    loadSrtContent,
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
          <DialogTitle>Upload files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <DropZone
            label="Subtitle file (.srt)"
            accept=".srt"
            icon={<FileText className="h-4 w-4" />}
            required
            fileName={pendingSrtFile?.name || null}
            onFileSelect={handleSrtSelect}
            disabled={Boolean(pendingVideoFile)}
          />

          <DropZone
            label="Video file"
            accept="video/*"
            icon={<Film className="h-4 w-4" />}
            fileName={pendingVideoFile?.name || videoFile?.name || null}
            onFileSelect={handleVideoSelect}
            disabled={Boolean(pendingSrtFile)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!pendingSrtFile && !pendingVideoFile}>
            <Upload />
            Load files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
