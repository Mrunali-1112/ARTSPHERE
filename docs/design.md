# Design System

> **Purpose:** This document defines the visual language, layout
> grammar, component rules, and implementation constraints for the
> entire product.
>
> **Reference direction:** Editorial neo-brutalism + Swiss-inspired
> modular composition + restrained playful accents.
>
> **Core principle:** Content can change from page to page. The visual
> language must remain consistent.

------------------------------------------------------------------------

## 1. Design Philosophy

The product should feel:

-   Editorial
-   Geometric
-   Minimal
-   Playful but restrained
-   Premium but approachable
-   Human-designed
-   Modular
-   Slightly asymmetric
-   Information-rich without feeling cluttered
-   Deliberately art-directed

The design should look like one designer created the entire product
system, not like an AI generated each page independently.

### Avoid

Do **not** use:

-   Glassmorphism
-   Purple/blue "AI" gradients
-   Excessive gradients
-   Excessive drop shadows
-   Floating blobs
-   Generic SaaS/dashboard aesthetics
-   Repetitive rounded cards
-   Excessive 3D
-   Random decorative shapes
-   Excessive animation
-   Template-like symmetrical layouts
-   Arbitrary colors
-   Random one-off component styles

The visual character should come primarily from **geometry, typography,
borders, spacing, composition, and controlled color accents**.

------------------------------------------------------------------------

# 2. Design DNA

The visual language can be summarized as:

> **A warm editorial neo-brutalist system built from black geometric
> outlines, cream paper-like surfaces, restrained yellow/orange accents,
> tight grotesk typography, pill-shaped controls, modular cards, shared
> borders, asymmetric column spans, and deliberately composed
> information density.**

The reference image is a **style reference, not a template**.

Do not copy:

-   Its content
-   Its exact layout
-   Its illustrations
-   Its wording
-   Its exact card arrangement
-   Its exact proportions

Instead, extract and consistently apply its **visual grammar**.

------------------------------------------------------------------------

# 3. Color System

Use a restrained palette.

  Token        Hex         Role
  ------------ ----------- ----------------------------------
  `ink`        `#0A0A0A`   Primary text, borders, icons
  `white`      `#FFFFFF`   Primary surfaces
  `paper`      `#F4F0E7`   Main page background
  `cream`      `#EAE4D5`   Secondary cards/surfaces
  `yellow`     `#FFF49A`   CTA highlights and small accents
  `orange`     `#FF5A1F`   Accent and emphasis
  `grey`       `#E7E7E5`   Subtle surfaces
  `mid-grey`   `#6F6F6A`   Secondary text

### Color ratio

Approximately:

-   **90%** neutral colors
-   **5--8%** black/high-contrast elements
-   **2--5%** yellow/orange accents

Yellow and orange should behave like punctuation, not like primary
surfaces.

### Rules

-   Never invent arbitrary colors.
-   Never introduce a new accent color without a deliberate design
    reason.
-   Do not use gradients as a default styling mechanism.
-   Prefer solid fills.
-   Use orange sparingly.
-   Yellow should feel like a highlight rather than a background theme.

------------------------------------------------------------------------

# 4. Border System

Borders are one of the defining visual elements.

### Tokens

``` css
--border-thin: 1px;
--border-standard: 1.5px;
--border-strong: 2px;
```

Primary border:

``` css
border: 1.5px solid #0A0A0A;
```

Strong border:

``` css
border: 2px solid #0A0A0A;
```

### Rules

-   Prefer black outlines over shadows for hierarchy.
-   Primary cards should normally have visible black borders.
-   Avoid generic Tailwind-style light-grey borders for major
    components.
-   Do not add shadows simply because a component needs separation.
-   Border weight should remain consistent across related components.

------------------------------------------------------------------------

# 5. Corner Radius System

Do not make every element `rounded-2xl`.

Use a controlled radius vocabulary.

     Radius Usage
  --------- ------------------------
      `4px` Micro controls
      `8px` Small components
     `12px` Compact cards
     `18px` Standard cards
     `24px` Large containers/cards
    `999px` Pills

### Rules

