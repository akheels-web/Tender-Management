import { getDb } from "./queries/connection";
import { users, vendorProfiles, tenders, bids } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./lib/auth";

async function runSeed() {
  const db = getDb();
  console.log("Seeding test accounts...");

  const testAccounts = [
    { email: "admin@example.com", name: "Admin Test", role: "admin", password: "password123" },
    { email: "superadmin@example.com", name: "Superadmin Test", role: "superadmin", password: "password123" },
    { email: "superadmin2@example.com", name: "Superadmin Two", role: "superadmin", password: "password123" },
    { email: "agent@example.com", name: "Agent Test", role: "agent", password: "password123" },
    { email: "vendor@example.com", name: "Vendor Test", role: "vendor", password: "password123" },
  ];

  let vendorId: number | null = null;

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
          vendorId = result[0].insertId;
          await db.insert(vendorProfiles).values({
            userId: vendorId,
            companyName: "Muscat Trading LLC",
            contactPerson: "Ahmed Al Balushi",
            phone: "+968 9123 4567",
            crNumber: "CR-9876543",
            vatNumber: "OM-VAT-12345",
            occiNumber: "OCCI-8765",
            registrationNumber: "REG-2023-01",
            address: "Ruwi, Muscat, Sultanate of Oman",
          });
        }
      } else {
        console.log(`${acc.role} account ${acc.email} already exists.`);
        if (acc.role === "vendor") {
          vendorId = existing.id;
          // Update existing vendor with Oman data
          await db.update(vendorProfiles).set({
            crNumber: "CR-9876543",
            vatNumber: "OM-VAT-12345",
            occiNumber: "OCCI-8765",
            address: "Ruwi, Muscat, Sultanate of Oman"
          }).where(eq(vendorProfiles.userId, vendorId));
        }
      }
    } catch (e) {
      console.error(`Failed to create/update ${acc.email}:`, e);
    }
  }

  // Seed Dummy Tenders
  if (vendorId) {
    console.log("Seeding dummy tenders...");
    const existingTenders = await db.select().from(tenders).limit(1);
    
    if (existingTenders.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const insertedTenders = await db.insert(tenders).values([
        {
          tenderId: "TND-2026-001",
          title: "IT Equipment Supply for HQ",
          description: "Supply and installation of 50 high-performance laptops and network switches for the new Muscat Headquarters.",
          category: "Hardware",
          status: "open",
          budgetEstimate: "120000",
          location: "Muscat, Oman",
          publishDate: new Date(),
          closingDate: nextWeek,
          openingDate: nextWeek,
          contractPeriod: "3 Months",
          createdBy: 2, // Assuming agent is ID 2
        },
        {
          tenderId: "TND-2026-002",
          title: "Office Furniture Revamp",
          description: "Complete replacement of office furniture for 3 branches including ergonomic chairs, desks, and meeting tables.",
          category: "Furniture",
          status: "published",
          budgetEstimate: "45000",
          location: "Salalah, Oman",
          publishDate: new Date(),
          closingDate: nextWeek,
          openingDate: nextWeek,
          contractPeriod: "1 Month",
          createdBy: 2,
        },
        {
          tenderId: "TND-2026-003",
          title: "Cloud Software Licensing (Locked)",
          description: "Enterprise software licensing for cloud infrastructure monitoring. This tender is locked.",
          category: "Software",
          status: "open",
          budgetEstimate: "250000",
          location: "Remote/Muscat",
          publishDate: lastWeek,
          closingDate: nextWeek,
          openingDate: nextWeek,
          contractPeriod: "1 Year",
          isLocked: true,
          unlockPassword: "secretpassword",
          createdBy: 2,
        }
      ]);
      
      console.log("Seeding dummy bids...");
      await db.insert(bids).values([
        {
          tenderId: insertedTenders[0].insertId,
          vendorId: vendorId,
          status: "submitted",
          bidAmount: "115000",
          notes: "We have included premium Dell laptops with extended 3-year warranties.",
          quotationDocumentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          technicalDocumentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        }
      ]);
    } else {
      console.log("Tenders already exist, skipping dummy data injection.");
    }
  }

  console.log("Seeding complete.");
  process.exit(0);
}

runSeed();
