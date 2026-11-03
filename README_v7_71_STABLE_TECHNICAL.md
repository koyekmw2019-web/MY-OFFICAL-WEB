# YE KUN Official Website v7.71 — Conservative Stable Source

## Release result

This is a **code-stability / regression-checked source ZIP**, based exclusively on the user-supplied v7.70 project. It is **not a live-production certification**. The Netlify deployment, database, Identity, payment bank transfer, receipt access, YKCR live synchronization and real device flows have **not** been checked against production.

### Changes from v7.70

- `package.json` version fixed from `7.69.0` to `7.71.0`.
- `npm test` now includes v7.70 Dictionary Translation QA and the v7.71 release/static checks, alongside existing v7.63+ test suite. It intentionally excludes obsolete historical v7.62 and v7.69 snapshot tests.
- Netlify build has a post-bundle release check, which **fails the build if `assets/identity.bundle.js` is missing**.
- Service-worker release identifier updated to v7.71 (same fetch/activate behavior, no new offline-cache promises).
- Sitemap last-modified date updated for this source release.
- v7.70 Netlify Functions + Database migrations held **byte-identical**, tracked by SHA-256 manifest `QA_v7_71_BACKEND_HASHES.json`.
- Existing exam questions, JLPT data, Dictionary 8,542 records, student verification, payment, dashboard, YKCR sync, Auth sources, SEO, PWA icons and all user UI preserved. No new PDF files added.

### Dictionary disclosure

The 8,542 source entries are all retained. Of these, 1,234 have a Myanmar gloss (some unreviewed/draft), 7,308 do not, and **full independent human translation review has not happened**. Do not say the Dictionary is fully translated or verified. See `README_v7_70_TRANSLATION_QA_MY.md` and `DICTIONARY_v7_70_QA_SUMMARY.json`.

### Verify before deploy

1. Use Node.js >=22. Run `npm install` in a network-enabled trusted build environment. (The attached source does **not** include `node_modules`, `package-lock.json`, or a prebuilt identity bundle.)
2. Run `npm test` for the automated local regression suite.
3. Run `npm run build`. The browser Identity module is **built**, not shipped in the source ZIP; the build verifies it exists. A ZIP drag-and-drop deploy which skips this build will break Login / Account / Dashboard. Deploy from a Git-linked Netlify project using `netlify.toml`, or upload the **built publish folder**, not the source ZIP.
4. On **staging**: check `/.netlify/functions/exam-health` as Admin (200 + `ready: true`), and verify login/logout, Admin/Student/Member dashboards, each free exam type, JLPT 180-point practice grading and autosave/resume, YKCR sync, payment receipt and approval, dictionary search/favorites, Android/iOS PWA and SEO routes. Do not use real account/receipt data in a public staging environment.
5. Only promote to production after the live staging checks pass and a database backup plus prior Netlify deploy ID have been retained. Do not rollback database by dropping tables or reversing migrations.

### Caveats / dependencies

- Dependencies are pinned in `package.json`, but no transitive lockfile is present in upstream source. The build network and npm registry must be available to install modules. Generate/review a lockfile on the trusted build environment before introducing `npm ci`.
- v7.71 source static and mocked tests do **not** prove the payment approval, live database migrations, third-party Identity/Netlify integrations, or translated vocabulary semantics.
- Current effective free trial policy is **one free attempt per exam type** (v7.63 migration), not the old global one-attempt policy described in historical v7.29 notes.

## Result checklist

See `QA_v7_71_RESULTS.json` for test results and the explicit untested areas. No user/student data was migrated or reset by building this ZIP.
