// condo-server-synch.js
// Run with: node scripts/condo-server-synch.js

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors()); // <--- allow all origins
app.use(express.json());

// Middleware to parse JSON requests
app.use(express.json());

async function main() {
  try {
    // Connect to MySQL
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'Inge',
      password: 'Sommer--2025',
      database: "condos"
    });

    console.log("✅ Connected to MySQL");

    // Example endpoint: get current server time
    app.get("/time", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT NOW() AS time");
        res.json({ server_time: rows[0].time });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Example endpoint: query your table
    app.get("/users", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM user"); // change table name
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Start the server
    app.listen(3000, () => {
      console.log("🚀 Server running at http://localhost:3000");
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

// Run main
main();