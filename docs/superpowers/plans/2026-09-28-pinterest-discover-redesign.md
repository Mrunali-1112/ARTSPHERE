# Discover Page Pinterest-Style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the ArtSphere Discover page (`/pages/discover.html`) into a Pinterest-inspired, high-density, multi-column masonry discovery feed with mixed content types (artists, events, community highlights, opportunities) matching Reference 4.

**Architecture:** Replace the large hero section with a compact horizontal discovery toolbar and a multi-column CSS masonry grid. Update the frontend JavaScript to fetch and interleave artist profiles, upcoming events, community highlights, and opportunities with real-time multi-criteria filtering.

**Tech Stack:** HTML5, Vanilla CSS (CSS multi-column masonry, flexbox, CSS custom properties), Vanilla JavaScript ES6+, Spring Boot static asset serving.

## Global Constraints
- Do NOT rebuild or recreate the page from scratch.
- Do NOT change backend APIs, database, authentication, or routing.
- Warm cream/paper background (`#F7F4ED`), warm-white cards (`#FFFFFF`), 16px corner radius, subtle 1px border.
- 5–6 columns on large desktop, responsive down to 1–2 columns on mobile.
- Support 4 card typologies: Artist Profile, Jam Session / Event, Community Highlight, and Collaboration Opportunity.

---

### Task 1: Update HTML Markup in `discover.html`

**Files:**
- Modify: `src/main/resources/static/pages/discover.html`

**Interfaces:**
- Produces:
  - `.discover-toolbar-section` with `#searchInput`, `#clearSearchBtn`, `#categoryPillsRow`, `#locationSelect`, `#sortSelect`
  - `.discover-masonry-section` with `#discoverMasonryFeed` and `#resultsCountLabel`
- Consumes:
  - Universal floating capsule navigation (`#navWrapper`)
  - Universal footer (`.editorial-footer`)

- [ ] **Step 1: Replace hero section with compact discovery toolbar**
  In `src/main/resources/static/pages/discover.html`, remove the `.discover-hero-section` and the separate `.section-discipline-filters`. Insert the compact discovery toolbar section:
  ```html
  <section class="discover-toolbar-section">
      <div class="toolbar-inner-container">
          <!-- Search Box -->
          <div class="toolbar-search-wrapper">
              <svg class="search-lens-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="searchInput" class="toolbar-search-input" placeholder="Search by artist name, skill, or medium (e.g. guitar, digital art, acrylic)..." autocomplete="off">
              <button id="clearSearchBtn" class="search-clear-btn" aria-label="Clear Search" style="display:none;">&times;</button>
          </div>

          <!-- Discipline Pills Row -->
          <div class="toolbar-pills-wrapper">
              <div class="toolbar-pills-row" id="categoryPillsRow">
                  <button class="filter-pill-btn active" data-category="all">All</button>
                  <button class="filter-pill-btn" data-category="Musicians">Musicians</button>
                  <button class="filter-pill-btn" data-category="Dancers">Dancers</button>
                  <button class="filter-pill-btn" data-category="Visual Artists">Visual Artists</button>
                  <button class="filter-pill-btn" data-category="Photographers">Photographers</button>
                  <button class="filter-pill-btn" data-category="Writers & Lyricists">Writers &amp; Lyricists</button>
                  <button class="filter-pill-btn" data-category="Actors">Actors</button>
                  <button class="filter-pill-btn" data-category="Filmmakers">Filmmakers</button>
                  <button class="filter-pill-btn" data-category="Designers">Designers</button>
              </div>
              <button class="pills-scroll-right-btn" id="pillsScrollRightBtn" aria-label="Scroll disciplines">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
          </div>

          <!-- Controls Group (Location & Sort) -->
          <div class="toolbar-controls-group">
              <div class="select-pill-wrapper">
                  <svg class="select-pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <select id="locationSelect" class="pill-select-control" aria-label="Filter by Location">
                      <option value="all">All Cities</option>
                      <option value="Mumbai" selected>Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Thane">Thane</option>
                      <option value="Navi Mumbai">Navi Mumbai</option>
                  </select>
                  <svg class="select-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>

              <div class="select-pill-wrapper">
                  <select id="sortSelect" class="pill-select-control" aria-label="Sort Feed">
                      <option value="relevant" selected>Most Relevant</option>
                      <option value="followers">Most Followers</option>
                      <option value="recent">Recently Added</option>
                  </select>
                  <svg class="select-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
          </div>
      </div>
  </section>
  ```

- [ ] **Step 2: Replace results grid with masonry discovery feed container**
  Update the main content section in `discover.html`:
  ```html
  <section class="discover-masonry-section">
      <div class="feed-header-meta">
          <span id="resultsCountLabel" class="results-count-stamp">Showing all creative discoveries</span>
      </div>
      <div class="masonry-discovery-feed" id="discoverMasonryFeed">
          <!-- Populated dynamically via discover.js -->
      </div>
  </section>
  ```

