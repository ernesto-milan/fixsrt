import type { SubtitleBlock } from "@/shared/types/subtitle";

export type TextRule =
  | "cpl"
  | "wpl"
  | "split-symbol"
  | "split-word"
  | "remove-symbols"
  | "transform-spaces"
  | "text-case"
  | "find-replace"
  | "replace-words";

export type TextRuleOptions = {
  maxCpl: number | null;
  dontCutWords: boolean;
  maxWpl: number | null;
  splitSymbol: string;
  splitSymbolMode: "keep" | "remove";
  splitWord: string;
  removeSymbols: string;
  transformSpaces: "none" | "remove-extra" | "normalize";
  textCase: "none" | "upper" | "lower" | "title";
  findText: string;
  replaceText: string;
};

type SplitMode = "remove" | "keep-left" | "keep-right";

const normalizeForReflow = (text: string) => text.replace(/\s+/g, " ").trim();

const chunkWord = (word: string, size: number) => {
  if (size <= 0) return [word];
  const chunks: string[] = [];
  for (let i = 0; i < word.length; i += size) {
    chunks.push(word.slice(i, i + size));
  }
  return chunks;
};

const splitByMaxCpl = (text: string, maxCpl: number, dontCutWords: boolean): string[] => {
  const normalized = normalizeForReflow(text);
  if (!normalized) return [""];
  if (!Number.isFinite(maxCpl) || maxCpl <= 0) return [normalized];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  const pushCurrent = () => {
    if (current) {
      lines.push(current);
      current = "";
    }
  };

  for (const word of words) {
    if (!current) {
      if (!dontCutWords && word.length > maxCpl) {
        lines.push(...chunkWord(word, maxCpl));
        continue;
      }
      current = word;
      continue;
    }

    if (current.length + 1 + word.length <= maxCpl) {
      current = `${current} ${word}`;
      continue;
    }

    pushCurrent();
    if (!dontCutWords && word.length > maxCpl) {
      lines.push(...chunkWord(word, maxCpl));
      continue;
    }
    current = word;
  }

  pushCurrent();
  return lines.length > 0 ? lines : [normalized];
};

const splitByMaxWpl = (text: string, maxWpl: number): string[] => {
  const normalized = normalizeForReflow(text);
  if (!normalized) return [""];
  if (!Number.isFinite(maxWpl) || maxWpl <= 0) return [normalized];

  const words = normalized.split(" ");
  const lines: string[] = [];

  for (let i = 0; i < words.length; i += maxWpl) {
    lines.push(words.slice(i, i + maxWpl).join(" "));
  }

  return lines.length > 0 ? lines : [normalized];
};

const splitByDelimiter = (text: string, delimiter: string, mode: SplitMode): string[] => {
  if (!delimiter) return [text];
  const parts = text.split(delimiter);
  if (parts.length === 1) return [text];

  let segments = parts;
  if (mode === "keep-left") {
    segments = parts.map((part, index) =>
      index < parts.length - 1 ? `${part}${delimiter}` : part,
    );
  } else if (mode === "keep-right") {
    segments = parts.map((part, index) => (index === 0 ? part : `${delimiter}${part}`));
  }

  const trimmed = segments.map((segment) => segment.trim()).filter((segment) => segment.length > 0);
  return trimmed.length > 0 ? trimmed : [text.trim()];
};

const isWordChar = (char: string | undefined) => {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122)
  );
};

const isWholeWordAt = (text: string, index: number, word: string) => {
  const before = index > 0 ? text[index - 1] : undefined;
  const after = text[index + word.length];
  return !isWordChar(before) && !isWordChar(after);
};

const splitByWord = (text: string, word: string): string[] => {
  if (!word) return [text];

  const indices: number[] = [];
  for (let i = 0; i <= text.length - word.length; ) {
    if (text.startsWith(word, i) && isWholeWordAt(text, i, word)) {
      indices.push(i);
      i += word.length;
      continue;
    }
    i += 1;
  }

  if (indices.length === 0) return [text];

  const segments: string[] = [];
  let start = 0;
  for (const index of indices) {
    if (index > start) {
      segments.push(text.slice(start, index).trim());
    }
    start = index;
  }
  segments.push(text.slice(start).trim());

  const trimmed = segments.filter((segment) => segment.length > 0);
  return trimmed.length > 0 ? trimmed : [text.trim()];
};

const removeSymbolsFromText = (text: string, symbols: string): string => {
  if (!symbols) return text;
  const symbolSet = new Set(symbols.split(""));
  let next = "";
  for (const char of text) {
    if (!symbolSet.has(char)) next += char;
  }
  return next;
};

const transformSpacesInText = (
  text: string,
  mode: TextRuleOptions["transformSpaces"],
): string => {
  if (mode === "none") return text;
  return text
    .split("\n")
    .map((line) => {
      if (mode === "remove-extra") {
        return line.replace(/ {2,}/g, " ");
      }
      return line.trim().replace(/ {2,}/g, " ");
    })
    .join("\n");
};

