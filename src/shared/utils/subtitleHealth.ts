import type { SubtitleBlock } from "@/shared/types/subtitle";

export type CueHealth = "ok" | "warning" | "danger";

// Thresholds for derived cue health. These mirror common subtitle QC limits;
// they only drive a visual indicator and never mutate the data.
const MAX_CPS = 25; // characters per second (reading speed ceiling)
const MIN_DURATION = 0.5; // seconds — anything shorter flashes by
const TIGHT_GAP = 0.08; // seconds — gaps below this read as "touching"
const EPSILON = 1e-3;

const visibleCharCount = (text: string) => text.replace(/\s+/g, " ").trim().length;

/**
 * Compute a health status per subtitle id from existing timing + text data:
 *  - danger  : overlaps the next cue, or has a non-positive duration
 *  - warning : reads too fast (high CPS), is very short, or sits in a tight gap
 *  - ok      : otherwise
 */
export const getSubtitleHealth = (
  subtitles: SubtitleBlock[],
): Record<string, CueHealth> => {
  const ordered = [...subtitles].sort((a, b) => a.startTime - b.startTime);
  const result: Record<string, CueHealth> = {};

  ordered.forEach((cue, i) => {
    const duration = cue.endTime - cue.startTime;
    const next = ordered[i + 1];

    if (duration <= EPSILON || (next && cue.endTime > next.startTime + EPSILON)) {
      result[cue.id] = "danger";
      return;
    }

    const cps = duration > 0 ? visibleCharCount(cue.text) / duration : Infinity;
    const gap = next ? next.startTime - cue.endTime : Infinity;

    if (cps > MAX_CPS || duration < MIN_DURATION || (gap >= 0 && gap < TIGHT_GAP)) {
      result[cue.id] = "warning";
      return;
    }

    result[cue.id] = "ok";
  });

  return result;
};
