"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { useUiStore } from "@/shared/store/uiStore";
import type { PreferencesState } from "@/shared/types/subtitle";

function ThemeSync() {
  const theme = useUiStore((state) => state.preferences.theme);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (nextTheme: PreferencesState["theme"]) => {
      root.classList.remove("light", "dark");
      if (nextTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(nextTheme);
      }
    };

    applyTheme(theme);

    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [theme]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeSync />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
