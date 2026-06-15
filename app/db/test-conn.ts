import "dotenv/config";
import { createConnection } from "mysql2/promise";

async function test() {
  const conn = await createConnection(process.env.DATABASE_URL!);
  const [rows] = await conn.execute("SHOW TABLES");
  console.log("Tables:", rows);
  await conn.end();
}

test().catch(console.error);
