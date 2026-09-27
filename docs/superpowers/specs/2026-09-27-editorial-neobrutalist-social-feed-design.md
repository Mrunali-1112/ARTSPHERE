# Editorial Neo-brutalist Social Feed & Posts Design Specification

## 1. Overview
Overhaul the Social Feed & Post creation slice (`feed.html`, `create-post.html`, `post-details.html`) from generic purple mobile clamped screens into a full-viewport, responsive, high-impact Editorial Neo-brutalist studio stream adhering to [`Docs/design.md`](file:///c:/Users/Rover/Documents/Github/Mrunali%20Project/ARTSPHERE/Docs/design.md).

## 2. Design System Tokens
- **Backgrounds:** Tactile paper base (`#F4F0E7`), clean white card surfaces (`#FFFFFF`), warm light tint (`#EFE9DB`).
- **Inks & Borders:** `#0A0A0A` high contrast ink, `1.5px solid #0A0A0A` borders.
- **Accents:** Punchy pastel yellow (`#FFF49A`), international safety orange (`#FF5A1F`), crisp monochrome contrast.
- **Typography:** Manrope font family, sharp weights (700-900), editorial uppercase tags with letter-spacing.
- **Shadows:** Hard drop shadows `4px 4px 0px #0A0A0A`, interactive hover offsets `-2px, -2px`.
- **Radii:** `18px` for primary cards, `9999px` for pills/chips/buttons, `8px` for inner media/inputs.

## 3. Page Architectures

### Page 1: `feed.html` (The Studio Stream & Discovery Feed)
1. **Universal Floating Capsule Navigation:**
   - Standard capsule nav, Home / Feed active context.
2. **Feed Hero Banner Card:**
   - Tag: `COMMUNITY STUDIO STREAM`
   - Display title: `The Creative Pulse & Studio Feed`
   - Subtitle: `Live sketches, work-in-progress thoughts, sound experiments, and announcements from artists worldwide.`
   - Action Button: `+ Post to Studio Feed` linking to `/pages/create-post.html`.
3. **Filter & Search Controls:**
   - Search bar with clear button.
   - Discipline ledger pills: `All Streams`, `Visual Arts`, `Music & Sound`, `Contemporary Dance`, `Photography`, `Writing & Poetry`, `Crafts`.
4. **12-Column Responsive Feed Layout (8 cols left feed stream, 4 cols right sidebar):**
   - Left 8 cols:
     - Post Cards:
       - Author row: Avatar with border, author name (linking to `artist-profile.html?id=...`), discipline pill, timestamp.
       - Post Title & Narrative caption.
       - Visual Media: Large high-resolution artwork or video with 1.5px ink border and hard shadow.
       - Tags: e.g. `#digitalpainting`, `#conceptart`.
       - Actions Bar: Like button with dynamic counter, Comment button (links to `post-details.html?id=...`), Share button, Bookmark button.
   - Right 4 cols (Editorial Sidebar):
     - Daily Artistic Prompt / Inspiration Card (Henri Matisse quote / creative challenge).
     - Trending Tags Ledger.
     - Featured Co-Creation Spotlight.
5. **Universal Editorial Footer.**

### Page 2: `create-post.html` (The Studio Studio Publisher)
1. **Universal Floating Capsule Navigation:**
   - Standard capsule nav.
2. **Top Breadcrumb:** `&larr; Back to Studio Feed` (`/pages/feed.html`).
3. **Form Architecture (8 cols form, 4 cols tips sidebar):**
   - Media Dropzone / URL Picker with visual preview and remove button.
   - Caption / Narrative textarea with character counter.
   - Art Form & Category dropdowns.
   - Tags input.
   - Action bar: `Publish to Community Feed &rarr;` and `Cancel`.
4. **Universal Editorial Footer.**

### Page 3: `post-details.html` (The Discussion & Artwork Inspection Dossier)
1. **Universal Floating Capsule Navigation:**
   - Standard capsule nav.
2. **Top Breadcrumb:** `&larr; Back to Feed` (`/pages/feed.html`).
3. **12-Column Layout (8 cols artwork & comments, 4 cols creator profile):**
   - Left 8 cols:
     - Large visual presentation frame.
     - Caption, artist statement, and tags.
     - Engagement bar (Likes, Comments count, Share).
     - Comments section with interactive comment submission form.
   - Right 4 cols:
     - Creator Profile dossier preview.
     - More works by this artist.
4. **Universal Editorial Footer.**
