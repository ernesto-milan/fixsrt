"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo_full.png" alt="FixSRT" className="h-10 w-auto block" />
            <span className="sr-only">FixSRT</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground hover:text-foreground !h-8 !w-8 p-0 [&_svg]:h-6 [&_svg]:w-6"
            >
              <Link href="/" className="flex h-full w-full items-center justify-center">
                <ArrowLeft />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Why FixSRT exists</h1>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-foreground">
            <p>
              FixSRT is a simple, focused subtitle editor for short-form video. Drop in an .srt, fix the timing and text against your clip, and export clean — no bloat, no signup.
            </p>
            <p>
              Editing subtitles for Shorts, Reels, and TikToks usually means picking between two bad options: the heavy pro tools that are overkill for a 30-second fix, or the tiny web tools that are too limited to actually fix the thing you opened them for.
            </p>
            <p>
              FixSRT sits in the gap. It’s built for the small, repetitive fixes that short-form subtitles actually need — fast, in the browser, without the complexity you don’t want or the missing features that send you back to the heavy tools. It works fine for longer videos too, but short-form is what it was made for.
            </p>
            <p>
              The goal is to keep it lightweight and straightforward — no accounts, no uploads, no unnecessary steps. Just open the file, make the edit, and move on.
            </p>
            <p>
              If you have feedback, ideas, or suggestions for improvements, you can reach out at:{" "}
              <Link href="mailto:emilanprojects@gmail.com" className="text-primary hover:underline">
                emilanprojects@gmail.com
              </Link>
            </p>
            <p>
              If this tool saved you time and you’d like to support its development, you can{" "}
              <Link
                href="https://buymeacoffee.com/emilan"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                ☕ Buy me a coffee here
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