-   Large cards: `18–24px`
-   Small cards: `8–12px`
-   Buttons: pill-shaped
-   Navigation: pill-shaped
-   Do not use a single radius globally.

------------------------------------------------------------------------

# 6. Grid System

The product uses a modular column grid.

### Desktop

``` text
12 columns
```

### Tablet

``` text
8 columns
```

### Mobile

``` text
4 columns
```

### Desktop page margins

``` text
5–7vw
```

### Column gap

``` text
16–24px
```

### Preferred spans

Use deliberate spans such as:

``` text
2
3
4
5
6
7
8
12
```

Avoid making every section:

``` text
3 + 3 + 3 + 3
```

The composition should use variable spans.

### Preferred compositions

``` text
4 + 8
5 + 7
6 + 6
3 + 5 + 4
2 + 4 + 6
8 + 4
```

The exact values should depend on content.

------------------------------------------------------------------------

# 7. Spacing System

Use the following spacing scale:

``` text
4
8
12
16
20
24
32
40
48
64
80
96
128
```

### Usage

         Space Typical usage
  ------------ ---------------------------
       `4–8px` Icon/text relationships
     `12–16px` Internal card spacing
     `20–24px` Component spacing
     `32–48px` Card padding
     `64–96px` Section spacing
    `96–128px` Major composition spacing

Do not randomly introduce values such as `27px`, `43px`, or `73px`
unless there is a specific layout reason.

------------------------------------------------------------------------

# 8. Typography

## Primary Typeface

Preferred:

``` text
Manrope
```

Fallback:

``` text
Inter
```

Typography should feel:

-   Clean
-   Geometric
-   Compact
-   Modern
-   Highly legible

## Scale

  Role             Size   Line Height
  --------- ----------- -------------
  Display     `64–80px`   `0.95–1.05`
  H1          `48–64px`   `0.95–1.05`
  H2          `32–44px`     `1.0–1.1`
  H3          `24–32px`   `1.05–1.15`
  Body        `15–18px`     `1.4–1.6`
  Small       `12–14px`     `1.3–1.5`
  Micro       `10–12px`     `1.2–1.4`

### Headlines

Headlines should use tight line-height.

Prefer:

``` text
Build better
with your
community
```

over loose editorial spacing.

Typography should create hierarchy before decoration does.

------------------------------------------------------------------------

# 9. Layout Grammar

The interface is not a collection of independent cards.

It is a **modular composition system**.

Components should feel like pieces of one larger visual composition.

### Good

``` text
┌──────────────┬──────────────────────────┐
│              │                          │
│    4 COL     │          8 COL           │
│              │                          │
└──────────────┴──────────────────────────┘
```

### Good

``` text
┌────────────┬───────────────┬─────────────┐
│    2 COL   │     5 COL     │    5 COL    │
│            │               │             │
└────────────┴───────────────┴─────────────┘
```

### Avoid

``` text
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ CARD │ │ CARD │ │ CARD │ │ CARD │
└──────┘ └──────┘ └──────┘ └──────┘
```

repeated throughout the product.

### Shared borders

Cards may intentionally:

-   Touch
-   Share borders
-   Form groups
-   Have different heights
-   Span different columns
-   Visually connect to neighboring components

This is important to the design language.

------------------------------------------------------------------------

# 10. Section Composition

Every major section should generally contain:

1.  **One dominant element**
2.  **One to three supporting elements**
3.  **One visual interruption/accent**

For example:

``` text
                 MAIN CONTENT
        ┌───────────────────────────┐
        │                           │
        │          HEADLINE         │
        │                           │
        └───────────────────────────┘

┌────────────────┐      ┌───────────────────┐
│                │      │                   │
│      CARD      │      │       IMAGE       │
│                │      │                   │
└────────────────┘      └───────────────────┘
```

### Important

Do not center everything.

Do not make every section symmetrical.

Asymmetry should be deliberate and grid-based, not chaotic.

------------------------------------------------------------------------

# 11. Navigation

Navigation should feel like a floating editorial capsule rather than a
conventional SaaS navbar.

### Characteristics

