# ArtSphere Editorial Neo-Brutalist Redesign: Vertical Slice 6 (Collaborations)

## Purpose & Scope
Transform the entire Collaboration suite (`collaborators.html`, `collaboration-details.html`, `collaboration-requests.html`, `create-collaboration.html`, their CSS and JS) from restricted mobile app frames into expansive, responsive, full-viewport editorial neo-brutalist co-creation systems adhering to `Docs/design.md`.

---

## 1. Structure & Layout Architecture
- **Root Element**: `<div class="page-wrapper">` with responsive `6vw` gutters across all 4 pages.
- **Universal Top Capsule Nav**: Floating `<header class="capsule-nav-wrapper">` with active state on **Collaborate** (`/pages/collaborators.html`), notification trigger, and user account dropdown.
- **Universal Editorial Footer**: Standardized 4-column footer on all pages.

---

## 2. Collaborations Directory (`collaborators.html`)
1. **Hero & Spotlight (Asymmetric 8 + 4 Grid)**:
   - **Left (8 cols)**:
     - Eyebrow: `✦ CO-CREATION & RESIDENCIES`
     - Display Headline: `Build in Tandem.<br><span class="hero-title-accent">Find Your Partner.</span>`
     - Lead text highlighting multidisciplinary project squads and cross-genre creative calls.
     - High-contrast search input (`#collabSearchInput`, `#clearSearchBtn`).
     - Counter stamp (`#collabCountBadge`) & shortcut link "Manage Requests &rarr;" (`/pages/collaboration-requests.html`).
   - **Right (4 cols)**:
     - Featured Project Spotlight card (`.card-yellow`):
       - "COMMUNITY SPOTLIGHT" badge + "OPEN CALL" tag.
       - Title, pitch synopsis, team needed, and "View Pitch &rarr;" button (`/pages/collaboration-details.html?id=301`).
       - "Post a Request" shortcut button (`/pages/create-collaboration.html`).

2. **Art Forms & Skills Filter Strip (`#skillsFilterList`)**:
   - Filter pills: `All`, `Digital Art`, `Painting`, `Photography`, `Music`, `Dance`, `Writing`, `Film & 3D`.

3. **Collaborations Bento Grid (`#collabGrid`)**:
   - 3 columns desktop, 2 columns tablet, 1 column mobile.
   - Cards with `1.5px solid #0A0A0A` borders, status badges (`OPEN`), skill pills, project overview, host artist info linking to `/pages/artist-profile.html?id=...`, and action button.

---

## 3. Collaboration Details (`collaboration-details.html`)
1. **Breadcrumb**: `&larr; All Collaborations` (`/pages/collaborators.html`).
2. **Creator Header Card**: Host avatar, name, discipline, location, and link to artist profile.
3. **Collaboration Overview Card**: Status badge, timestamp, project title, quick facts ledger (Purpose, Type, Timeline, Team Needed, Location).
4. **Editorial 2-Column Content Grid**:
   - Left: Project Vision & Narrative, Skills Sought, Reference Moodboard link.
   - Right: Host Guild/Studio card, Collaboration IP & Conduct guidelines, Inquire action button.
5. **Interactive Request Modal**: Note textarea, portfolio link input, submit inquiry.

---

## 4. Collaboration Requests (`collaboration-requests.html`)
1. **Tabs Bar**: `Received`, `Sent`, `Approved` with live counter badges.
2. **Request Cards**: Host/inbound artist avatar, pitch title, inquiry note, accept/decline action buttons, and links to `/pages/artist-profile.html?id=...`.

---

## 5. Create Collaboration Post (`create-collaboration.html`)
1. **Neo-Brutalist Form**: Purpose chips, Title, Skills desired, Type, Availability, Team size, Location, Narrative textarea, Reference link, and Publish button.
