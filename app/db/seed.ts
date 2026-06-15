import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { users, tenders, bids, vendorProfiles, activityLogs } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../api/lib/auth";

async function seed() {
  const db = getDb();
  const defaultPassword = hashPassword("password123");

  // Create admin user
  await db
    .insert(users)
    .values({
      name: "Admin User",
      email: "admin@protender.com",
      role: "admin",
      passwordHash: defaultPassword,
    })
    .onDuplicateKeyUpdate({
      set: { name: "Admin User", role: "admin", passwordHash: defaultPassword },
    });
  console.log("Admin created (admin@protender.com / password123)");

  // Create agent user
  await db
    .insert(users)
    .values({
      name: "Agent Smith",
      email: "agent@protender.com",
      role: "agent",
      passwordHash: defaultPassword,
    })
    .onDuplicateKeyUpdate({
      set: { name: "Agent Smith", role: "agent", passwordHash: defaultPassword },
    });
  console.log("Agent created");

  // Create vendor users with profiles
  const vendorData = [
    {
      name: "Acme Corp",
      email: "acme@protender.com",
      role: "vendor" as const,
      passwordHash: defaultPassword,
      companyName: "Acme Corporation Ltd",
      contactPerson: "John Doe",
      phone: "+1-555-0101",
      yearsInBusiness: 15,
      description: "Leading infrastructure development company",
    },
    {
      name: "BuildRight Inc",
      email: "buildright@protender.com",
      role: "vendor" as const,
      passwordHash: defaultPassword,
      companyName: "BuildRight Infrastructure Inc",
      contactPerson: "Jane Smith",
      phone: "+1-555-0102",
      yearsInBusiness: 8,
      description: "Specialized in commercial construction",
    },
    {
      name: "TechServe",
      email: "techserve@protender.com",
      role: "vendor" as const,
      passwordHash: defaultPassword,
      companyName: "TechServe Solutions",
      contactPerson: "Mike Johnson",
      phone: "+1-555-0103",
      yearsInBusiness: 5,
      description: "IT services and software development",
    },
    {
      name: "GreenField Co",
      email: "greenfield@protender.com",
      role: "vendor" as const,
      passwordHash: defaultPassword,
      companyName: "GreenField Construction Co",
      contactPerson: "Sarah Williams",
      phone: "+1-555-0104",
      yearsInBusiness: 12,
      description: "Sustainable building solutions",
    },
  ];

  for (const v of vendorData) {
    const { companyName, contactPerson, phone, yearsInBusiness, description, ...userData } = v;
    await db
      .insert(users)
      .values(userData)
      .onDuplicateKeyUpdate({
        set: { name: v.name, role: v.role, passwordHash: defaultPassword },
      });

    const vendorUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (vendorUser[0]) {
      await db
        .insert(vendorProfiles)
        .values({
          userId: vendorUser[0].id,
          companyName,
          contactPerson,
          phone,
          yearsInBusiness,
          description,
          isActive: true,
          isVerified: true,
        })
        .onDuplicateKeyUpdate({
          set: { companyName, contactPerson, phone, yearsInBusiness, description },
        });
    }
  }
  console.log("Vendors created");

  // Create sample tenders
  const tenderData = [
    {
      tenderId: "TDR-2026-001",
      title: "City Highway Expansion Project - Phase 2",
      description:
        "Expansion of the main city highway from 4 lanes to 6 lanes including bridges, overpasses, and smart traffic management systems. Estimated project duration is 18 months.",
      category: "Infrastructure",
      status: "open" as const,
      budgetEstimate: "4500000.00",
      currency: "USD",
      location: "Metropolis Central District",
      department: "Public Works Department",
      publishDate: "2026-01-15",
      closingDate: "2026-07-30",
      openingDate: "2026-08-05",
      contractPeriod: "18 Months",
      eligibilityCriteria:
        "Minimum 10 years experience in highway construction. Must have completed at least 2 similar projects.",
      isLocked: true,
      unlockPassword: "HWexp2026!",
      lockReason: "Sensitive infrastructure details - Admin access only",
      createdBy: 1,
    },
    {
      tenderId: "TDR-2026-002",
      title: "Municipal Data Center Modernization",
      description:
        "Complete modernization of the municipal data center including server upgrades, cooling systems, and cybersecurity infrastructure. Cloud hybrid architecture required.",
      category: "IT Infrastructure",
      status: "open" as const,
      budgetEstimate: "2800000.00",
      currency: "USD",
      location: "Tech Park Zone B",
      department: "IT Department",
      publishDate: "2026-02-01",
      closingDate: "2026-08-15",
      openingDate: "2026-08-20",
      contractPeriod: "12 Months",
      eligibilityCriteria:
        "ISO 27001 certification required. Experience with hybrid cloud deployments.",
      isLocked: true,
      unlockPassword: "DCmod2026!",
      lockReason: "Contains classified network architecture details",
      createdBy: 1,
    },
    {
      tenderId: "TDR-2026-003",
      title: "Public School Renovation - District 5",
      description:
        "Renovation of 5 public schools including classroom upgrades, sports facilities, safety improvements, and energy-efficient systems installation.",
      category: "Education",
      status: "published" as const,
      budgetEstimate: "3200000.00",
      currency: "USD",
      location: "District 5 - North Zone",
      department: "Education Department",
      publishDate: "2026-03-01",
      closingDate: "2026-09-30",
      openingDate: "2026-10-05",
      contractPeriod: "24 Months",
      eligibilityCriteria:
        "Experience in educational facility construction. LEED certification preferred.",
      isLocked: true,
      unlockPassword: "SCHren2026!",
      lockReason: "Budget and planning details confidential",
      createdBy: 1,
    },
  ];

  for (const t of tenderData) {
    await db
      .insert(tenders)
      .values(t as any)
      .onDuplicateKeyUpdate({
        set: { title: t.title, status: t.status },
      });
  }
  console.log("Tenders created");

  console.log("Seed complete!");
}

seed().catch(console.error);
