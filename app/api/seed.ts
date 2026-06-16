import { getDb } from "./queries/connection";
import { users, vendorProfiles } from "@db/schema";
import { hashPassword } from "./lib/auth";

async function runSeed() {
  const db = getDb();
  console.log("Seeding test accounts...");

  const testAccounts = [
    { email: "admin@example.com", name: "Admin Test", role: "admin", password: "password123" },
    { email: "agent@example.com", name: "Agent Test", role: "agent", password: "password123" },
    { email: "vendor@example.com", name: "Vendor Test", role: "vendor", password: "password123" },
  ];

  for (const acc of testAccounts) {
    try {
      // Check if user exists
      const existing = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, acc.email),
      });

      if (!existing) {
        console.log(`Creating ${acc.role} account: ${acc.email} / ${acc.password}`);
        const result = await db.insert(users).values({
          email: acc.email,
          name: acc.name,
          role: acc.role as any,
          passwordHash: hashPassword(acc.password),
        });

        if (acc.role === "vendor") {
          const insertId = result[0].insertId;
          await db.insert(vendorProfiles).values({
            userId: insertId,
            companyName: "Test Vendor Corp",
            contactPerson: "John Doe",
            phone: "1234567890",
            registrationNumber: "CR-123456",
          });
        }
      } else {
        console.log(`${acc.role} account ${acc.email} already exists.`);
      }
    } catch (e) {
      console.error(`Failed to create ${acc.email}:`, e);
    }
  }

  console.log("Seeding complete.");
  process.exit(0);
}

runSeed();
