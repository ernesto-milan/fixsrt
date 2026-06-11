import type { SubtitleBlock } from "@/shared/types/subtitle";

export type TimeRule =
  | "max-cps"
  | "min-cps"
  | "max-wps"
  | "min-wps"
  | "min-gap"
  | "max-gap"
  | "merge-gap"
  | "shift"
  | "fix-overlaps"
  | "trim-duration";

export type TimeRuleOptions = {
  maxCps: number | null;
  maxCpsWindowMs: number | null;
  maxCpsDontCutWords: boolean;
  minCps: number | null;
  minCpsWindowMs: number | null;
  minCpsDontCutWords: boolean;
  maxWps: number | null;
  maxWpsWindowMs: number | null;
  minWps: number | null;
  minWpsWindowMs: number | null;
  minGapMs: number | null;
  maxGapMs: number | null;
  mergeGapMs: number | null;
  shiftMs: number | null;
  shiftDirection: "forward" | "backward";
  trimMs: number | null;
};

const toMs = (seconds: number) => seconds * 1000;
const toSeconds = (ms: number) => ms / 1000;

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

const applySpeedRule = (
  subtitles: SubtitleBlock[],
  maxUnitsPerWindow: number,
  windowMs: number,
  countFn: (text: string) => number,
  unitMode: "chars" | "words",
  ruleTag: string,
  dontCutWords = false,
): SubtitleBlock[] => {
  if (!Number.isFinite(maxUnitsPerWindow) || maxUnitsPerWindow <= 0) return subtitles;
  if (!Number.isFinite(windowMs) || windowMs <= 0) return subtitles;
  const maxPerSecond = (maxUnitsPerWindow / windowMs) * 1000;

  const splitByCharacters = (text: string, segments: number) => {
    if (segments <= 1) return [text];
    const totalLength = text.length;
    const count = Math.min(segments, totalLength);
    if (count <= 1) return [text];
    const pieces: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const start = Math.round((i * totalLength) / count);
      const end = Math.round(((i + 1) * totalLength) / count);
      pieces.push(text.slice(start, end));
    }
    return pieces.filter((piece) => piece.length > 0);
  };

  const splitByUnits = (text: string, segments: number) => {
    if (segments <= 1) return [text];
    const tokens = text.match(/\S+\s*/g);
    if (!tokens || tokens.length <= 1) {
      if (unitMode === "chars") {
        if (dontCutWords) return [text];
        return splitByCharacters(text, segments);
      }
      return [text];
    }

    if (unitMode === "chars" && segments > tokens.length) {
      if (dontCutWords) {
        return tokens.map((token) => token.trim()).filter(Boolean);
      }
      return splitByCharacters(text, segments);
    }

    const limit = Math.min(segments, tokens.length);
    const tokenUnits = tokens.map((token) =>
      unitMode === "chars" ? token.length : 1,
    );
    const totalUnits = tokenUnits.reduce((sum, units) => sum + units, 0);
    if (totalUnits <= 0) return [text];

    const segmentsText: string[] = [];
    let remainingUnits = totalUnits;
    let remainingSegments = limit;
    let currentText = "";
    let currentUnits = 0;

    for (let i = 0; i < tokens.length; i += 1) {
      currentText += tokens[i];
      currentUnits += tokenUnits[i];
      const targetUnits = remainingUnits / remainingSegments;
      if (segmentsText.length < limit - 1 && currentUnits >= targetUnits) {
        segmentsText.push(currentText);
        remainingUnits -= currentUnits;
        remainingSegments -= 1;
        currentText = "";
        currentUnits = 0;
      }
    }

    if (currentText) {
      segmentsText.push(currentText);
    }

    const normalized = segmentsText.map((segment) => segment.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized : [text.trim()];
  };

  const stamp = Date.now();
  let changed = false;
  const next: SubtitleBlock[] = [];
  let segmentCounter = 0;

  subtitles.forEach((subtitle, index) => {
    const count = countFn(subtitle.text);
    if (count === 0) {
      next.push(subtitle);
      return;
    }

    const startMs = toMs(subtitle.startTime);
    const endMs = toMs(subtitle.endTime);
    const durationMs = Math.max(0, endMs - startMs);
    const actual = durationMs > 0 ? count / (durationMs / 1000) : Number.POSITIVE_INFINITY;
    if (actual <= maxPerSecond) {
      next.push(subtitle);
      return;
    }

    const segmentsTarget = Math.max(1, Math.ceil(count / maxUnitsPerWindow));
    const segments = splitByUnits(subtitle.text, segmentsTarget);
    const requiredDurationMs = (count / maxPerSecond) * 1000;
    let nextEndMs = Math.max(endMs, startMs + requiredDurationMs);

    const nextSubtitle = subtitles[index + 1];
    if (nextSubtitle) {
      const nextStartMs = toMs(nextSubtitle.startTime);
      const limitEndMs = nextStartMs >= endMs ? nextStartMs : endMs;
      if (nextEndMs > limitEndMs) {
        nextEndMs = limitEndMs;
      }
    }

    if (segments.length <= 1 || nextEndMs <= startMs) {
      if (nextEndMs === endMs) {
        next.push(subtitle);
        return;
      }
      changed = true;
      next.push({ ...subtitle, endTime: toSeconds(nextEndMs) });
      return;
    }

    const totalCount = segments.reduce((sum, segment) => sum + countFn(segment), 0);
    const totalDurationMs = Math.max(0, nextEndMs - startMs);
    if (totalCount <= 0 || totalDurationMs <= 0) {
      if (nextEndMs === endMs) {
        next.push(subtitle);
        return;
      }
      changed = true;
      next.push({ ...subtitle, endTime: toSeconds(nextEndMs) });
      return;
    }
    let currentStartMs = startMs;
    let usedDurationMs = 0;

    segments.forEach((segment, segmentIndex) => {
      const segmentCount = countFn(segment);
      const isLast = segmentIndex === segments.length - 1;
      const segmentDurationMs = isLast
        ? totalDurationMs - usedDurationMs
        : totalDurationMs * (segmentCount / totalCount);
      const segmentEndMs = isLast ? nextEndMs : currentStartMs + segmentDurationMs;
      segmentCounter += 1;
      next.push({
        ...subtitle,
        id: `${ruleTag}-${subtitle.id}-${segmentCounter}-${stamp}`,
        text: segment,
        startTime: toSeconds(currentStartMs),
        endTime: toSeconds(segmentEndMs),
      });
      usedDurationMs += segmentDurationMs;
      currentStartMs = segmentEndMs;
    });
    changed = true;
  });

  if (!changed) return subtitles;
  return reindexSubtitles(next);
};

