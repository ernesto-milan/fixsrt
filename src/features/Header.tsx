"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Upload, Settings, Info, Sun, Moon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useUiStore } from "@/shared/store/uiStore";
import { useSubtitlesStore } from "@/shared/store/subtitlesStore";

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

// Subscribe to the OS color-scheme preference without setState-in-effect.
function useSystemPrefersDark() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(SYSTEM_DARK_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(SYSTEM_DARK_QUERY).matches,
    () => false,
  );
}

export function Header() {
  const setIsUploadModalOpen = useUiStore((state) => state.setIsUploadModalOpen);
  const setIsPreferencesOpen = useUiStore((state) => state.setIsPreferencesOpen);
  const setIsExportModalOpen = useUiStore((state) => state.setIsExportModalOpen);
  const theme = useUiStore((state) => state.preferences.theme);
  const updatePreferences = useUiStore((state) => state.updatePreferences);
  const subtitleFileName = useSubtitlesStore((state) => state.subtitleFileName);
  const subtitlesCount = useSubtitlesStore((state) => state.subtitles.length);

  // Resolve the actually-applied theme (handles "system") for the toggle icon.
  const systemPrefersDark = useSystemPrefersDark();
  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  const toggleTheme = () => updatePreferences({ theme: isDark ? "light" : "dark" });

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-panel px-3 sm:gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <Image
          src="/icon.png"
          alt=""
          width={512}
          height={512}
          priority
          className="block h-7 w-7"
        />
        <span className="hidden bg-gradient-to-br from-[#7C3AED] to-[#C026D3] bg-clip-text text-[22px] font-bold leading-none tracking-tight text-transparent sm:inline">
          FixSRT
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsExportModalOpen(true)}
          disabled={subtitlesCount === 0}
        >
          <Download />
          <span className="hidden sm:inline">Export SRT</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload />
          <span className="hidden sm:inline">
            {subtitleFileName ? "Replace files" : "Upload"}
          </span>
        </Button>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 hidden max-w-[180px] truncate font-mono text-2xs text-faint sm:block">
          {subtitleFileName || "no file"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
        <Button asChild variant="ghost" size="icon">
          <Link href="/info" aria-label="About FixSRT">
            <Info />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPreferencesOpen(true)}
          aria-label="Preferences"
        >
          <Settings />
        </Button>
      </div>
    </header>
  );
}
