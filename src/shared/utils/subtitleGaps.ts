import type { SubtitleBlock } from "@/shared/types/subtitle";

export type SubtitleGap = {
  id: string;
  start: number;
  end: number;
  leftId: string;
  rightId: string;
};

export const getSubtitleGaps = (subtitles: SubtitleBlock[]): SubtitleGap[] => {
  const ordered = [...subtitles].sort((a, b) => a.startTime - b.startTime);
  const result: SubtitleGap[] = [];

  for (let i = 0; i < ordered.length - 1; i += 1) {
    const start = ordered[i].endTime;
    const end = ordered[i + 1].startTime;
    if (end <= start) continue;
    result.push({
      id: `gap-${i}-${Math.round(start * 1000)}-${Math.round(end * 1000)}`,
      start,
      end,
      leftId: ordered[i].id,
      rightId: ordered[i + 1].id,
    });
  }

  return result;
};
