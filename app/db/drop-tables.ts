import { getDb } from "../api/queries/connection";

async function dropTables() {
  const db = getDb();
  await db.execute(
    "DROP TABLE IF EXISTS activity_logs, tender_assignments, barred_vendors, bids, tenders, vendor_profiles"
  );
  console.log("Tables dropped");
}

dropTables().catch(console.error);
