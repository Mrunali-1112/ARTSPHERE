# Editorial Neo-brutalist Opportunities & Applications Design Specification

## 1. Overview
Overhaul the Opportunities & Applications slice (`opportunities.html`, `opportunity-details.html`, `my-applications.html`) from generic purple mobile clamped mockups into full-viewport, responsive, high-contrast Editorial Neo-brutalist pages complying with [`Docs/design.md`](file:///c:/Users/Rover/Documents/Github/Mrunali%20Project/ARTSPHERE/Docs/design.md).

## 2. Design System Tokens
- **Backgrounds:** Paper base (`#F4F0E7`), clean white card surfaces (`#FFFFFF`), light tint (`#F9F6F0`).
- **Inks & Borders:** `#0A0A0A` high contrast ink, `1.5px solid #0A0A0A` borders.
- **Accents:** Punchy pastel yellow (`#FFF49A`), international safety orange (`#FF5A1F`), muted cream (`#EFE9DB`).
- **Typography:** Manrope font family, sharp weights (700-900), editorial uppercase tags with letter-spacing.
- **Shadows:** Hard drop shadows `4px 4px 0px #0A0A0A`, interactive hover offsets `-2px, -2px`.
- **Radii:** `18px` for primary cards, `9999px` for pills/chips/buttons, `8px` for inner media/inputs.

## 3. Page Architectures

### Page 1: `opportunities.html` (Open Calls, Grants, Auditions & Gigs)
1. **Universal Floating Capsule Navigation:**
   - Active nav item: "Opportunities" (`/pages/opportunities.html`).
   - Notification bell with unread dot, user profile trigger with full account dropdown.
2. **Hero Banner Card:**
   - Tag pill: `CREATIVE CALLS & COMMISSIONS`
   - Display title: `Artist Opportunities & Grants`
   - Subtitle: Curated auditions, residencies, grants, exhibitions, and paid commissions for independent artists.
   - Quick action pill: `View My Applications (3)` linking to `/pages/my-applications.html`.
3. **Neo-brutalist Filter Controls:**
   - Category chips: `All`, `Auditions`, `Residencies`, `Grants & Funding`, `Commissions & Gigs`, `Competitions`.
   - Search bar with ink borders and clear button.
4. **Featured Opportunity Banner:**
   - High-impact editorial split card with visual preview, stipend/grant badge, host organization, deadline countdown, and direct Apply button.
5. **12-Column Responsive Opportunities Grid:**
   - 3 columns desktop (col-4), 2 columns tablet (col-6), 1 column mobile (col-12).
   - Opportunity cards featuring:
     - Category badge (`AUDITION`, `GRANT`, `RESIDENCY`, `GIG`)
     - Title with link to `/pages/opportunity-details.html?id=...`
     - Host organization & location
     - Compensation / Award (e.g. `₹75,000 Grant` or `Paid Role`)
     - Deadline date pill
     - Action buttons: `View Call &rarr;` and bookmark button.
6. **Universal Editorial Footer.**

### Page 2: `opportunity-details.html` (Application Dossier & Modal)
1. **Universal Floating Capsule Navigation:**
   - Active: "Opportunities".
2. **Breadcrumb Bar:** `&larr; Back to All Opportunities`
3. **Hero Dossier Card:**
   - Organization badge, title, compensation ledger, application deadline countdown, mode (Remote / In-Person).
   - Direct CTA: `Apply for Opportunity &rarr;` and `Share Call`.
4. **12-Column Layout (8 cols left narrative, 4 cols right requirements & host):**
   - Left 8 cols:
     - About the Opportunity / Scope of Work.
     - Deliverables & Artistic Criteria.
     - Eligibility & Discipline details.
   - Right 4 cols:
     - Host Organization profile card.
     - Key Dates ledger (Announcement, Review, Final Selection).
     - Selection Committee / Juror notes.
5. **Interactive Application Modal (`#applyModal`):**
   - Cover note / Artist Statement textarea.
   - Portfolio / Sample Work URL input.
   - Confirmation checkbox for terms.
   - Instant feedback and success modal linking to `my-applications.html`.
6. **Universal Editorial Footer.**

### Page 3: `my-applications.html` (Unified Applicant Tracker)
1. **Universal Floating Capsule Navigation:**
   - Active: "Opportunities" or Profile dropdown context.
2. **Hero Tracker Banner:**
   - Title: `My Applications & Submissions`
   - Stats Ledger: Total Submissions, Pending Review, Accepted, Interviews/Auditions.
3. **Two-Tier Neo-brutalist Filtering:**
   - Category Tabs: `All Submissions`, `Events & Workshops`, `Collaborations`, `Opportunities & Grants`.
   - Status Pills: `All`, `Pending`, `Accepted / Shortlisted`, `Declined`.
4. **Responsive Applications Cards:**
   - Linked to target item (`opportunity-details.html`, `event-details.html`, `collaboration-details.html`).
   - Clear status badges (`PENDING REVIEW`, `ACCEPTED / CONFIRMED`, `DECLINED`).
   - Submitted date, reference ID, and action button.
5. **Universal Editorial Footer.**