-   Pill-shaped
-   Cream or white background
-   Black `1.5–2px` border
-   Compact height
-   Generous horizontal padding
-   Minimal separators
-   Clear primary CTA

Example:

``` text
╭──────────────────────────────────────────────────────╮
│ LOGO    ───   ABOUT   PROGRAMS   BLOG   ...   LOGIN │
│                                             SIGN UP  │
╰──────────────────────────────────────────────────────╯
```

Do not use a generic dashboard navigation bar unless the product context
explicitly requires one.

------------------------------------------------------------------------

# 12. Buttons

## Primary Button

Characteristics:

-   Black background
-   White text
-   Black border
-   Pill shape
-   `48–56px` height
-   `24–32px` horizontal padding
-   Optional directional arrow

Example:

``` text
╭────────────────────────────╮
│  Get started          →    │
╰────────────────────────────╯
```

## Secondary Button

Characteristics:

-   Cream/white background
-   Black text
-   Black border
-   Pill shape

Example:

``` text
╭────────────────────────────╮
│  Watch video          ●    │
╰────────────────────────────╯
```

### Button rules

-   Prefer a maximum of two prominent CTA treatments per viewport.
-   Use directional arrows where appropriate.
-   Hover animation should be subtle.
-   Do not use gradient buttons.

------------------------------------------------------------------------

# 13. Cards

Cards are modular building blocks.

A card can contain:

-   Label
-   Title
-   Description
-   Metadata
-   Image
-   Statistic
-   Icon
-   CTA
-   Decorative accent

### Standard card

``` text
┌─────────────────────────────┐
│ LABEL                       │
│                             │
│ TITLE                       │
│                             │
│ Supporting text             │
│                             │
│                        →    │
└─────────────────────────────┘
```

### Information card

``` text
┌─────────────────────────────┐
│ ✦                           │
│                             │
│ 12K+                        │
│                             │
│ Students reached            │
└─────────────────────────────┘
```

### Feature card

``` text
┌─────────────────────────────┐
│                             │
│          VISUAL             │
│                             │
├─────────────────────────────┤
│ Feature title               │
│ Supporting text             │
└─────────────────────────────┘
```

### Profile card

``` text
┌─────────────────────────────┐
│ ● ● ●                       │
│                             │
│ Name                        │
│ Description                 │
│                             │
│ →                           │
└─────────────────────────────┘
```

------------------------------------------------------------------------

# 14. Card Composition Rules

Cards should not all look identical.

Variation can come from:

-   Width
-   Height
-   Column span
-   Internal hierarchy
-   Image position
-   Accent placement
-   Shared borders
-   Content density

Variation should happen **inside the design system**, not outside it.

Do not create random styles for individual cards.

------------------------------------------------------------------------

# 15. Image System

Images should feel editorial and natural.

### Image containers can use

-   Strong black outlines
-   Controlled corner radii
-   Circular crops
-   Organic crops
-   Color-backed containers
-   Deliberate cropping
-   Asymmetric placement

### Avoid

-   Artificial gradients
-   Fake glass effects
-   Heavy image filters
-   Generic AI-looking imagery
-   Excessive blur
-   Random image masks

Images should remain visually believable.

------------------------------------------------------------------------

# 16. Decorative Language

Use a small, consistent vocabulary.

### Allowed motifs

-   Diamonds
-   Small stars
-   Circles
-   Arrows
-   Offset rectangles
-   Thin rules
-   Tiny labels

Examples:

``` text
◇
✦
→
↗
◯
```

### Rules

Decorative elements must reinforce the composition.

They must never be scattered randomly just to "make the page
interesting."

Decoration should be sparse.

------------------------------------------------------------------------

# 17. Information Density

The product should feel rich without becoming cluttered.

Prefer compositions such as:

``` text
Large headline
+
Small metadata
+
Compact information card
+
Visual
```

rather than:

``` text
Large headline
+
Huge empty space
+
Huge illustration
```

Small labels, dividers, statistics, metadata and compact information
blocks can create useful editorial density.

------------------------------------------------------------------------

# 18. Visual Hierarchy

Each viewport should have an obvious visual priority.

