# CLAUDE.md

Guidance for Claude / agents working in this repo. For human dev setup see
`DEVELOPMENT.md`; for board-member operations see `OPERATIONS.md`.

## Branch & release workflow

- **`staging`** — the integration branch for *all* work (code changes and CMS
  edits). Pushing here triggers a **free** Netlify branch preview at
  `https://staging--wpia.netlify.app/`.
- **`main`** — the live public site. Every production deploy costs **15 Netlify
  credits** (free tier = 300/month).
- **How work enters `staging` is complexity-gated:**
  - *Small / low-risk* (copy, config bump, isolated fix) — **commit directly
    to `staging`**. This lighter path is intentional; don't force PR ceremony
    on trivial changes.
  - *Non-trivial / risky* (logic, new pages, refactors) — short-lived feature
    branch **off `staging`** → PR → merge back to `staging`. PRs get a **free
    Netlify Deploy Preview** (no production credits), keeping WIP off the
    content-bearing `staging` branch until it's reviewed.
- **Branch off `staging`, never `main`** — `staging` carries unreleased
  content/code; branching off `main` would miss it.
- **Never commit or push `main` directly.** The only promotion path is the
  manual **"Release staging to main"** GitHub Action
  (`.github/workflows/release.yml`, `workflow_dispatch`). Releasing is a
  deliberate human decision — surface it to the user, don't trigger it.
- **Never hand-merge `main` → `staging`.** `sync-staging.yml` does that
  automatically after a release or an `/admin-publish/` CMS write.

## Static-build date gotcha (load-bearing scripts)

The site is statically generated, so any build-time `new Date()` is frozen at
the last deploy. The upcoming/past split in `src/pages/events/index.astro` and
the homepage events preview in `src/pages/index.astro` is corrected in the
browser by **small inline `<script>` blocks** that re-evaluate each event's
`data-date` against the visitor's real (UTC) date. **These scripts are
load-bearing — do not remove them as "unused/dead JS."** See `DEVELOPMENT.md`
§12 for the full explanation.

## Toolchain

- **Node 22 (current LTS).** Pinned in both `netlify.toml` (`NODE_VERSION`) and
  `.nvmrc` — keep the two in sync when bumping.
- Run `npm run build` before pushing significant changes; the production build
  is stricter than `npm run dev`.
- The user runs `npm run dev` themselves in their own terminal — don't start a
  duplicate dev server.

## Committing (Windows / PowerShell)

Multi-line commit messages passed via a PowerShell here-string (`@'...'@`) get
their subject line corrupted (a stray `@ ` prefix). For multi-line messages,
write the message to a temp file and `git commit -F <file>`, or use the Bash
tool with a normal double-quoted `-m "..."`. Single-line `-m "..."` is safe
either way.
