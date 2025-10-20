// scripts/check-supabase-admin.js
require("dotenv").config({ path: ".env.local" });

require("dotenv").config(); // loads .env.local when run with node
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const sbAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function run() {
  try {
    console.log("Testing admin access to profiles...");
    // Try to read 5 rows from profiles
    const { data, error } = await sbAdmin.from("profiles").select("*").limit(5);
    if (error) {
      console.error("Profiles select error:", error);
    } else {
      console.log("Profiles sample:", data);
    }

    // Optionally test getting a user by id (replace an id below)
    // const userId = "replace-with-uuid";
    // const ud = await sbAdmin.auth.admin.getUserById(userId);
    // console.log("User data:", ud);

  } catch (err) {
    console.error("Unexpected:", err);
  } finally {
    const { data: tables, error: tablesError } = await sbAdmin.rpc("pg_catalog.pg_tables");
    if (tablesError) console.error("Table list error:", tablesError);
    else console.log("All tables:", tables.filter(t => t.schemaname === "public").map(t => t.tablename));

    process.exit(0);
  }
}

run();
