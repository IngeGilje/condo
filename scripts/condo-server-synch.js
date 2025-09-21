// condo-server-synch.js
// Run with: node scripts/condo-server-synch.js

// Test- or web server
// const serverStatus = 1; // Web server
// const serverStatus = 2; // Test server/ local test server
const serverStatus = 2;

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());          // allow frontend to call backend
app.use(express.json());

// Middleware to parse JSON requests
app.use(express.json());

let db;

// Run main
main();

async function main() {
  try {

    // Connect mySQL
    switch (serverStatus) {

      // Web server
      case 1: {

        // Connect to MySQL
        db = await mysql.createConnection({
          host: '127.0.0.1',
          user: 'Inge',
          password: 'Vinter-2025',
          database: "condos"
        });
        break;
      };

      // Test server/ local test server
      case 2: {

        // Connect to MySQL
        db = await mysql.createConnection({
          host: 'localhost',
          user: 'Inge',
          password: 'Sommer--2025',
          database: "condos"
        });
        break;
      }
    }

    console.log("✅ Connected to MySQL");

    // Returns users ordered by ID
    app.get("/users", async (req, res) => {

      try {

        const condominiumId = req.query.condominiumId;
        const SQLquery =
          `
            SELECT * FROM users
            WHERE condominiumId = ${condominiumId}
              AND deleted <> 'Y'
            ORDER BY userId;
          `;
        const [rows] = await db.query(SQLquery);
        res.json(rows);
      } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
      }
    });

    // Returns accounts ordered by ID
    app.get("/accounts", async (req, res) => {

      try {

        const condominiumId = req.query.condominiumId;
        const SQLquery =
          `
          SELECT * FROM accounts
          WHERE condominiumId = ${condominiumId}
            AND deleted <> 'Y'
          ORDER BY accountId;
        `;
        const [rows] = await db.query(SQLquery);
        res.json(rows);
      } catch (err) {
        console.error("Database error in /accounts:", err.message);
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