# Communities ("Groups") Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the ArtSphere Communities page (`/pages/communities.html`) into a clean, Pinterest-inspired "Groups" directory featuring a 4-column uniform card grid, dynamic filter tabs, search/sort controls, and distinct public/private status badges matching Reference Image 2.

**Architecture:** Replace the hero and featured guild sections with an editorial "Groups" header, dynamic filter tabs (All, My, Public, Private), compact search/location/sort toolbar, and a 4-column CSS grid. Enhance the frontend JS to support live multi-tab filtering, counts computation, and 3-dots action menus.

**Tech Stack:** HTML5, Vanilla CSS (CSS Grid, flexbox, CSS variables), Vanilla JavaScript ES6+, Spring Boot static assets.

## Global Constraints
- Modify the existing page in place without rebuilding or recreating from scratch.
- Preserve existing APIs, database models, user session, and routing.
- Warm cream background (`#F7F4ED`), warm-white cards (`#FFFFFF`), 16px corner radius, subtle 1px border.
- 4-column regular grid on desktop (not masonry!), 2 on tablet, 1 on mobile.
- Clean public/private pastel pill badges and compact metadata.

---

### Task 1: Update HTML Markup in `communities.html`

**Files:**
- Modify: `src/main/resources/static/pages/communities.html`

**Interfaces:**
- Produces:
  - `.groups-header-section` with "Groups" heading, subtitle, and `#groupsFilterTabs`
  - `.groups-toolbar-wrapper` with `#groupSearchInput`, `#groupLocationSelect`, `#groupSortSelect`, `#viewSwitcher`
  - `.section-groups-directory` with `#groupsResultsGrid` and `#groupsCountStamp`
- Consumes:
  - Universal floating capsule navigation (`#navWrapper`)
  - Universal footer (`.editorial-footer`)

- [ ] **Step 1: Replace hero & category filter section with Groups header and toolbar**
  In `communities.html`, replace `.communities-hero-section` and `.section-discipline-filters` with:
  ```html
  <section class="groups-header-section">
      <div class="groups-header-top">
          <!-- Left: Title, Subtitle, and Filter Tabs -->
          <div class="groups-header-left">
              <div class="pill-tag accent-yellow">
                  <span>✦</span>
                  <span>CREATIVE GUILDS</span>
              </div>
              <h1 class="groups-page-title">Groups</h1>
              <p class="groups-lead-text">
                  Find local studio circles, genre-specific collectives, and collaborative squads.<br>
                  Share works in progress, host jams, and build creative projects together.
              </p>
              
              <!-- Filter Tabs Row -->
              <div class="groups-filter-tabs" id="groupsFilterTabs">
                  <button class="group-tab-btn active" data-tab="all">
                      <span>All Groups</span>
                      <span class="tab-count-badge" id="tabCountAll">31</span>
                  </button>
                  <button class="group-tab-btn" data-tab="my">
                      <span>My Groups</span>
                      <span class="tab-count-badge" id="tabCountMy">10</span>
                  </button>
                  <button class="group-tab-btn" data-tab="public">
                      <span>Public Groups</span>
                      <span class="tab-count-badge" id="tabCountPublic">23</span>
                  </button>
                  <button class="group-tab-btn" data-tab="private">
                      <span>Private Groups</span>
                      <span class="tab-count-badge" id="tabCountPrivate">8</span>
                  </button>
              </div>
          </div>

          <!-- Right: Search, Location, Sort, and View Switcher -->
          <div class="groups-header-right">
              <!-- Search Input -->
              <div class="groups-search-wrapper">
                  <svg class="search-lens-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input type="text" id="groupSearchInput" class="groups-search-input" placeholder="Search groups by name, medium, or creative focus..." autocomplete="off">
                  <button id="clearSearchBtn" class="search-clear-btn" aria-label="Clear Search" style="display:none;">&times;</button>
              </div>

              <!-- Controls Row: Location, Sort, and Grid/List -->
              <div class="groups-controls-row">
                  <div class="select-pill-wrapper">
                      <svg class="select-pin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <select id="groupLocationSelect" class="pill-select-control" aria-label="Filter by Location">
                          <option value="all">All Cities</option>
                          <option value="Mumbai" selected>Mumbai</option>
                          <option value="Pune">Pune</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Thane">Thane</option>
                          <option value="Global">Global</option>
                      </select>
                      <svg class="select-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>

                  <div class="select-pill-wrapper">
                      <select id="groupSortSelect" class="pill-select-control" aria-label="Sort Groups">
                          <option value="members" selected>Most Members</option>
                          <option value="active">Recently Active</option>
                          <option value="alphabetical">Alphabetical</option>
                      </select>
                      <svg class="select-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>

                  <div class="view-switcher-group" id="viewSwitcher">
                      <button class="view-btn active" data-view="grid" aria-label="Grid View">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                              <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                              <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                              <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                          </svg>
                      </button>
                      <button class="view-btn" data-view="list" aria-label="List View">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                              <line x1="8" y1="6" x2="21" y2="6"></line>
                              <line x1="8" y1="12" x2="21" y2="12"></line>
                              <line x1="8" y1="18" x2="21" y2="18"></line>
                              <line x1="3" y1="6" x2="3.01" y2="6"></line>
                              <line x1="3" y1="12" x2="3.01" y2="12"></line>
                              <line x1="3" y1="18" x2="3.01" y2="18"></line>
                          </svg>
                      </button>
                  </div>
              </div>
          </div>
      </div>
  </section>
  ```

