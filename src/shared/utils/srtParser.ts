import { Subtitle } from "@/shared/types/subtitle";

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

// Parse SRT file content to Subtitle array.
export function parseSRT(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const blocks = content.trim().split(/\n\n+/);

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
      id: `sub-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      index,
      startTime,
      endTime,
      text,
    });
  }

  return subtitles;
}

// Generate SRT file content from Subtitle array.
export function generateSRT(subtitles: Subtitle[]): string {
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
