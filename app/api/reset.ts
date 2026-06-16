import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { hashPassword } from "./lib/auth";
import { eq } from "drizzle-orm";

async function resetAdmin() {
  const db = getDb();
  await db.update(users)
    .set({ passwordHash: hashPassword("password123") })
    .where(eq(users.email, "admin@example.com"));
  console.log("Admin password reset to password123");
  process.exit(0);
}
resetAdmin();