A typical hierarchy:

``` text
1. Dominant headline / primary visual
2. Primary CTA
3. Supporting content
4. Secondary cards
5. Metadata
6. Decorative details
```

Do not give every element the same visual weight.

------------------------------------------------------------------------

# 19. Responsive Design

Do not simply shrink the desktop layout.

Use the grid appropriately.

### Desktop

``` text
12 columns
```

### Tablet

``` text
8 columns
```

### Mobile

``` text
4 columns
```

### Mobile rules

-   Preserve hierarchy.
-   Stack major components when necessary.
-   Maintain the border language.
-   Maintain controlled corner radii.
-   Reduce typography proportionally.
-   Preserve card relationships.
-   Avoid turning every element into a giant full-width card.
-   Preserve visual rhythm.

The mobile version should feel like the same product, not a completely
different design.

------------------------------------------------------------------------

# 20. Motion System

Animation should support interaction, not become the design.

### Default timing

``` text
150–250ms
ease-out
```

### Allowed

-   Arrow movement
-   `2–4px` card translation
-   Subtle image scale (`1.02–1.04`)
-   Border emphasis
-   Small decorative rotation

### Avoid

-   Scroll hijacking
-   Excessive parallax
-   Bouncing UI
-   Constant floating elements
-   Excessive blur transitions
-   Infinite decorative animations
-   Long cinematic transitions for basic UI interactions

The interface should still look good without animation.

------------------------------------------------------------------------

# 21. Component Architecture

Create reusable components instead of designing one-off elements.

Recommended structure:

``` text
/components
    /layout
        PageFrame
        Section
        Grid
        SplitLayout

    /navigation
        Navbar
        NavPill

    /cards
        BaseCard
        StatCard
        FeatureCard
        ImageCard
        ProfileCard
        QuoteCard
        ActionCard

    /buttons
        PrimaryButton
        SecondaryButton
        IconButton

    /typography
        Display
        Heading
        Body
        Eyebrow
        Metadata

    /decorative
        AccentStar
        AccentDiamond
        Arrow
        Divider
```

### Component rule

> **Never create a one-off visual component when an existing component
> can be composed to achieve the same result.**

New components should only be introduced when an existing component
cannot reasonably express the required pattern.

------------------------------------------------------------------------

# 22. Design Tokens

Keep the visual system centralized.

Example:

``` css
:root {
  --color-ink: #0A0A0A;
  --color-white: #FFFFFF;
  --color-paper: #F4F0E7;
  --color-cream: #EAE4D5;
  --color-yellow: #FFF49A;
  --color-orange: #FF5A1F;
  --color-grey: #E7E7E5;
  --color-mid-grey: #6F6F6A;

  --border-thin: 1px;
  --border-standard: 1.5px;
  --border-strong: 2px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-card: 18px;
  --radius-lg: 24px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 64px;
  --space-11: 80px;
  --space-12: 96px;
  --space-13: 128px;
}
```

Use these tokens throughout the application.

Do not scatter hard-coded visual values across components.

------------------------------------------------------------------------

# 23. Content vs. Style

The content layer and visual layer must remain conceptually separate.

Content may change:

-   Headings
-   Paragraphs
-   Statistics
-   Images
-   User profiles
-   Products
-   Features
-   Calls to action

The visual system must remain stable:

-   Typography
-   Grid
-   Borders
-   Radius
-   Spacing
-   Button geometry
-   Card grammar
-   Color palette
-   Decorative vocabulary
-   Composition principles

This separation is essential.

------------------------------------------------------------------------

# 24. Page Creation Process

Before implementing a new page:

### Step 1: Identify the dominant content

Determine:

-   Main message
-   Primary action
-   Primary visual
-   Secondary information

### Step 2: Determine grid structure

Choose the appropriate:

-   Column spans
-   Major containers
-   Supporting cards
-   Image placements

### Step 3: Establish hierarchy

Decide:

-   Display heading
-   Supporting copy
-   CTA
-   Metadata
-   Supporting information

### Step 4: Compose

Build the page using existing components.

### Step 5: Add accents

Only after the layout works, introduce:

