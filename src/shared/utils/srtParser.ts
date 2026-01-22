import { parseSync, type NodeList } from "subtitle";
import { SubtitleBlock } from "@/shared/types/subtitle";

// Parse time string "00:00:00,000" to seconds.
export function parseTimeToSeconds(timeStr: string): number {
  const [time, ms] = timeStr.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const totalMs =
    (hours * 3600 + minutes * 60 + seconds) * 1000 + parseInt(ms || "0", 10);
  return totalMs / 1000;
}

// Convert seconds to time string "00:00:00,000".
export function secondsToTimeString(totalSeconds: number): string {
  const totalMs = Math.max(0, Math.round(totalSeconds * 1000));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${milliseconds
    .toString()
    .padStart(3, "0")}`;
}

// Format time for display (shorter format) from seconds.
export function formatTimeDisplay(totalSeconds: number): string {
  const totalMs = Math.max(0, Math.round(totalSeconds * 1000));
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centiseconds = Math.floor((totalMs % 1000) / 10);

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
}

// Calculate duration in seconds.
export function getDuration(startSeconds: number, endSeconds: number): string {
  const duration = endSeconds - startSeconds;
  return `${duration.toFixed(1)}s`;
}

// Parse SRT file content to SubtitleBlock array.
export function parseSRT(content: string): SubtitleBlock[] {
  const subtitles: SubtitleBlock[] = [];
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    if (Number.isNaN(index)) continue;

    const timeLine = lines[1];
    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/,
    );
    if (!timeMatch) continue;

    const startTime = parseTimeToSeconds(timeMatch[1]);
    const endTime = parseTimeToSeconds(timeMatch[2]);
    const text = lines.slice(2).join("\n");

    subtitles.push({
      id: `sub-${index}-${Math.round(startTime * 1000)}-${Math.round(endTime * 1000)}`,
      index,
      startTime,
      endTime,
      text,
    });
  }

  return subtitles;
}

// Transform raw SRT content into subtitle blocks for the editor store.
export function transformSrtToSubtitles(content: string): SubtitleBlock[] {
  const elements = parseSync(content);
  const converted = convertSubtitleNodesToBlocks(elements);

  if (converted.length > 0) {
    return converted;
  }

  // Temporary fallback until the subtitle-node conversion is implemented.
  return parseSRT(content);
}

export function convertSubtitleNodesToBlocks(elements: NodeList): SubtitleBlock[] {
  let index = 0;

  return elements.flatMap((node) => {
    if (node.type !== "cue") return [];

    index += 1;

    const startMs = node.data.start;
    const endMs = node.data.end;
    const startTime = startMs / 1000;
    const endTime = endMs / 1000;

    return [
      {
        id: `sub-${index}-${startMs}-${endMs}`,
        index,
        startTime,
        endTime,
        text: node.data.text ?? "",
      },
    ];
  });
}

// Generate SRT file content from SubtitleBlock array.
export function generateSRT(subtitles: SubtitleBlock[]): string {
  return subtitles
    .slice()
    .sort((a, b) => a.startTime - b.startTime)
    .map((sub, idx) => {
      const index = idx + 1;
      const startTime = secondsToTimeString(sub.startTime);
      const endTime = secondsToTimeString(sub.endTime);
      return `${index}\n${startTime} --> ${endTime}\n${sub.text}`;
    })
    .join("\n\n");
}
