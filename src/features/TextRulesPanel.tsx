"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/shared/lib/utils";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";
import { useToast } from "@/shared/hooks/use-toast";
import { applyTextRule, type TextRule, type TextRuleOptions } from "@/shared/utils/textRules";

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
  const [transformSpaces, setTransformSpaces] = useState<"none" | "remove-extra" | "normalize">(
    "none",
  );
  const [textCase, setTextCase] = useState<"none" | "upper" | "lower" | "title">("none");
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
      transformSpaces,
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
        <div className="flex flex-wrap items-stretch gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("cpl")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("cpl");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isCplActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-1">
              <Label htmlFor="max-cpl" className="text-sm font-medium">
                Max characters per line (Max CPL)
              </Label>
              <Input
                id="max-cpl"
                type="number"
                placeholder="42"
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
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("wpl")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("wpl");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isWplActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-1">
              <Label htmlFor="max-wpl" className="text-sm font-medium">
                Max words per line (Max WPL)
              </Label>
              <Input
                id="max-wpl"
                type="number"
                placeholder="7"
                className="max-w-[160px]"
                value={maxWpl}
                onChange={(event) => setMaxWpl(event.target.value)}
                disabled={!isWplActive}
              />
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("split-symbol")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("split-symbol");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isSplitSymbolActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-1">
              <Label htmlFor="split-symbol" className="text-sm font-medium">
                Split by symbol
              </Label>
              <Input
                id="split-symbol"
                placeholder="-"
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
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("split-word")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("split-word");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isSplitWordActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-1">
              <Label htmlFor="split-word" className="text-sm font-medium">
                Split by word
              </Label>
              <Input
                id="split-word"
                placeholder="because"
                className="max-w-[160px]"
                value={splitWord}
                onChange={(event) => setSplitWord(event.target.value)}
                disabled={!isSplitWordActive}
              />
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("remove-symbols")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("remove-symbols");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isRemoveSymbolsActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-1">
              <Label htmlFor="remove-symbols" className="text-sm font-medium">
                Remove symbols
              </Label>
              <Input
                id="remove-symbols"
                placeholder=",.!?"
                className="max-w-[200px]"
                value={removeSymbols}
                onChange={(event) => setRemoveSymbols(event.target.value)}
                disabled={!isRemoveSymbolsActive}
              />
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("transform-spaces")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("transform-spaces");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isTransformSpacesActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transform spaces</Label>
              <RadioGroup
                value={transformSpaces}
                onValueChange={(value) =>
                  setTransformSpaces(value as "none" | "remove-extra" | "normalize")
                }
                className="grid gap-3"
              >
                <Label className="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="none" disabled={!isTransformSpacesActive} />
                  None
                </Label>
                <Label className="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="remove-extra" disabled={!isTransformSpacesActive} />
                  Remove extra spaces
                </Label>
                <Label className="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="normalize" disabled={!isTransformSpacesActive} />
                  Normalize
                </Label>
              </RadioGroup>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("text-case")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("text-case");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isTextCaseActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-2">
              <Label className="text-sm font-medium">Text case</Label>
              <RadioGroup
                value={textCase}
                onValueChange={(value) => setTextCase(value as "none" | "upper" | "lower" | "title")}
                className="grid gap-3"
              >
                <Label className="flex items-center gap-2 font-normal">
                  <RadioGroupItem value="none" disabled={!isTextCaseActive} />
                  None
                </Label>
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
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("find-replace")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("find-replace");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isFindReplaceActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-3">
              <Label className="text-sm font-medium">Find &amp; replace (characters)</Label>
              <Input
                id="find-text"
                placeholder="Find"
                className="max-w-[240px]"
                value={findText}
                onChange={(event) => setFindText(event.target.value)}
                disabled={!isFindReplaceActive}
              />
              <Input
                id="replace-text"
                placeholder="Replace"
                className="max-w-[240px]"
                value={replaceText}
                onChange={(event) => setReplaceText(event.target.value)}
                disabled={!isFindReplaceActive}
              />
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setActiveRule("replace-words")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveRule("replace-words");
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 space-y-4 transition-colors",
              isReplaceWordsActive
                ? "border-primary/40 shadow-sm"
                : "border-border/60 opacity-60 hover:opacity-80",
            )}
          >
            <div className="space-y-3">
              <Label className="text-sm font-medium">Replace words</Label>
              <Input
                id="find-word"
                placeholder="Find word"
                className="max-w-[240px]"
                value={findText}
                onChange={(event) => setFindText(event.target.value)}
                disabled={!isReplaceWordsActive}
              />
              <Input
                id="replace-word"
                placeholder="Replace with"
                className="max-w-[240px]"
                value={replaceText}
                onChange={(event) => setReplaceText(event.target.value)}
                disabled={!isReplaceWordsActive}
              />
            </div>
          </div>
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
