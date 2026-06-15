import "dotenv/config";
import { createConnection } from "mysql2/promise";

async function dropAll() {
  const conn = await createConnection(process.env.DATABASE_URL!);

  await conn.execute("SET FOREIGN_KEY_CHECKS = 0");

  const [rows] = await conn.execute(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
  );

  for (const row of rows as any[]) {
    const tableName = row.TABLE_NAME || row.table_name;
    if (tableName !== "__drizzle_migrations") {
      await conn.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`Dropped: ${tableName}`);
    }
  }

  await conn.execute("SET FOREIGN_KEY_CHECKS = 1");
  await conn.end();
  console.log("All tables dropped");
}

dropAll().catch(console.error);