---

### Task 2: Implement Pinterest-Style Masonry & Card Styles in `discover.css`

**Files:**
- Modify: `src/main/resources/static/css/discover.css`

**Interfaces:**
- Produces:
  - Responsive multi-column layout (`.masonry-discovery-feed`)
  - Compact horizontal discovery toolbar (`.discover-toolbar-section`)
  - Card styles: `.artist-masonry-card`, `.event-masonry-card`, `.community-masonry-card`, `.opportunity-masonry-card`
  - Badges, date tags, attendee avatars, bookmark button, pill tags, and action buttons.

- [ ] **Step 1: Style the compact discovery toolbar**
  Implement responsive flex container aligning search box, discipline pills with horizontal scrolling, and pill select controls.
- [ ] **Step 2: Implement multi-column masonry layout**
  Use CSS columns (`column-count: 6; column-gap: 18px;`) with `@media` breakpoints for 5, 4, 3, 2, and 1 columns.
  Apply `break-inside: avoid; margin-bottom: 18px; display: inline-block; width: 100%;` to cards.
- [ ] **Step 3: Style the warm editorial cards**
  Set `background: #FFFFFF; border: 1px solid rgba(10,10,10,0.08); border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);`
  Configure image aspect ratios (variable portrait, landscape, tall editorial with `object-fit: cover`).
- [ ] **Step 4: Style card elements (badges, dates, attendees, buttons)**
  Style top-left pill badges, top-right bookmark button, dark date badges (`24 AUG`), attendee avatar stacks (`+12 going`), and circular arrow buttons `↗`.

---

### Task 3: Refactor and Enhance JavaScript Engine in `discover.js`

**Files:**
- Modify: `src/main/resources/static/js/discover.js`

**Interfaces:**
- Produces:
  - `loadDiscoverData()`: Fetches artists, events, opportunities, communities, and combines them.
  - `filterAndRenderDiscoverFeed()`: Filters and renders cards into `#discoverMasonryFeed`.
  - Event listeners for `#searchInput`, `#categoryPillsRow`, `#locationSelect`, `#sortSelect`, `#clearSearchBtn`, `#pillsScrollRightBtn`.
  - `toggleBookmark(type, id, btn)`: Interactive bookmark state handler.

- [ ] **Step 1: Define comprehensive seed dataset representing Reference 4**
  Incorporate the full 16-item mixed dataset matching Reference 4 (Aanya Deshmukh, Rohan Mehta, Arjun Rao, Meera Singh, Open Jam Session, Kavya Iyer, Sneha Patil, Riya Deshmukh, Community Highlight, Neel Joshi, Ishita Kulkarni, Looking for a Guitarist Opportunity, Creative Meetup Event, Karan Shah, Indie Showcase Night Exhibition).
- [ ] **Step 2: Implement data loading with API integration and seamless fallback**
  Fetch `/api/home/featured-artists` or `/api/artists`, `/api/home/upcoming-events` or `/api/events`, and merge with enriched discover items.
- [ ] **Step 3: Implement multi-criteria filtering and sorting logic**
  Filter by search query (across title, name, bio, skills, tags, location), discipline category, and location city. Sort by relevance, followers, or date.
- [ ] **Step 4: Implement card HTML generators for the 4 card typologies**
  Render `.artist-masonry-card`, `.event-masonry-card`, `.community-masonry-card`, and `.opportunity-masonry-card`.
- [ ] **Step 5: Wire up toolbar controls and interactive bookmark toggles**
  Connect debounced search, pill clicks, location select changes, sort select changes, scroll arrow, and bookmark icon toggles.

---

### Task 4: Verification and Visual Quality Check

**Files:**
- Test target: `http://localhost:8080/pages/discover.html`

- [ ] **Step 1: Check page loading via curl or HTTP verification**
  Ensure HTTP 200 OK and valid HTML payload.
- [ ] **Step 2: Verify responsive multi-column layout and card rendering**
  Inspect rendered output, test filtering by search, discipline, and location.
- [ ] **Step 3: Verify against the 10 self-check criteria from the prompt**
  Confirm:
  1. Content starts immediately without large hero.
  2. Immediate discovery feed feel.
  3. Visibly uneven masonry grid.
  4. Varied card heights and aspect ratios.
  5. Mixed content types (artists, events, community highlight, opportunities).
  6. Warm cream background with distinct warm-white cards.
  7. Unmistakable ArtSphere editorial aesthetic.
  8. Density like Pinterest without branding duplication.
  9. Preserved search, filters, navigation, and portfolio buttons.