const applyTitleCase = (text: string): string => {
  const titleCaseWord = (word: string) => {
    let foundLetter = false;
    let next = "";
    for (const char of word) {
      if (!foundLetter && /[A-Za-z]/.test(char)) {
        foundLetter = true;
        next += char.toUpperCase();
      } else if (foundLetter) {
        next += char.toLowerCase();
      } else {
        next += char;
      }
    }
    return next;
  };

  return text
    .split(/(\s+)/)
    .map((token) => {
      if (!token || token.trim() === "") return token;
      return token
        .split("-")
        .map((part) => titleCaseWord(part))
        .join("-");
    })
    .join("");
};

const applyTextCase = (text: string, mode: TextRuleOptions["textCase"]): string => {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "title") return applyTitleCase(text);
  return text;
};

const applyFindReplace = (text: string, findText: string, replaceText: string): string => {
  if (!findText) return text;
  return text.split(findText).join(replaceText);
};

const applyWordReplace = (text: string, word: string, replacement: string): string => {
  if (!word) return text;
  let next = "";
  for (let i = 0; i < text.length; ) {
    if (text.startsWith(word, i) && isWholeWordAt(text, i, word)) {
      next += replacement;
      i += word.length;
      continue;
    }
    next += text[i];
    i += 1;
  }
  return next;
};

const reindexSubtitles = (subtitles: SubtitleBlock[]): SubtitleBlock[] =>
  subtitles.map((subtitle, index) => ({ ...subtitle, index: index + 1 }));

const applySplitRule = (
  subtitles: SubtitleBlock[],
  splitFn: (text: string) => string[],
  ruleTag: string,
): SubtitleBlock[] => {
  const stamp = Date.now();
  let changed = false;
  let segmentCounter = 0;

  const next = subtitles.flatMap((subtitle) => {
    const segments = splitFn(subtitle.text);
    if (segments.length <= 1) {
      const nextText = segments[0] ?? "";
      if (nextText === subtitle.text) {
        return [subtitle];
      }
      changed = true;
      return [{ ...subtitle, text: nextText }];
    }

    changed = true;
    const totalDuration = subtitle.endTime - subtitle.startTime;
    const segmentDuration = segments.length > 0 ? totalDuration / segments.length : 0;
    let currentStart = subtitle.startTime;

    return segments.map((segment, index) => {
      const isLast = index === segments.length - 1;
      const endTime = isLast ? subtitle.endTime : currentStart + segmentDuration;
      segmentCounter += 1;
      const nextBlock: SubtitleBlock = {
        ...subtitle,
        id: `${ruleTag}-${subtitle.id}-${segmentCounter}-${stamp}`,
        text: segment,
        startTime: currentStart,
        endTime,
      };
      currentStart = endTime;
      return nextBlock;
    });
  });

  if (!changed) return subtitles;
  return reindexSubtitles(next);
};

const applyTextTransform = (
  subtitles: SubtitleBlock[],
  transformFn: (text: string) => string,
): SubtitleBlock[] => {
  let changed = false;
  const next = subtitles.map((subtitle) => {
    const nextText = transformFn(subtitle.text);
    if (nextText === subtitle.text) return subtitle;
    changed = true;
    return { ...subtitle, text: nextText };
  });

  if (!changed) return subtitles;
  return reindexSubtitles(next);
};

export function applyTextRule(
  subtitles: SubtitleBlock[],
  rule: TextRule,
  options: TextRuleOptions,
): SubtitleBlock[] {
  if (subtitles.length === 0) return subtitles;

  switch (rule) {
    case "cpl": {
      const maxCpl = options.maxCpl;
      if (maxCpl == null) return subtitles;
      return applySplitRule(subtitles, (text) => splitByMaxCpl(text, maxCpl, options.dontCutWords), "cpl");
    }
    case "wpl": {
      const maxWpl = options.maxWpl;
      if (maxWpl == null) return subtitles;
      return applySplitRule(subtitles, (text) => splitByMaxWpl(text, maxWpl), "wpl");
    }
    case "split-symbol":
      if (!options.splitSymbol) return subtitles;
      return applySplitRule(
        subtitles,
        (text) =>
          splitByDelimiter(
            text,
            options.splitSymbol,
            options.splitSymbolMode === "keep" ? "keep-left" : "remove",
          ),
        "split-symbol",
      );
    case "split-word":
      if (!options.splitWord) return subtitles;
      return applySplitRule(
        subtitles,
        (text) => splitByWord(text, options.splitWord),
        "split-word",
      );
    case "remove-symbols":
      if (!options.removeSymbols) return subtitles;
      return applyTextTransform(subtitles, (text) =>
        removeSymbolsFromText(text, options.removeSymbols),
      );
    case "transform-spaces":
      if (options.transformSpaces === "none") return subtitles;
      return applyTextTransform(subtitles, (text) =>
        transformSpacesInText(text, options.transformSpaces),
      );
    case "text-case":
      if (options.textCase === "none") return subtitles;
      return applyTextTransform(subtitles, (text) => applyTextCase(text, options.textCase));
    case "find-replace":
      if (!options.findText) return subtitles;
      return applyTextTransform(subtitles, (text) =>
        applyFindReplace(text, options.findText, options.replaceText),
      );
    case "replace-words":
      if (!options.findText) return subtitles;
      return applyTextTransform(subtitles, (text) =>
        applyWordReplace(text, options.findText, options.replaceText),
      );
    default:
      return subtitles;
  }
}
