# Leisure — Project Memory

## Project overview
- **Leisure** — premium retro Bluetooth speaker D2C brand ("Sound Your Wild").
- Two separate repos share only the name "leisure" (unrelated git history):
  - `/Users/apple/Downloads/leisure` — original Vite + React (JSX) prototype (DRIFT/EDGE scroll experience, `wip/slide-aside` branch). Kept as reference only.
  - `/Users/apple/Downloads/leisure-web` — **active production app**. Next.js 16 (App Router) + TypeScript, React 19, Tailwind v4. GitHub: `techinfinitydevelopers/leisure` (`main` branch). Auto-deploys to **Railway** on push to `main`.
- All active development happens in `leisure-web`.

## Stack
- Next.js 16, TypeScript (strict), React 19, Tailwind v4
- React Three Fiber (`@react-three/fiber`), `@react-three/drei` (`useGLTF`), three.js
- GSAP + ScrollTrigger, Lenis smooth scroll
- Prisma + SQLite — local admin dashboard / fallback content
- Shopify Storefront + Admin GraphQL API — headless commerce backend

## Shopify integration
- Products, cart, **hosted checkout** (via `cartCreate` mutation → `checkoutUrl`), blogs, coupons, metafields all wired through Shopify.
- Env vars (in `.env`, gitignored — **must be set manually in Railway's dashboard**, they don't travel with git push):
  - `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` = `leisure-6rmbayf2.myshopify.com`
  - `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`
  - `SHOPIFY_ADMIN_TOKEN` (sensitive — Admin API)
  - `SHOPIFY_API_VERSION` = `2024-10`
- India delivery issue (fixed): needed an India shipping zone + India fulfillment location + Cash on Delivery enabled in Shopify admin.
- Relevant files: `src/lib/shopify.ts`, `src/lib/shopify-checkout.ts`, `src/lib/shopify-blogs.ts`, `src/lib/products-source.ts`.

## Products (6)
| Slug | Model | Tagline | Price |
|---|---|---|---|
| drift | DRIFT | Small Size. Massive Sound. | ₹3,190 |
| edge | EDGE | Sleek look. Unstoppable sound. | ₹8,900 |
| core | CORE | Power Meets Precision. | ₹9,900 |
| legend | LEGEND | Unleash the Legend. | ₹13,900 |
| elevate | ELEVATE | Double the Energy. | ₹17,900 |
| dominator | DOMINATOR | Built to Dominate. | ₹25,900 |

Data source: `src/lib/products.ts` (static pricing/specs/colors) merged with Shopify + `src/lib/product-experience.ts` (typed, slug-keyed animation/marketing config for the rich R3F product pages).

## Fonts (5 currently loaded)
Declared in `src/app/layout.tsx`, tokens in `src/app/globals.css` `@theme inline`.

| Font | CSS var | Tailwind class | Where used |
|---|---|---|---|
| SF Pro Display | `--font-sf` | `font-display` | Headings, prices, most UI (~39 files) |
| Roboto (variable) | `--font-roboto` | `font-sans` | Body/default text (set globally on `<body>`) |
| Cormorant | `--font-cormorant` | `font-script` | Serif accents |
| Pinyon Script | `--font-pinyon` | `font-pinyon` | "Leisure" logo, taglines |
| THE GLOBE (Bold only) | `--font-globe` | `font-globe` | `MarqueeBand` scrolling text; product-name heading `.hero__title` on individual product pages (`src/components/product/product-experience.css`) |

