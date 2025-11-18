// api/db.js
import { neon } from "@neondatabase/serverless";

// Connexion à Neon Postgres
export const sql = neon(process.env.DATABASE_URL);
