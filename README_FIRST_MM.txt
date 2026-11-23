STUDYING WITH YE KUN — 2026-11-23 QA-only Menu V2.1 + 普通第二種免許 Candidate

ဒီ ZIP သည် Production Release မဟုတ်ပါ။ GitHub main, Netlify Production, SQL, Payment, YKCR မပြောင်းထားပါ။

1. dist-menu-qa/ = 41-page local full QA website snapshot. Preview/Test အတွက်သာ။
2. QA_BRANCH_OVERLAY/ = GitHub QA branch `qa/v7.89.0-rc1-second-license-20261120` ထဲက qa/menu-slidein-pr7/ ကိုသာ update လုပ်မည့် ဖိုင် 4 ခု။ Main branch သို့ မကူးပါနှင့်။
3. source-overlay/ = original QA source overlay + latest language/brand fixes + five-tab navigation.
4. QA_TEST_RESULTS.json = ဒီ Chat မှာ အသစ်စစ်ထားသော တိကျသော PASS/BLOCKED အခြေအနေ။
5. QA_REPORT_MM.md = Scope, limitations, rollback and final decision.

Menu: Home · Study · Exam · Video · Account; hamburger Menu remains in header.
FIX03 local synthetic security PASS report exists separately, but NOT integrated into this candidate or production.
普通第二種免許 QA simulator is local-only; authenticated server scoring, paid/student access and production readiness NOT VERIFIED.
Browser E2E attempted: environment blocks localhost navigation; PASS is NOT claimed.
Hosted Identity Team Login cookie-less verification is NOT VERIFIED. Do not publish as production.

Release/rollback: Do not overwrite production until proper authorized review and hosted E2E, backend entitlements and scoring verification.
