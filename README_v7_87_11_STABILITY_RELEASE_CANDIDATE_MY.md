# YE KUN Official Website — v7.87.11 STABILITY RELEASE CANDIDATE

**Date:** 2026-11-12 (JST)  
**Education brand:** STUDYING WITH YE KUN  
**Source:** Direct continuation of the delivered **v7.87.10 cumulative ZIP** (includes v7.87.5–v7.87.10).  
**Current production baseline:** GitHub main v7.87.4 (last checked); the cumulative updates are **not yet deployed**.  
**Release gate:** **CANDIDATE / NOT PRODUCTION-CERTIFIED** until the complete-repository build, authenticated flows and migrations pass in Netlify Deploy Preview.

## Boss ကြီးအတွက် အနှစ်ချုပ်

- **Grammar 509/509 / 例文 1,018:** ဖိုင်အရေအတွက်၊ 3-language fields၊ 例文 Grammar အနီမျဉ်းနဲ့ Browser UI ကို စစ်ပြီးပါပြီ။ ဒါပေမဲ့ Japanese native expert တစ်ယောက်က 509 ခုလုံးရဲ့ Meaning ကို လူကိုယ်တိုင် စစ်ပြီးကြောင်း အာမမခံနိုင်ပါ။
- **Exam 12 မျိုး:** Original exam page structure, original scoring limits, timer table and Student/Member/Admin route isolation ကို လုံခြုံစွာ ထိန်းထားပါတယ်။
- **Free Attempt Crash Fix (P0):** Netlify log မှာ `WaddlerQueryError.cause` ထဲမှာရှိတဲ့ PostgreSQL `23505 / exam_one_free_attempt_per_user_type` error ကြောင့် HTTP 500 ဖြစ်တာ တွေ့ခဲ့ပါတယ်။ ဒီ Version မှာ `_shared/exam-autosave.mts` ရဲ့ error classifier ကိုသာ ပြင်ထားပြီး nested database error ကို ဖမ်းနိုင်အောင် လုပ်ထားပါတယ်။ တစ်မျိုးကို free 1 ကြိမ် စည်းကမ်းကို မဖျက်ပါဘူး။ အခြား duplicate error တွေကို payment_required လို့ မှားမသတ်မှတ်ပါ။
- **Admin CRM / YKCR / Payment:** ယခင် v7.87.7–v7.87.8 Marketing/CRM ကို ဆက်ထိန်းထားပါတယ်။ CRM မှာ Admin-only API၊ Student ကနေ CRM မဝင်နိုင်မှုနဲ့ Admin UI 390/1280px ကို Mock/Browser Test ပြန်စစ်ထားပါတယ်။
- **Mobile & PWA:** Grammar JSON ကို Level တစ်ခုချင်းစီ (N5…N1) လိုအပ်မှ Load; Furigana ON/OFF, Bookmark, Red Underline; Mobile 390px/1280px Browser Fixture PASS။ Service Worker က Page HTML၊ Login၊ API နဲ့ Private Response ကို cache မလုပ်တဲ့ စည်းကမ်း ဆက်ထိန်းထားပါတယ်။

## What changed in v7.87.11 (compared with v7.87.10)

1. `netlify/functions/_shared/exam-autosave.mts`: Narrowly correct nested Postgres error classification, including wrapped free-attempt unique violation and missing-checkpoint-table errors. All other scoring/timer functions match the GitHub v7.87.4 original (verified fingerprint).
2. `tests/v78711-stability.mjs`: Wrapped-error regression tests + 12 score/timer rule preservation + grammar/CRM asset contracts.
3. `tests/v78711-release.mjs`: Static `dist/` route-isolation and release-check matrix (13 exam routes, Student/Admin separation, grammar 509, no published backend source).
4. `package.json` and existing version-guard/source test compatibility: bumped to `7.87.11`; cumulative build/test pipeline preserved.
5. This QA report and a structured audit manifest.

## QA completed locally

| Check | Result | Scope |
|---|---|---|
| ZIP CRC, previous cumulative file preservation | PASS | Local patch archive |
| JavaScript / Node / TS syntax | PASS | Included code |
| Grammar N5=35 N4=75 N3=135 N2=137 N1=127 | PASS | Schema/counts; not native language proofreading |
| 1,018 Grammar highlights in original examples | PASS | Text structural check |
| Chromium phone 390px and desktop 1280px | PASS | Grammar fixture / Admin fixture (not whole live site) |
| Free attempt duplicate error classification | PASS | Nested Waddler/Neon mock; no DB mutation |
| Original exam timer and score rules match baseline | PASS | Source fingerprint comparison |
| Admin-only CRM / UTM / finance validation | PASS | Existing isolated test mocks |
| Previous v7.87.5–v7.87.10 release checks | PASS where assets available | Synthetic fixture, NOT full production build |
| Full `npm test`, `npm run build` on complete repo | **NOT RUN** | Full GitHub checkout unavailable in this archive |
| Netlify Deploy Preview login, exam, paid access, YKCR, migrations | **NOT RUN** | Live credentials and deploy required |
| Grammar 509 human pedagogy and translation review | **NOT CERTIFIED** | Requires teacher/editor review |
| Real-user mobile Core Web Vitals LCP/INP/CLS | **NOT MEASURED** | Need production or Preview performance monitoring |

## Weekly GitHub upload: IMPORTANT

**This ZIP is a CUMULATIVE SOURCE PATCH, not a full repository.** Never replace the entire GitHub repository with it.

1. Existing `koyekmw2019-web/MY-OFFICAL-WEB` repository must be on the expected `v7.87.4` base. If changes have been made since, review conflicts rather than overwriting them blindly.
2. Create a **test branch** in GitHub Desktop. Extract this ZIP and copy the files into the existing repository root. Do not replace `.git/` or remove unaffected source files. All v7.87.5–v7.87.11 patches are included; uploading previous ZIPs separately is unnecessary.
3. On a machine with the complete repo, run: `npm ci` (or `npm install` if no lock file), `npm test`, `npm run build`. Fix every failure before deploying. Tests should not generate unreconciled modifications unexpectedly; review Git changes before commit.
4. Use **Netlify Deploy Preview**, not Production first. Confirm two previously introduced migrations:
   - `20261112090000_yk_growth_analytics.sql`
   - `20261112140000_yk_enrollment_crm.sql`
5. Manually test: N5/N4/N3/N2/N1 Grammar; Original 30 legacy lessons and bookmarks; 12 exam start/resume/result flows; **free attempt first allowed vs repeated payment_required**; Student vs Member vs Admin; YKCR sync; paid access and receipts; Messenger links; mobile PWA update; error/slow-network recovery. Verify no passwords or access tokens shown to guest.
6. Check Netlify Function logs: the previous `exam-access` HTTP 500 (wrapped duplicate free attempt) must no longer occur. Only after all checks pass, merge/push at the **once-per-week upload time**.

## Stable release decision

**v7.87.11 is a tested RELEASE CANDIDATE, not a guaranteed Production Stable release.** The known wrapped-database-error bug has a specific code fix and local regression coverage. Final release approval must wait for a complete build and authenticated Netlify Preview smoke checks. Do not promise zero loading problems or an exact speed gain without mobile measurements.
