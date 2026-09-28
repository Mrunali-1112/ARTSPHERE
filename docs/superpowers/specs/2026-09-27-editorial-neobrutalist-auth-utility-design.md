# Design Specification: Editorial Neo-brutalist Auth & Utility Pages (Slice 10)

## 1. Overview
Slice 10 represents the final vertical slice of the ArtSphere redesign. It completely rebuilds all authentication, notification, settings, and support pages, removing the last remnants of mobile-clamped containers, purple gradients, and generic web elements.

The target pages in this slice are:
1. `login.html`, `login.css`, `login.js`
2. `signup.html`, `signup.css`, `signup.js`
3. `notifications.html`, `notifications.css`, `notifications.js`
4. `settings.html`, `settings.css`, `settings.js`
5. `settings-details.html`, `settings-details.css`, `settings-details.js`
6. `help-support.html`, `help-support.css`, `help-support.js`

## 2. Design System Alignment
- **Backgrounds:** `#F4F0E7` (warm paper), `#FFFFFF` (crisp white card surface).
- **Ink & Typography:** `#0A0A0A` (deep black), `Cinzel` / `Syne` / `Fraunces` for headings, `Plus Jakarta Sans` / `Inter` for functional UI.
- **Accents:** `#FFF49A` (electric yellow badge/hover), `#FF5A1F` (vivid international orange CTAs and alerts).
- **Borders & Shadows:** `1.5px solid #0A0A0A` borders with hard retro drop shadows (`3px 3px 0 #0A0A0A`).
- **Capsule Navigation:** Universal floating capsule header (`.capsule-nav-wrapper`) on all authenticated utility pages.

## 3. Page Specifications

### A. Authentication (`login.html`, `signup.html`)
- **Structure:** Split-screen editorial layout (or balanced dual-column on desktop):
  - Left Column (Editorial Brand Pillar): Oversized typography headline, community manifesto, quote from featured member, badge pill "NO ALGORITHMS. NO ADS. PURE ART."
  - Right Column (Auth Card): Clean, high-contrast inputs with black borders, password toggle, quick sample demo credentials chip (`aanya / password`), submit action button with directional arrow, and smooth redirection to dashboard upon authentication.

### B. Notifications Center (`notifications.html`)
- **Structure:** 12-column responsive layout:
  - Header: Breadcrumb + Hero title with unread pill badge + "Mark all as read" button.
  - Left 8-col: Filter tabs (`All`, `Collaborations`, `Opportunities`, `Events`), time-grouped stream (`Today`, `This Week`, `Earlier`), each item featuring creator avatar, category pill, description, action button, and unread indicator.
  - Right 4-col: Notification Preferences card (interactive toggles), Weekly Digest recap, and Quick Navigation card.

### C. Studio Settings (`settings.html`) & Profile Editor (`settings-details.html`)
- **Structure:**
  - `settings.html`: High-level configuration hub with grouped setting cards (Identity & Account, Creative Profile, Privacy & Security, Danger Zone / Sign Out) and active user profile plaque.
  - `settings-details.html`: In-depth Profile Editor allowing updates to artist avatar, full name, username, bio, discipline, location, and creative skills. Dynamic preview and immediate feedback via toast.

### D. Help & Support (`help-support.html`)
- **Structure:**
  - Left 8-col: Conversational support chat & interactive FAQ stream with live status pill ("Online - Community Stewards"), quick topic pills ("Collab Inquiries", "Portfolio Uploads", "Guild Applications"), and interactive message input.
  - Right 4-col: Direct contact info, studio office hours, and Community Etiquette manifesto.

## 4. Verification Criteria
- All pages load with HTTP 200 via `http://localhost:8080`.
- Universal navigation functions consistently with mobile responsive drawer and account dropdown.
- Full viewport responsiveness across desktop, tablet, and mobile with zero horizontal scrollbars.
- Git commit on branch `feature/editorial-neobrutalist-redesign`.
