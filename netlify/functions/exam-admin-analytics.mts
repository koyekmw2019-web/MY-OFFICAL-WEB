/** v7.84 Admin Dashboard Pro — aggregate only, read-only, no student PII.
 * Requires Netlify Identity admin. All rates use server-verified submitted exams.
 * YKCR metrics show inbound receiver events only (NOT upstream delivery queue health).
 */
import { getDatabase } from '@netlify/database';
import { requireAdmin, asResponse } from './_shared/auth.mts';

const response = (data: unknown, status=200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
});
const count = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const rate = (passed: number, eligible: number) => eligible > 0 ? Math.round(passed * 1000 / eligible) / 10 : null;
export default async (req: Request) => {
  try {
    if (req.method !== 'GET') return response({error:'Method not allowed'},405);
    await requireAdmin();
    const daysText = new URL(req.url).searchParams.get('days') || '30';
    if (!['7','30','90'].includes(daysText)) return response({error:'Invalid range'},400);
    const days = Number(daysText);
    const db = getDatabase();
    const [students, payments, totals, byType, trend, sync, practice, learning] = await Promise.all([
      db.sql<any>`SELECT COUNT(*)::int total,
        COUNT(*) FILTER (WHERE status='active' AND CURRENT_DATE BETWEEN class_start AND expire_date)::int active,
        COUNT(*) FILTER (WHERE status<>'active' OR expire_date<CURRENT_DATE)::int inactive_or_expired,
        COUNT(*) FILTER (WHERE status='active' AND class_start>CURRENT_DATE)::int upcoming
        FROM exam_students`,
      db.sql<any>`SELECT COUNT(*) FILTER (WHERE status='pending')::int pending,
        COUNT(*) FILTER (WHERE status='approved')::int approved,
        COUNT(*) FILTER (WHERE status='rejected')::int rejected
        FROM exam_payment_requests WHERE deleted_at IS NULL`,
      db.sql<any>`SELECT COUNT(*) FILTER (WHERE status='submitted')::int submitted,
        COUNT(*) FILTER (WHERE status='submitted' AND score_verified=TRUE AND passed IS NOT NULL)::int verified,
        COUNT(*) FILTER (WHERE status='submitted' AND score_verified=TRUE AND passed=TRUE)::int passed
        FROM exam_attempts WHERE (submitted_at AT TIME ZONE 'Asia/Tokyo')::date >= ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int - 1))`,
      db.sql<any>`SELECT exam_type,
        COUNT(*) FILTER (WHERE score_verified=TRUE AND passed IS NOT NULL)::int verified,
        COUNT(*) FILTER (WHERE score_verified=TRUE AND passed=TRUE)::int passed,
        COUNT(*)::int submitted
        FROM exam_attempts WHERE status='submitted' AND (submitted_at AT TIME ZONE 'Asia/Tokyo')::date >= ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int - 1))
        GROUP BY exam_type ORDER BY exam_type LIMIT 30`,
      db.sql<any>`SELECT (submitted_at AT TIME ZONE 'Asia/Tokyo')::date::text day,
        COUNT(*) FILTER (WHERE score_verified=TRUE AND passed IS NOT NULL)::int verified,
        COUNT(*) FILTER (WHERE score_verified=TRUE AND passed=TRUE)::int passed,
        COUNT(*)::int submitted
        FROM exam_attempts WHERE status='submitted' AND (submitted_at AT TIME ZONE 'Asia/Tokyo')::date >= ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int - 1))
        GROUP BY (submitted_at AT TIME ZONE 'Asia/Tokyo')::date
        ORDER BY day ASC LIMIT 92`,
      db.sql<any>`SELECT COUNT(*)::int received,
        COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '24 hours')::int inbound_24h,
        COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '7 days')::int inbound_7d,
        MAX(received_at) last_received_at FROM ykcr_sync_events`,
      db.sql<any>`SELECT r.value->>'day' AS day,
        COUNT(*)::int sessions,
        COALESCE(SUM((r.value->>'count')::int),0)::int questions,
        COALESCE(SUM((r.value->>'correct')::int),0)::int correct
        FROM yk_jlpt_learning_progress p
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(p.state->'dailyRuns','[]'::jsonb)) AS r(value)
        WHERE r.value->>'day' >= ((NOW() AT TIME ZONE 'Asia/Tokyo')::date - (${days}::int - 1))::text
          AND r.value->>'day' <= (NOW() AT TIME ZONE 'Asia/Tokyo')::date::text
        GROUP BY day ORDER BY day ASC LIMIT 92`,
      db.sql<any>`SELECT COUNT(*)::int accounts,
        COALESCE(SUM(jsonb_array_length(COALESCE(state->'completed','[]'::jsonb))),0)::int lessons_completed,
        COUNT(*) FILTER (WHERE updated_at>=NOW() - (${days}::int * INTERVAL '1 day'))::int recently_updated
        FROM yk_jlpt_learning_progress`
    ]);
    const verified = count(totals[0]?.verified), passed = count(totals[0]?.passed);
    return response({
      periodDays:days, generatedAt:new Date().toISOString(), timezone:'Asia/Tokyo',
      students:students[0] || {total:0,active:0}, payments:payments[0]||{pending:0,approved:0,rejected:0},
      exams:{submitted:count(totals[0]?.submitted),verified,passed,passRate:rate(passed,verified),
        byType:byType.map((r:any)=>({type:String(r.exam_type),submitted:count(r.submitted),verified:count(r.verified),passed:count(r.passed),passRate:rate(count(r.passed),count(r.verified))})),
        daily:trend.map((r:any)=>({day:String(r.day),submitted:count(r.submitted),verified:count(r.verified),passed:count(r.passed),passRate:rate(count(r.passed),count(r.verified))}))},
      ykcr:{received:count(sync[0]?.received),inbound24h:count(sync[0]?.inbound_24h),inbound7d:count(sync[0]?.inbound_7d),lastReceivedAt:sync[0]?.last_received_at||null,
        queueStatus:'unknown',failureStatus:'unknown',scope:'inbound-receiver-only'},
      learning:{accounts:count(learning[0]?.accounts),lessonsCompleted:count(learning[0]?.lessons_completed),recentlyUpdated:count(learning[0]?.recently_updated),
        dailyPractice:practice.map((r:any)=>({day:String(r.day),sessions:count(r.sessions),questions:count(r.questions),correct:count(r.correct)}))},
      notes:{exam:'Pass rate uses only server-verified, submitted mock exams. Not the official exam pass rate.',
        learning:'Daily practice is stored learning activity (not verified exam results). Lesson completions have no historical day field.',
        sync:'Shows events received by the Official Website only. Upstream YKCR Pending/Failed queue is not connected.'}
    });
  } catch (error) {return asResponse(error)}
};
