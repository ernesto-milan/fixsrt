"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useUiStore } from "@/shared/store/uiStore";
import type { RightPanelTab } from "@/shared/types/subtitle";
import { VideoPreview } from "./VideoPreview";
import { TextRulesPanel } from "./TextRulesPanel";
import { TimeRulesPanel } from "./TimeRulesPanel";

export function RightPanel() {
  const rightPanelTab = useUiStore((state) => state.rightPanelTab);
  const setRightPanelTab = useUiStore((state) => state.setRightPanelTab);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <Tabs
        value={rightPanelTab}
        onValueChange={(value) => setRightPanelTab(value as RightPanelTab)}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="flex h-10 shrink-0 items-center border-b px-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="text-rules">Text Rules</TabsTrigger>
            <TabsTrigger value="time-rules">Time Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="mt-0 flex min-h-0 flex-1 p-3">
          <VideoPreview />
        </TabsContent>

        <TabsContent value="text-rules" className="mt-0 flex min-h-0 flex-1 overflow-hidden p-3">
          <TextRulesPanel />
        </TabsContent>

        <TabsContent value="time-rules" className="mt-0 flex min-h-0 flex-1 overflow-hidden p-3">
          <TimeRulesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
