# ArtSphere Editorial Neo-Brutalist Redesign: Vertical Slice 5 (Events & Workshops)

## Purpose & Scope
Transform the Events Directory (`events.html`, `events.css`, `events.js`) and Event Details Experience (`event-details.html`, `event-details.css`, `event-details.js`) from cramped mobile viewports into full-viewport, editorial neo-brutalist community programming platforms following `Docs/design.md`.

---

## 1. Structure & Layout Architecture
- **Root Element**: Wrap both pages in `<div class="page-wrapper">` with responsive `6vw` gutters.
- **Universal Top Capsule Nav**: Floating `<header class="capsule-nav-wrapper">` with active state on **Events** (`/pages/events.html`), notifications trigger, and account dropdown menu.
- **Universal Editorial Footer**: Standardized footer with complete directory, platform, and account links.

---

## 2. Events Directory (`events.html`)
1. **Hero & Spotlight (Asymmetric 8 + 4 Grid)**:
   - **Left (8 cols)**:
     - Eyebrow: `✦ LIVE SESSIONS & JAMS`
     - Display Headline: `Master the Craft.<br><span class="hero-title-accent">Live with Creators.</span>`
     - Lead text highlighting workshops, studio jams, and exhibitions.
     - Search input with debounced querying (`#eventSearchInput`, `#clearSearchBtn`).
     - Live result counter (`#eventsCountBadge`).
     - Direct link: "View My Registrations &rarr;" (`/pages/my-applications.html?category=EVENTS`).
   - **Right (4 cols)**:
     - Featured Event Spotlight card (`.card-yellow`):
       - Date stamp box (`MAR 15`), "SPOTLIGHT EVENT" badge.
       - Title, venue, schedule, attendee counter.
       - Actions: "View Details" & "Register Now" (`/pages/event-details.html?id=801`).

2. **Art Form Filter Bar (`#categoriesScrollRow`)**:
   - Filter pills: All, Painting, Music, Dance, Photography, Writing, Digital Art.
   - Active high-contrast state (`#0A0A0A` background, white text).

3. **Upcoming Events Bento Grid (`#eventsGrid`)**:
   - 3 columns desktop, 2 columns tablet, 1 column mobile.
   - Neo-brutalist cards (`1.5px solid #0A0A0A`, `4px 4px 0 #0A0A0A` shadow on hover):
     - Thumbnail image with date stamp badge and event type pill.
     - Title, short description, time, location.
     - Host guild/artist avatar linking to community hub (`/pages/community-details.html?id=...`).
     - Action buttons: "View Details" link and "Register / Registered" toggle.

---

## 3. Event Details Experience (`event-details.html`)
1. **Top Breadcrumb Navigation**:
   - Clickable back link: `&larr; Back to Events & Workshops` (`/pages/events.html`).

2. **Hero Cover Banner & Header Card**:
   - Full-width hero banner frame with crisp black outline.
   - Event Profile Header (`.event-header-card`):
     - Event Type pill badge, title, subtitle.
     - Meta badges: Date, Time, Venue, Attendee count.
     - Action buttons: "Register Now" pill, "Save to Calendar", "Share Event".

3. **2-Column Editorial Grid (8 + 4 cols)**:
   - **Left (8 cols)**:
     - "About This Event" card with rich narrative description.
     - "What You'll Learn" checklist with checkmark motifs.
     - "What to Bring / Prerequisites" card.
     - "Who Can Join" and "Studio Etiquette & Guidelines".
   - **Right (4 cols)**:
     - Host Guild card linking to `/pages/community-details.html?id=...`.
     - Venue details card with address and directions.
     - Attendee roll preview card.
     - Studio quote block.

4. **RSVP Confirmation Modal**:
   - Neo-brutalist modal card with confetti badge, confirmed event title, and dismissal.
