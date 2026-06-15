import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { users, vendorProfiles } from "./schema";
import { eq } from "drizzle-orm";

async function fix() {
  const db = getDb();

  // Delete wrong profile
  await db.delete(vendorProfiles);

  const vendorUsers = await db.select().from(users).where(eq(users.role, "vendor"));

  const profiles = [
    { companyName: "Acme Corporation Ltd", contactPerson: "John Doe", phone: "+1-555-0101", yearsInBusiness: 15, description: "Leading infrastructure development company" },
    { companyName: "BuildRight Infrastructure Inc", contactPerson: "Jane Smith", phone: "+1-555-0102", yearsInBusiness: 8, description: "Specialized in commercial construction" },
    { companyName: "TechServe Solutions", contactPerson: "Mike Johnson", phone: "+1-555-0103", yearsInBusiness: 5, description: "IT services and software development" },
    { companyName: "GreenField Construction Co", contactPerson: "Sarah Williams", phone: "+1-555-0104", yearsInBusiness: 12, description: "Sustainable building solutions" },
  ];

  for (let i = 0; i < vendorUsers.length; i++) {
    await db.insert(vendorProfiles).values({
      userId: vendorUsers[i].id,
      ...profiles[i],
      isActive: true,
      isVerified: true,
    });
  }

  console.log("Profiles fixed");
}

fix().catch(console.error);