const applyMinimumSpeedRule = (
  subtitles: SubtitleBlock[],
  minUnitsPerWindow: number,
  windowMs: number,
  countFn: (text: string) => number,
  ruleTag: string,
): SubtitleBlock[] => {
  if (!Number.isFinite(minUnitsPerWindow) || minUnitsPerWindow <= 0) return subtitles;
  if (!Number.isFinite(windowMs) || windowMs <= 0) return subtitles;

  const minUnitsPerMs = minUnitsPerWindow / windowMs;
  const merged: SubtitleBlock[] = [];
  const stamp = Date.now();
  let changed = false;
  let mergeIndex = 0;

  const joinText = (left: string, right: string) => {
    if (!left) return right;
    if (!right) return left;
    return `${left} ${right}`;
  };

  for (let i = 0; i < subtitles.length; i += 1) {
    let current = { ...subtitles[i] };
    const currentStartMs = toMs(current.startTime);
    let currentEndMs = toMs(current.endTime);
    let currentDurationMs = Math.max(0, currentEndMs - currentStartMs);
    let currentCount = countFn(current.text);
    let currentRate =
      currentDurationMs > 0
        ? currentCount / currentDurationMs
        : currentCount > 0
          ? Number.POSITIVE_INFINITY
          : 0;

    while (i < subtitles.length - 1 && currentRate < minUnitsPerMs) {
      const nextSubtitle = subtitles[i + 1];
      mergeIndex += 1;
      current = {
        ...current,
        id: `${ruleTag}-${current.id}-${nextSubtitle.id}-${stamp}-${mergeIndex}`,
        text: joinText(current.text, nextSubtitle.text),
        endTime: nextSubtitle.endTime,
      };
      currentEndMs = toMs(nextSubtitle.endTime);
      currentDurationMs = Math.max(0, currentEndMs - currentStartMs);
      currentCount = countFn(current.text);
      currentRate =
        currentDurationMs > 0
          ? currentCount / currentDurationMs
          : currentCount > 0
            ? Number.POSITIVE_INFINITY
            : 0;
      changed = true;
      i += 1;
    }

    merged.push(current);
  }

  if (!changed) return subtitles;
  return reindexSubtitles(merged);
};

