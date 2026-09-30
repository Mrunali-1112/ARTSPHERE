# ArtSphere Editorial Neo-Brutalist Redesign: Vertical Slice 1 (Landing & Foundation)

## Purpose & Scope
Transform ArtSphere from a generic, AI-styled, mobile-framed prototype into a responsive, full-viewport, editorial neo-brutalist web application adhering strictly to `Docs/design.md`.

This design document covers:
1. **Global Design System & Tokens** (`common.css`)
2. **Universal Floating Capsule Navigation System**
3. **Full-Viewport Editorial Landing Page** (`landing.html` & `landing.css`)
4. **Inter-page Routing & Route Interconnection**

---

## 1. Global Design Tokens & Foundation (`common.css`)

### Color Palette (Section 3 of `Docs/design.md`)
- `--color-ink`: `#0A0A0A` (Primary text, solid geometric outlines, icons)
- `--color-white`: `#FFFFFF` (Card surfaces, clean fill)
- `--color-paper`: `#F4F0E7` (Warm editorial paper background)
- `--color-cream`: `#EAE4D5` (Secondary containers, pill fills, accent cards)
- `--color-yellow`: `#FFF49A` (Restrained CTA accents, tags, highlights)
- `--color-orange`: `#FF5A1F` (High-emphasis punctuation, notification dots)
- `--color-grey`: `#E7E7E5` (Subtle borders and input fills)
- `--color-mid-grey`: `#6F6F6A` (Secondary metadata text)

### Border & Elevation Grammar (Section 4)
- `--border-thin`: `1px solid var(--color-ink)`
- `--border-standard`: `1.5px solid var(--color-ink)`
- `--border-strong`: `2px solid var(--color-ink)`
- **Rule**: Eliminates all blurry colored box-shadows, purple glow, and glassmorphism. Structure is defined cleanly by geometric black borders and solid backgrounds.

### Controlled Corner Radius Vocabulary (Section 5)
- Micro controls: `4px`
- Small components: `8px`
- Compact cards: `12px`
- Standard cards: `18px`
- Large containers: `24px`
- Pills (buttons, nav, tags): `999px`

### Typography (Section 8)
- Font: `Manrope`, with `Inter` and system sans fallbacks.
- Tight line-heights:
  - Display / H1: `0.95–1.05`
  - H2: `1.0–1.1`
  - H3: `1.05–1.15`
  - Body: `1.4–1.6`
  - Small / Metadata: `1.3–1.4`

### Responsive Grid System (Section 6 & 19)
- Remove `.mobile-frame-container` and `.screen-container` constraints (520px / 1100px wrappers).
- Desktop: 12-column grid, `5–7vw` margins, `20–24px` column gap.
- Tablet (768px - 1024px): 8-column grid, `4–5vw` margins.
- Mobile (< 768px): 4-column grid, `16px` margins.

---

## 2. Floating Editorial Capsule Navigation

### Geometry & Styling (Section 11)
- Position: Sticky top with generous breathing room (`padding: 20px 5vw 0`).
- Container: Pill shape (`border-radius: 999px`), `1.5px solid var(--color-ink)`, background `var(--color-paper)` with `var(--color-white)` pill interior.
- Left: ArtSphere Wordmark + geometric motif (`✦ ArtSphere`).
- Center Links:
  - `Home` (`/pages/home.html`)
  - `Discover` (`/pages/discover.html`)
  - `Communities` (`/pages/communities.html`)
  - `Events` (`/pages/events.html`)
  - `Collaborate` (`/pages/collaborators.html`)
  - `Opportunities` (`/pages/opportunities.html`)
- Right Controls:
  - "Log In" secondary pill button (`/pages/login.html`)
  - "Join ArtSphere →" primary black pill button (`/pages/signup.html`)
  - Mobile Menu toggle button with clean geometric SVG icon.

---

## 3. Landing Page Composition (`landing.html` & `landing.css`)

### Section A: Editorial Hero (Asymmetric 7 + 5 Grid)
- **Left Column (7 cols)**:
  - Pill label: `✦ THE INDEPENDENT CREATIVE NETWORK` with solid black border.
  - Display Headline: `Every Artist.` `<br>` `Every Passion.` with tight leading and high contrast.
  - Body copy: Clear editorial text describing the multidisciplinary creator community.
  - Action Group:
    - Primary Button: Black pill with white text + directional arrow `Join ArtSphere →` (`/pages/signup.html`).
    - Secondary Button: Cream pill with black border `Explore Directory ↗` (`/pages/discover.html`).
- **Right Column (5 cols)**:
  - Editorial Spotlight Card: `18px` radius, `1.5px solid #0A0A0A`, cream surface.
  - Features real artist profile snapshot: Aanya Deshmukh (Visual Artist) or Rohan Mehta (Musician) with verified badge, pill tags, artwork preview thumbnail, and direct link to portfolio.

### Section B: Art Form Taxonomy (Modular Bento)
- Asymmetric modular card layout instead of repeated identical cards:
  - **Musicians** (4 cols, audio note icon motif, cream card)
  - **Dancers** (4 cols, motion motif, white card)
  - **Visual Artists** (4 cols, yellow accent tag `FEATURED`, artist count)
  - **Photographers** (6 cols, horizontal card with focal thumbnail)
  - **Writers & Composers** (6 cols, editorial quote block with author mark)
- All cards link directly to filtered searches on `/pages/discover.html?artForm=...`.

### Section C: Live Platform Metrics (Shared-Border Strip)
- Full-width modular banner with shared black borders:
  - `10,000+` Verified Artists
  - `5,200+` Collaborations Formed
  - `2,400+` Live Events & Workshops
  - `60+` Guilds & Communities
- Clean geometric labels (`✦`, `◇`, `→`), high typographic contrast, zero emoji clutter.

### Section D: Why Join ArtSphere (Bento Feature Grid)
- Multi-column modular arrangement:
  - Card 1 (Large 6 col): "Cross-Disciplinary Collaborations" — Find musicians for your film, dancers for your music video, designers for your brand.
  - Card 2 (3 col): "Open Calls & Residencies" — Direct access to gigs and curated auditions.
  - Card 3 (3 col): "Workshops & Jams" — Offline and virtual creator meetups.
  - Card 4 (12 col banner): "No Algorithms. Pure Craft." — Direct artist-to-artist connection.

### Section E: Editorial Bottom CTA & Full Footer
- Bold headline call-to-action with pill button `Create Your Portfolio →`.
- Full-width footer with structured columns:
  - Navigation routes (Home, Discover, Communities, Events, Collaborations, Opportunities)
  - Resources & Support (Help & Support, Guidelines, Terms)
  - Connect links and copyright stamp.

---

## 4. Verification & Testing Criteria
- **Viewport Responsiveness**: Tested at 1440px (Wide Desktop), 1024px (Laptop), 768px (Tablet), and 375px (Mobile).
- **Navigation Continuity**: All navigation links point to existing valid routes and can be traversed without dead ends.
- **Visual Design Gate**: Verified against all checklist items in Section 25 of `Docs/design.md`.
