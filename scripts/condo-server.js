// condo-server-synch.js
// Run with: node scripts/condo-server-synch.js

// Test- or web server
// const serverStatus = 1; // Web server
// const serverStatus = 2; // Test server/ local test server
const serverStatus = 2;

/*
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import fs from "fs";
import csv from "csv-parser";
//import fs from "fs/promises";

const app = express();
app.use(cors());          // allow frontend to call backend
*/

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import fs from "fs/promises";

const app = express();
app.use(cors());          // allow frontend to call backend

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

      const action = req.query.action;

      switch (action) {

        case 'select': {
          const condominiumId = Number(req.query.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM accounts
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY name ASC, accountId ASC;
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

      const action = req.query.action;

      switch (action) {

        case 'select': {

          const condominiumId = Number(req.query.condominiumId);

          try {

            let SQLquery =
              `
                SELECT * FROM users
              `;

            if (Number(condominiumId) === 999999999) {

              SQLquery +=
                `
                    WHERE deleted <> 'Y'
                  `;

            } else {

              SQLquery +=
                `
                   WHERE condominiumId = ${condominiumId}
                    AND deleted <> 'Y'
                `;
            }

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

      const action = req.query.action;

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
            const bankAccount = req.query.bankAccount;
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
            const openingBalanceDate = req.query.openingBalanceDate;
            const openingBalance = req.query.openingBalance;
            const closingBalanceDate = req.query.closingBalanceDate;
            const closingBalance = req.query.closingBalance;

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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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

      const action = req.query.action;

      switch (action) {

        case 'select': {

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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery :', SQLquery);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          console.log("Delete condominium request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const condominiumId = req.query.condominiumId;

            // Delete table
            const SQLquery =
              `
                UPDATE condominiums
                SET 
                  deleted = 'Y',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}'
                WHERE condominiumId = ${condominiumId};
              `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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

      const action = req.query.action;

      switch (action) {

        case 'select': {

          try {

            const condominiumId = req.query.condominiumId;
            const year = Number(req.query.year);
            const accountId = Number(req.query.accountId);

            let SQLquery =
              `
                SELECT * FROM budgets
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
              `;

            if (year !== 999999999) {
              SQLquery +=
                `
                  AND year = '${year}'
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
                ORDER BY year,accountId;
              `;

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
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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

      const action = req.query.action;

      switch (action) {

        case 'select': {

          try {

            const condominiumId = req.query.condominiumId;
            const accountId = Number(req.query.accountId);
            const condoId = Number(req.query.condoId);
            const fromDate = Number(req.query.fromDate);
            const toDate = Number(req.query.toDate);

            let SQLquery =
              `
                SELECT * FROM dues
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
              `;

            if (fromDate !== 999999999) {
              SQLquery +=
                `
                  AND date BETWEEN ${fromDate} AND ${toDate}
                `;
            }

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
                ORDER BY condoId, date DESC;
              `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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
                UPDATE dues
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
            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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
                INSERT INTO dues (
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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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
                WHERE dueId = ${dueId};
              `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
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

      const action = req.query.action;

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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condo:", err.message);
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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condo:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }
      }
    });

    // Requests for user bank account
    app.get("/userbankaccounts", async (req, res) => {

      const action = req.query.action;

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

      const action = req.query.action;

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
            const bankAccountAccountId = req.query.accountId;
            const amountAccountId = req.query.amountAccountId;
            const text = req.query.text;
            const textAccountId = req.query.textAccountId;
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
                  bankAccountAccountId = ${bankAccountAccountId},
                  amount = '${amount}',
                  amountAccountId = ${amountAccountId},
                  text = '${text}',
                  textAccountId = ${textAccountId}
                WHERE supplierId = ${supplierId};
              `;

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
            const bankAccountAccountId = req.query.accountId;
            const amount = req.query.amount;
            const amountAccountId = req.query.amountAccountId;
            const text = req.query.text;
            const textAccountId = req.query.textAccountId;

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
                  bankAccountAccountId,
                  amount,
                  amountAccountId,
                  text,
                  textAccountId
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
                  ${bankAccountAccountId},
                  ${amount},
                  ${amountAccountId},
                  '${text}',
                  ${textAccountId}
                );
              `;
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

    // Requests for bank account transactions
    app.get("/bankaccounttransactions", async (req, res) => {

      const action = req.query.action;
      switch (action) {

        case 'select': {

          const condominiumId = Number(req.query.condominiumId);
          const deleted = req.query.deleted;
          const condoId = Number(req.query.condoId);
          const accountId = Number(req.query.accountId);
          const amount = Number(req.query.amount);
          const fromDate = Number(req.query.fromDate);
          const toDate = Number(req.query.toDate);

          try {

            let SQLquery =
              `
                SELECT * FROM bankaccounttransactions
                WHERE condominiumId = ${condominiumId}
              `;
            if (deleted === 'Y') {
              SQLquery +=
                `
                  AND deleted = 'Y'
                `;
            }
            if (deleted === 'N') {
              SQLquery +=
                `
                  AND deleted = 'N'
                `;
            }

            SQLquery +=
              `
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
                  AND(income = ${amount} OR payment = ${amount})
                `;
            }

            SQLquery +=
              `
                ORDER BY date DESC, income DESC;
              `;

            console.log('SQLquery:', SQLquery);
            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

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
            const bankAccountTransactionId = req.query.bankAccountTransactionId;

            // Update bank account transactions table
            const SQLquery =
              `
                UPDATE bankaccounttransactions
            SET
            deleted = 'N',
              user = '${user}',
              lastUpdate = '${lastUpdate}',
              condoId = '${condoId}',
              accountId = '${accountId}',
              income = ${income},
            payment = ${payment},
            numberKWHour = '${numberKWHour}',
              date = ${date},
            text = '${text}'
                WHERE bankAccountTransactionId = ${bankAccountTransactionId};
            `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          console.log("Insert bank account transactions request received");

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

            // Insert new bank account transactions row
            const SQLquery =
              `
                INSERT INTO bankaccounttransactions(
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
            ) VALUES(
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

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }

        case 'delete': {

          console.log("Delete Bank account transactions request received");

          try {

            const user = req.query.user;
            const lastUpdate = req.query.lastUpdate;
            const bankAccountTransactionId = req.query.bankAccountTransactionId;

            // Delete table
            const SQLquery =
              `
                UPDATE bankaccounttransactions
            SET
            deleted = 'Y',
              lastUpdate = '${lastUpdate}',
              user = '${user}'
                  WHERE bankAccountTransactionId = ${bankAccountTransactionId};
            `;

            const [rows] = await db.query(SQLquery);
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }
      }
    });

    app.get("/import-csvFile", async (req, res) => {

      console.log("Received request for csvFile", req.query);
      try {

        const csvFileName = req.query.csvFileName;

        //const data = await fs.readFile("C:/Websites/condo/data/transaksjonsliste.csv", "utf8");
        const data = await fs.readFile(csvFileName, "utf8");
        res.json({ content: data });
        console.log('data :', data);

      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Requests for menu
    app.get("/menu", async (req, res) => {

      const action = req.query.action;

      switch (action) {

        case 'select': {
          const condominiumId = Number(req.query.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM menu
                  WHERE deleted <> 'Y'
                ORDER BY menuId;
              `;
            const [rows] = await db.query(SQLquery);
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
          } catch (err) {

            console.log("Database error in /menu:", err.message);
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