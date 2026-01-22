# Repository Guidelines

## Architecture (MVP + Lightweight FSD, Tool-Oriented)
This is a desktop-first, single-page web tool for subtitle editing and transformation. It is not a content-driven site. Favor clarity, predictability, and explicit state over clever abstractions. Optimize for fast iteration and maintainability. The app is primarily client-side and stateful; server logic should be minimal.

All product code lives under `src/` (the root is config only). The Next.js App Router lives only in `src/app/` (no root `app/`, no legacy `pages/` router).

## Layers and Dependency Rules
- Active layers under `src/`: `app/`, `screens/`, `features/`, `shared/`.
- `widgets/` and `entities/` are reserved for later; do not introduce them unless the app grows significantly.
- Dependency direction: `screens` → `features` → `shared`.
- `src/app/` may import from any layer; `shared/` must not import from higher layers.
- Avoid cross-feature imports; if something is shared, move it to `src/shared/`.
- Each feature should be cohesive internally and simple externally.

## Project Structure
- `src/app/` route files (`layout.tsx`, `page.tsx`, `route.ts`) and minimal glue. Routing stays shallow (single main screen).
- `src/screens/` page-sized UI compositions (e.g., `EditorScreen`).
- `src/features/` isolated feature modules (subtitle list, timeline, rules panels, export flow).
- `src/shared/` reusable UI, hooks, utilities, constants, and styling primitives (no feature-specific logic).
- `public/` static assets only.
- Ignored/generated: `.next/`, `node_modules/`, `.env*`.

## Development Commands (npm)
- `npm ci` install dependencies from `package-lock.json`.
- `npm run dev` start the dev server at `http://localhost:3000`.
- `npm run lint` run ESLint.
- `npm run build` create the production build.
- `npm run start` run the production server after a build.

## Style, State, and Quality Guidelines
- TypeScript `strict` is enabled.
- 2-space indentation; double quotes in TS/TSX.
- Tailwind CSS utilities; support both light and dark themes.
- Prefer explicit state and simple data structures; avoid deep nesting and clever abstractions.
- Keep components readable and narrowly focused.

## Testing Guidelines
Testing is not configured yet. If tests are added later:
- Add `npm test`.
- Place tests under `src/**/__tests__/` or `src/**/*.test.ts(x)`.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects (e.g., "Add export flow").
- Before PRs: run `npm run lint` and `npm run build`.
- Include screenshots for UI changes and link relevant issues.

## Configuration & Security
- Use `.env.local` for local configuration and secrets.
- Do not commit real credentials (`.env*` is ignored).
- API routes under `src/app/api/*` are allowed but should remain minimal and tool-focused (e.g., file handling helpers).
