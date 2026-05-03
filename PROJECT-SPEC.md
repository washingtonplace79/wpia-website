# Washington Place Improvement Association — Project Spec

## Overview

Build a static website for a small neighborhood association using **Astro + Decap CMS**, deployed on **Netlify (free tier)**. The site must be easy for non-technical board members to update through a web-based CMS dashboard while being fast, accessible, and free to host.

---

## Tech Stack

| Layer         | Choice                  | Why                                                      |
|---------------|-------------------------|----------------------------------------------------------|
| Framework     | Astro (latest)          | Static-first, content-focused, fast, supports MDX        |
| CMS           | Decap CMS (formerly Netlify CMS) | Free, Git-backed, web dashboard for non-technical editors |
| Hosting       | Netlify (free tier)     | Free SSL, custom domain, auto-deploy from GitHub, forms  |
| Styling       | Vanilla CSS (or Astro scoped styles) | No build dependency, simple to maintain          |
| Source control| GitHub                  | Required for Decap CMS Git Gateway integration           |

---

## Site Sections & Content Architecture

### 1. Home Page (`/`)
- Hero banner with welcome message and association name
- 3 quick-link cards: News, Events, Documents
- Preview of the 3 most recent news posts (pulled from the news collection)

### 2. News & Announcements (`/news/`)
- Blog-style listing page, newest first
- Individual post pages at `/news/[slug]/`
- Each post has: title, date, author, tag/category, body content
- Tags: Event, Infrastructure, Governance, Community (color-coded badges)

### 3. Events (`/events/`)
- List view of upcoming events, sorted by date
- Each event has: title, date, start time, end time, location, type/category, description
- Past events should either be hidden or shown in a separate "Past events" section
- Event types: Volunteer, Governance, Social

### 4. Documents (`/documents/`)
- Filterable list of downloadable files (PDFs primarily)
- Each document entry has: name, category, date, file attachment
- Categories: Governance, Minutes, Financial
- Filter pills to narrow by category
- Files are uploaded through Decap CMS and stored in the repo (or Netlify Large Media if needed)

### 5. Contact (`/contact/`)
- Static info: email, mailing address, meeting schedule
- Board members list with: name, role, initials/avatar
- Optional: Netlify Forms-powered contact form

---

## Content Collections (Astro Content Collections)

### `src/content/news/`
```yaml
# Frontmatter schema
title: string (required)
date: date (required)
author: string (required)
tag: enum [Event, Infrastructure, Governance, Community] (required)
excerpt: string (required, ~200 chars for listing pages)
```
Body: Markdown

### `src/content/events/`
```yaml
title: string (required)
date: date (required)
startTime: string (required, e.g. "9:00 AM")
endTime: string (optional)
location: string (required)
type: enum [Volunteer, Governance, Social] (required)
```
Body: Markdown (event description)

### `src/content/documents/`
```yaml
name: string (required)
category: enum [Governance, Minutes, Financial] (required)
date: date (required)
file: string (required, path to uploaded file)
size: string (optional, e.g. "245 KB")
```
No body content.

### `src/content/board/`
```yaml
name: string (required)
role: string (required, e.g. "President")
email: string (optional)
order: number (required, for display sorting)
```

---

## Decap CMS Configuration

Location: `public/admin/index.html` and `public/admin/config.yml`

### Key config points:
- **Backend**: `git-gateway` (uses Netlify Identity for auth)
- **Media folder**: `public/uploads` (for document PDFs, images)
- **Public folder**: `/uploads`
- **Collections**: Match the content collections above
- **Editor preview**: Disabled (keeps things simple for non-technical users)

### CMS collections should include:
1. **News** — fields: title, date, author (default: "Board of Directors"), tag (select widget), excerpt (text widget), body (markdown widget)
2. **Events** — fields: title, date, startTime, endTime, location, type (select widget), body (markdown widget)
3. **Documents** — fields: name, category (select widget), date, file (file widget), size
4. **Board Members** — fields: name, role, email, order (number widget)

### Netlify Identity setup:
- Enable Netlify Identity on the site
- Enable Git Gateway in Netlify settings
- Invite board members via email
- Board members log in at `yoursite.com/admin/` to edit content

