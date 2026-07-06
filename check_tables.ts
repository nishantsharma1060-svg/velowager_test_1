import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  console.log("Connected");

  const user = await pool.query("SELECT current_user");
  console.log("User:", user.rows);

  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log("Tables:");
  console.table(tables.rows);

  await pool.end();
}

main().catch(console.error);