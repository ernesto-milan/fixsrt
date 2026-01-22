"use client";

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { useToast } from '@/shared/hooks/use-toast';

export function TextRulesPanel() {
  const { toast } = useToast();

  const handleApply = () => {
    toast({
      title: "Text rules applied",
      description: "Your text transformations have been applied to all subtitles.",
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 space-y-6 p-1">
        {/* Max characters per line */}
        <div className="space-y-2">
          <Label htmlFor="max-chars">Maximum characters per line</Label>
          <Input 
            id="max-chars" 
            type="number" 
            placeholder="42" 
            className="max-w-[120px]"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox id="remove-formatting" />
            <Label htmlFor="remove-formatting" className="font-normal cursor-pointer">
              Remove formatting tags (e.g., {"<i>"}, {"<b>"})
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="remove-music" />
            <Label htmlFor="remove-music" className="font-normal cursor-pointer">
              Remove music notes (♪, ♫)
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="trim-whitespace" />
            <Label htmlFor="trim-whitespace" className="font-normal cursor-pointer">
              Trim extra whitespace
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox id="fix-punctuation" />
            <Label htmlFor="fix-punctuation" className="font-normal cursor-pointer">
              Fix punctuation spacing
            </Label>
          </div>
        </div>

        {/* Case transformation */}
        <div className="space-y-2">
          <Label>Case transformation</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">None</Button>
            <Button variant="outline" size="sm">UPPERCASE</Button>
            <Button variant="outline" size="sm">lowercase</Button>
            <Button variant="outline" size="sm">Title Case</Button>
          </div>
        </div>

        {/* Find and Replace */}
        <div className="space-y-2">
          <Label>Find and replace</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Find..." />
            <Input placeholder="Replace with..." />
          </div>
        </div>
      </div>

      {/* Apply button */}
      <div className="pt-4 border-t mt-auto">
        <Button onClick={handleApply} className="w-full">
          Apply Text Rules
        </Button>
      </div>
    </div>
  );
}
