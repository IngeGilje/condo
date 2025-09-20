// condo-server-synch.js (ESM version)

// Import packages
import express from "express";
import mysql from "mysql2/promise";

const app = express();

async function main() {
  // Connect to MySQL
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "test"
  });

  console.log("Connected to database");

  // Example endpoint
  app.get("/time", async (req, res) => {
    try {
      const [rows] = await db.query("SELECT NOW() AS time");
      res.json({ server_time: rows[0].time });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Start server
  app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });
}

main();