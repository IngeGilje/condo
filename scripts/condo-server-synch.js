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

    // Requests for accounts
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

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update account request received");

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

            console.log("Database error in /accounts:", err.message);
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

            console.log("Database error in /accounts:", err.message);
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

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }
      }
    });

    // Requests for users
    app.get("/users", async (req, res) => {

      console.log("Received request for users", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {
          const condominiumId = Number(req.query.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM users
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY userId;
            `;
            console.log('SQLquery: ', SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update users request received");

          try {

            const userId = req.query.userId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const email = req.query.email;
            const condoId = req.query.condoId;
            const firstName = req.query.firstName;
            const lastName = req.query.lastName;
            const phone = req.query.phone;
            const securityLevel = req.query.securityLevel;
            const password = req.query.password;

            const SQLquery =
              `
                UPDATE users
                SET
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  email = '${email}',
                  condoId = ${condoId},
                  firstName = '${firstName}',
                  lastName = '${lastName}',
                  phone = '${phone}',
                  securityLevel = ${securityLevel},
                  password = '${password}'
                WHERE 
                  userId = ${userId};
              `;
            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert user request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const email = req.query.email;
            const condoId = req.query.condoId;
            const firstName = req.query.firstName;
            const lastName = req.query.lastName;
            const phone = req.query.phone;
            const securityLevel = req.query.securityLevel;
            const password = req.query.password;

            // Insert new row
            const SQLquery =
              `
                INSERT INTO users(
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  email,
                  condoId,
                  firstName,
                  lastName,
                  phone,
                  securityLevel,
                  password
                )
                VALUES(
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  '${email}',
                  ${condoId},
                  '${firstName}',
                  '${lastName}',
                  '${phone}',
                  ${securityLevel},
                  '${password}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          console.log("Delete user request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const userId = req.query.userId;

            // Delete table
            const SQLquery =
              `
                UPDATE users
                  SET 
                    deleted = 'Y',
                    lastUpdate = '${lastUpdate}',
                    user = '${user}'
                  WHERE userId = ${userId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }
      }
    });

    // Requests for bank accounts
    app.get("/bankaccounts", async (req, res) => {

      console.log("Received request for bank accounts", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {
          const condominiumId = Number(req.query.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM bankaccounts
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY bankAccountId;
            `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update bank account request received");

          try {


            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const name = req.query.name;
            const openingBalance = req.query.openingBalance;
            const openingBalanceDate = req.query.openingBalanceDate;
            const closingBalance = req.query.closingBalance;
            const closingBalanceDate = req.query.closingBalanceDate;
            const bankAccountId = req.query.bankAccountId;

            const SQLquery =
              `
                UPDATE bankaccounts
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  bankAccount = '${bankAccount}',
                  name = '${name}',
                  openingBalance = '${openingBalance}',
                  openingBalanceDate = '${openingBalanceDate}',
                  closingBalance = '${closingBalance}',
                  closingBalanceDate = '${closingBalanceDate}'
                WHERE bankAccountId = ${bankAccountId};
              `;
            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert bank account request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const bankAccount = req.query.bankAccount;
            const name = req.query.name;
            const openingBalance = req.query.openingBalance;
            const openingBalanceDate = req.query.openingBalanceDate;
            const closingBalance = req.query.closingBalance;
            const closingBalanceDate = req.query.closingBalanceDate;

            // Insert new row
            const SQLquery =
              `
                INSERT INTO bankaccounts (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  bankAccount,
                  name,
                  openingBalance, 
                  openingBalanceDate,
                  closingBalance, 
                  closingBalanceDate
                ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  '${bankAccount}',
                  '${name}',
                  '${openingBalance}',
                  '${openingBalanceDate}',
                  '${closingBalance}',
                  '${closingBalanceDate}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          console.log("Delete bank account request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const bankAccountId = req.query.bankAccountId;

            // Delete table
            const SQLquery =
              `
                UPDATE bankaccounts
                  SET 
                    deleted = 'Y',
                    lastUpdate = '${lastUpdate}',
                    user = '${user}'
                  WHERE bankAccountId = ${bankAccountId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }
      }
    });

    // Requests for condominiums table
    app.get("/condominiums", async (req, res) => {

      console.log("Received request for condominiums", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {

          console.log("Select condominium request received");
          try {

            const SQLquery =
              `
                SELECT * FROM condominiums
                  WHERE deleted <> 'Y'
                ORDER BY condominiumId;
              `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update condominium request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const name = req.query.name;
            const street = req.query.street;
            const address2 = req.query.address2;
            const postalCode = req.query.postalCode;
            const city = req.query.city;
            const phone = req.query.phone;
            const email = req.query.email;
            const incomeRemoteHeatingAccountId = req.query.incomeRemoteHeatingAccountId;
            const paymentRemoteHeatingAccountId = req.query.paymentRemoteHeatingAccountId;
            const commonCostAccountId = req.query.commonCostAccountId;
            const organizationNumber = req.query.organizationNumber;
            const importPath = req.query.importPath;

            const SQLquery =
              `        
                UPDATE condominiums
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  name = '${name}',
                  street = '${street}',
                  address2 = '${address2}',
                  postalCode = '${postalCode}', 
                  city = '${city}',
                  phone = '${phone}',
                  email = '${email}',
                  incomeRemoteHeatingAccountId = ${incomeRemoteHeatingAccountId},
                  paymentRemoteHeatingAccountId = ${paymentRemoteHeatingAccountId},
                  commonCostAccountId = ${commonCostAccountId},
                  organizationNumber = '${organizationNumber}',
                  importPath = '${importPath}'
                WHERE condominiumId = ${condominiumId};
              `;
            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert condominium request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const name = req.query.name;
            const street = req.query.street;
            const address2 = req.query.address2;
            const postalCode = req.query.postalCode;
            const city = req.query.city;
            const phone = req.query.phone;
            const email = req.query.email;
            const incomeRemoteHeatingAccountId = req.query.incomeRemoteHeatingAccountId;
            const paymentRemoteHeatingAccountId = req.query.paymentRemoteHeatingAccountId;
            const commonCostAccountId = req.query.commonCostAccountId;
            const organizationNumber = req.query.organizationNumber;
            const importPath = req.query.importPath;

            // Insert new row
            const SQLquery =
              `
                INSERT INTO condominiums (
                  deleted,
                  user,
                  lastUpdate,
                  name,
                  street,
                  address2,
                  postalCode,
                  city,
                  phone,
                  email,
                  incomeRemoteHeatingAccountId,
                  paymentRemoteHeatingAccountId,
                  commonCostAccountId,
                  organizationNumber,
                  importPath
                ) VALUES (
                  'N',
                  '${user}',
                  '${lastUpdate}',
                  '${name}',
                  '${street}',
                  '${address2}',
                  '${postalCode}',
                  '${city}',
                  '${phone}',
                  '${email}',
                  ${incomeRemoteHeatingAccountId},
                  ${paymentRemoteHeatingAccountId},
                  ${commonCostAccountId},
                  '${organizationNumber}',
                  '${importPath}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          console.log("Delete condo request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const condoId = req.query.condoId;

            // Delete table
            const SQLquery =
              `
                UPDATE condominiums
                SET 
                  deleted = 'Y',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}'
                WHERE condominiumId = ${condoId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }
      }
    });

    // Requests for budgets table
    app.get("/budgets", async (req, res) => {

      console.log("Received request for budgets", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {

          console.log("Select budget request received");
          try {

            const condominiumId = req.query.condominiumId;
            const year = req.query.year;
            const accountId = Number(req.query.accountId);

            const SQLquery =
              `
                SELECT * FROM budgets
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                  AND year = '${year}'
              `;

            if (accountId !== 999999999) {
              SQLquery +=
                `
                  AND accountId = ${accountId}
                `;
            }

            SQLquery +=
              `
                ORDER BY year,accountId;
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update budget request received");

          try {

            const budgetId = req.query.budgetId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const accountId = req.query.accountId;
            const amount = req.query.amount;
            const year = req.query.year;

            // Update row
            const SQLquery =
              `
              UPDATE budgets
              SET
                user = '${user}', 
                lastUpdate = '${lastUpdate}',
                accountId = ${accountId},
                amount = ${amount},
                year = '${year}'
              WHERE budgetId = ${budgetId};
            `;
            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert budget request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const accountId = req.query.accountId;
            const amount = req.query.amount;
            const year = req.query.year;

            // Insert new row
            const SQLquery =
              `
                INSERT INTO budgets (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  accountId,
                  amount,
                  year
                  ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  ${accountId},
                  ${amount},
                  '${year}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          console.log("Delete budget request received");

          try {

            const budgetId = req.query.budgetId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;

            // Delete table
            const SQLquery =
              `
                UPDATE budgets
                SET 
                  deleted = 'Y',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}'
                WHERE budgetId = ${budgetId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }
      }
    });

    // Requests for dues table
    app.get("/dues", async (req, res) => {

      console.log("Received request for dues", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {

          console.log("Select due request received");
          try {

            const condominiumId = req.query.condominiumId;
            const accountId = Number(req.query.accountId);
            const condoId = Number(req.query.condoId);

            let SQLquery =
              `
                SELECT * FROM dues
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
              `;

            if (condoId !== 999999999) {
              SQLquery +=
                `
                  AND condoId = ${condoId}
                `;
            }

            if (accountId !== 999999999) {
              SQLquery +=
                `
                  AND accountId = ${accountId}
                `;
            }

            SQLquery +=
              `
                ORDER BY date DESC;
              `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /dues:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update due request received");

          try {

            const dueId = req.query.dueId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const condoId = req.query.condoId;
            const accountId = req.query.accountId;
            const amount = req.query.amount;
            const date = req.query.date;
            const text = req.query.text;

            // Update row
            const SQLquery =
              `
                UPDATE due
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  condoId = ${condoId},
                  accountId = ${accountId},
                  amount = ${amount},
                  date = ${date},
                  text = '${text}'
                WHERE dueId = ${dueId};
              `;
            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /dues:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert due request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const condoId = req.query.condoId;
            const accountId = req.query.accountId;
            const amount = req.query.amount;
            const date = req.query.date;
            const text = req.query.text;

            // Insert new row
            const SQLquery =
              `
                INSERT INTO due (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  condoId,
                  accountId,
                  amount,
                  date,
                  text
                ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  ${condoId},
                  ${accountId},
                  ${amount},
                  ${date},
                  '${text}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /dues:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          console.log("Delete due request received");

          try {

            const dueId = req.query.dueId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;

            // Delete table
            const SQLquery =
              `
                UPDATE dues
                SET 
                  deleted = 'Y',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}'
                WHERE duesId = ${duesId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /dues:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }
      }
    });

    // Requests for condo
    app.get("/condo", async (req, res) => {

      console.log("Received request for condo", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {
          const condominiumId = Number(req.query.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM condo
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY condoId;
              `;
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condo:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update condo request received");

          try {

            const condoId = req.query.condoId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const name = req.query.name;
            const street = req.query.street;
            const address2 = req.query.address2;
            const postalCode = req.query.postalCode;
            const city = req.query.city;
            const squareMeters = req.query.squareMeters;

            // Update condo table
            const SQLquery =
              `
                UPDATE condo
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  name = '${name}',
                  street = '${street}',
                  address2 = '${address2}',
                  postalCode = '${postalCode}', 
                  city = '${city}',
                  squareMeters = '${squareMeters}'
                WHERE condoId = ${condoId};
              `;
            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert account request received");

          try {

            const condominiumId = req.query.condominiumId;
            console.log('CondominiumId: ', condominiumId);
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const name = req.query.name;
            const street = req.query.street;
            const address2 = req.query.address2;
            const postalCode = req.query.postalCode;
            const city = req.query.city;
            const squareMeters = req.query.squareMeters;

            // Insert new row
            const SQLquery =
              `
                INSERT INTO condo (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  name,
                  street,
                  address2,
                  postalCode,
                  city,
                  squareMeters
                ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  '${name}',
                  '${street}',
                  '${address2}',
                  '${postalCode}',
                  '${city}',
                  '${squareMeters}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;

        }

        case 'delete': {

          console.log("Delete account request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const condoId = req.query.condoId;

            // Delete table
            const SQLquery =
              `
                UPDATE condo
                  SET 
                    deleted = 'Y',
                    lastUpdate = '${lastUpdate}',
                    user = '${user}'
                  WHERE condoId = ${condoId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }
      }
    });

    // Requests for user bank account
    app.get("/userbankaccounts", async (req, res) => {

      console.log("Received request for user bank account", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {

          const condominiumId = Number(req.query.condominiumId);

          try {
            const SQLquery =
              `
                SELECT * FROM userbankaccounts
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY userBankAccountId;
              `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /userbankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update user bank account request received");

          try {

            console.log('req.query: ', req.query);
            const user = req.query.user;
            console.log('user: ', user);
            const lastUpdate = req.query.lastUpdate;
            const userId = req.query.userId;
            const accountId = req.query.accountId;
            const name = req.query.name;
            const bankAccount = req.query.bankAccount;
            const userBankAccountId = req.query.userBankAccountId;

            // Update user bank account table
            const SQLquery =
              `
                UPDATE userBankAccounts
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  userId = ${userId},
                  accountId = ${accountId},
                  name = '${name}',
                  bankAccount = '${bankAccount}'
                WHERE userBankAccountId = ${userBankAccountId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /userbankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert user bank account request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const userId = req.query.userId;
            const accountId = req.query.accountId;
            const name = req.query.name;
            const bankAccount = req.query.bankAccount;

            // Insert new row
            // Insert new record
            const SQLquery =
              `
                INSERT INTO userBankAccounts (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  userId,
                  accountId,
                  name,
                  bankAccount
                ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  ${userId},
                  ${accountId},
                  '${name}',
                  '${bankAccount}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /userbankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;

        }

        case 'delete': {

          console.log("Delete user bank account request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const userBankAccountId = req.query.userBankAccountId;

            // Delete table
            const SQLquery =
              `
                UPDATE userbankaccounts
                  SET 
                    deleted = 'Y',
                    lastUpdate = '${lastUpdate}',
                    user = '${user}'
                  WHERE userBankAccountId = ${userBankAccountId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /userbankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }
      }
    });

    // Requests for supplier
    app.get("/suppliers", async (req, res) => {

      console.log("Received request for supplier", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {

          const condominiumId = Number(req.query.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM suppliers
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY supplierId;
              `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /suppliers:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update supplier request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const email = req.query.email;
            const name = req.query.name;
            const street = req.query.street;
            const address2 = req.query.address2;
            const postalCode = req.query.postalCode;
            const city = req.query.city;
            const phone = req.query.phone;
            const bankAccount = req.query.bankAccount;
            const accountId = req.query.accountId;
            const account2Id = req.query.account2Id;
            const amount = req.query.amount;
            const supplierId = req.query.supplierId;

            // Update supplier table
            const SQLquery =
              `
                UPDATE suppliers
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  name = '${name}',
                  street = '${street}',
                  address2 = '${address2}',
                  postalcode = '${postalCode}',
                  city = '${city}',
                  email = '${email}',
                  phone = '${phone}',
                  bankAccount = '${bankAccount}',
                  accountId = ${accountId},
                  account2Id = ${account2Id},
                  amount = '${amount}'
                WHERE supplierId = ${supplierId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /suppliers:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert supplier request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const email = req.query.email;
            const name = req.query.name;
            const street = req.query.street;
            const address2 = req.query.address2;
            const postalCode = req.query.postalCode;
            const city = req.query.city;
            const phone = req.query.phone;
            const bankAccount = req.query.bankAccount;
            const accountId = req.query.accountId;
            const account2Id = req.query.account2Id;
            const amount = req.query.amount;
            console.log('amount: ', amount);

            // Insert new supplier row
            const SQLquery =
              `
                INSERT INTO suppliers (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  name,
                  street,
                  address2,
                  postalCode,
                  city,
                  email,
                  phone,
                  bankAccount,
                  accountId,
                  account2Id,
                  amount
                ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  '${name}',
                  '${street}',
                  '${address2}',
                  '${postalCode}',
                  '${city}',
                  '${email}',
                  '${phone}',
                  '${bankAccount}',
                  ${accountId},
                  ${account2Id},
                  ${amount}
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /suppliers:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;

        }

        case 'delete': {

          console.log("Delete supplier request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const supplierId = req.query.supplierId;

            // Delete table
            const SQLquery =
              `
                UPDATE suppliers
                  SET 
                    deleted = 'Y',
                    lastUpdate = '${lastUpdate}',
                    user = '${user}'
                  WHERE supplierId = ${supplierId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /supplier:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }
      }
    });

    // Requests for bank account movements
    app.get("/bankaccountmovements", async (req, res) => {

      console.log("Received request for bank account movements", req.query);
      const action = req.query.action;

      console.log("action: ", action);
      switch (action) {

        case 'select': {

          console.log("Select bank account movements request received");

          const condominiumId = Number(req.query.condominiumId);
          const condoId = Number(req.query.condoId);
          const accountId = Number(req.query.accountId);
          const amount = Number(req.query.amount);
          const fromDate = Number(req.query.fromDate);
          const toDate = Number(req.query.toDate);

          try {

            let SQLquery =
              `
                SELECT * FROM bankaccountmovements
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                AND date BETWEEN ${fromDate} AND ${toDate}
              `;
            if (condoId !== 999999999) {
              SQLquery +=
                `
                  AND condoId = ${condoId}
                `;
            }
            if (accountId !== 999999999) {
              SQLquery +=
                `
                  AND accountId = ${accountId}
                `;
            }
            if (amount !== 0) {
              SQLquery +=
                `
                  AND income = ${amount} OR payment = ${amount}
                `;
            }
            SQLquery +=
              `
                ORDER BY date DESC, income DESC;
              `;
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccountmovements:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          console.log("Update bank account movements request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const condoId = req.query.condoId;
            const accountId = req.query.accountId;
            const income = req.query.income;
            const payment = req.query.payment;
            const numberKWHour = req.query.numberKWHour;
            const date = req.query.date;
            const text = req.query.text;
            const bankAccountMovementId = req.query.bankAccountMovementId;

            // Update bank account movements table
            const SQLquery =
              `
                UPDATE bankaccountmovements
                SET 
                  deleted = 'N',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  condoId = '${condoId}',
                  accountId = '${accountId}',
                  income = ${income},
                  payment = ${payment},
                  numberKWHour  = '${numberKWHour}',
                  date  = ${date},
                  text = '${text}'
                WHERE bankAccountMovementId = ${bankAccountMovementId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccountmovements:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert bank account movements request received");

          try {

            const condominiumId = req.query.condominiumId;
            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const condoId = req.query.condoId;
            const accountId = req.query.accountId;
            const income = req.query.income;
            const payment = req.query.payment;
            const numberKWHour = req.query.numberKWHour;
            const date = req.query.date;
            const text = req.query.text;

            // Insert new bank account movements row
            const SQLquery =
              `
                INSERT INTO bankaccountmovements (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  condoId,
                  accountId,
                  income,
                  payment,
                  numberKWHour,
                  date,
                  text
                ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  ${condoId},
                  ${accountId},
                  ${income},
                  ${payment},
                  '${numberKWHour}',
                  ${date}, 
                  '${text}'
                );
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccountmovements:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }

        case 'delete': {

          console.log("Delete bank account movement request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const bankAccountMovementId = req.query.bankAccountMovementId;

            // Delete table
            const SQLquery =
              `
                UPDATE bankaccountmovements
                  SET 
                    deleted = 'Y',
                    lastUpdate = '${lastUpdate}',
                    user = '${user}'
                  WHERE bankAccountMovementId = ${bankAccountMovementId};
              `;

            console.log("SQLquery: ", SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccountmovements:", err.message);
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
    console.log("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}