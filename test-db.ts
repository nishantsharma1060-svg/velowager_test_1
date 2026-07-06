import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    console.log("Connecting...");

    await client.connect();

    console.log("Connected!");

    const result = await client.query("SELECT NOW()");

    console.log(result.rows);

    await client.end();
  } catch (e) {
    console.error(e);
  }
})();