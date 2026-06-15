import "dotenv/config";
import { createConnection } from "mysql2/promise";

async function check() {
  const conn = await createConnection(process.env.DATABASE_URL!);

  const [users] = await conn.execute("SELECT id, name, email, role FROM users");
  console.log("Users:", users);

  const [tenders] = await conn.execute("SELECT id, tenderId, title, status FROM tenders");
  console.log("Tenders:", tenders);

  const [vendorProfiles] = await conn.execute("SELECT id, userId, companyName, isActive FROM vendor_profiles");
  console.log("Vendor Profiles:", vendorProfiles);

  const [bidsData] = await conn.execute("SELECT id, tenderId, vendorId, bidAmount, status FROM bids");
  console.log("Bids:", bidsData);

  await conn.end();
}

check().catch(console.error);
