import { Subtitle } from '@/shared/types/subtitle';

// Parse time string "00:00:00,000" to milliseconds
export function parseTimeToMs(timeStr: string): number {
  const [time, ms] = timeStr.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000 + parseInt(ms || '0');
}

// Convert milliseconds to time string "00:00:00,000"
export function msToTimeString(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

// Format time for display (shorter format)
export function formatTimeDisplay(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

// Calculate duration in seconds
export function getDuration(startMs: number, endMs: number): string {
  const duration = (endMs - startMs) / 1000;
  return `${duration.toFixed(1)}s`;
}

// Parse SRT file content to Subtitle array
export function parseSRT(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const blocks = content.trim().split(/\n\n+/);
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    
    const index = parseInt(lines[0]);
    if (isNaN(index)) continue;
    
    const timeLine = lines[1];
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;
    
    const startTime = parseTimeToMs(timeMatch[1]);
    const endTime = parseTimeToMs(timeMatch[2]);
    const text = lines.slice(2).join('\n');
    
    subtitles.push({
      id: `sub-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      index,
      startTime,
      endTime,
      text,
    });
  }
  
  return subtitles;
}

// Generate SRT file content from Subtitle array
export function generateSRT(subtitles: Subtitle[]): string {
  return subtitles
    .sort((a, b) => a.startTime - b.startTime)
    .map((sub, idx) => {
      const index = idx + 1;
      const startTime = msToTimeString(sub.startTime);
      const endTime = msToTimeString(sub.endTime);
      return `${index}\n${startTime} --> ${endTime}\n${sub.text}`;
    })
    .join('\n\n');
}
