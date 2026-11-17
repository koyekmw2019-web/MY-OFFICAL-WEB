# v7.88.0 RC1 — Netlify build progress limit failure, local QA

## Grounded failure
Screenshots show a build assertion at `scripts/build-v7880-grammar-rc.mjs:64:2` (`ERR_ASSERTION`, actual false, expected true); Netlify build exits nonzero.

The active GitHub v7.88.0 RC1 commit `410e2befce3318e6417a8df66c56b1074a3bb5cd` contains the prebuild source patch script and invokes `build-v7880-grammar-rc.mjs` at the end of the postbuild chain. However, `package.json` does not invoke the source patch script before `npm run build`, while the browser-side JLPT state and server-side JLPT progress function still cap ID arrays at 500. The assertion expects 2000, so the guard fails.

## Verified local tests in synthetic fixture only
- `node --check` on supplied source patch and safety wrapper: PASS.
- On `qa/v7.88.0-progress-build` fixture, one run edits only the two exact source files: PASS.
- Three client and three server caps upgraded from 500 to 2000: PASS.
- A second application is refused: PASS.
- Script refuses to operate on `main`: PASS.
- ZIP CRC integrity: PASS.

## Not verified / not implied
- Actual complete GitHub repository `npm run build`: NOT RUN.
- Netlify Deploy Preview / production deploy: NOT RUN.
- Student cloud progress and auth regression: NOT RUN.
- Language correctness for 524 grammar cards or 1,572 examples: NOT VERIFIED.
- Stable release status: NO-GO.

This is a **local QA build-blocker repair**, not a stable release, not a server migration, and not authorization to push or merge to main.
