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

      console.log("Received request for users", req.query);
      try {

        const condominiumId = req.query.condominiumId;
        console.log("condominiumId: ", condominiumId);
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

      console.log("Received request for accounts", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {
          const condominiumId = Number(req.query.condominiumId);

          try {

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
          break;
        }

        case 'update': {

          console.log("Update account request received");

          console.log("try");
          try {

            const accountId = req.query.accountId;
            console.log("accountId: ", accountId);
            const user = req.query.user;
            const fixedCost = req.query.fixedCost;
            const lastUpdate = req.query.lastUpdate;
            const accountName = req.query.accountName;

            const SQLquery =
              `
                UPDATE accounts
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  name = '${accountName}',
                  fixedCost = '${fixedCost}'
                WHERE accountId = ${accountId};
              `;
            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.error("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert account request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const accountName = req.query.accountName;
            const fixedCost = req.query.fixedCost;

            // Insert new row
            const SQLquery =
              `
                INSERT INTO accounts (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  name,
                  fixedCost
                ) 
                VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  '${accountName}',
                  '${fixedCost}'
                  );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.error("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;

        }

        case 'delete': {

          console.log("Delete account request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const accountId = req.query.accountId;

            // Delete table
            const SQLquery =
              `
                UPDATE accounts
                  SET 
                    deleted = 'Y',
                    lastUpdate = '${lastUpdate}',
                    user = '${user}'
                  WHERE accountId = ${accountId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.error("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;

        }
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