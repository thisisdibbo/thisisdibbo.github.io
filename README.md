# thisisdibbo.github.io

Personal portfolio of **Md. Mahin Rahman**: embedded systems, PCB design, research and business cases.
A one-page site with a near-black background, one electric-coral accent, the name set edge to edge in
Syne ExtraBold, and a cut-out portrait standing inside it.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · Motion (`motion/react`) · lucide-react · clsx.
No component library, no CMS, no form backend: the contact button is a `mailto:` link.

## Put the site live (GitHub Pages)

The repository starts **private**, so nothing is published until you choose to. To go live:

1. **Make the repository public.** Settings → General → *Danger Zone* → **Change visibility** → Public.
   (GitHub Pages is free for public repositories.)
2. **Turn on Pages.** Settings → **Pages** → *Build and deployment* → Source: **GitHub Actions**.
3. **Publish.** Actions → **Deploy to GitHub Pages** → **Run workflow** → Run workflow.
4. After about a minute the site is at **https://thisisdibbo.github.io**. The deploy job's summary shows the link.

From then on every push to `main` rebuilds and republishes the site automatically. Before step 2, the workflow
only checks that the site builds and leaves a note saying it did not publish.

To take the site down later: Settings → Pages → **Unpublish site**, or make the repository private again.

## Run it on your computer

Needs [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev       # local dev server at http://localhost:5173
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
```

## Edit the content

Everything you read on the page is in **`src/content.ts`**: hero text, projects, research, case competitions,
experience, numbers, the quote, the About text, the contact copy and the links. The components only lay it out.
You can edit that file directly on github.com (pencil icon); the site rebuilds when you commit.

| What | Where |
|:--|:--|
| Copy, links, projects, cases | `src/content.ts` |
| Case decks (slide images and PDFs) | `public/decks/` |
| Project, research, case and portrait images | `src/assets/` (import them in `content.ts`) |
| Downloadable CV | `public/Md-Mahin-Rahman-CV.pdf` |
| Link-preview image for LinkedIn and others | `public/og-image.jpg` (1200 × 630) |
| Colours, fonts, type scale, hero sizing | `src/index.css` |

### Add a case competition

Each case opens its deck in a full-screen slide viewer (arrows, keyboard, swipe) with a **Download PDF** button.
Decks live in `public/decks/`: one folder of slide images per deck plus the PDF.

1. Render the PDF into slides (needs Python):

   ```bash
   pip install pymupdf pillow
   python scripts/render_deck.py ~/Downloads/My_Deck.pdf my-deck
   ```

   It prints the `decks: [...]` line to paste into the case.
2. Export the title slide (or any strong slide) as a thumbnail into `src/assets/`, about 960 × 540. It follows the
   pointer when someone hovers the row.
3. Add the case to `cases` (featured rows) or `moreCases` (the short list) in `src/content.ts`:

   ```ts
   import caseAcme from './assets/case-acme.webp'

   // inside `cases`
   {
     title: 'Deck title',
     description: 'The problem and your recommendation, in one or two lines.',
     venue: 'Competition 2025 · Round · Team name',
     thumb: caseAcme,
     decks: [{ slug: 'my-deck', pages: 18, ratio: SLIDES }],
   },
   ```

   A case with several rounds lists one deck per round, each with a `label`; the viewer shows them as tabs.

### Swap the portrait

`src/assets/portrait-hero.webp` is a transparent cut-out (560 × 963), graded black and white. A replacement
should also be a transparent PNG or WebP, framed from the top of the head to about the hips, with the head near
the top edge. `portrait-about.webp` is the About photo, cropped to 4:5 (608 × 760).

## Layout notes

- **Hero overlap.** The name size `--F` fits "RAHMAN" to the viewport width (Syne 800 sets it at 7.47em) and is
  capped by the viewport height. The portrait is `3.3 × --F` tall; line one sits behind it (`z-0`) and line two
  in front (`z-20`). Phones and portrait tablets stack the name and put the portrait underneath.
- **Cursor dot.** A 10 px coral dot follows the pointer on a spring and grows to 64 px with "View" over project
  cards. It is not rendered on touch devices.
- **Reduced motion.** Motion respects `prefers-reduced-motion`, and the marquee stops.
- **Other domains.** `vite.config.ts` uses a relative `base`, so `dist/` works from any path. If you move the
  site to another domain, update the absolute URLs (`canonical`, `og:url`, `og:image`) in `index.html`.
