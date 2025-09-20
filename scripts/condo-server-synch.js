import express from "express";
import mysql from "mysql2/promise";

const app = express();
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "test"
});

app.get("/get-data", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS time");
    res.json({ result: rows[0].time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));