const applyMinGap = (subtitles: SubtitleBlock[], minGapMs: number): SubtitleBlock[] => {
  if (!Number.isFinite(minGapMs) || minGapMs <= 0) return subtitles;

  const next = subtitles.map((subtitle) => ({ ...subtitle }));
  let changed = false;

  for (let i = 0; i < next.length - 1; i += 1) {
    const current = next[i];
    const following = next[i + 1];
    const gapMs = toMs(following.startTime) - toMs(current.endTime);
    if (gapMs >= minGapMs) continue;

    const durationMs = toMs(following.endTime) - toMs(following.startTime);
    const newStartMs = toMs(current.endTime) + minGapMs;
    following.startTime = toSeconds(newStartMs);
    following.endTime = toSeconds(newStartMs + durationMs);
    changed = true;
  }

  return changed ? next : subtitles;
};

const applyMaxGap = (subtitles: SubtitleBlock[], maxGapMs: number): SubtitleBlock[] => {
  if (!Number.isFinite(maxGapMs) || maxGapMs <= 0) return subtitles;

  const next = subtitles.map((subtitle) => ({ ...subtitle }));
  let changed = false;

  for (let i = 0; i < next.length - 1; i += 1) {
    const current = next[i];
    const following = next[i + 1];
    const gapMs = toMs(following.startTime) - toMs(current.endTime);
    if (gapMs <= maxGapMs) continue;

    const shiftMs = gapMs - maxGapMs;
    for (let j = i + 1; j < next.length; j += 1) {
      const startMs = toMs(next[j].startTime) - shiftMs;
      const endMs = toMs(next[j].endTime) - shiftMs;
      next[j].startTime = toSeconds(startMs);
      next[j].endTime = toSeconds(endMs);
    }
    changed = true;
  }

  return changed ? next : subtitles;
};

const reindexSubtitles = (subtitles: SubtitleBlock[]): SubtitleBlock[] =>
  subtitles.map((subtitle, index) => ({ ...subtitle, index: index + 1 }));

const applyMergeGap = (subtitles: SubtitleBlock[], mergeGapMs: number): SubtitleBlock[] => {
  if (!Number.isFinite(mergeGapMs) || mergeGapMs <= 0) return subtitles;

  const merged: SubtitleBlock[] = [];
  const stamp = Date.now();
  let changed = false;
  let mergeIndex = 0;

  for (let i = 0; i < subtitles.length; i += 1) {
    let current = { ...subtitles[i] };
    while (i < subtitles.length - 1) {
      const nextSubtitle = subtitles[i + 1];
      const gapMs = toMs(nextSubtitle.startTime) - toMs(current.endTime);
      if (gapMs >= mergeGapMs) break;

      mergeIndex += 1;
      current = {
        ...current,
        id: `merge-${current.id}-${nextSubtitle.id}-${stamp}-${mergeIndex}`,
        text: `${current.text} ${nextSubtitle.text}`,
        endTime: nextSubtitle.endTime,
      };
      changed = true;
      i += 1;
    }
    merged.push(current);
  }

  if (!changed) return subtitles;
  return reindexSubtitles(merged);
};

const applyShift = (
  subtitles: SubtitleBlock[],
  shiftMs: number,
  direction: TimeRuleOptions["shiftDirection"],
): SubtitleBlock[] => {
  if (!Number.isFinite(shiftMs) || shiftMs <= 0) return subtitles;

  const signedShift = direction === "backward" ? -Math.abs(shiftMs) : Math.abs(shiftMs);
  const minStartMs = Math.min(...subtitles.map((subtitle) => toMs(subtitle.startTime)));
  const effectiveShift = signedShift < 0 && minStartMs + signedShift < 0 ? -minStartMs : signedShift;
  if (effectiveShift === 0) return subtitles;

  const next = subtitles.map((subtitle) => {
    const startMs = toMs(subtitle.startTime) + effectiveShift;
    const endMs = toMs(subtitle.endTime) + effectiveShift;
    return { ...subtitle, startTime: toSeconds(startMs), endTime: toSeconds(endMs) };
  });

  return next;
};