---

## Design System

### Brand
- **Primary color**: `#1a4d2e` (deep forest green)
- **Background**: `#FAFAF6` (warm off-white)
- **Card/surface**: `#FFFFFF`
- **Borders**: `#e8e6df`
- **Muted text**: `#888780`
- **Body text**: `#2C2C2A`

### Typography
- **Headings**: Source Serif 4 (Google Fonts), weights 400/500/600
- **Body/UI**: DM Sans (Google Fonts), weights 400/500
- Load via `<link>` in the base layout

### Tag / Badge Colors
| Tag             | Background | Text color |
|-----------------|-----------|------------|
| Event           | #E1F5EE   | #085041    |
| Infrastructure  | #FAEEDA   | #633806    |
| Governance      | #EEEDFE   | #3C3489    |
| Community       | #FAECE7   | #712B13    |
| Volunteer       | #EAF3DE   | #27500A    |
| Social          | #FBEAF0   | #72243E    |
| Financial       | #E6F1FB   | #0C447C    |
| Minutes         | #F1EFE8   | #444441    |

### Layout
- Max content width: 960px, centered
- Card border-radius: 12px
- Badge border-radius: 99px (pill shape)
- Sticky navigation bar below the header
- Mobile responsive (single column on small screens)

---

## Component Inventory

These are the reusable Astro components to build:

1. **`BaseLayout.astro`** — HTML shell, fonts, meta tags, header, nav, footer
2. **`Header.astro`** — Green banner with tree icon, association name, est. date
3. **`Nav.astro`** — Sticky nav with links: Home, News, Events, Documents, Contact
4. **`Badge.astro`** — Color-coded pill badge, accepts `label` prop, uses color map
5. **`NewsCard.astro`** — Used on listing pages: badge, date, title, excerpt
6. **`EventCard.astro`** — Date block on the left, title + time/location on right
7. **`DocumentRow.astro`** — Icon, name, date/size, category badge
8. **`BoardMember.astro`** — Avatar circle (initials), name, role
9. **`QuickLinkCard.astro`** — Icon, label, description; used on home page
10. **`Footer.astro`** — Copyright line

---

## Pages

| Route             | File                          | Description                     |
|-------------------|-------------------------------|---------------------------------|
| `/`               | `src/pages/index.astro`       | Home with hero, quick links, recent news |
| `/news/`          | `src/pages/news/index.astro`  | All news posts, newest first    |
| `/news/[slug]`    | `src/pages/news/[...slug].astro` | Individual news post         |
| `/events/`        | `src/pages/events/index.astro`| Upcoming events list            |
| `/documents/`     | `src/pages/documents/index.astro` | Filterable document list (JS for filtering) |
| `/contact/`       | `src/pages/contact/index.astro`| Contact info + board members   |

---

## Deployment Checklist

1. Create GitHub repo
2. `npm create astro@latest` — initialize project
3. Build out components, pages, and content collections
4. Add Decap CMS admin files (`public/admin/`)
5. Add sample content (at least 3-4 items per collection)
6. Connect repo to Netlify
7. Configure custom domain in Netlify
8. Enable Netlify Identity + Git Gateway
9. Invite board members to Netlify Identity
10. Test CMS login at `/admin/` and verify content editing workflow

---

## Future Considerations (Not in v1)

- **Member login area**: Could add Netlify Identity-gated pages for a private resident directory
- **Event RSVPs**: Could integrate a simple form or third-party tool
- **Email notifications**: Could add a newsletter signup with Buttondown or similar free service
- **Search**: Could add Pagefind (free, static search) if content grows

---

## Sample Content

The prototype (see `neighborhood-site.jsx`) contains sample data for all sections. Use that as the seed content when scaffolding. The association name is **Washington Place Improvement Association** (placeholder — the user can rename).

---

## Reference

A working React prototype of the full design is available as `neighborhood-site.jsx`. It demonstrates the exact layout, color scheme, typography, component structure, and sample data. Match this design as closely as possible in the Astro implementation.
