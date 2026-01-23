"use client";

import { useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useToast } from "@/shared/hooks/use-toast";
import { applyTextRule, type TextRule, type TextRuleOptions } from "@/shared/utils/textRules";

const cardBaseClass = "rounded-lg border bg-card p-4 space-y-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const activeCardClass = "border-primary/40 shadow-sm";
const inactiveCardClass = "border-border/60 opacity-60 hover:opacity-80";

type RuleCardProps = {
  rule: TextRule;
  active: boolean;
  onActivate: (rule: TextRule) => void;
  className?: string;
  children: ReactNode;
};

function RuleCard({ rule, active, onActivate, className, children }: RuleCardProps) {
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
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLButtonElement
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
      className={cn(cardBaseClass, active ? activeCardClass : inactiveCardClass, className)}
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
    <div className="space-y-3 mr-2">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground dark:text-white">
        <span>{title}</span>
        <span className="flex-1 h-px bg-border dark:bg-white/60" />
      </div>
      {children}
    </div>
  );
}

export function TextRulesPanel() {
  const { toast } = useToast();
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const setSubtitles = useSubtitlesStore((state) => state.setSubtitles);
  const resetToOriginal = useSubtitlesStore((state) => state.resetToOriginal);
  const [activeRule, setActiveRule] = useState<TextRule>("cpl");
  const [maxCpl, setMaxCpl] = useState("");
  const [dontCutWords, setDontCutWords] = useState(true);
  const [maxWpl, setMaxWpl] = useState("");
  const [splitSymbol, setSplitSymbol] = useState("");
  const [splitSymbolMode, setSplitSymbolMode] = useState<"keep" | "remove">("keep");
  const [splitWord, setSplitWord] = useState("");
  const [removeSymbols, setRemoveSymbols] = useState("");
  const [textCase, setTextCase] = useState<"none" | "upper" | "lower" | "title">("upper");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const isCplActive = activeRule === "cpl";
  const isWplActive = activeRule === "wpl";
  const isSplitSymbolActive = activeRule === "split-symbol";
  const isSplitWordActive = activeRule === "split-word";
  const isRemoveSymbolsActive = activeRule === "remove-symbols";
  const isTransformSpacesActive = activeRule === "transform-spaces";
  const isTextCaseActive = activeRule === "text-case";
  const isFindReplaceActive = activeRule === "find-replace";
  const isReplaceWordsActive = activeRule === "replace-words";

  const parsePositiveInt = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return Math.floor(parsed);
  };

  const activateRule = (rule: TextRule) => setActiveRule(rule);

  const handleApply = () => {
    if (subtitles.length === 0) {
      toast({
        title: "No subtitles loaded",
        description: "Upload a subtitle file to apply text rules.",
      });
      return;
    }

    const options: TextRuleOptions = {
      maxCpl: parsePositiveInt(maxCpl),
      dontCutWords,
      maxWpl: parsePositiveInt(maxWpl),
      splitSymbol,
      splitSymbolMode,
      splitWord,
      removeSymbols,
      transformSpaces: "remove-extra",
      textCase,
      findText,
      replaceText,
    };

    const nextSubtitles = applyTextRule(subtitles, activeRule, options);
    if (nextSubtitles === subtitles) {
      toast({
        title: "No changes applied",
        description: "Check the rule inputs and try again.",
      });
      return;
    }

    setSubtitles(nextSubtitles);
    toast({
      title: "Text rule applied",
      description: "Your subtitles were updated with the active rule.",
    });
  };

  const handleRevert = () => {
    resetToOriginal();
    toast({
      title: "Rules reverted",
      description: "Subtitles were reset to the original file.",
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto p-1">
        <div className="space-y-6">
          <Section title="Structure">
            <div className="flex flex-wrap gap-4">
              <RuleCard rule="cpl" active={isCplActive} onActivate={activateRule}>
                <div className="space-y-1">
                  <Label htmlFor="max-cpl" className="text-sm font-medium">
                    Max characters per line
                  </Label>
                  <Input
                    id="max-cpl"
                    type="number"
                    className="max-w-[160px]"
                    value={maxCpl}
                    onChange={(event) => setMaxCpl(event.target.value)}
                    disabled={!isCplActive}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="dont-cut-words"
                    checked={dontCutWords}
                    onCheckedChange={(checked) => setDontCutWords(Boolean(checked))}
                    disabled={!isCplActive}
                  />
                  <Label htmlFor="dont-cut-words" className="font-normal cursor-pointer">
                    Don&apos;t cut words
                  </Label>
                </div>
              </RuleCard>
              <RuleCard rule="wpl" active={isWplActive} onActivate={activateRule}>
                <div className="space-y-1">
                  <Label htmlFor="max-wpl" className="text-sm font-medium">
                    Max words per line
                  </Label>
                  <Input
                    id="max-wpl"
                    type="number"
                    className="max-w-[160px]"
                    value={maxWpl}
                    onChange={(event) => setMaxWpl(event.target.value)}
                    disabled={!isWplActive}
                  />
                </div>
              </RuleCard>
            </div>
          </Section>

          <Section title="Split">
            <div className="flex flex-wrap gap-4">
              <RuleCard rule="split-symbol" active={isSplitSymbolActive} onActivate={activateRule}>
                <div className="space-y-1">
                  <Label htmlFor="split-symbol" className="text-sm font-medium">
                    Split by symbol
                  </Label>
                  <Input
                    id="split-symbol"
                    className="max-w-[160px]"
                    value={splitSymbol}
                    onChange={(event) => setSplitSymbol(event.target.value)}
                    disabled={!isSplitSymbolActive}
                  />
                </div>
                <RadioGroup
                  value={splitSymbolMode}
                  onValueChange={(value) => setSplitSymbolMode(value as "keep" | "remove")}
                  className="grid gap-3"
                >
                  <Label className="flex items-center gap-2 font-normal">
                    <RadioGroupItem value="keep" disabled={!isSplitSymbolActive} />
                    Keep symbol
                  </Label>
                  <Label className="flex items-center gap-2 font-normal">
                    <RadioGroupItem value="remove" disabled={!isSplitSymbolActive} />
                    Remove symbol
                  </Label>
                </RadioGroup>
              </RuleCard>
              <RuleCard rule="split-word" active={isSplitWordActive} onActivate={activateRule}>
                <div className="space-y-1">
                  <Label htmlFor="split-word" className="text-sm font-medium">
                    Split by word
                  </Label>
                  <Input
                    id="split-word"
                    className="max-w-[160px]"
                    value={splitWord}
                    onChange={(event) => setSplitWord(event.target.value)}
                    disabled={!isSplitWordActive}
                  />
                </div>
              </RuleCard>
            </div>
          </Section>

          <Section title="Cleanup">
            <div className="flex flex-wrap gap-4">
              <RuleCard rule="transform-spaces" active={isTransformSpacesActive} onActivate={activateRule}>
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Transform spaces</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove extra spaces within each line.
                  </p>
                </div>
              </RuleCard>
              <RuleCard rule="text-case" active={isTextCaseActive} onActivate={activateRule}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Text case</Label>
                  <RadioGroup
                    value={textCase}
                    onValueChange={(value) => setTextCase(value as "none" | "upper" | "lower" | "title")}
                    className="grid gap-3"
                  >
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="upper" disabled={!isTextCaseActive} />
                      UPPERCASE
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="lower" disabled={!isTextCaseActive} />
                      lowercase
                    </Label>
                    <Label className="flex items-center gap-2 font-normal">
                      <RadioGroupItem value="title" disabled={!isTextCaseActive} />
                      Title Case
                    </Label>
                  </RadioGroup>
                </div>
              </RuleCard>
              <RuleCard rule="remove-symbols" active={isRemoveSymbolsActive} onActivate={activateRule}>
                <div className="space-y-1">
                  <Label htmlFor="remove-symbols" className="text-sm font-medium">
                    Remove symbols
                  </Label>
                  <Input
                    id="remove-symbols"
                    className="max-w-[200px]"
                    value={removeSymbols}
                    onChange={(event) => setRemoveSymbols(event.target.value)}
                    disabled={!isRemoveSymbolsActive}
                  />
                </div>
              </RuleCard>
              <RuleCard rule="find-replace" active={isFindReplaceActive} onActivate={activateRule}>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Find &amp; replace characters</Label>
                  <Input
                    id="find-text"
                    className="max-w-[240px]"
                    value={findText}
                    onChange={(event) => setFindText(event.target.value)}
                    disabled={!isFindReplaceActive}
                  />
                  <Input
                    id="replace-text"
                    className="max-w-[240px]"
                    value={replaceText}
                    onChange={(event) => setReplaceText(event.target.value)}
                    disabled={!isFindReplaceActive}
                  />
                </div>
              </RuleCard>
              <RuleCard rule="replace-words" active={isReplaceWordsActive} onActivate={activateRule}>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Find &amp; replace words</Label>
                  <Input
                    id="find-word"
                    className="max-w-[240px]"
                    value={findText}
                    onChange={(event) => setFindText(event.target.value)}
                    disabled={!isReplaceWordsActive}
                  />
                  <Input
                    id="replace-word"
                    className="max-w-[240px]"
                    value={replaceText}
                    onChange={(event) => setReplaceText(event.target.value)}
                    disabled={!isReplaceWordsActive}
                  />
                </div>
              </RuleCard>
            </div>
          </Section>
        </div>
      </div>

      <div className="pt-4 border-t mt-auto flex items-center justify-end gap-3">
        <Button variant="outline" className="min-w-[140px]" onClick={handleRevert}>
          Revert Rules
        </Button>
        <Button className="min-w-[160px]" onClick={handleApply}>
          Apply Text Rules
        </Button>
      </div>
    </div>
  );
}
