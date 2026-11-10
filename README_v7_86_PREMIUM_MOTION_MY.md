# YE KUN Official Website — v7.86.0
## Premium Animation & Character Experience

**Education brand:** STUDYING WITH YE KUN
**Base:** `YEKUN_v7.85_Video_Course_Learning_Center_Update.zip` (approved source)
**Scope:** animation layer only. No new images, database changes, payment rules, or API calls.

### ဘာအသစ်ထည့်ထားသလဲ

- **Homepage** — Hero စာသားများ တစ်ကြိမ်သာ အသာလေးပေါ်လာသော Entrance Animation။ Google Homepage Title မပြောင်းပါ။
- **STUDY HUB** — Cards Scroll Reveal၊ Hover Lift၊ Original Anime Student/Teacher ရဲ့ လေးလံမှုနည်းသော Entrance Motion။ ရှိပြီးသား Character ပုံစံ မပြောင်းပါ။
- **Hamburger Menu** — Menu ထွက်လာသောအခါ Menu Links တစ်ခုချင်း Slide-in။ မူလ Navigation၊ Login/Logout Logic မပြောင်းပါ။
- **Video Course** — TRUCK/TAXI/BUS Card Reveal, Filter Transition, Play Button Soft Glow, Textbook/Contact Hover။ YouTube Embed ကို လက်ရှိအတိုင်း **Play နှိပ်မှသာ Load**။
- **JLPT Learning Center** — လက်ရှိ Teacher Tip, Correct/Wrong/Completed Reaction Panel ကို Motion ပိုပေးထားပါတယ်။ မူလ Student/Teacher WebP နှစ်ခုကိုသာ သုံးပါတယ်။
- **Exam Result** — Result Score Ring ကို Result Screen ရောက်မှ Soft Entrance Motion။ Exam Timer, Server-side Grade/Attempts မပြောင်းပါ။
- **Accessibility** — `prefers-reduced-motion: reduce` ဖြင့် Animation ပိတ်ပေးထားပြီး Content ကို Hide မလုပ်ပါ။ Mobile အတွက် Infinite/Heavy Particle Animations မပါ။

### Modified / Added

**Added:**
- `assets/yk-premium-motion-v786.css`
- `assets/yk-premium-motion-v786.js`
- `tests/v786-premium-motion.mjs`
- `README_v7_86_PREMIUM_MOTION_MY.md`, `QA_v7_86_RELEASE.json`

**Modified:**
- `index.html`, `video-class.html`, `study/jlpt-learning.html` (new stylesheet+script links only)
- `package.json` (version + test)
- `service-worker.js` (cache namespace updated)
- `scripts/build-public-v7841.mjs` (report version)
- Six legacy tests (allowed version values only)

**Unchanged:** original anime character image bytes, original v7.82 character reaction logic, all Netlify Functions/DB migrations, YKCR Sync, authentication, payment, exams, full dictionary data, YouTube links, Facebook links, original book cover images, SEO title.

### Deployment (Important)

1. ZIP ကို Extract လုပ်ပြီး GitHub Desktop ရဲ့ **လက်ရှိ Repository Root Folder** ထဲ Source Files အားလုံး Copy/Replace လုပ်ပါ။ `.git` Folder ကို မဖျက်ပါနဲ့။ v7.85 ကို မတင်ရသေးလည်း v7.86 က ၎င်းရဲ့ Feature တွေ ပါဝင်ပြီးသားမို့ ဒီ Source ကို သုံးနိုင်ပါတယ်။
2. Production Main ကို တန်း Push မလုပ်ဘဲ Staging/Preview Branch မှာ **`npm run build`** အောင်မြင်တာ အရင်စစ်ပါ။ Netlify `netlify.toml` က Build=`npm run build`, Publish=`dist`, Functions=`netlify/functions` အဖြစ် သတ်မှတ်ထားပါတယ်။
3. Staging မှာ Homepage Menu, Study Hub, Video Course YouTube embed, JLPT Learning, Login, Dashboard, Payments, YKCR, Admin, Exams စတာတွေကို တကယ်စစ်ပါ။
4. အားလုံး အောင်မြင်မှ Production Main မှာ Publish လုပ်ပါ။ Production Deploy မစစ်ဘဲ Stable လို့ မသတ်မှတ်ပါနဲ့။

### QA — 2026-11-10

- ZIP source audit: v7.85 ရဲ့ 351 files အားလုံး ဆက်ရှိ; 339 files မပြောင်း; 12 files ကို update; 3 new implementation/test files + 2 QA/README အသစ်။ Netlify protected backend & original character WebP bytes **unchanged**။
- `npm test`: **211 PASS, 0 FAIL** (v7.86 motion tests 8 PASS)။
- Offline Chromium Document Injection (1280px/390px): Homepage Hamburger Menu & Study Hub Reveal, Video Filter/Modal Close (iframe removal), JLPT Teacher Tip & Reaction, two original characters display, no horizontal overflow, reduced-motion disables animation: **PASS**။
- Public Build Preview: 25 HTML pages; 90 asset files incl newly added animation assets, 8,542 words losslessly packed. 483 local HTML links inspected: only 8 refs to the same `assets/identity.bundle.js`, which **must be created by esbuild** in the full Netlify build. Other Missing refs: 0.
- `npm run build` **NOT VERIFIED/FAILED LOCALLY**: `esbuild` executable missing in this environment. Full Netlify Build, live YouTube playback, authenticated database interactions, and real production speed have **not been verified**. Build artifacts `dist/` are intentionally excluded from ZIP as Netlify must generate them itself.
- Offline injected Chromium Homepage raised `localStorage` SecurityError because `about:blank` is an opaque origin. That limitation is test-environment-specific, not a live-hosted diagnosis.
- No extra PDF or video binary included in source ZIP.

**RELEASE TYPE:** Source candidate, needs staging/full build verification before production.
