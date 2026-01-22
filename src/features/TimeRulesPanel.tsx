"use client";

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { useToast } from '@/shared/hooks/use-toast';

export function TimeRulesPanel() {
  const { toast } = useToast();

  const handleApply = () => {
    toast({
      title: "Time rules applied",
      description: "Your timing adjustments have been applied to all subtitles.",
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 space-y-6 p-1">
        {/* Minimum duration */}
        <div className="space-y-2">
          <Label htmlFor="min-duration">Minimum duration (seconds)</Label>
          <Input 
            id="min-duration" 
            type="number" 
            placeholder="0.5" 
            step="0.1"
            className="max-w-[120px]"
          />
        </div>

        {/* Maximum duration */}
        <div className="space-y-2">
          <Label htmlFor="max-duration">Maximum duration (seconds)</Label>
          <Input 
            id="max-duration" 
            type="number" 
            placeholder="7.0" 
            step="0.1"
            className="max-w-[120px]"
          />
        </div>

        {/* Minimum gap */}
        <div className="space-y-2">
          <Label htmlFor="min-gap">Minimum gap between subtitles (ms)</Label>
          <Input 
            id="min-gap" 
            type="number" 
            placeholder="100" 
            step="10"
            className="max-w-[120px]"
          />
        </div>

        {/* Shift all timings */}
        <div className="space-y-2">
          <Label htmlFor="shift-time">Shift all timings (ms)</Label>
          <Input 
            id="shift-time" 
            type="number" 
            placeholder="0" 
            step="100"
            className="max-w-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            Positive values delay subtitles, negative values advance them
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox id="snap-frames" />
            <Label htmlFor="snap-frames" className="font-normal cursor-pointer">
              Snap to frame boundaries (24fps)
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="fix-overlaps" />
            <Label htmlFor="fix-overlaps" className="font-normal cursor-pointer">
              Fix overlapping subtitles
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="extend-short" />
            <Label htmlFor="extend-short" className="font-normal cursor-pointer">
              Extend short subtitles to minimum duration
            </Label>
          </div>
        </div>
      </div>

      {/* Apply button */}
      <div className="pt-4 border-t mt-auto">
        <Button onClick={handleApply} className="w-full">
          Apply Time Rules
        </Button>
      </div>
    </div>
  );
}
