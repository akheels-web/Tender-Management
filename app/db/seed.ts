import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { users, tenders, bids, vendorProfiles, activityLogs } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const db = getDb();

  // Create admin user
  await db
    .insert(users)
    .values({
      unionId: "admin_union_001",
      name: "Admin User",
      email: "admin@protender.com",
      role: "admin",
    })
    .onDuplicateKeyUpdate({
      set: { name: "Admin User", email: "admin@protender.com", role: "admin" },
    });
  console.log("Admin created");

  // Create agent user
  await db
    .insert(users)
    .values({
      unionId: "agent_union_001",
      name: "Agent Smith",
      email: "agent@protender.com",
      role: "agent",
    })
    .onDuplicateKeyUpdate({
      set: { name: "Agent Smith", email: "agent@protender.com", role: "agent" },
    });
  console.log("Agent created");

  // Create vendor users with profiles
  const vendorData = [
    {
      unionId: "vendor_union_001",
      name: "Acme Corp",
      email: "acme@protender.com",
      role: "vendor" as const,
      companyName: "Acme Corporation Ltd",
      contactPerson: "John Doe",
      phone: "+1-555-0101",
      yearsInBusiness: 15,
      description: "Leading infrastructure development company",
    },
    {
      unionId: "vendor_union_002",
      name: "BuildRight Inc",
      email: "buildright@protender.com",
      role: "vendor" as const,
      companyName: "BuildRight Infrastructure Inc",
      contactPerson: "Jane Smith",
      phone: "+1-555-0102",
      yearsInBusiness: 8,
      description: "Specialized in commercial construction",
    },
    {
      unionId: "vendor_union_003",
      name: "TechServe",
      email: "techserve@protender.com",
      role: "vendor" as const,
      companyName: "TechServe Solutions",
      contactPerson: "Mike Johnson",
      phone: "+1-555-0103",
      yearsInBusiness: 5,
      description: "IT services and software development",
    },
    {
      unionId: "vendor_union_004",
      name: "GreenField Co",
      email: "greenfield@protender.com",
      role: "vendor" as const,
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
        set: { name: v.name, email: v.email, role: v.role },
      });

    const vendorUser = await db
      .select()
      .from(users)
      .where(eq(users.unionId, userData.unionId))
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
    {
      tenderId: "TDR-2026-004",
      title: "Smart City IoT Sensor Network Deployment",
      description:
        "Deployment of 5000+ IoT sensors across the city for traffic monitoring, air quality measurement, waste management optimization, and public safety.",
      category: "Technology",
      status: "open" as const,
      budgetEstimate: "1850000.00",
      currency: "USD",
      location: "City-wide deployment",
      department: "Smart City Initiative",
      publishDate: "2026-04-01",
      closingDate: "2026-10-15",
      openingDate: "2026-10-20",
      contractPeriod: "15 Months",
      eligibilityCriteria:
        "IoT platform development experience. Must provide 5-year maintenance support.",
      isLocked: true,
      unlockPassword: "IoTcity2026!",
      lockReason: "Contains security-sensitive deployment locations",
      createdBy: 1,
    },
    {
      tenderId: "TDR-2026-005",
      title: "Water Treatment Plant Upgrade",
      description:
        "Upgrade of the main water treatment plant to increase capacity by 40% and implement advanced filtration systems meeting new EPA standards.",
      category: "Utilities",
      status: "closed" as const,
      budgetEstimate: "5200000.00",
      currency: "USD",
      location: "Riverfront Industrial Area",
      department: "Water Works Department",
      publishDate: "2026-01-01",
      closingDate: "2026-05-15",
      openingDate: "2026-05-20",
      contractPeriod: "30 Months",
      eligibilityCriteria:
        "Water treatment facility construction experience required. EPA compliance certification.",
      isLocked: true,
      unlockPassword: "WTRtrt2026!",
      lockReason: "Environmental impact assessment data sensitive",
      createdBy: 1,
    },
    {
      tenderId: "TDR-2026-006",
      title: "Public Transit Electric Bus Fleet Procurement",
      description:
        "Procurement of 200 electric buses with charging infrastructure, maintenance depot upgrades, and driver training programs.",
      category: "Transportation",
      status: "awarded" as const,
      budgetEstimate: "8900000.00",
      currency: "USD",
      location: "City Transport Depot",
      department: "Transportation Department",
      publishDate: "2025-11-01",
      closingDate: "2026-02-28",
      openingDate: "2026-03-05",
      contractPeriod: "36 Months",
      eligibilityCriteria:
        "Electric vehicle manufacturing experience. Must provide 10-year battery warranty.",
      isLocked: true,
      unlockPassword: "BUSelec2026!",
      lockReason: "Procurement pricing confidential",
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

  // Create sample bids
  const allTenders = await db.select().from(tenders);
  const allVendors = await db
    .select()
    .from(users)
    .where(eq(users.role, "vendor"));

  const bidData = [
    {
      tenderRef: "TDR-2026-001",
      vendorIdx: 0,
      amount: "4250000.00",
      status: "under_review" as const,
      description: "Comprehensive highway expansion proposal with smart traffic systems",
    },
    {
      tenderRef: "TDR-2026-001",
      vendorIdx: 3,
      amount: "4680000.00",
      status: "submitted" as const,
      description: "Sustainable highway construction with eco-friendly materials",
    },
    {
      tenderRef: "TDR-2026-002",
      vendorIdx: 2,
      amount: "2650000.00",
      status: "shortlisted" as const,
      description: "Hybrid cloud architecture with advanced security stack",
    },
    {
      tenderRef: "TDR-2026-002",
      vendorIdx: 0,
      amount: "2900000.00",
      status: "submitted" as const,
      description: "Enterprise data center modernization proposal",
    },
    {
      tenderRef: "TDR-2026-004",
      vendorIdx: 2,
      amount: "1720000.00",
      status: "under_review" as const,
      description: "End-to-end IoT sensor network with AI analytics platform",
    },
    {
      tenderRef: "TDR-2026-005",
      vendorIdx: 0,
      amount: "5100000.00",
      status: "accepted" as const,
      description: "Advanced water treatment facility upgrade proposal",
    },
    {
      tenderRef: "TDR-2026-005",
      vendorIdx: 3,
      amount: "4950000.00",
      status: "rejected" as const,
      description: "Green water treatment solution",
    },
  ];

  for (const b of bidData) {
    const tender = allTenders.find((t) => t.tenderId === b.tenderRef);
    const vendor = allVendors[b.vendorIdx];
    if (tender && vendor) {
      await db.insert(bids).values({
        tenderId: tender.id,
        vendorId: vendor.id,
        bidAmount: b.amount,
        status: b.status,
        description: b.description,
      });
    }
  }
  console.log("Bids created");

  // Create activity logs
  await db.insert(activityLogs).values([
    {
      userId: 1,
      action: "Tender Created",
      entityType: "tender",
      entityId: 1,
      details: "Created TDR-2026-001",
    },
    {
      userId: 1,
      action: "Tender Created",
      entityType: "tender",
      entityId: 2,
      details: "Created TDR-2026-002",
    },
    {
      userId: 1,
      action: "Vendor Barred",
      entityType: "vendor",
      entityId: 3,
      details: "Barred vendor from TDR-2026-001",
    },
    {
      userId: 1,
      action: "Tender Assigned",
      entityType: "tender",
      entityId: 6,
      details: "Assigned TDR-2026-006 to vendor",
    },
    {
      userId: 1,
      action: "Bid Reviewed",
      entityType: "bid",
      entityId: 3,
      details: "Shortlisted bid for TDR-2026-002",
    },
  ]);
  console.log("Activity logs created");

  console.log("Seed complete!");
}

seed().catch(console.error);
