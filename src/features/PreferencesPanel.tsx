"use client";

import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/uiStore";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
];

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
          "fixed top-0 right-0 h-full w-80 bg-card border-l shadow-xl z-50 transition-transform duration-300 ease-out",
          isPreferencesOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Preferences</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsPreferencesOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select 
              value={preferences.theme} 
              onValueChange={(value: 'light' | 'dark' | 'system') => updatePreferences({ theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select 
              value={preferences.language} 
              onValueChange={(value) => updatePreferences({ language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Layout */}
          <div className="flex items-center justify-between">
            <Label htmlFor="swap-panels">Swap left/right panels</Label>
            <Switch
              id="swap-panels"
              checked={preferences.swapPanels}
              onCheckedChange={(checked) => updatePreferences({ swapPanels: checked })}
            />
          </div>

          {/* Subtitle List Options */}
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
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
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">
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
