# Tanya ♥ Vishal — Ring Ceremony Invitation

A single-page invitation website: opening palace doors, pages that layer over each other as you
scroll, falling petals, a live countdown, venue directions and background music.

Built with React, TanStack Start, Tailwind CSS and Vite. Hosted on Vercel.

## Run it locally

You need [Node.js](https://nodejs.org) 22 or newer.

```sh
npm install
npm run dev
```

Then open http://localhost:8080.

Other commands: `npm run build` (production build), `npm run lint`, `npm test`.

## Change the background music

Everything the page shows (artwork and music) is listed in `src/config/media.ts`, and the files
live in `public/media/`.

- Easiest: replace `public/media/wedding-music.mp3` with your new song under the same name.
- Or add a new file to `public/media/` and update `BACKGROUND_MUSIC` in `src/config/media.ts`.

Commit and push to `main`; Vercel redeploys automatically. Keep the MP3 to about 5 MB or less.

## Deploy

The repository is connected to Vercel, which deploys every push to `main`. No settings are
needed: the build detects Vercel and produces its output format automatically.

## Where things are

- `src/routes/index.tsx` — the invitation content and sections
- `src/styles.css` — all styling (fluid sizes so each section fits one screen)
- `src/components/invitation-effects.tsx` — petals, layering and scroll animation
- `src/hooks/use-fit-to-frame.ts` — fits the invitation text inside the floral frame
- `src/config/media.ts` — music and artwork
