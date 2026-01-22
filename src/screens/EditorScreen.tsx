"use client";

import { Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/store/uiStore";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { Header } from "@/features/Header";
import { UploadModal } from "@/features/UploadModal";
import { PreferencesPanel } from "@/features/PreferencesPanel";
import { LeftPanel } from "@/features/LeftPanel";
import { RightPanel } from "@/features/RightPanel";
import { Timeline } from "@/features/Timeline";
import { ExportModal } from "@/features/ExportModal";
import { cn } from "@/shared/lib/utils";

function MainContent() {
  const preferences = useUiStore((state) => state.preferences);
  const isPreferencesOpen = useUiStore((state) => state.isPreferencesOpen);
  const setIsExportModalOpen = useUiStore((state) => state.setIsExportModalOpen);
  const subtitles = useSubtitlesStore((state) => state.subtitles);

  return (
    <div
      className={cn(
        "flex h-screen flex-col transition-all duration-300",
        isPreferencesOpen && "mr-80",
      )}
    >
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {preferences.swapPanels ? (
          <>
            <div className="w-1/2 border-r">
              <RightPanel />
            </div>
            <div className="w-1/2">
              <LeftPanel />
            </div>
          </>
        ) : (
          <>
            <div className="w-[400px] min-w-[300px] max-w-[500px]">
              <LeftPanel />
            </div>
            <div className="flex-1">
              <RightPanel />
            </div>
          </>
        )}
      </div>

      <Timeline />

      <Button
        className="fixed bottom-24 right-6 gap-2 shadow-lg"
        onClick={() => setIsExportModalOpen(true)}
        disabled={subtitles.length === 0}
      >
        <Download className="h-4 w-4" />
        Export SRT
      </Button>

      <UploadModal />
      <ExportModal />
      <PreferencesPanel />
    </div>
  );
}

export function EditorScreen() {
  return <MainContent />;
}
