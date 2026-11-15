# STUDYING WITH YE KUN v7.87.6 — Mobile JLPT Repair 03

## Goal
Fix two user-reported bugs after the v7.87.6 auto-build update:
1. Explore Lessons jumps to a horizontally shifted learning page. Tabs / lesson cards / bottom nav appear clipped.
2. Opening a Grammar Card may not show the newly provided Grammar Pattern detail page.

## Current source basis
- GitHub repo: `koyekmw2019-web/MY-OFFICAL-WEB`
- Reviewed main baseline: `f997fdc44eba10b6df5e7162c691b72391571bc4`
- Reviewed `scripts/build-page-transitions-v7875.mjs` Git blob SHA: `a0d973b4135f955d173eee3c26db1ea76fdf670a`
- Reviewed existing `scripts/build-v7876-jlpt-deploy.mjs` Git blob SHA: `32ba4eb64eca7e520c3c3d5c22e4d9f5e56c9ca7`
- New ZIP is incremental and must be applied only to a QA branch based on that commit or a reconciled later revision.

## Changes in this patch
- Original v7.87.5 build entrypoint remains intact, with one appended import to a new **dist-only** repair builder.
- New stylesheet stops document-wide horizontal overflow on mobile via grid min-width fixes and a truly separately scrollable category tabstrip.
- New page script replaces the default `#yk82Title` anchor jump with a header-offset-aware vertical-only scroll. This preserves all existing category tab and lesson logic.
- Fallback click navigation handles grammar cards if a stale renderer from older cached JS is displayed, without intercepting Bookmark or Mark Learned buttons.
- Cache-bust the generated lesson JavaScript, grammar card detail URL and dedicated grammar detail JS (`?v=7876fix03`).
- Other pages, database, payments, exams and YKCR source files unchanged.

## Tested locally
- PASS — 4 JS files (builder, new builder, new page script, test) syntax checks with Node v22.
- PASS — Git base byte-for-byte SHA comparisons for both existing build scripts.
- PASS — v7.87.6 simulated `dist` build repair: style/script injection and grammar detail URL cache-bust.
- PASS — existing v7.87.6 deployed-output regression on simulated 15-page dist: home CTA, exams, JLPT hero, grammar detail markers.
- PASS — browser isolated DOM (not real live site): Chromium at 360px, 390px, 430px, 720px: page scrollWidth equals viewport, `scrollX=0`, title below sticky header, tabs scroll independently and 5 nav items are in viewport.
- NOTE — Playwright navigation to localhost in this environment returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`; live cross-page navigation test cannot be counted PASS. In-memory browser DOM test completed.

## Still required on Netlify Deploy Preview
- Run the site's full `npm test`, `npm run build`, and `node tests/v7876-mobile-repair.mjs --release`.
- Open with phone, tap Study → Open All Lessons → Explore Lessons; ensure no horizontal page movement.
- Tap Grammar → first N5 Grammar Card; verify header brand, pattern, 3 JP/MM/EN examples without MY/EN labels, underline, Bookmark and Mark Learned; verify Back.
- Test other levels N4, N3, N2, N1 and language/theme preference. Make sure Payment/Guest Access and actual exam flows are unaffected.
- Check PWA/service worker/phone cache only on Preview; do not promote without signoff.

**Status: QA Candidate. Not confirmed stable, not deployed or merged by this assistant.**