- Font files live in `src/app/fonts/` (NOT `public/fonts/` — that's an unused leftover duplicate folder, ignore it).
- **On hold** (no font files provided yet): Albra Trial Grotesk, GC Regain.
- ⚠️ THE GLOBE is a **"Personal Use" licensed font** — check licensing before shipping commercially.

## Brand colors
- Core (already matched exactly, from official brand kit PDF): Black `#000000`, Yellow `#fbed2b`, White `#ffffff`.
- Existing codebase quirk: the Tailwind `gold` token/utility (`text-gold`, `.gold-glow`, `btn-gold`, etc.) is actually **an alias for Yellow**, not a literal gold color — this predates the brand kit and is used everywhere (buttons, glows, prices).
- New **Gold gradient** from brand kit (`#8a5a2b → #db9658 → #eaaa7a`) added as **separate, additive tokens** — does NOT replace the yellow "gold": `--gold-1/2/3` CSS vars, `bg-gold-1/2/3` Tailwind utilities, `.grad-gold` class. Available for future use, not yet applied anywhere.

## 3D models (GLB) — current state (2026-07-24)
- **Drift, Edge, Dominator** have live GLBs wired (`model:` set in `product-experience.ts`). **Core, Legend, Elevate** do not yet — those pages use the 2D `ProductPlane` fallback for the hero image only (roaming/explode animation explicitly disabled via `skipPlaneAnimation: true`, see build log "cont'd 11").
- `dominator-model.glb` — currently 33.6MB (swapped twice: 924MB→20.6MB Draco compression, then a full user-supplied replacement to 33.6MB). Backups on disk: `dominator-model-prev.glb` (20.6MB, previous compressed version), `dominator-model-old.glb` (48.7MB, original pre-compression — **gitignored**, not tracked).
- `drift-model.glb` — currently 31.3MB (was 48.7MB). Backup `drift-model-old.glb` on disk, **gitignored**.
- `edge-model.glb` — 87MB, untouched/uncompressed (under GitHub's 100MB limit but above the 50MB warning threshold — consider compressing later).
- **Untracked, not yet wired into code**: `public/products/core/Core.glb` (26.6MB) and `public/products/elevate/Elevate.glb` (40.8MB) appeared in the working tree 2026-07-24 (user-added, not yet mentioned/confirmed in chat). To activate: add `model: "/products/core/Core.glb"` (and same pattern for elevate) to their `product-experience.ts` entries, remove `skipPlaneAnimation`, then verify facing (`modelBaseRy`) the same way Drift/Dominator's swaps were verified — **do not assume facing is correct just because bbox proportions look similar** (bit us once on Dominator's second GLB swap).
- `src/components/product/ProductModel.tsx`: model scale normalizes by the **largest** bounding-box dimension (not just height). Every product with a GLB has its own explicit `modelBaseRy` (facing) + `modelScale` (size) — no shared/implicit values, verified via grep to have zero cross-product references.

## EDGE product page — status
- Originally a bespoke "cinema-mode" experience (full-bleed hero, giant overlapping title text) that the user rejected — since fixed: as of 2026-07-24, EDGE's **hero now matches DRIFT's shared layout** (`Hero.tsx`, split variant) — see build log "cont'd 10". The rest of the page (`EdgeExperience.tsx`) still has its own bespoke bespoke sections (`EdgeSections.tsx`: stat ribbon, spin, feature tour, colours stack, anatomy, deep-dive mag, specs marquee, box strip, FAQ grid, CTA band) — those were NOT touched and remain as-is.
- Known unfixed issue in that bespoke code: `EdgeColoursStack` (`EdgeSections.tsx` ~L200) hardcodes model position `scroll.holdX = i % 2 === 0 ? -0.28 : 0.28`, which overlaps the "04 WHITE" colour-finish heading — low priority, flagged not fixed.

## Home page (`/`) — sections top to bottom
1. Preloader, Nav (global, from `layout.tsx`)
2. **Hero** — scroll-scrubbed video rendered as a 180-frame JPG sequence (`public/frames/frame_0001.jpg` … `frame_0180.jpg`, 1600×900), drawn to canvas via GSAP ScrollTrigger + Lenis (`src/components/landing/LandingExperience.tsx`). `FRAME_VERSION` const bumped (currently 3) to cache-bust whenever frames are re-exported.
3. **MarqueeBand** — scrolling brand text band, now in THE GLOBE font.
4. **RevolveShowcase** — 3D speaker turn/recolour/side-swap showcase.
5. **ParallaxGrid** ("Six Ways to Sound Wild") — sticky stacking deck, one full-height card per product, images at `public/products/{slug}.png`. Alternating image left/right, watermark, specs, price, Add to Cart.
6. **ProductShowcase** ("Meet the Range") — circular/carousel SVG gallery (`src/components/ui/carousel-circular-image-gallery.tsx`), images at `public/gallery/{slug}.png` (1200×320 "Desktop-View" photos). Stage `aspectRatio: "1200 / 320"` (matches image exactly — no crop, no letterbox). Caption (tagline/name/price/CTA) renders **below** the image, not overlaid.
7. TestimonialSection, Footer, FloatingSoundToggle, CartDrawer (global overlay).

## Known tooling gotchas (this environment)
- The sandboxed Browser-pane preview tool intermittently disconnects/reconnects across the session (MCP server churn) — when unavailable, fall back to DOM measurement via `curl`/build checks rather than skipping verification entirely.
- `claude-in-chrome` (real Chrome) requires picking from the user's 4 connected browser devices — avoid for routine local dev checks, too intrusive.
- The home page's heavy scroll-scrubbed canvas hero makes automated screenshot/scroll verification unreliable (tool timeouts, programmatic `scrollTo` desyncs Lenis). Prefer reading computed DOM rect / network requests over screenshots when verifying changes on this page.
- No dedicated browser-preview tool was available in this session (`preview_start`, `claude-in-chrome` not accessible). Workaround that worked: install `puppeteer` ad hoc via `npm install puppeteer --no-save` in the scratchpad dir, script it to `goto` the dev server URL, scroll to specific fractions of `document.body.scrollHeight`, and screenshot — then `Read` the PNG to inspect visually. Good fallback for verifying 3D model facing/scale/position on product pages.
- `npm run dev` for `leisure-web` sometimes needs manual restart (`cd leisure-web && npm run dev &`, log to `/tmp/leisure-web-dev.log`) since the launch.json-based `preview_start` requires a path inside project root — leisure-web is a sibling folder, so `preview_start` by name doesn't work for it; use Bash + `preview_start({url})` for the browser pane instead.

## Feedback / working agreements
- **Never commit or push unless explicitly asked.** Confirmed: commit `b8c1918` pushed to `main` on 2026-07-22; commit `1413786` created (but user said NOT to push yet) on 2026-07-24; commit `e92238e` (audio hint feature) committed **and pushed** on 2026-08-06 — user explicitly asked for both in the same turn. Triggers a Railway auto-deploy.
- When asked for "git commands", give/prepare them (or run if asked) but confirm before the actual `push` step specifically — user has explicitly declined to push same-session before.
- User communicates in Hinglish; keep responses concise, direct, no filler.
- When large binary assets (GLBs) risk exceeding GitHub's 100MB hard limit, compress first (Draco via `gltf-transform`) rather than attempting Git LFS unless asked.
- Don't commit throwaway backup files (`*-old.glb`, `*-prev.glb`, `frames_old_backup/`) — add to `.gitignore` instead (user did this proactively on 2026-07-24 for the GLB backups).

## Build log

### 2026-08-06
- Cloned `techinfinitydevelopers/leisure` (GitHub) fresh to `C:\Users\Lenovo\OneDrive\Desktop\leisure` (Windows machine). Prior memory entries below reference Mac paths (`/Users/apple/Downloads/leisure-web`) from earlier sessions — same repo, different local checkout. `main` branch checked out, tracking `origin/main`, working tree clean at commit `cf59343`.
- `npm install` had never been run on this checkout (`node_modules` missing — that's why `next dev` failed with "'next' is not recognized"). Installed deps; `@prisma/client` also needed a manual `npx prisma generate` since npm's allow-scripts policy blocked its postinstall.
- Added a permanent "Click to hear the audio" hint (`src/components/FloatingSoundToggle.tsx`) next to the global sound-toggle button on the homepage hero — text stays right-aligned (avoids clipping off the viewport edge) while the arrow icon gets its own computed `margin-right` so its tip still lands exactly on the button's center. Iterated through several hand-coded SVG curly-arrow designs (verified by rasterizing each candidate to PNG with `sharp` + `Read`, since the Browser pane's screenshot tool was unreliable this session) before the user supplied their own arrow image via a Google Drive link; that PNG (cropped tight to content, saved as `public/icons/hint-arrow.png`) is what's live now, rendered via `next/image`. Alignment math (tip-to-button-center offset, text-clipping check) was verified against the live DOM (`getBoundingClientRect`), not guessed. (Superseded later same day by commit `5ace2cf` from another session — reworked hint logic to key off actual audio playback state, not just pathname.)
- `RevolveShowcase.tsx` (homepage 3D speaker): bumped `MODEL_SCALE` 1.3→1.7 (model fills more of the same camera frustum, ~61%→~79% vertically) and the canvas cap 500px→560px at the `md` breakpoint — deliberately left mobile/tablet sizing alone since growing those too would've increased the section's existing intentional edge-bleed, conflicting with "must stay fully visible on mobile." Couldn't get a real WebGL screenshot this session (this Browser pane throttles rendering/ResizeObserver in the backgrounded tab — confirmed by the canvas staying at its default 300x150 until a manual `resize` event was dispatched); verified via frustum math + live DOM box measurements instead.
- `ParallaxGrid.tsx` ("Six Ways to Sound Wild" stacked deck): card `max-w-1200→1100px`, `h-82vh→75vh` (~8.5%). The per-product giant watermark text (`DRIFT`/`EDGE`/etc.) was a single fixed `text-[9rem]` regardless of name length — fine for short names, overflowed the column for `LEGEND`/`ELEVATE`/`DOMINATOR`. Fixed with a per-model cap in `cqw` (container-query width, needs `[container-type:inline-size]` on the details column) combined via `min(9rem, Ncqw)`, so short names are pixel-identical to before and long names shrink just enough to fit — verified at both 390px and 1440px viewports. Also re-zoomed the product image panels (they're flat `object-contain` PNGs, not a 3D scene — all 6 share a 1605:1065 canvas ratio but their actual drawn-content fraction varies wildly, e.g. `edge` 70.8%×21.6% vs `elevate` 28.0%×61.9%, so a uniform crop that's safe for one product isn't necessarily safe for another; checked each product's real content bbox via `sharp` before settling on a shared 30% scale).
- `ProductShowcase.tsx` + `carousel-circular-image-gallery.tsx` ("Meet the Range" carousel): redesigned to fit one 100vh screen on desktop with a two-column caption (name/tagline left, price+CTA right, divider between) instead of one centered column. Went through a few corrections here: (1) capping the image to the same `max-w-1200` grid as the heading shrank it a lot on wide screens — reverted, image stays full-bleed/uncapped, only the heading and caption row use the shared container; (2) `lg:min-h-screen lg:justify-center` alone let the heading render behind the fixed nav (nav is `fixed`, doesn't take layout space, so a section that rests exactly at viewport-top needs its own top clearance) — fixed with explicit `lg:pt-[5.5rem]` sized to clear the nav's real 80px height, trimming a few other margins to keep it fitting at 1366×768 too. Verified section-height-equals-viewport-height (no scroll) at 768/900/1080px, and nav clearance, via live `getBoundingClientRect`.
- `Footer.tsx` giant "LEISURE" waveform: went through several rounds tightening the amplitude spec, ending on bar heights as a direct 25–45% of each letter's own cap-height (not absolute units). Measured real letter geometry by rasterizing the exact SVG text against the actual embedded font file (`SF-Pro-Display-Black.otf`, base64-inlined into a throwaway test SVG, rendered with `sharp`) rather than trusting `getBBox()`/browser font-fallback, which was unreliable here — baseline sits at y=158, caps top out at y≈34.8, so 123.2 viewBox units are actually available. Also fixed a real bug found along the way: the old design used one continuous sine wave across the whole word, and "LEISURE"'s letter boundaries happened to land `U` and half of `R` inside one long trough — 10 bars in a row clamped to the exact same minimum, reading as visually dead. Rewrote so each letter computes its own local wave (phase offset by letter index) against its own measured x-range, guaranteeing every letter independently spans the full 25–45% band.

### 2026-07-24 (cont'd 14)
- `/shop` header (`shop/page.tsx`): added `mt-5`.
- Committed all of today's session work as `1413786` ("Add per-product 3D model tuning, Shopify image fixes, and UI polish") — **not pushed**, user explicitly said hold off. Excluded from the commit: GLB backups (now gitignored by user), `frames_old_backup/`, and the untracked `Core.glb`/`Elevate.glb` (not wired into code yet — see 3D models section).

### 2026-07-24 (cont'd 13)
- `/shop` grid: gap `gap-8 → gap-18` (`src/app/shop/page.tsx`), card width fixed at `w-[300px]` (`ShopProductCard.tsx` root `<Link>`). Tailwind v4's spacing utilities are formula-generated (`n * 0.25rem`), so `gap-18` works without any config change. Verified card width measures exactly 300px in the DOM.

### 2026-07-24 (cont'd 12)
- Added an Amazon/Myntra-style magnifier (lens + side zoom panel) to the individual product page hero image, per user request (discussed 2 options first — simple scale-hover vs. lens magnifier — user picked the lens).
- New component `src/components/product/ZoomImage.tsx`: tracks mouse position over the hero image, renders a bordered lens box that follows the cursor (clamped to stay inside the frame), and a side panel showing a magnified crop via `background-position`/`background-size` matching the lens position. Wired into `Hero.tsx`'s split-variant `.hero__frame`, replacing the plain `<img>` (same `stillRef` passed through so the existing GSAP scroll-fade still works unchanged).
- CSS added to `product-experience.css` (shared by all products): gated entirely behind `@media (hover: hover) and (pointer: fine)` so it only activates for real mouse users — touch devices just see the plain image, no dead hover state. Side panel additionally hidden below 1180px viewport width (not enough room beside the image) via a nested media query.
- **Bug caught during verification**: first pass had `overflow: hidden` on `.zoom-frame`, which clipped the side panel since it's a child positioned OUTSIDE the frame's own bounds (`left: calc(100% + 1.5rem)`) — lens showed, panel silently didn't. Removed `overflow:hidden` (the lens is already clamped in JS so it never overflows anyway); confirmed via screenshot the panel now renders and tracks the correct magnified region.
- Verified: works on Drift (and by extension all products using the shared split Hero — Dominator/Core/Legend/Elevate/Edge), thumbnail clicks still swap the zoomed image correctly, narrow viewport (1000px) correctly hides just the side panel while the lens still works, `tsc --noEmit` clean, no console errors.

### 2026-07-24 (cont'd 11)
- Disabled the 2D roaming/explode-plane animation (`ProductPlane`) for CORE/LEGEND/ELEVATE, per user request — they'll get real GLBs later; until then the PNG-driven roam/explode looked wrong so it's off, but the hero (static image, swatches, price, buy buttons) stays exactly as-is.
- Added an explicit `skipPlaneAnimation?: boolean` flag to `ProductExperience` type (`product-experience.ts`) rather than an implicit "no `model` → no plane" rule — keeps `ProductPlane` available for any future product that might genuinely want the 2D fallback experience without a GLB. Set `true` for core/legend/elevate only.
- `ProductExperience.tsx`: canvas now renders `ProductModel` if `model` set, `null` if `skipPlaneAnimation`, else `ProductPlane` (previous default).
- **Known side effect, not addressed** (user's chosen scope was specifically "just stop the roaming animation, keep hero image" — not "hide all model-dependent copy"): sections like `SpinStage` ("SEE IT FROM ALL SIDES — SCROLL TO SPIN") still render their eyebrow/caption text even with nothing visually spinning underneath now, since those captions are driven by the `spinStage`/`featureStops` config fields independently of whether a plane/model exists. Looks a bit orphaned but was out of the requested scope — flag if it should also be hidden until GLB arrives.
- Verified: `tsc --noEmit` clean, all 3 pages 200, hero unchanged, roam sections confirmed blank (no product image) via screenshots, no console errors.

### 2026-07-24 (cont'd 10)
- Changed EDGE's hero (start section) to match DRIFT's structure, per explicit user request with reference screenshots: two-column layout (image + thumbnail strip left, eyebrow/title/tagline/description/color-swatches/price/Buy-Now+Add-to-Cart right) instead of EDGE's old full-bleed cinematic hero (giant overlapping title text over the model).
- `src/components/product/edge/EdgeExperience.tsx`: replaced `<EdgeHero>` with the shared `<Hero>` component (same one DRIFT/DOMINATOR/CORE/LEGEND/ELEVATE use — `perspective.heroVariant: "split"` was already set for EDGE in `product-experience.ts`, so no config change needed there). Wired `viewIndex`/`onView={setViewIndex}` (EdgeHero never took these). Deleted the now-unused `EdgeHero.tsx`.
- **Found + fixed a styling gotcha**: `product-experience.css` scopes literally every rule under `.leisure-xp` (e.g. `.leisure-xp .btn--primary`), but EDGE's root wrapper div uses `.edge-xp` — so after swapping in `<Hero>`, its buttons/thumbnails/swatches rendered completely unstyled (plain text buttons, no gold ring) even though the CSS file was imported. Fixed by adding `leisure-xp` alongside `edge-xp` on the root div (`className="edge-xp leisure-xp"`) rather than rewriting the scoped stylesheet — lets both the shared Hero styles and EDGE's own bespoke section styles (`edge-experience.css`, imported after and taking cascade priority for edge-specific classes) apply together.
- Verified: `tsc --noEmit` clean, new hero visually matches DRIFT's exactly (gold-ring active swatch, pill Buy Now/Add to Cart, styled thumbnail strip), and scrolled through the rest of EDGE's bespoke sections (Twin Tweeters feature stop, Anatomy grid) to confirm the added `leisure-xp` class didn't break anything below the hero.

### 2026-07-24 (cont'd 9)
- Fixed: `/shop` grid page (`src/app/shop/page.tsx` + `src/components/ShopProductCard.tsx`) was showing images/colors from the OLD static `src/lib/products.ts` data (hardcoded local file paths, hardcoded hex/color names) — completely ignoring Shopify, even though `getStorefrontProducts()` (already Shopify-merged) was being called on the page and its price/mrp were already correct.
- `ShopProductCard` now takes a `colors: ProductColor[]` prop (Shopify/DB-sourced, passed from `product.colors` in `shop/page.tsx`) instead of calling the static `getProduct()`/`getProductImages()`/`PRODUCT_IMAGE_COUNTS`. Displayed image = `activeColor.images[0]`, falling back to the product's default `imageUrl` when a color has no images yet.
- Confirmed via live Shopify query: all 6 products already have a "Color" option configured in Shopify (Drift: Black/White, Edge: Black/Brown/Orange/White, Dominator: Black/Light Grey, Core: Black/Brown/Green/White, Legend: +Orange, Elevate: Black/Brown/Orange) — but only Drift and Edge currently have images uploaded; Dominator/Core/Legend/Elevate have 0 Shopify images so far and correctly fall back to the local cutout image until photos are added there too.
- Verified: swatch click on Drift correctly swaps to the real Shopify White-variant photo, no failed image requests, `tsc --noEmit` clean.

### 2026-07-24 (cont'd 8)
- Fixed bug: DRIFT's White variant (added via Shopify, 6 images each for Black/White) showed only 4 images while Black showed all 6.
- Root cause: `PRODUCT_FRAGMENT` in `src/lib/shopify.ts` queried `images(first: 10)` — with DRIFT now having 12 total product images (6 black + 6 white, black listed first in Shopify), Shopify's API only returned the first 10, silently truncating White's last 2 (`Side2`, `Top`). Not a caching issue (checked `revalidate: 30`, confirmed via direct raw GraphQL query + polling) — genuinely a hard image-count cap in our own query.
- Fix: bumped to `images(first: 50)`.
- **Self-caught mistake during the fix**: first edit added a `//` JS-style comment inside the GraphQL template string — GraphQL only supports `#` comments, so `//` is invalid syntax that Shopify's API rejects, causing `storefront()` (which silently swallows all errors, returning `null`) to fail and fall through to the local Prisma DB fallback (stale Black/Grey 2-image test data). Caught it immediately via a temporary debug API route (`/api/debug-drift`, calls `getMergedExperience` directly — created and removed within the same session) that made the fallback visible. Fixed by switching to `#` comments.
- **Lesson**: `src/lib/shopify.ts`'s `storefront()` helper swallows ALL fetch/GraphQL errors silently (`catch { return null }`, `if (json.errors) return null`) with no logging — makes exactly this class of bug (malformed query, API error) invisible and easy to misdiagnose as "no images" or "caching" rather than "the query itself is broken." Worth adding at least a `console.error` on the errors path if this bites again.
- Verified fix via the (now-removed) debug route: Black and White both correctly show 6 images (Front/Tilted/Back/Side1/Side2/Top), `tsc --noEmit` clean.

### 2026-07-24 (cont'd 7)
- Replaced the sound-ripple reveal (previous entry) with option 3 from the suggestion list — "minimal cross-fade + parallax drift" — per explicit user request to try the more premium/understated option instead.
- `carousel-circular-image-gallery.tsx` simplified significantly: removed the entire clip-path circle mechanism (`posSmall`/`posSmallAbove`/`posCenter`/`posCenterBig`, the echo ring, `clipId`/`squareId` defs, `BIG`/`SCALE` constants) — each `GalleryImage` is now just a plain full-frame `<image>` inside a `<g>` that GSAP animates via opacity + `y` (±14px drift) + `scale` (1.05→1 incoming, 1→0.96 outgoing) only. No masking at all.
- Also removed the now-unused `inPlace` PROP passed to `GalleryImage` (deleted, not `_`-prefixed — it was genuinely dead once the square/circle clip-path switch went away). The `inPlace` STATE in the parent `ImageGallery` is still needed (drives the Prev/Next button re-enable timing via `onInPlace` callback) and was left alone.
- Durations: fade-in 0.5s `power2.out`, fade-out 0.4s `power2.in` — asymmetric so the incoming image's settle reads a touch slower/softer than the outgoing's quicker exit.
- Verified via Puppeteer: mid-transition screenshot shows the intended soft drift+fade blend (top/bottom edge gradient as the scaled/offset image settles into frame), no console errors or warnings on a fresh isolated check, `tsc --noEmit` clean.
- Found one **pre-existing, unrelated** lint issue while checking (`react-hooks/set-state-in-effect` on `useEffect(() => setDisabled(...), [opened/inPlace])`, lines untouched by any of these carousel edits, confirmed via `git diff`) — flagged to user's attention but not fixed, out of scope.

### 2026-07-24 (cont'd 6)
- Implemented "sound-ripple reveal" for the ProductShowcase carousel (`src/components/ui/carousel-circular-image-gallery.tsx`), replacing the old lateral circle-wipe + bounce-drop transition (per user request after I gave 5 animation-alternative suggestions — this was the chosen one).
- Changes: the clip-circle now expands/contracts FROM THE CENTER (`posCenterBig`, centered huge radius) instead of sweeping in from a huge off-canvas circle offset to one side (`posEnd`/`posStart`, now removed) — reads as a radial "iris" pulse instead of a wipe. Eases changed `power4.in/out → power3.out/in` for a snappier burst-then-settle feel.
- Added a new decorative element: a stroke-only "echo ring" (gold, `rgba(251,237,43,0.9)`) on a second `<circle>` (not a clip path, just layered on top) that pulses outward from center alongside the reveal and fades to 0 opacity over a slightly longer duration (`DUR*1.6`) than the main reveal — gives a "sound wave leaving the speaker" flourish. Only plays on the open/incoming side, not on close, to avoid visual clutter.
- Verified via Puppeteer burst-screenshot (rapid frames during a triggered "Next" click) — ring clearly visible mid-reveal, `tsc --noEmit` clean, no console errors.
- **Not done yet** (flagged during the suggestion phase, still open): no `prefers-reduced-motion` handling on this carousel — worth adding regardless of which animation style is used.

### 2026-07-24 (cont'd 5)
- Fixed the long black-screen gap on the home page after the hero video-scrub finishes, before MarqueeBand/RevolveShowcase appear. Root cause: `LandingExperience.tsx`'s scroll track was `h-[1000vh]`, split 80% video-scrub / 20% fade-to-black — that tail 20% (200vh ≈ 2 full screens) was ALL dead black scroll, since the fade-to-black overlay's own ScrollTrigger spans exactly that range with `scrub:1`.
- Changed: track height `1000vh → 800vh`, split `80/20 → 92/8` (video scrub end `"80% bottom" → "92% bottom"`, fade start same). Cuts the black segment from ~200vh to ~64vh (verified via scroll-fraction scan: fade now goes 0→1 opacity in about 6% of total page scroll, and the next section is already peeking through by the time it's fully black).
- This component has no GSAP `pin:true` — the sticky-canvas behavior is plain CSS `position: sticky`, so ScrollTrigger start/end fractions map directly to the container's own height, not a separate pinned duration.

### 2026-07-24 (cont'd 4)
- User reported the new DOMINATOR GLB's facing showed the left side panel instead of the front grille — my earlier "no facing fix needed" call (cont'd entry above) was wrong. I'd only checked the technical-split/specs sections (which use non-zero `ry` per spec row), not the `featureStops[0]` "Signature Sound" stop (`rx:0, ry:0` — the true dead-front test). At that exact stop the model showed its left side/strap, confirming the new GLB's authored front axis differs from the old one after all, despite near-identical bounding-box proportions.
- Fixed: `dominator.modelBaseRy` changed from `-Math.PI/2 + 0.42` to `0` (`product-experience.ts`). Re-verified across hero, both featureStops (Signature Sound + Dominator Controls), and the specs section — all front-facing and clean, no regressions.
- **Lesson**: bbox aspect-ratio matching between an old and new GLB is NOT sufficient evidence that facing will also match — always verify the `ry:0` / most-front-on stop specifically, not just whichever section happens to be easy to screenshot.

### 2026-07-24 (cont'd 3)
- Migrated CORE/LEGEND/ELEVATE onto the rich R3F experience (`product-experience.ts`) per explicit user request to have separate rotation/facing/scale-fit config for "sab product" — previously these 3 had NO entry in `PRODUCT_EXPERIENCES` at all and rendered via the old classic 2D static template (no 3D system involved).
- None of the three have a GLB yet (`public/products/{core,legend,elevate}/` only has 2D color photography) — `model` field left unset, so pages fall back to the 2D `ProductPlane` (confirmed `ProductPlane.tsx` doesn't read `holdX/holdY/holdS` at all, only `ProductModel.tsx` does — so `overviewModel`/`featuresModel`/`specsModel`/`deepDiveModel`/`featureStops` are harmless/inert placeholders until a GLB is added).
- Still gave each an explicit `modelBaseRy`/`modelScale` + independent (not shared) stage-placement objects, so the moment a GLB is dropped in, only `model: "/products/{slug}/{slug}-model.glb"` needs adding — no config decisions deferred.
- Pricing/specs/technical/box copied verbatim from `src/lib/products.ts` (real data). Feature bullets, deep-dive blurbs, and FAQ copy are **derived/generic**, grounded in the real specs but not fabricated marketing prose — flagged to user as worth a copy review before shipping.
- Verified: `tsc --noEmit` clean, all 3 pages return 200, zero browser console errors, screenshots confirm correct pricing/colors/photography render via the 2D fallback.
- All 6 products now consistently structured in `PRODUCT_EXPERIENCES` (drift, edge, dominator, core, legend, elevate) + legacy `drift2` (unused showcase slug, no model).

### 2026-07-24 (cont'd 2)
- Completed strict per-product separation of base rotation/facing offset + scale-fit logic across ALL three GLB products (user explicitly required this — "strictly separate", not a nice-to-have). Correction to an earlier statement in this log: EDGE is NOT a fully separate system — `EdgeExperience.tsx` imports and uses the same shared `ProductModel.tsx` as drift/dominator (confirmed by reading the component), it only has a bespoke page layout/section-choreography wrapper. So EDGE was still silently falling back to the shared `BASE_RY` constant with no explicit override.
- Added explicit `modelBaseRy: -Math.PI/2 + 0.42` to `edge` in `product-experience.ts` (its `modelScale: 1.35` was already explicit/separate). Verified via screenshot the value change is a no-op visually (pixel-identical before/after) — this was about removing an implicit dependency, not fixing a bug.
- Final state: `drift`, `edge`, `dominator` each have their own explicit `modelBaseRy` + `modelScale`, and zero object-reference sharing between them (`grep`-verified). `core`/`legend`/`elevate` have no GLB wired yet, so N/A.
- Found (but did NOT fix — out of scope, flagged only) another overlap bug in EDGE's bespoke `EdgeColoursStack` section (`EdgeSections.tsx` ~L200): `scroll.holdX = i % 2 === 0 ? -0.28 : 0.28` hardcodes the model over the "04 WHITE" colour-finish heading text. Same category of bug as the DRIFT/DOMINATOR specs-section overlap fixed earlier, but this lives in edge-specific hardcoded values, not the shared config fields — and the whole EDGE bespoke experience is already marked stale/pending-redesign per user (see EDGE section above), so not worth fixing until that redesign happens.

### 2026-07-24 (cont'd)
- Replaced DOMINATOR's GLB with a second user-supplied model (33.6MB). File-swap convention: `dominator-model-prev.glb` now holds the previously-active compressed model (20.6MB); `dominator-model-old.glb` (48.7MB, the original pre-Draco-compression file) was left alone rather than overwritten, since a "-old" slot was already taken.
- No facing/scale fix needed this time — checked the new GLB's bbox (`gltf-transform inspect`) and its aspect ratio matches the previous dominator model almost exactly, so the per-product tuning already in place (from the earlier decoupling work) carried over cleanly. Confirmed visually across intro, spin, specs, and technical-details sections.

### 2026-07-24
- Replaced DRIFT GLB with user-supplied model (`Drift-new.glb`, 31.3MB, was 48.7MB). Old file kept as `drift-model-old.glb` (same convention as `dominator-model-old.glb`). Path unchanged (`/products/drift/drift-model.glb`) so no code wiring needed for the swap itself.
- Fixed new Drift model's facing: it showed left-side profile instead of front grille. Root cause — `BASE_RY` in `ProductModel.tsx` was a single global heading constant shared by ALL products; the new GLB's authored front axis differs from the old one. Added per-product override field `modelBaseRy?: number` to `ProductExperience` type (`src/lib/product-experience.ts`) and wired it in `ProductModel.tsx` (`holder.rotation.y = product.modelBaseRy ?? BASE_RY`, added to the `useMemo` dep array). Set `modelBaseRy: 0` for drift only; edge/dominator untouched.
- Verified fix via a local Puppeteer screenshot pipeline (installed ad hoc in scratchpad, not a repo dependency) since no browser-preview tool was available this session — screenshotted 5 scroll stages (intro, feature-tour stops, specs, technical-split) to confirm front-facing + scale/position all correct before reporting done.
- **Reusable pattern**: for future GLB swaps, if a new model's facing looks off, use `modelBaseRy` per-product rather than touching the shared `BASE_RY` constant.
- Decoupled DOMINATOR's rotation/scale-fit config from DRIFT's: it previously referenced `drift.spinStage`, `drift.overviewModel`, `drift.featuresModel`, `drift.specsModel`, `drift.deepDiveModel`, `drift.featureStops`, `drift.track` **by object reference** — meaning any future retune of DRIFT's stage placements would have silently changed DOMINATOR too. Replaced with DOMINATOR's own literal copies (`src/lib/product-experience.ts`), plus explicit `modelBaseRy`/`modelScale` fields. DOMINATOR is a much deeper box (338×180×240mm vs DRIFT's 128×49×93mm — depth/width ratio 0.765 vs 0.36), so its `overviewModel`/`featuresModel`/`specsModel`/`deepDiveModel` scale multipliers were tuned down from DRIFT's.
- **Found + fixed a pre-existing bug** (present in DRIFT's original config too, not caused by the above): the `specsModel` hold position (`SpecsSection.tsx`) parks the model at a FIXED screen position while the spec list scrolls past underneath it — old values (`x:-0.16, scale:0.46`) put it directly on top of the label column text for both products. Changed to sit in the empty gap between the label and value columns instead: DRIFT `specsModel: { x: 0.04, scale: 0.4 }`, DOMINATOR `{ x: 0.0, scale: 0.32 }`. Verified precisely by temporarily exposing the `scroll` store on `window.__scroll` (reverted after) and reading `holdX`/`holdS` mid-scroll — confirms the fix is live, not just visually plausible.
- **Verification gotcha**: headless Puppeteer + blind fractional `scrollTo` is unreliable for this site's GSAP ScrollTrigger–pinned sections — an instant jump can land mid-transition, and naive "keep scrolling a bit further" loops can overshoot past a pinned hold entirely back onto the regular roam track, producing misleading screenshots that look identical before/after a real fix. Reliable method: scroll to the target fraction, wait ~2-3s for lerp/GSAP to settle, and where possible cross-check the actual `scroll` store state (not just pixels).

### 2026-07-22
- Fixed dev server launch config (`.claude/launch.json`) — path issues resolved by running Next.js dev server directly via Bash instead of the `preview_start` name-based launcher.
- Replaced home hero video: extracted 180 frames from new source video, bumped `FRAME_VERSION`.
- Swapped `ProductShowcase` gallery images (6 products) to real product photos (later re-updated to "Desktop-View" 1200×320 versions); fixed crop/zoom (SVG `preserveAspectRatio` + stage `aspectRatio` matching); moved caption below image (was overlapping).
- Swapped `ParallaxGrid` product panel images (6 products).
- Integrated real EDGE GLB (91MB → replaced with actual model, later compressed reference kept at 87MB pre-optimization variant in this note refers to file as delivered).
- Added `modelScale` per-product multiplier; bumped EDGE to 1.35x.
- Added Gold gradient brand color tokens (additive, not replacing yellow "gold").
- Added THE GLOBE font; applied to `MarqueeBand` and product-page hero title (`.hero__title`).
- Updated SF Pro Display and Roboto font files with user-provided versions (same filenames, no code changes needed).
- Compressed Dominator GLB 924MB → 20.6MB (Draco) to clear GitHub's 100MB push limit.
- Committed and pushed 240 files to `main` (`b8c1918`) — triggers Railway auto-deploy. Excluded scratch backup files (`frames_old_backup/`, `dominator-model-old.glb`) from the commit.
- Gave user the 4 Shopify env var values to add to Railway's dashboard manually.

### 2026-08-21 — Architecture Q&A: Railway ⟷ Shopify ⟷ Hostinger domain
**Question asked (recurring):** how does the Railway ↔ Shopify headless connection work, and can the same domain live on both?

**Answer / knowledge base:**
- **Railway ⟷ Shopify is API-only, no DNS coupling.** Railway runs the Next.js app (GitHub push → build → deploy, `railway.json`). `src/lib/shopify.ts` hits `https://<store>.myshopify.com/api/${SHOPIFY_API_VERSION}/graphql.json` with `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` + `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` (30s `next.revalidate`). `src/lib/shopify-checkout.ts` does `cartCreate` → redirects browser to Shopify's `checkoutUrl`. Payments/orders never touch Railway.
- Env vars live in local `.env` — must be mirrored into Railway → Service → Variables or prod reads nothing. (Values were handed over 2026-07-22.)
- **One hostname cannot serve both.** Split by host:
  - `www.yourdomain.com` → Railway (CNAME + TXT; **both** required, missing TXT = 404 even after CNAME resolves)
  - `yourdomain.com` → redirect to www
  - `shop.yourdomain.com` → Shopify (CNAME `shops.myshopify.com`), set as **primary domain in Shopify Admin → Domains** so checkout renders on it instead of `.myshopify.com`. Single-domain checkout (`checkout.yourdomain.com`) is Shopify Plus only.
- **Hostinger blocker:** Railway apex domains need CNAME flattening or dynamic ALIAS (per Railway docs `networking/domains/working-with-domains`); Hostinger DNS supports neither. Options: (a) www on Railway + Hostinger apex→www redirect, or (b) move nameservers to Cloudflare (free CNAME flattening) — Cloudflare is the recommended path.
- Railway custom-domain plan limits: Trial 1/service, Hobby 2/service, Pro 20/service — apex + www count as two.
- **SEO:** metadata/sitemap/robots all come from Next.js on Railway; Shopify product SEO fields are pulled via Storefront API into Next metadata. Password-protect the Shopify online store (Preferences → password page) so `shop.` / `.myshopify.com` aren't indexed as duplicate content.

**Build log:** No code changes. Read-only inspection of `src/lib/shopify.ts`, `src/lib/shopify-checkout.ts`, `.env` (keys only), `railway.json`; verified apex-domain constraint against live Railway docs.

### 2026-08-21 — Cursor size + DOMINATOR ghost-model bugs (user-confirmed fixed)
- **Cursor**: `public/cursor-mic.png` resized 64×64 → 32×32 (`sips`); hotspot in `src/app/globals.css` updated `4 4` → `2 2` (both the `html` and `*,*::before,*::after` rules). Original 64×64 backed up in scratchpad only (not in repo).
- **DOMINATOR "exploded video frames" (SequenceReveal) section was showing a second/ghost speaker behind the frame sequence.** Two separate root causes, both fixed:
  1. `ProductModel.tsx` (~line 266): the model's hide-fade (`hideRef`) eased toward `scroll.productHide` at a flat `0.1` lerp regardless of direction — on a fast scroll into a section that pins abruptly (SequenceReveal), the fade lagged ~0.3–0.4s behind the pin engaging, so the model was briefly still visible. Fixed: asymmetric lerp alpha — `0.6` when hiding (target > current), `0.1` when revealing (keeps the existing gentle reveal fade).
  2. `FeatureGrid.tsx`'s own hide-window (`ScrollTrigger` for the no-`featuresModel` case) ended at `end: "bottom 20%"`, but `SequenceReveal`'s hide-window only arms at `top top` — leaving a real ~20vh scroll gap between the two sections where `scroll.hideCount` could hit 0 and the roaming model reappeared. This was the persistent one, visible in *both* scroll directions (user caught it scrolling bottom-to-top). Fixed: `end: "bottom top"` so the two sections' hide windows hand off at the same scroll boundary with no gap.
- **General pattern worth remembering for this codebase**: model visibility across sections is a refcounted `hideCount`/`holdCount` system (`src/lib/scrollStore.ts`, `pushHide`/`popHide`/`requestVisible`) — each section arms/disarms on `onEnter`/`onEnterBack`/`onLeave`/`onLeaveBack`. The refcounting itself tolerates overlap fine; the actual bug class here is **boundary mismatches between adjacent sections' trigger windows** (one using a percentage-of-viewport boundary, the next using a pin-relative one) leaving a gap. If a "ghost model" bug shows up again in a different product/section pair, check for this same kind of boundary gap first before assuming it's an opacity/timing issue.
- Verified: `tsc --noEmit` clean after each change; user manually re-tested on localhost and confirmed fixed.
