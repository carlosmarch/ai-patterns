# ai-patterns

A copy-paste library of animated UI components, in the spirit of
[beautifui.dev](https://www.beautifului.dev/), [shadcn/ui](https://ui.shadcn.com/),
and similar registries: own the source, don't install a dependency.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) (Framer Motion) for animation
- [Radix UI](https://www.radix-ui.com) primitives + [shadcn/ui](https://ui.shadcn.com)-style conventions for accessible base components
- [Shiki](https://shiki.style) for syntax-highlighted code panels

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a component

Components live under `src/registry/<category>/<slug>/`:

```
src/registry/buttons/shiny-button/
  component.tsx   # the component itself (this is what's shown in the "Code" tab)
  demo.tsx         # renders the component for the live "Preview" tab
```

Register it in `src/registry/index.ts` and it's automatically picked up by:

- `/components` — the gallery, grouped by category
- `/components/<category>/<slug>` — the detail page (live preview + syntax-highlighted, copyable source)

## Roadmap

- [x] Registry convention + Preview/Code doc template
- [x] First component (Shiny Button)
- [ ] More components across more categories
- [ ] Site chrome: sidebar nav, search
- [ ] Dark/light theme toggle
- [ ] Installable CLI (`npx <tool> add <slug>`), shadcn-registry style
