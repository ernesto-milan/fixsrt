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
              FixSRT is a small, focused tool for editing and fixing .srt subtitle files directly in the browser.
            </p>
            <p>
              It was built out of a real need: making quick subtitle changes without having to install heavy desktop software or open complex video editors just to fix a few lines of text. For simple tasks, most existing tools felt slow, overpowered, or inconvenient.
            </p>
            <p>
              FixSRT is designed for situations where you already know what you want to change and just want to do it fast. This is especially common when working with short videos, social media clips, reels, or quick subtitle revisions where speed and simplicity matter more than advanced features.
            </p>
            <p>
              The goal is to keep the tool lightweight, straightforward, and easy to use — no accounts, no uploads, and no unnecessary steps. Just open the file, make the edit, and move on.
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
