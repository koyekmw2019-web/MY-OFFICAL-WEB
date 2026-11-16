# STUDYING WITH YE KUN — UI Fix05.2 QA Report

**Status:** QA candidate only, NOT deployed. Baseline Fix04 commit `010fe4d6c5f108654c17826551ba648092dca96d`.

## Reported screenshot regression

- View More area has too much vertical spacing before/after it on mobile.
- Arrow-free Burmese CTA still appeared left-weighted after Fix05.1.

## Fix05.2 implementation

- Replaces the direct text node with `<span class="yk88-cta-label">Open All Lessons</span>` in generated public `dist/index.html`; existing i18n map localizes that text to Burmese/Japanese. The link destination is unchanged.
- Center the label using full-width span + flex layout and dedicated scoped rules. An inline critical-style fallback protects from stale/missing CSS request. No extra arrow.
- Shrink four **mobile-only** spacing sources around the Study Hub / JLPT section without hiding View More.
- Retain all Fix05.1 Learning and Grammar Detail changes and state/access boundaries.

## Tests actually performed

- `node --check` on 4 JS/MJS files: PASS.
- Synthetic builder with exact fixtures and fail-closed duplicate / changed anchor guards: PASS.
- Synthetic Chromium: 5 viewport widths × 3 routes, plus 3 languages for Home. Checks text visual center, 3-column detail actions, header removal, no horizontal overflow, and <11px View More-to-panel gap on mobile: PASS.
- The Home test deliberately injects **only the inline fallback CSS**, not the linked stylesheet, demonstrating the fallback does not need a CSS network request.
- ZIP CRC/sha256: validated after package creation.

## Tests not performed

Full repository `npm test`/`npm run build`, real Samsung phone, live Netlify deploy preview, authenticated E2E (Login/Payments/Exams/YKCR/learning-state). Do not label stable or production-ready.

**Release decision: NO-GO; QA only.**
