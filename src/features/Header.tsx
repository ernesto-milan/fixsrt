"use client";
import { Download, Upload, Settings } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/store/uiStore";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";

export function Header() {
  const setIsUploadModalOpen = useUiStore(
    (state) => state.setIsUploadModalOpen,
  );
  const setIsPreferencesOpen = useUiStore(
    (state) => state.setIsPreferencesOpen,
  );
  const setIsExportModalOpen = useUiStore(
    (state) => state.setIsExportModalOpen,
  );
  const subtitleFileName = useSubtitlesStore((state) => state.subtitleFileName);
  const subtitlesCount = useSubtitlesStore((state) => state.subtitles.length);
  const logoSrc = "/logo_full.png";

  return (
    <header className="border-b bg-card flex items-center px-4 py-2">
      <div className="flex items-center gap-4">
        <img src={logoSrc} alt="FixSRT" className="h-10 w-auto block" />
        <span className="sr-only">FixSRT</span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          className="gap-2"
          disabled={subtitlesCount === 0}
        >
          <Download className="h-3 w-3" />
          Export SRT
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
          className="gap-2"
        >
          <Upload className="h-3 w-3" />
          {subtitleFileName ? "Replace Files" : "Upload"}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPreferencesOpen(true)}
          className="text-muted-foreground hover:text-foreground !h-8 !w-8 p-0 [&_svg]:h-6 [&_svg]:w-6"
        >
          <Settings />
        </Button>
      </div>
    </header>
  );
}
