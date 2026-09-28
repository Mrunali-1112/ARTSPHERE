# Editorial Neo-brutalist Artist Profile & Portfolio Design Specification

## 1. Overview
Overhaul the Artist Profile (`artist-profile.html`) and Artist Portfolio (`portfolio.html`) from generic purple mobile clamped screens into a full-viewport, responsive, high-impact Editorial Neo-brutalist creative portfolio experience following [`Docs/design.md`](file:///c:/Users/Rover/Documents/Github/Mrunali%20Project/ARTSPHERE/Docs/design.md).

## 2. Design System Tokens
- **Backgrounds:** Tactile paper base (`#F4F0E7`), clean white card surfaces (`#FFFFFF`), light warm tint (`#EFE9DB`).
- **Inks & Borders:** `#0A0A0A` high contrast ink, `1.5px solid #0A0A0A` solid borders.
- **Accents:** Punchy pastel yellow (`#FFF49A`), international safety orange (`#FF5A1F`), stark monochrome contrasts.
- **Typography:** Manrope font family, sharp weights (700-900), editorial uppercase tags with letter-spacing.
- **Shadows:** Hard drop shadows `4px 4px 0px #0A0A0A`, interactive hover offsets `-2px, -2px`.
- **Radii:** `18px` for primary cards, `9999px` for pills/chips/buttons, `8px` for inner media/inputs.

## 3. Page Architecture

### Page 1: `artist-profile.html` (The Creator Dossier)
1. **Universal Floating Capsule Navigation:**
   - Standard capsule nav, Profile dropdown highlighting "My Artist Profile".
2. **Top Breadcrumb:** `&larr; Discover Directory` linking to `/pages/discover.html`.
3. **Hero Dossier Card:**
   - Full-width cover art frame with solid 1.5px ink border and hard drop shadow.
   - Creator Avatar: 96px circular avatar with thick ink border and active status dot.
   - Creator Identity: Full name in large display serif/sans, discipline & medium tags, location pill, verified creator badge.
   - Profile Stats Ledger: Posts, Artworks, Followers, Following, Co-creations.
   - Bio & Artist Statement: Narrative paragraph explaining artistic practice, materials, and influences.
   - Discipline & Skill Pills: e.g. `Digital Art`, `Character Design`, `2D Animation`, `Soundscapes`.
   - External Links: Instagram, Behance, Website/Substack buttons.
   - Primary Actions: `Follow Creator` (toggleable state) and `Send Pitch / Message` (links to `collaborators.html` or modal).
4. **Interactive Profile Sections (Tabs or Stacked):**
   - Portfolio Showcase: 6-card artwork preview with `View Full Portfolio &rarr;` button (`/pages/portfolio.html?id=...`).
   - Active Collaboration Calls: Open pitches posted by this artist.
   - Communities & Guilds: Guilds the artist is a member or leader of.
5. **Universal Editorial Footer.**

### Page 2: `portfolio.html` (The Creator Gallery)
1. **Universal Floating Capsule Navigation:**
   - Standard capsule nav.
2. **Top Breadcrumb & Header:**
   - Breadcrumb: `&larr; Back to Artist Profile` linking to `/pages/artist-profile.html?id=...`.
   - Header title: `[Artist Name]'s Portfolio & Gallery` (massive display font).
   - Subtitle: Curated archive of visual works, animations, and soundscapes.
   - Action Button: `+ Add Artwork` (opens `#addArtworkModal` if viewing own portfolio).
3. **Category Filtering Ledger:**
   - Filter pills: `All`, `Digital Art`, `Illustrations`, `Concept Art`, `Paintings`, `Photography`, `Sketches`.
4. **Artwork Gallery Grid:**
   - 12-column responsive layout (col-4 desktop, col-6 tablet, col-12 mobile).
   - Artwork Cards:
     - High quality visual presentation with thick ink border.
     - Artwork Title, medium, and completion year.
     - Likes counter and view button.
     - Lightbox / Details preview click action.
5. **Add / Edit Artwork Modal:**
   - Clean neo-brutalist modal for adding artwork with title, category, description, and image URL.
6. **Universal Editorial Footer.**
