"use client";

import { useUiStore } from "@/shared/store/uiStore";
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

  return (
    <div
      className={cn(
        "flex h-screen flex-col overflow-hidden transition-all duration-300",
        isPreferencesOpen && "lg:pr-80",
      )}
    >
      <Header />

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row">
        {preferences.swapPanels ? (
          <>
            <div className="min-h-0 min-w-0 flex-1 border-b lg:border-b-0 lg:border-r">
              <RightPanel />
            </div>
            <div className="min-h-0 flex-1 lg:flex-[0_0_35%] lg:min-w-[260px] lg:max-w-[40%]">
              <LeftPanel />
            </div>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 lg:flex-[0_0_35%] lg:min-w-[260px] lg:max-w-[40%]">
              <LeftPanel />
            </div>
            <div className="min-h-0 min-w-0 flex-1">
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
