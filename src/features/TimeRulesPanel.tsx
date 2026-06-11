"use client";

import { useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { applyTimeRule, type TimeRule, type TimeRuleOptions } from "@/shared/utils/timeRules";

const cardBaseClass =
  "rounded-md border bg-card p-2.5 space-y-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1";
const activeCardClass = "border-accent bg-accent-soft/30 shadow-xs";
const inactiveCardClass = "border-border opacity-70 hover:opacity-100";

type RuleCardProps = {
  rule: TimeRule;
  active: boolean;
  onActivate: (rule: TimeRule) => void;
  children: ReactNode;
};

function RuleCard({ rule, active, onActivate, children }: RuleCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate(rule);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (active) return;
    onActivate(rule);
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLButtonElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      event.preventDefault();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onActivate(rule)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      className={cn(cardBaseClass, active ? activeCardClass : inactiveCardClass)}
    >
      {children}
    </div>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <div className="mr-1 space-y-2.5">
      <div className="flex items-center gap-3 text-2xs font-semibold uppercase tracking-caps text-muted-foreground">
        <span>{title}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}

type ShiftDirection = TimeRuleOptions["shiftDirection"];

export function TimeRulesPanel() {
  const { toast } = useToast();
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const timeRulesSnapshot = useSubtitlesStore((state) => state.timeRulesSnapshot);
  const setSubtitles = useSubtitlesStore((state) => state.setSubtitles);
  const setTimeRulesSnapshot = useSubtitlesStore((state) => state.setTimeRulesSnapshot);
  const revertTimeRulesSnapshot = useSubtitlesStore((state) => state.revertTimeRulesSnapshot);
  const [activeRule, setActiveRule] = useState<TimeRule>("max-cps");
  const [maxCps, setMaxCps] = useState("");
  const [maxCpsWindowMs, setMaxCpsWindowMs] = useState("");
  const [maxCpsDontCutWords, setMaxCpsDontCutWords] = useState(true);
  const [minCps, setMinCps] = useState("");
  const [minCpsWindowMs, setMinCpsWindowMs] = useState("");
  const [minCpsDontCutWords, setMinCpsDontCutWords] = useState(true);
  const [maxWps, setMaxWps] = useState("");
  const [maxWpsWindowMs, setMaxWpsWindowMs] = useState("");
  const [minWps, setMinWps] = useState("");
  const [minWpsWindowMs, setMinWpsWindowMs] = useState("");
  const [minGap, setMinGap] = useState("");
  const [maxGap, setMaxGap] = useState("");
  const [mergeGap, setMergeGap] = useState("");
  const [shiftMs, setShiftMs] = useState("");
  const [shiftDirection, setShiftDirection] = useState<ShiftDirection>("forward");
  const [trimMs, setTrimMs] = useState("");
  const isMaxCpsActive = activeRule === "max-cps";
  const isMinCpsActive = activeRule === "min-cps";
  const isMaxWpsActive = activeRule === "max-wps";
  const isMinWpsActive = activeRule === "min-wps";
  const isMinGapActive = activeRule === "min-gap";
  const isMaxGapActive = activeRule === "max-gap";
  const isMergeGapActive = activeRule === "merge-gap";
  const isShiftActive = activeRule === "shift";
  const isFixOverlapsActive = activeRule === "fix-overlaps";
  const isTrimActive = activeRule === "trim-duration";

  const parsePositiveNumber = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  };

  const handleApply = () => {
    if (subtitles.length === 0) {
      toast({
        title: "No subtitles loaded",
        description: "Upload a subtitle file to apply time rules.",
      });
      return;
    }

    const options: TimeRuleOptions = {
      maxCps: parsePositiveNumber(maxCps),
      maxCpsWindowMs: parsePositiveNumber(maxCpsWindowMs),
      maxCpsDontCutWords,
      minCps: parsePositiveNumber(minCps),
      minCpsWindowMs: parsePositiveNumber(minCpsWindowMs),
      minCpsDontCutWords,
      maxWps: parsePositiveNumber(maxWps),
      maxWpsWindowMs: parsePositiveNumber(maxWpsWindowMs),
      minWps: parsePositiveNumber(minWps),
      minWpsWindowMs: parsePositiveNumber(minWpsWindowMs),
      minGapMs: parsePositiveNumber(minGap),
      maxGapMs: parsePositiveNumber(maxGap),
      mergeGapMs: parsePositiveNumber(mergeGap),
      shiftMs: parsePositiveNumber(shiftMs),
      shiftDirection,
      trimMs: parsePositiveNumber(trimMs),
    };

    const nextSubtitles = applyTimeRule(subtitles, activeRule, options);
    if (nextSubtitles === subtitles) {
      toast({
        title: "No changes applied",
        description: "Check the rule inputs and try again.",
      });
      return;
    }

    setTimeRulesSnapshot();
    setSubtitles(nextSubtitles);
    toast({
      title: "Time rule applied",
      description: "Your timing adjustments have been applied to all subtitles.",
    });
  };

  const handleRevert = () => {
    if (!timeRulesSnapshot) {
      toast({
        title: "Nothing to revert",
        description: "Apply a time rule to create a snapshot first.",
      });
      return;
    }

    revertTimeRulesSnapshot();
    toast({
      title: "Changes reverted",
      description: "Subtitles were restored to the state before the last apply.",
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto p-1">
        <div className="space-y-5">
          <Section title="Density">
            <div className="flex flex-wrap gap-2.5">
              <RuleCard rule="max-cps" active={isMaxCpsActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="max-cps" className="text-sm font-medium">
                    Max characters per window
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="max-cps"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={maxCps}
                      onChange={(event) => setMaxCps(event.target.value)}
                      disabled={!isMaxCpsActive}
                    />
                    <span className="text-xs text-muted-foreground">chars</span>
                    <span className="text-xs text-muted-foreground">per</span>
                    <Input
                      id="max-cps-window"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={maxCpsWindowMs}
                      onChange={(event) => setMaxCpsWindowMs(event.target.value)}
                      disabled={!isMaxCpsActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="max-cps-dont-cut"
                      checked={maxCpsDontCutWords}
                      onCheckedChange={(checked) => setMaxCpsDontCutWords(Boolean(checked))}
                      disabled={!isMaxCpsActive}
                    />
                    <Label htmlFor="max-cps-dont-cut" className="font-normal cursor-pointer">
                      Don&apos;t cut words
                    </Label>
                  </div>
                </div>
              </RuleCard>
              <RuleCard rule="min-cps" active={isMinCpsActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="min-cps" className="text-sm font-medium">
                    Min characters per window
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="min-cps"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={minCps}
                      onChange={(event) => setMinCps(event.target.value)}
                      disabled={!isMinCpsActive}
                    />
                    <span className="text-xs text-muted-foreground">chars</span>
                    <span className="text-xs text-muted-foreground">per</span>
                    <Input
                      id="min-cps-window"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={minCpsWindowMs}
                      onChange={(event) => setMinCpsWindowMs(event.target.value)}
                      disabled={!isMinCpsActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="min-cps-dont-cut"
                      checked={minCpsDontCutWords}
                      onCheckedChange={(checked) => setMinCpsDontCutWords(Boolean(checked))}
                      disabled={!isMinCpsActive}
                    />
                    <Label htmlFor="min-cps-dont-cut" className="font-normal cursor-pointer">
                      Don&apos;t cut words
                    </Label>
                  </div>
                </div>
              </RuleCard>
              <RuleCard rule="max-wps" active={isMaxWpsActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="max-wps" className="text-sm font-medium">
                    Max words per window
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="max-wps"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={maxWps}
                      onChange={(event) => setMaxWps(event.target.value)}
                      disabled={!isMaxWpsActive}
                    />
                    <span className="text-xs text-muted-foreground">words</span>
                    <span className="text-xs text-muted-foreground">per</span>
                    <Input
                      id="max-wps-window"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={maxWpsWindowMs}
                      onChange={(event) => setMaxWpsWindowMs(event.target.value)}
                      disabled={!isMaxWpsActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                </div>
              </RuleCard>
              <RuleCard rule="min-wps" active={isMinWpsActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="min-wps" className="text-sm font-medium">
                    Min words per window
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="min-wps"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={minWps}
                      onChange={(event) => setMinWps(event.target.value)}
                      disabled={!isMinWpsActive}
                    />
                    <span className="text-xs text-muted-foreground">words</span>
                    <span className="text-xs text-muted-foreground">per</span>
                    <Input
                      id="min-wps-window"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={minWpsWindowMs}
                      onChange={(event) => setMinWpsWindowMs(event.target.value)}
                      disabled={!isMinWpsActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                </div>
              </RuleCard>
            </div>
          </Section>
          <Section title="Gaps">
            <div className="flex flex-wrap gap-2.5">
              <RuleCard rule="min-gap" active={isMinGapActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="min-gap" className="text-sm font-medium">
                    Minimum gap
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="min-gap"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={minGap}
                      onChange={(event) => setMinGap(event.target.value)}
                      disabled={!isMinGapActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                </div>
              </RuleCard>
              <RuleCard rule="max-gap" active={isMaxGapActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="max-gap" className="text-sm font-medium">
                    Max gap
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="max-gap"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={maxGap}
                      onChange={(event) => setMaxGap(event.target.value)}
                      disabled={!isMaxGapActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                </div>
              </RuleCard>
              <RuleCard rule="merge-gap" active={isMergeGapActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="merge-gap" className="text-sm font-medium">
                    Merge gaps if smaller than
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="merge-gap"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={mergeGap}
                      onChange={(event) => setMergeGap(event.target.value)}
                      disabled={!isMergeGapActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Consecutive subtitles closer than this gap will be merged.
                  </p>
                </div>
              </RuleCard>
            </div>
          </Section>
          <Section title="Global adjustments">
            <div className="flex flex-wrap gap-2.5">
              <RuleCard rule="shift" active={isShiftActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="shift-ms" className="text-sm font-medium">
                    Shift all subtitles by
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="shift-ms"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={shiftMs}
                      onChange={(event) => setShiftMs(event.target.value)}
                      disabled={!isShiftActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                    <RadioGroup
                      value={shiftDirection}
                      onValueChange={(value) => setShiftDirection(value as ShiftDirection)}
                      className="flex items-center gap-3"
                    >
                      <Label className="flex items-center gap-2 font-normal">
                        <RadioGroupItem value="forward" disabled={!isShiftActive} />
                        Forward
                      </Label>
                      <Label className="flex items-center gap-2 font-normal">
                        <RadioGroupItem value="backward" disabled={!isShiftActive} />
                        Backward
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              </RuleCard>
              <RuleCard rule="fix-overlaps" active={isFixOverlapsActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fix overlapping subtitles</Label>
                  <p className="text-xs text-muted-foreground">
                    Adjust overlapping subtitles to ensure correct order.
                  </p>
                </div>
              </RuleCard>
            </div>
          </Section>
          <Section title="Duration">
            <div className="flex flex-wrap gap-2.5">
              <RuleCard rule="trim-duration" active={isTrimActive} onActivate={setActiveRule}>
                <div className="space-y-2">
                  <Label htmlFor="trim-ms" className="text-sm font-medium">
                    Trim duration by
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="trim-ms"
                      type="number"
                      min="1"
                      step="1"
                      className="max-w-[160px]"
                      value={trimMs}
                      onChange={(event) => setTrimMs(event.target.value)}
                      disabled={!isTrimActive}
                    />
                    <span className="text-xs text-muted-foreground">ms</span>
                  </div>
                </div>
              </RuleCard>
            </div>
          </Section>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-end gap-2 border-t pt-3">
        <Button variant="outline" size="sm" onClick={handleRevert}>
          Revert
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply Time Rules
        </Button>
      </div>
    </div>
  );
}
