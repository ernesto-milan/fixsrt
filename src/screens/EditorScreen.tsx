"use client";

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
  const subtitles = useSubtitlesStore((state) => state.subtitles);

  return (
    <div
      className={cn(
        "flex h-screen flex-col overflow-hidden transition-all duration-300",
        isPreferencesOpen && "pr-80",
      )}
    >
      <Header />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {preferences.swapPanels ? (
          <>
            <div className="flex-1 min-w-0 border-r">
              <RightPanel />
            </div>
            <div className="flex-[0_0_35%] min-w-[260px] max-w-[40%]">
              <LeftPanel />
            </div>
          </>
        ) : (
          <>
            <div className="flex-[0_0_35%] min-w-[260px] max-w-[40%]">
              <LeftPanel />
            </div>
            <div className="flex-1 min-w-0">
              <RightPanel />
            </div>
          </>
        )}
      </div>

      <Timeline />

      <UploadModal />
      <ExportModal />
      <PreferencesPanel />
    </div>
  );
}

export function EditorScreen() {
  return <MainContent />;
}
