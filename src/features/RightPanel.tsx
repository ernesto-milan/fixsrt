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
    <div className="flex flex-col h-full bg-card">
      <Tabs 
        value={rightPanelTab} 
        onValueChange={(value) => setRightPanelTab(value as RightPanelTab)}
        className="flex flex-col h-full"
      >
        <div className="px-4 py-3 border-b">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="text-rules">Text Rules</TabsTrigger>
            <TabsTrigger value="time-rules">Time Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 p-4 mt-0">
          <VideoPreview />
        </TabsContent>

        <TabsContent value="text-rules" className="flex-1 p-4 mt-0">
          <TextRulesPanel />
        </TabsContent>

        <TabsContent value="time-rules" className="flex-1 p-4 mt-0">
          <TimeRulesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
