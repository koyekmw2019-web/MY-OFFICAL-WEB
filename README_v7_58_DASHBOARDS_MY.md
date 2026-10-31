# YE KUN Official Website — v7.58 Dashboard Update

## ထည့်သွင်းထားသည်

- Login ဝင်ပြီးမှ Homepage Hamburger Menu မှာ **Dashboard** (အပေါ်), **Logout** (အောက်) ကို ပြမယ်။ Guest မှာ **Login** တစ်ခုပဲ မြင်ရမယ်။ Language ဘယ်လိုရွေးရွေး Login / Logout / Dashboard အင်္ဂလိပ်လို ထားတယ်။
- Login success ပြီးရင် မူလ Homepage ပြန်ရောက်မယ်။ Dashboard နှိပ်ရင် `/dashboard.html` က Server Identity Status ကို စစ်ပြီး အောက်က သီးခြား Page ကိုပို့မယ်။
  - `/admin-dashboard.html` (Admin role)
  - `/student-dashboard.html` (လက်ရှိ YKCR Student record နဲ့ linked ဖြစ်တဲ့ account)
  - `/member-dashboard.html` (အခြား Login account)
- **Admin Dashboard**: Student CSV Import (ရှိပြီးသား `exam-admin-import-students`), Student/YKCR counters, Payment Requests Refresh / Receipt Review / Approve / Reject / Delete.
- **Student Dashboard**: Student Profile, class start/expiry, active status, Exam Links, own Exam History & Payment History.
- **Member Dashboard**: Free Attempt/Paid Plan/Payment Status, YKCR Student Verification, own Exam History & Payment History.
- Homepage JLPT N1–N5 Card design, Full Mock bank, Driving Exams, Existing Payment/Student/YKCR tables remain preserved.

## Payment Delete သတိပြုရန်

**Soft Delete** သုံးထားပါတယ်။ `exam_payment_requests` မှာ `deleted_at / deleted_by / delete_reason` column တွေ ထပ်ထည့်ထားပြီး request ကို Admin နဲ့ Member normal view ကနေ ဖယ်ရှားတယ်။ Payment record နဲ့ Receipt ကို Audit အတွက် စနစ်ထဲမှာ ဆက်သိမ်းထားတယ်။ **Approved Paid Access မပျက်ပါ။**

Delete မှာ Confirm Dialog ပြပြီး `DELETE <request ID>` ကို ရိုက်ထည့်ရမယ်။ Backend မှာ Admin role, confirmation နှစ်ခုလုံး စစ်ထားတယ်။ Reject / Approve က Pending request မှာပဲ လုပ်နိုင်တယ်။

## Setup / deploy

1. v7.57 မှ Source ZIP အပြည့်ပါဝင်တယ်။ v7.58 ကို Netlify Git-connected Build နဲ့ Deploy လုပ်ပါ (`npm run build`)။
2. **Netlify Database Migration** `netlify/database/migrations/20261031090000_payment_soft_delete.sql` ကို deploy ပြုလုပ်တဲ့အချိန် အောင်မြင်စွာ apply ဖြစ်ကြောင်း အတည်ပြုပါ။ Migration မရှိရင် `deleted_at` column ကို သုံးတဲ့ Function တွေ Error ဖြစ်မယ်။
3. Identity email confirmation / login, Admin role, YKCR student sync, payment approval + soft delete, paid access, receipt access ကို Netlify **Deploy Preview** နဲ့ တကယ့် Account သုံးပြီး စမ်းသပ်ပြီးမှ Production တင်ပါ။
4. Netlify secret/environment value များကို မူလအတိုင်းထားပြီး Student Database အသစ် မလုပ်ပါနဲ့။

**Note**: Payment backend functions are protected by Netlify Identity server-side role checks. Frontend hidden buttons alone are not authorization. Browser mock QA ≠ Live Netlify QA. No live website changes were made here.
