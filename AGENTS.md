<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the invitation as one scrolling index route with section anchors, because the requested experience is a continuous invitation film.
- Keep ambient and scroll animation in a browser-only effects component, respecting reduced motion, so SSR remains safe and the invitation readable.
- Serve artwork and music from `public/media/`, referenced only through `src/config/media.ts`, because the site is also hosted on Vercel, where Lovable's CDN asset paths do not resolve, and that file is the one place the owner changes the background music.
- Do not label decorative palace art as a photograph of the venue, because venue imagery must be accurate.
