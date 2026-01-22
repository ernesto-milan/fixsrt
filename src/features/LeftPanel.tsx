"use client";

import { SubtitleList } from './SubtitleList';
import { SubtitleEditor } from './SubtitleEditor';

export function LeftPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card border-r">
      <div className="px-4 py-3 border-b">
        <h2 className="font-medium text-sm">Subtitles</h2>
      </div>
      <SubtitleList />
      <SubtitleEditor />
    </div>
  );
}
