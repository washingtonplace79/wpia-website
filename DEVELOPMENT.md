# Development Guide

For developers working on the site code. For day-to-day site operations (publishing content, managing board members, deploying), see `OPERATIONS.md`.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [First-time setup](#2-first-time-setup)
3. [Running the dev server](#3-running-the-dev-server)
4. [Project structure](#4-project-structure)
5. [Editing content locally](#5-editing-content-locally)
6. [Working with content collections](#6-working-with-content-collections)
7. [Adding pages and components](#7-adding-pages-and-components)
8. [Building and previewing the production site](#8-building-and-previewing-the-production-site)
9. [Testing the CMS locally](#9-testing-the-cms-locally)
10. [Editor and tooling setup](#10-editor-and-tooling-setup)
11. [Debugging](#11-debugging)
12. [Common issues](#12-common-issues)

---

## 1. Prerequisites

- **Node.js 22.x (current LTS)** — install from [nodejs.org](https://nodejs.org) or via a version manager (nvm, fnm, volta). The repo has a `.nvmrc` pinned to `22`; `nvm use` picks it up. This matches the Netlify build (`NODE_VERSION` in `netlify.toml`).
- **Git** — install from [git-scm.com](https://git-scm.com).
- **A code editor** — VS Code is recommended (see Section 10).

Check versions:

```bash
node --version   # should print v22.x.x
npm --version
git --version
```

---

## 2. First-time setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/YOUR-ORG/wpia-website.git
cd wpia-website
npm install
```

`npm install` will create `node_modules/` and `package-lock.json`. The first install takes 30–60 seconds.

---

## 3. Running the dev server

```bash
npm run dev
```

This starts Astro's dev server on **http://localhost:4321/**. It supports:

- **Hot module reload** — saving any `.astro`, `.css`, or content file refreshes the browser instantly.
- **Schema validation** — content files are validated against `src/content/config.ts` on every change. Errors appear in the terminal and as a browser overlay.
- **TypeScript checking** — type errors in `.astro` frontmatter or component scripts surface in the terminal.

To stop the server: press `Ctrl+C` in the terminal.

### Other npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server (port 4321) |
| `npm run build` | Build the production site to `dist/` |
| `npm run preview` | Serve the built `dist/` folder for local production testing |

---

## 4. Project structure

```
website-2604/
├── astro.config.mjs        # Astro config (site URL lives here)
├── netlify.toml            # Netlify build config
├── package.json
├── tsconfig.json
├── public/                 # Static assets served as-is
│   ├── admin/              # Decap CMS dashboard (loaded at /admin/)
│   │   ├── index.html
│   │   └── config.yml      # CMS field definitions
│   └── uploads/            # PDFs and images uploaded via the CMS land here
├── src/
│   ├── components/         # Reusable .astro components
│   ├── content/            # All editable content lives here
│   │   ├── config.ts       # Zod schemas for each collection
│   │   ├── news/           # *.md files (frontmatter + body)
│   │   ├── events/         # *.md files (frontmatter + body)
│   │   ├── documents/      # *.yml files (data only)
│   │   └── board/          # *.yml files (data only)
│   ├── layouts/            # BaseLayout.astro (shared HTML shell)
│   ├── pages/              # File-based routing
│   │   ├── index.astro             # /
│   │   ├── news/index.astro        # /news/
│   │   ├── news/[...slug].astro    # /news/:slug/
│   │   ├── events/index.astro      # /events/
│   │   ├── events/[...slug].astro  # /events/:slug/ (featured only)
│   │   ├── documents/index.astro   # /documents/
│   │   └── contact/index.astro     # /contact/
│   └── styles/global.css   # CSS variables, base typography
└── dist/                   # Build output (git-ignored)
```

### What goes where

- **Static assets** (logos, favicons) → `public/`
- **Code** (components, layouts, pages, styles) → `src/`
- **Content edited via CMS** → `src/content/<collection>/`
- **CMS configuration** → `public/admin/config.yml`
- **Schema validation rules** → `src/content/config.ts`

---

## 5. Editing content locally

You don't need the CMS to edit content during development — just edit the markdown or YAML files directly. Save the file and the dev server will reflect the change immediately.

### Add a news post

Create `src/content/news/your-slug.md`:

```markdown
---
title: "Your post title"
date: 2026-04-30
author: "Board of Directors"
tag: Community
excerpt: "One- or two-sentence summary shown on listing pages."
---

The body of the post in Markdown. Headings, lists, **bold**, *italic*, and [links](https://example.com) all work.
```

### Add an event

Create `src/content/events/2026-MM-DD-your-slug.md`:

```markdown
---
title: "Event name"
date: 2026-06-15
startTime: "9:00 AM"
endTime: "12:00 PM"
location: "Where it happens"
type: Volunteer
featured: false
---

Optional event description.
```

Set `featured: true` to generate a detail page at `/events/your-slug/` with hero image and gallery support.

### Add a document or board member

These are YAML files (no body). Create `src/content/documents/something.yml`:

```yaml
name: Document display name
category: Governance
date: Apr 2026
file: /uploads/something.pdf
size: 156 KB
```

---

## 6. Working with content collections

Schemas are defined in `src/content/config.ts` using Zod. If you add a field to a collection, you must:

1. Update the Zod schema in `src/content/config.ts`.
2. Update the corresponding collection in `public/admin/config.yml` (so the CMS exposes it).
3. Update any pages or components that use the new field.
4. Update existing content files to include the new field if it's required (or mark it `.optional()` in Zod).

### Field type → Zod mapping

| Content field | Zod type |
|---|---|
| Required string | `z.string()` |
| Optional string | `z.string().optional()` |
| Date | `z.date()` (frontmatter must be `YYYY-MM-DD`) |
| Boolean | `z.boolean().optional().default(false)` |
| One of a fixed set | `z.enum(['A', 'B', 'C'])` |
| List of strings | `z.array(z.string()).optional()` |

### Reading content in pages

```astro
---
import { getCollection } from 'astro:content';

const allNews = await getCollection('news');
const sorted = allNews.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
```

For dynamic routes, use `getStaticPaths()`:

```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('news');
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
---
```

> **Note:** In Astro 5 use `entry.id`, not `entry.slug` (which was removed). `entry.id` is the filename without extension.

---

## 7. Adding pages and components

### New page

Create a file under `src/pages/`. The path becomes the URL.

- `src/pages/about.astro` → `/about/`
- `src/pages/blog/[slug].astro` → `/blog/:slug/`

Every page should wrap its content in `<BaseLayout>`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="About | WPIA">
  <h2>About</h2>
  <p>...</p>
</BaseLayout>
```

### New component

Create a file under `src/components/`. Use TypeScript-typed props:

```astro
---
interface Props {
  title: string;
  count?: number;
}

const { title, count = 0 } = Astro.props;
---

<div class="my-component">
  <h3>{title}</h3>
  <p>{count} items</p>
</div>

<style>
.my-component {
  /* Styles are scoped to this component automatically */
}
</style>
```

### Adding a link to the nav

Edit `src/components/Nav.astro` and add an entry to the `links` array.

---

## 8. Building and previewing the production site

To build a production version locally:

```bash
npm run build
```

This generates `dist/` with the fully rendered HTML, CSS, and assets. Build errors (missing fields, broken links, type errors) show up here that may not appear during dev.

To serve the built site locally for testing:

```bash
npm run preview
```

Then open the URL it prints (usually http://localhost:4321/).

> **Always run `npm run build` before pushing significant changes.** The production build is stricter than dev and catches issues like Zod validation failures and broken `getStaticPaths`.

---

## 9. Testing the CMS locally

The Decap CMS dashboard at `/admin/` requires Netlify Identity, which only works on the deployed site. To test the CMS locally, use Decap's **local backend** mode:

1. In a separate terminal, run:
   ```bash
   npx decap-server
   ```
   (Press `y` to install if prompted.) This starts a local proxy on port 8081.

2. Edit `public/admin/config.yml` and add at the top:
   ```yaml
   local_backend: true
   ```

3. Start the dev server: `npm run dev`.

4. Visit http://localhost:4321/admin/. The CMS will read and write directly to your local content files. Changes appear in `src/content/` and you can commit them with Git.

> **Remove `local_backend: true` before pushing to production.** Or guard it — the line is only active when accessed from `localhost`, but it's cleaner to leave it out.

---

## 10. Editor and tooling setup

### VS Code (recommended)

Install these extensions:

- **Astro** (`astro-build.astro-vscode`) — syntax highlighting, type checking, IntelliSense for `.astro` files.
- **YAML** (`redhat.vscode-yaml`) — for editing `config.yml` and content YAML files.
- **Markdown All in One** (`yzhang.markdown-all-in-one`) — for editing news and event bodies.

### TypeScript

Astro projects are TypeScript by default. Type errors in component scripts will show in the editor and during build. Pages and components don't require explicit type annotations beyond `interface Props`.

### No linter or formatter is configured

This project intentionally has no Prettier or ESLint config, to keep the dependency footprint small. If you want them, add them to `devDependencies` and configure as you prefer.

---

## 11. Debugging

### Browser dev tools

For client-side issues (the document filter script, the events date-rollover scripts on `/` and `/events/`, form submission), open the browser console (F12) and check for errors.

### Astro errors

Astro shows two kinds of errors:

- **Build/render errors** — printed in the terminal where `npm run dev` is running, and as a full-page overlay in the browser.
- **Schema (Zod) errors** — printed in the terminal when a content file's frontmatter doesn't match the schema. The error names the file and the offending field.

### Content collection errors

Most content errors are validation failures. Common ones:

- **"Required" but missing** — the schema marks a field required but the content file doesn't have it.
- **"Expected date, received string"** — date frontmatter must be `YYYY-MM-DD` without quotes (e.g. `date: 2026-04-19`, not `date: "April 19, 2026"`).
- **"Invalid enum value"** — typo in a tag/category/type. Check `src/content/config.ts` for allowed values.

### Inspecting a specific entry

In any `.astro` page, you can dump an entry to the console (server-side, not browser):

```astro
---
const allEvents = await getCollection('events');
console.log(allEvents[0]); // prints to the terminal running `npm run dev`
---
```

### Force a clean rebuild

If hot reload starts behaving strangely:

```bash
rm -rf .astro dist node_modules/.vite
npm run dev
```

---

## 12. Common issues

### "Cannot find module 'astro:content'" or red squiggles in your editor

Astro generates type definitions on first run. Run `npm run dev` once to populate `.astro/`. After that, restart the editor's TypeScript server (in VS Code: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server").

### Port 4321 is already in use

Another dev server is already running. Either stop it, or run on a different port:

```bash
npm run dev -- --port 4322
```

### Build succeeds locally but fails on Netlify

- Make sure `package-lock.json` is committed.
- Check the Node version: Netlify uses what's set in `netlify.toml` (`NODE_VERSION = "22"`, mirrored in `.nvmrc`). Bump both together when moving Node versions.
- Some packages behave differently on Linux (Netlify's build env) vs macOS/Windows. Errors in the Netlify deploy log will name the file.

### An event in the past still shows under "Upcoming"

Expected, and self-correcting. The site is statically built, so the
server-side upcoming/past split in `src/pages/events/index.astro` and the
homepage preview is frozen at the last deploy's date. Small inline scripts on
both pages re-evaluate each event's `data-date` against the visitor's real
date and move/hide stragglers in the browser — **these scripts are
load-bearing; don't remove them as "unused JS."** A fresh deploy also clears
the staleness server-side. Comparison is UTC, to match the build-time filter.

### CMS preview shows fields differently than the schema expects

The CMS config (`public/admin/config.yml`) and Astro schema (`src/content/config.ts`) are independent — keeping them in sync is your job. If you add a field to one, add it to the other.

### Image upload from the CMS doesn't appear on the site

Decap CMS commits the image to `public/uploads/` in the repo. After committing, Netlify rebuilds the site. The image won't appear locally until you `git pull` from the branch the CMS committed to.

---

*Have a question this doc doesn't answer? Open an issue or contact the project maintainer.*