- [ ] **Step 2: Replace guilds bento grid with 4-column groups directory grid**
  Update the main content section:
  ```html
  <section class="section-groups-directory">
      <div class="groups-meta-bar">
          <span id="groupsCountStamp" class="results-count-stamp">Showing all groups</span>
      </div>
      <div class="groups-4col-grid" id="groupsResultsGrid">
          <!-- Populated dynamically via communities.js -->
      </div>
  </section>
  ```

---

### Task 2: Implement CSS Styles in `communities.css`

**Files:**
- Modify: `src/main/resources/static/css/communities.css`

**Interfaces:**
- Produces:
  - Header layout: `.groups-header-section`, `.groups-page-title`, `.groups-lead-text`
  - Filter tabs: `.groups-filter-tabs`, `.group-tab-btn`, `.tab-count-badge`
  - Controls: `.groups-search-wrapper`, `.groups-controls-row`, `.select-pill-wrapper`, `.view-switcher-group`
  - Grid: `.groups-4col-grid` (4 columns on desktop, 2 on tablet, 1 on mobile)
  - Card: `.group-directory-card`, `.group-status-pill` (public pink, private sage), `.group-banner-box`, `.group-title`, `.group-desc`, `.group-avatar-stack`

- [ ] **Step 1: Style the Groups header section and filter tabs**
- [ ] **Step 2: Style the search input and controls row**
- [ ] **Step 3: Implement the 4-column CSS grid layout**
- [ ] **Step 4: Style the uniform group cards matching Reference Image 2**

---

### Task 3: Refactor and Enhance JavaScript Engine in `communities.js`

**Files:**
- Modify: `src/main/resources/static/js/communities.js`

**Interfaces:**
- Produces:
  - Full curated dataset covering all 13 reference groups (Creative Souls, Illustration Hub, SoundSphere, Lens & Life, Move Together, Create & Craft, Words & Worlds, Frame by Frame, Design Circle, Live & Local, Exhibition Space, Animation Station, etc.)
  - `computeTabCounts()`: Dynamically calculates and displays counts on tabs
  - `filterAndRenderGroups()`: Real-time filtering by tab, search text, location, and sorting
  - Interactive three-dots menu dropdown on cards with Join/Leave functionality

- [ ] **Step 1: Define comprehensive dataset with public/private status and exact image assets**
- [ ] **Step 2: Implement dynamic tab count calculations and tab click switching**
- [ ] **Step 3: Implement multi-filter logic (tab, search, city, sort)**
- [ ] **Step 4: Implement card HTML renderer matching Reference Image 2**
- [ ] **Step 5: Wire up interactive 3-dots menu and join/leave toggle**

---

### Task 4: Verification and Quality Check

**Files:**
- Test target: `http://localhost:8080/pages/communities.html`

- [ ] **Step 1: Sync target classes with `.\mvnw.cmd compile`**
- [ ] **Step 2: Verify HTML, CSS, JS served with HTTP 200 OK**
- [ ] **Step 3: Validate JavaScript syntax with `node -c`**
- [ ] **Step 4: Run self-check against the 13 prompt criteria**
