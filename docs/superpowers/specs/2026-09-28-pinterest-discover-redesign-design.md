# Discover Page Redesign: Pinterest-Style Masonry Discovery Feed

## 1. Executive Summary & Intent
Visually redesign ONLY the ArtSphere Discover page (`/pages/discover.html`) into a Pinterest-inspired, high-density, multi-content creative discovery feed matching Reference 4.
The current large hero section (`Discover Multidisciplinary Craft.` and regional panel) is replaced with a compact horizontal discovery toolbar immediately followed by an uneven 5–6 column masonry grid.

## 2. Constraints & Principles
- **No Full Rebuild**: Preserve existing backend, REST API endpoints, database, security, and router mappings.
- **Visual Identity**: Warm ivory/paper background (`#F7F4ED`), warm-white cards (`#FFFFFF` with subtle warm borders and faint elevation shadows), editorial badges, and clean Manrope/Inter typography.
- **Pinterest Density**: High information density, uneven card heights based on natural aspect ratios, multi-column masonry flow without vertical gaps.
- **Mixed Content Types**: Seamlessly blend artist profiles with jam sessions, events, community highlights, and collaboration opportunities.
- **Zero Breakage**: Keep search, category filtering, city filtering, sorting, bookmarks, and portfolio links fully functional.

## 3. Architecture & Components

### 3.1 Compact Discovery Toolbar (`discover.html`)
Positioned directly underneath the floating capsule navigation:
- **Search Bar**: Pill-shaped container with magnifying glass icon, live input (`#searchInput`), and clear button (`#clearSearchBtn`).
- **Discipline Filter Pills**: Horizontally scrollable container (`#categoryPillsRow`) containing:
  - `All` (default active)
  - `Musicians`
  - `Dancers`
  - `Visual Artists`
  - `Photographers`
  - `Writers & Lyricists`
  - `Actors`
  - `Filmmakers`
  - `Designers`
  - `›` (horizontal scroll indicator)
- **Region & Sort Dropdowns**:
  - Location select dropdown (`#locationSelect` / `.location-pill-select`): All Cities, Mumbai, Pune, Bengaluru, Thane, Navi Mumbai.
  - Sort select dropdown (`#sortSelect` / `.sort-pill-select`): Most Relevant, Most Followers, Recently Added.

### 3.2 Masonry Discovery Grid (`discover.html` & `discover.css`)
Container: `#discoverMasonryFeed`
- Multi-column CSS layout:
  - Desktop ≥ 1440px: `column-count: 6; column-gap: 18px;`
  - Desktop 1200px–1439px: `column-count: 5; column-gap: 18px;`
  - Laptop 992px–1199px: `column-count: 4; column-gap: 16px;`
  - Tablet 768px–991px: `column-count: 3; column-gap: 14px;`
  - Mobile 480px–767px: `column-count: 2; column-gap: 12px;`
  - Mobile < 480px: `column-count: 1;`
- Cards have `break-inside: avoid; margin-bottom: 18px;` to eliminate awkward fragmentation across columns.

### 3.3 Card Typologies & Components

1. **Artist Profile Card**:
   - Cover area with natural aspect ratios (portrait 4:5, square 1:1, editorial 3:4).
   - Category badge pill top-left (`VISUAL ARTIST`, `PHOTOGRAPHER`, `SINGER`, `DANCER`, etc.).
   - Interactive bookmark action top-right.
   - Header: circular avatar + creator full name + location.
   - Editorial bio snippet.
   - Skill tag badges (`Concept Art`, `Illustration`, `Collabs`).
   - Footer: follower count (`1.4K Followers`) + `Portfolio →` button linking to artist profile.

2. **Jam Session / Event Card**:
   - Event image with event badge top-left (`JAM SESSION`, `EXHIBITION`, `EVENT`).
   - High-contrast date pill top-right (`24 AUG`, `30 AUG`, `12 SEP`).
   - Event title (e.g. *Open Jam Session*, *Indie Showcase Night*).
   - Location and art form metadata (`📍 Andheri, Mumbai 🎵 Music`).
   - Overlapping attendee avatars with count (`+12 going`).
   - Circular arrow action button `↗` linking to `/pages/event-details.html?id=...`.

3. **Community Highlight Card**:
   - Soft lavender/ivory accent card background without a top cover.
   - Pill badge: `⭐ COMMUNITY HIGHLIGHT`.
   - Title: *"Stories, creations and moments from our community."*
   - 3-photo thumbnail gallery strip.
   - Circular arrow action button `↗` linking to `/pages/communities.html`.

4. **Collaboration Opportunity Card**:
   - Opportunity cover image with `OPPORTUNITY` pill badge top-left + bookmark button top-right.
   - Title (e.g. *Looking for a Guitarist*), location (`📍 Navi Mumbai`), and brief requirement description.
   - Skill pills (`Live Performance`, `Indie`, `Collaboration`).
   - Member avatars with count (`+3 members`) + `Apply →` button linking to opportunity or collaboration details.

### 3.4 Data Engine (`discover.js`)
- Preserves `/api/home/featured-artists` and `/api/artists` fetching.
- Also fetches events (`/api/home/upcoming-events` or fallback events), opportunities, and communities to interleave seamlessly into the discovery stream.
- Supports multi-criteria client-side filtering:
  - Text search: Matches creator names, professions, bios, skills, event titles, descriptions, and locations.
  - Discipline filter: Filters by art form / medium.
  - Location filter: Filters by city/hub.
  - Sorting: Applies relevance, follower count, or content priority.
- Fallback dataset: Enriched with all 16 items mirroring Reference 4 so the feed looks complete even offline or during testing.
