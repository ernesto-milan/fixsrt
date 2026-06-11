# FixSRT Studio

A simple, focused subtitle editor for short-form video. Drop in an `.srt`, fix the timing and text against your video, and export clean — no bloat, no signup.

**Live:** https://fixsrt.com

## Why this exists

Editing subtitles for Shorts, Reels, and TikToks usually means picking between two bad options:

- **The heavy pro tools** (Aegisub and friends) — powerful, but overkill for short clips and a steep learning curve for what should be a 30-second fix.
- **The tiny web tools** — quick to open, but too limited to actually fix the thing you opened them for.

FixSRT sits in the gap. It's built for the small, repetitive fixes that short-form subtitles actually need — fast, in the browser, without the fancy complexity you don't want or the missing features that send you back to the heavy tools.

It works fine for longer videos too, but short-form is what it was made for.

## What it does

- **Subtitle list** with inline start/end editing
- **Live video preview** — load your clip and fix the timing against the actual footage, with captions overlaid
- **Text Rules** — batch text transforms (trim whitespace, strip tags, and more)
- **Time Rules** — batch timing transforms (shift, framerate scaling, and more)
- **Timeline** view of your cues
- **Clean export** back to `.srt`
- **Preferences** — theming, language, panel swapping, and control over what shows in the list and timeline

## Who it's for

Anyone subtitling short-form video who just wants to fix it and move on — creators, editors, and anyone who's bounced off both the bloated tools and the limited ones.

## Tech

- [Next.js](https://nextjs.org) (App Router) + [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org) (strict)
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Zustand](https://zustand-demo.pmnd.rs) for state
- [shadcn/ui](https://ui.shadcn.com) (Radix primitives) for components

Everything runs client-side — no backend, no accounts, no uploads.

## Running locally

Requires [Node.js](https://nodejs.org) 18.18+.

```bash
git clone <repo-url>
cd fixsrt
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run ESLint
```

## License

[MIT](LICENSE)
