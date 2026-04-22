# חכם הרזים

Interactive React companion app for Tzvika Einav's Leptin Diet Challenge

## Features

- **Week-by-week missions** — 8 weeks + For-Life maintenance with tasks, physiology, tips, new forbidden / allowed foods
- **31 recipes** with ingredients and steps (includes the featured Leptin Shake)
- **Food lists** — allowed / forbidden / drinks, per stage
- **Water tracker** — daily goal, 7-day chart, per-meal shortcut
- **Daily cumulative checklist** — tasks stack as you progress through weeks
- **Intermittent fasting timer** (week 6+) — 8/10/12 hour presets, live countdown
- **SOS / breakage protocol** + journal
- **14-day Camback protocol**
- **Streak counter** and recipe favorites

All progress is persisted to the browser's `localStorage` — no backend, no account.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/

## Build

```bash
npm run build
```

Output in `dist/`. Bundle size: ~68 KB gzipped.

## Stack

- Vite + React 18
- Hand-rolled CSS (no UI libraries)
- RTL Hebrew (Heebo font)
- `localStorage` for persistence
