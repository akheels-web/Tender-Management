import "dotenv/config";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { hashPassword } from "./lib/auth";

async function main() {
  const db = getDb();
  const passwordHash = hashPassword("password123");
  
  await db.insert(users).values({
    name: "Superadmin Two",
    email: "superadmin2@example.com",
    role: "superadmin",
    passwordHash: passwordHash,
  }).onDuplicateKeyUpdate({
    set: {
      name: "Superadmin Two",
      role: "superadmin",
      passwordHash: passwordHash,
    }
  });

  console.log("superadmin2 created");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