const applyFixOverlaps = (subtitles: SubtitleBlock[]): SubtitleBlock[] => {
  const next = subtitles.map((subtitle) => ({ ...subtitle }));
  let changed = false;

  for (let i = 0; i < next.length - 1; i += 1) {
    const current = next[i];
    const following = next[i + 1];
    if (following.startTime >= current.endTime) continue;

    const durationMs = toMs(following.endTime) - toMs(following.startTime);
    const newStartMs = toMs(current.endTime);
    following.startTime = toSeconds(newStartMs);
    following.endTime = toSeconds(newStartMs + durationMs);
    changed = true;
  }

  return changed ? next : subtitles;
};

const applyTrimDuration = (subtitles: SubtitleBlock[], trimMs: number): SubtitleBlock[] => {
  if (!Number.isFinite(trimMs) || trimMs <= 0) return subtitles;

  const next = subtitles.map((subtitle) => ({ ...subtitle }));
  let changed = false;

  for (const subtitle of next) {
    const startMs = toMs(subtitle.startTime);
    const endMs = toMs(subtitle.endTime);
    const durationMs = Math.max(0, endMs - startMs);
    const maxTrimMs = durationMs - 1;
    if (maxTrimMs <= 0) continue;

    const actualTrimMs = Math.min(trimMs, maxTrimMs);
    if (actualTrimMs <= 0) continue;

    const halfTrimMs = actualTrimMs / 2;
    const newStartMs = startMs + halfTrimMs;
    const newEndMs = endMs - halfTrimMs;
    if (newEndMs <= newStartMs) continue;

    subtitle.startTime = toSeconds(newStartMs);
    subtitle.endTime = toSeconds(newEndMs);
    changed = true;
  }

  return changed ? next : subtitles;
};

export function applyTimeRule(
  subtitles: SubtitleBlock[],
  rule: TimeRule,
  options: TimeRuleOptions,
): SubtitleBlock[] {
  if (subtitles.length === 0) return subtitles;

  switch (rule) {
    case "max-cps":
      if (!options.maxCps || !options.maxCpsWindowMs) return subtitles;
      return applySpeedRule(
        subtitles,
        options.maxCps,
        options.maxCpsWindowMs,
        (text) => text.length,
        "chars",
        "cps",
        options.maxCpsDontCutWords,
      );
    case "min-cps":
      if (!options.minCps || !options.minCpsWindowMs) return subtitles;
      return applyMinimumSpeedRule(
        subtitles,
        options.minCps,
        options.minCpsWindowMs,
        (text) => text.length,
        "min-cps",
      );
    case "max-wps":
      if (!options.maxWps || !options.maxWpsWindowMs) return subtitles;
      return applySpeedRule(
        subtitles,
        options.maxWps,
        options.maxWpsWindowMs,
        countWords,
        "words",
        "wps",
      );
    case "min-wps":
      if (!options.minWps || !options.minWpsWindowMs) return subtitles;
      return applyMinimumSpeedRule(
        subtitles,
        options.minWps,
        options.minWpsWindowMs,
        countWords,
        "min-wps",
      );
    case "min-gap":
      if (!options.minGapMs) return subtitles;
      return applyMinGap(subtitles, options.minGapMs);
    case "max-gap":
      if (!options.maxGapMs) return subtitles;
      return applyMaxGap(subtitles, options.maxGapMs);
    case "merge-gap":
      if (!options.mergeGapMs) return subtitles;
      return applyMergeGap(subtitles, options.mergeGapMs);
    case "shift":
      if (!options.shiftMs) return subtitles;
      return applyShift(subtitles, options.shiftMs, options.shiftDirection);
    case "fix-overlaps":
      return applyFixOverlaps(subtitles);
    case "trim-duration":
      if (!options.trimMs) return subtitles;
      return applyTrimDuration(subtitles, options.trimMs);
    default:
      return subtitles;
  }
}
