# Communities ("Groups") Page Redesign: Pinterest-Inspired Directory

## 1. Executive Summary & Intent
Visually and structurally refactor the ArtSphere Communities page (`/pages/communities.html`) into a clean, content-focused "Groups" creative directory inspired by the Pinterest "Groups" architecture and the ArtSphere target design (Image 2).
The existing marketing hero banner ("Join Guilds. Create in Tandem.") and the oversized yellow "Featured Guild" card are removed in favor of a prominent "Groups" page heading, concise subtitle, dynamic filter tabs, search/sort toolbar, and a uniform 4-column community card grid.

## 2. Constraints & Principles
- **No Rebuild / No Fake Architecture**: Keep existing Spring Boot APIs (`/api/communities`, `/api/communities/{id}/join`), database models, and user authentication session.
- **Visual Identity**: Warm cream canvas (`#F7F4ED` / `var(--color-paper)`), warm-white cards (`#FFFFFF`), rounded corners (`16px`), subtle 1px border (`rgba(10, 10, 10, 0.08)` / `#E8E4DC`), soft shadow, and editorial `Manrope` / `Inter` typography.
- **Uniform 4-Column Grid**: Unlike the Discover page's masonry, the Communities directory uses an aligned, consistent 4-column CSS grid on desktop (2 columns on tablet, 1 on mobile).
- **Directory Focus**: Immediate discovery of creative groups with zero marketing fluff.

## 3. Architecture & Components

### 3.1 Page Header & Control Row (`communities.html`)
Positioned directly below the universal floating capsule nav:
- **Left Column**:
  - Badge: `CREATIVE GUILDS` (yellow pill tag)
  - Heading: **Groups** (bold editorial display font, `font-size: clamp(36px, 4vw, 54px);`)
  - Subtitle:
    > "Find local studio circles, genre-specific collectives, and collaborative squads.  
    > Share works in progress, host jams, and build creative projects together."
  - Filter Tabs Row (`#groupsFilterTabs`):
    - `All Groups <span class="tab-badge" id="countAll">31</span>` (default active: black pill)
    - `My Groups <span class="tab-badge" id="countMy">10</span>` (shows groups joined by user)
    - `Public Groups <span class="tab-badge" id="countPublic">23</span>`
    - `Private Groups <span class="tab-badge" id="countPrivate">8</span>`
- **Right Column (Controls Toolbar)**:
  - Top Row:
    - Search input (`#groupSearchInput`): Pill wrapper with search icon, clear button, placeholder: *"Search groups by name, medium, or creative focus..."*
  - Bottom Row:
    - Location dropdown (`#groupLocationSelect`): `📍 Mumbai ▼` (All Cities, Mumbai, Pune, Bengaluru, Thane, Navi Mumbai).
    - Sort dropdown (`#groupSortSelect`): `Most Members ▼` (Most Members, Newest, Most Active).
    - View Switcher (`#viewSwitcher`): Grid / List toggle with active grid icon.

### 3.2 Uniform 4-Column Group Card Grid (`communities.html` & `communities.css`)
Container: `#groupsResultsGrid`
- CSS Grid: `grid-template-columns: repeat(4, 1fr); gap: 20px;` (Tablet: 2 columns, Mobile: 1 column).
- Consistent card dimensions (`.group-directory-card`).
- Card layout:
  - **Top Row**:
    - Status badge:
      - `PUBLIC GROUP`: soft pastel rose pill (`background: #FCE8F0; color: #D13876; font-size: 10px; font-weight: 800; border: none; padding: 4px 10px; border-radius: 999px;`)
      - `PRIVATE GROUP`: soft pastel sage pill (`background: #E6F4EA; color: #1E7E34; font-size: 10px; font-weight: 800; border: none; padding: 4px 10px; border-radius: 999px;`)
    - Member count metadata (`1.2K members`).
    - Three-dots action button (`⋮`) triggering context menu (View details, Join/Leave, Share).
  - **Thumbnail Banner**:
    - Clean horizontal landscape banner (`height: 110px; border-radius: 8px; object-fit: cover;`).
  - **Group Title & Description**:
    - Bold title: e.g. *Creative Souls*, *Illustration Hub*, *SoundSphere*, *Lens & Life*, *Move Together*, *Create & Craft*, *Words & Worlds*, *Frame by Frame*, *Design Circle*, *Live & Local*, *Exhibition Space*, *Animation Station*.
    - Short 2-line description.
  - **Footer**:
    - 3 overlapping creator avatars + member count text (`+1.2K`).
    - Whole card links to `/pages/community-details.html?id=...`.

### 3.3 Dynamic Filter Engine (`communities.js`)
- Fetch communities from `/api/communities` with user session join status.
- Enrich with curated reference groups dataset ensuring all 12+ reference groups exist with appropriate imagery, category, location, and member counts.
- Dynamically calculate and update counts for `All`, `My`, `Public`, and `Private` tabs.
- Filter by tab, search keyword, location, and sort criteria in real-time.
- Interactive join/leave toggle via three-dots menu or card action, updating `My Groups` count instantly.