-   Orange accents
-   Yellow highlights
-   Decorative symbols
-   Small geometric interruptions

### Step 6: Responsive pass

Adapt the composition for:

-   Desktop
-   Tablet
-   Mobile

### Step 7: Visual QA

Verify the page against the system below.

------------------------------------------------------------------------

# 25. Visual Quality Gate

Before considering a page complete, verify:

-   [ ] Is the appropriate column grid being used?
-   [ ] Are column spans varied intentionally?
-   [ ] Are borders consistently black?
-   [ ] Are unnecessary shadows removed?
-   [ ] Are unnecessary gradients removed?
-   [ ] Are colors limited to the defined palette?
-   [ ] Are cards visually related?
-   [ ] Is there excessive symmetry?
-   [ ] Are components using the radius system?
-   [ ] Is spacing following the defined scale?
-   [ ] Does typography have clear hierarchy?
-   [ ] Are decorative elements intentional?
-   [ ] Does the page feel like part of the same product?
-   [ ] Does it avoid generic AI/SaaS aesthetics?
-   [ ] Does the layout work without decorative elements?
-   [ ] Does the composition feel intentionally art-directed?
-   [ ] Are existing components being reused instead of duplicated?

### The most important QA question

> **If all decorative elements were removed, would the underlying layout
> still look designed?**

If the answer is no, fix the composition before adding more decoration.

------------------------------------------------------------------------

# 26. AI Design Instructions

When an AI coding/design agent is asked to create or modify UI:

1.  Read this design system before implementing UI.
2.  Reuse existing design tokens.
3.  Reuse existing components.
4.  Preserve the grid system.
5.  Preserve border and radius language.
6.  Preserve typography hierarchy.
7.  Do not invent new colors.
8.  Do not introduce generic SaaS patterns.
9.  Do not add decoration merely to fill empty space.
10. Do not redesign unrelated components while implementing a feature.
11. Do not create one-off visual styles unless absolutely necessary.
12. Maintain visual consistency across all routes.
13. Prefer composition and spacing over decorative effects.
14. Treat the reference design as a visual grammar, not a page template.

------------------------------------------------------------------------

# 27. Anti-AI Design Rules

The interface must actively avoid looking AI-generated.

### Do not

-   Center everything
-   Make every card identical
-   Use giant gradients
-   Use excessive rounded corners
-   Add random floating shapes
-   Use purple/blue gradient backgrounds
-   Add meaningless 3D objects
-   Fill whitespace with decoration
-   Use generic dashboard layouts
-   Overuse glass effects
-   Make every section symmetrical
-   Use excessive animation
-   Create visual noise

### Instead

-   Use deliberate asymmetry
-   Use shared borders
-   Use modular compositions
-   Use controlled spacing
-   Use strong typography
-   Use a restrained palette
-   Use small accents
-   Use meaningful information density
-   Use varied column spans
-   Let whitespace exist intentionally
-   Make every visual element serve a purpose

------------------------------------------------------------------------

# 28. Golden Rules

These rules have the highest priority.

### Rule 1

**Consistency beats novelty.**

### Rule 2

**Composition beats decoration.**

### Rule 3

**Typography beats oversized illustrations.**

### Rule 4

**Borders create structure.**

### Rule 5

**Color is an accent, not a personality substitute.**

### Rule 6

**Asymmetry should be deliberate, never chaotic.**

### Rule 7

**Cards are building blocks, not the entire design.**

### Rule 8

**Reuse components before creating new ones.**

### Rule 9

**The grid determines composition.**

### Rule 10

**Every page should look like it belongs to the same product.**

------------------------------------------------------------------------

# 29. Final Design Principle

The goal is not to recreate the reference image.

The goal is to make it possible to create **an entirely different
product that feels like it was designed by the same design team**.

The system should remain recognizable through:

-   Geometry
-   Typography
-   Borders
-   Spacing
-   Grid
-   Card relationships
-   Color restraint
-   Asymmetry
-   Information density
-   Button geometry
-   Decorative vocabulary

**Content changes.\
Products change.\
Pages change.\
The visual language stays.**
