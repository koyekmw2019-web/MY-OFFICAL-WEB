import { env } from "./env.mts";

export async function sendAdminPaymentEmail(data: { id: number; name: string; email: string; plan: string; amount: number; transferDate?: string }) {
  const apiKey = env("RESEND_API_KEY");
  const adminEmail = env("ADMIN_EMAIL");
  const from = env("RESEND_FROM_EMAIL");
  if (!apiKey || !adminEmail || !from) return { sent: false, reason: "email_not_configured" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [adminEmail],
      subject: `YK Exam payment request #${data.id}`,
      html: `<h2>New YK Exam payment request</h2><p><b>Name:</b> ${escapeHtml(data.name)}</p><p><b>Email:</b> ${escapeHtml(data.email)}</p><p><b>Plan:</b> ${escapeHtml(data.plan)}</p><p><b>Amount:</b> ¥${data.amount}</p><p><b>Transfer date:</b> ${escapeHtml(data.transferDate || "-")}</p><p>Open the YK Exam Admin page to review the receipt and approve/reject.</p>`
    })
  });
  if (!r.ok) return { sent: false, reason: `email_http_${r.status}` };
  return { sent: true };
}
function escapeHtml(v: string) { return v.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c] || c)); }
