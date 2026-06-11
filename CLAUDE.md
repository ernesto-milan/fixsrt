# CLAUDE.md

Guidance for Claude Code when working in this repository.

The full repository guidelines (architecture, layers, structure, style, commands)
live in **@AGENTS.md** — read it first; it is the single source of truth and
applies equally here.

## Quick reference
- Stack: Next.js (App Router) + React + TypeScript (strict), Tailwind CSS,
  Zustand for state, shadcn/ui (Radix) components under `src/shared/ui/`.
- Dependency direction: `screens` → `features` → `shared`. Never import upward
  from `shared/`. Avoid cross-feature imports.
- 2-space indentation, double quotes in TS/TSX, light + dark theme support.

## Workflow expectations
- Before finishing a change, run `npm run lint` and `npm run build`; both must pass.
- Keep changes scoped and cohesive; prefer explicit state over clever abstractions.
- The app is client-side and stateful — keep server logic minimal.
- Static assets go in `public/`; do not commit generated output (`.next/`) or
  Windows metadata (`*:Zone.Identifier`).
