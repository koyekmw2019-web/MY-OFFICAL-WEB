import { getDatabase } from "@netlify/database";
import { requireUser } from "./_shared/auth.mts";
import { makeVerificationHandler } from "./_shared/student-verification-handler.mjs";
import { makePostgresStudentStore } from "./_shared/student-rate-postgres.mjs";

// No database connection before authentication and input validation.
// This candidate requires the separately approved persistent table.
const handler = makeVerificationHandler({requireUser,store:makePostgresStudentStore(getDatabase)});
export default async (req: Request) => handler(req);
