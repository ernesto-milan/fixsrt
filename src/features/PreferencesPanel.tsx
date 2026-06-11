"use client";

import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/uiStore";

export function PreferencesPanel() {
  const isPreferencesOpen = useUiStore((state) => state.isPreferencesOpen);
  const setIsPreferencesOpen = useUiStore((state) => state.setIsPreferencesOpen);
  const preferences = useUiStore((state) => state.preferences);
  const updatePreferences = useUiStore((state) => state.updatePreferences);

  return (
    <>
      {/* Overlay */}
      {isPreferencesOpen && (
        <div 
          className="fixed inset-0 bg-background/50 z-40"
          onClick={() => setIsPreferencesOpen(false)}
        />
      )}
      
      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l bg-panel shadow-lg transition-transform duration-300 ease-out sm:w-80",
          isPreferencesOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
          <h2 className="text-md font-semibold">Preferences</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPreferencesOpen(false)}
            aria-label="Close preferences"
          >
            <X />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-3">
          {/* Layout */}
          <div className="space-y-3">
            <Label className="text-2xs font-semibold uppercase tracking-caps text-faint">
              Layout
            </Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="swap-panels" className="font-normal">
                Swap left/right panels
              </Label>
              <Switch
                id="swap-panels"
                checked={preferences.swapPanels}
                onCheckedChange={(checked) => updatePreferences({ swapPanels: checked })}
              />
            </div>
          </div>

          {/* Subtitle List Options */}
          <div className="space-y-3">
            <Label className="text-2xs font-semibold uppercase tracking-caps text-faint">
              Subtitle List Display
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-index" className="font-normal">Show index</Label>
                <Switch
                  id="show-index"
                  checked={preferences.showIndex}
                  onCheckedChange={(checked) => updatePreferences({ showIndex: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-start" className="font-normal">Show start time</Label>
                <Switch
                  id="show-start"
                  checked={preferences.showStartTime}
                  onCheckedChange={(checked) => updatePreferences({ showStartTime: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-end" className="font-normal">Show end time</Label>
                <Switch
                  id="show-end"
                  checked={preferences.showEndTime}
                  onCheckedChange={(checked) => updatePreferences({ showEndTime: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-duration" className="font-normal">Show duration</Label>
                <Switch
                  id="show-duration"
                  checked={preferences.showDuration}
                  onCheckedChange={(checked) => updatePreferences({ showDuration: checked })}
                />
              </div>
            </div>
          </div>

          {/* Timeline Options */}
          <div className="space-y-3">
            <Label className="text-2xs font-semibold uppercase tracking-caps text-faint">
              Timeline Display
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-timeline-number" className="font-normal">
                  Show number
                </Label>
                <Switch
                  id="show-timeline-number"
                  checked={preferences.showTimelineNumber}
                  onCheckedChange={(checked) => updatePreferences({ showTimelineNumber: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-timeline-text" className="font-normal">
                  Show text
                </Label>
                <Switch
                  id="show-timeline-text"
                  checked={preferences.showTimelineText}
                  onCheckedChange={(checked) => updatePreferences({ showTimelineText: checked })}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <Label htmlFor="timeline-max-scale" className="font-normal">
                    Timeline max scale
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Seconds per unit cap</p>
                </div>
                <Input
                  id="timeline-max-scale"
                  type="number"
                  min={1}
                  value={preferences.timelineMaxScale}
                  onChange={(event) => {
                    const next = Math.max(1, Number(event.target.value) || 1);
                    updatePreferences({ timelineMaxScale: next });
                  }}
                  className="w-20 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
