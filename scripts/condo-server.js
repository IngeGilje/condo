// condo-server-synch.js
// Run with: node scripts/condo-server-synch.js

// const serverStatus = 1; // http://ingegilje.no on web server
// const serverStatus = 2; // http://localhost on development PC
const serverStatus = 1;

import express from "express";
import session from "express-session";
import cors from "cors";
import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";

const nineNine = 999999999;
const minusNineNine = -999999999;

// Middleware in an Express.js server.
// Middleware = functions that run automatically for every request before your route handlers
const app = express();
// If the request body contains JSON, automatically parse it into a JavaScript object
app.use(express.json());
app.use(cors());

// Turn ON the ability for server to remember users
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,      // must be false on http
    sameSite: "lax"     // or "none" if cross-site
  }
}));

app.post('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get information from the session
//app.get("/profile", (req, res) => {
app.post("/profile", (req, res) => {

  if (req.session.username) {
    res.json({
      username: req.session.username,
      securityLevel: req.session.securityLevel,
      condominiumId: req.session.condominiumId
    });
  } else {
    res.status(401).json({ error: "No session data found" });
  }
});

// Destroy / clear session
//app.get("/logout", (req, res) => {
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Session destroyed");
  });
});

let mySqlDB;
const today = new Date();

// Run main
main();

async function main() {

  try {

    // Connect mySQL
    switch (serverStatus) {

      // http://ingegilje.no on web server
      case 1: {

        // Connect to MySQL
        mySqlDB = await mysql.createConnection({
          host: '127.0.0.1',
          user: 'Inge',
          password: 'Vinter-2025',
          database: "condos"
        });
        break;
      };

      // http://localhost on development PC
      case 2: {

        // Connect to MySQL
        mySqlDB = await mysql.createConnection({
          host: 'localhost',
          user: 'Inge',
          password: 'Sommer--2025',
          database: "condos"
        });
        break;
      }
    }

    console.log("✅ Connected to MySQL");

    // validate user
    app.post("/login", async (req, res) => {

      console.log('/login');
      try {

        const userId = req.body.userId;
        console.log('userId :', userId);
        const password = req.body.password;
        console.log('password :', password);

        // get password
        const SQLquery = `
        SELECT password FROM users
          WHERE 
            deleted = 'N'
          AND userId = ${userId};`;

        console.log('SQLquery :', SQLquery);
        const [rows] = await mySqlDB.query(SQLquery);
        if (rows.length === 1 && await bcrypt.compare(password, rows[0].password)) {

          console.log('Gyldig');
          res.status(200).send('OK');
        } else {

          console.log('Ugyldig');
          res.status(401).send("Not OK");
        }

      } catch (err) {
        console.log('Ugyldig');
        res.json({ success: false });
      };
    });

    app.post("/updateVoucerFileName", async (req, res) => {

      console.log('updateVoucerFileName');
      try {

        const lastUpdate = today.toISOString();
        const user = req.body.user;
        const bankAccountTransactionId = req.body.bankAccountTransactionId;
        const voucerFileName = req.body.voucerFileName;

        // Update a row in bank account transactions table
        const SQLquery = `
        UPDATE bankaccounttransactions
        SET
          user = '${user}',
          lastUpdate = '${lastUpdate}',
          voucerFileName = '${voucerFileName}'
        WHERE bankAccountTransactionId = ${bankAccountTransactionId};`;

        console.log('SQLquery :', SQLquery);
        const [rows] = await mySqlDB.query(SQLquery);

        // Send a JSON response to the client containing the data
        res.json(rows);
      } catch (err) {

        console.log("Database error in /updateVoucerFileName:", err.message);
        res.status(500).json({ error: err.message });
      }
    });

    // Check if file exists
    app.post("/checkIfFileExists", async (req, res) => {

      const fileName = path.join("data", req.body.fileName);
      try {

        await fs.access(fileName);
        res.json({ success: true });
      } catch (err) {
        res.json({ success: false });
      }
    });

    // Get current user info
    //app.get("/me", async (req, res) => {
    app.post("/me", async (req, res) => {

      console.log('req.session', req.session);
      if (req.session.user) {

        res.send(req.session.user);
      } else {

        res.status(401).send("Not logged in");
      }
    });

    // Requests for accounts
    //app.get("/accounts", async (req, res) => {
    app.post("/accounts", async (req, res) => {

      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          const condominiumId = Number(req.body.condominiumId);
          const fixedCost = req.body.fixedCost;

          try {

            let SQLquery =
              `
                SELECT * FROM accounts
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
              `;
            if (fixedCost === 'Y' || fixedCost === 'N') SQLquery += ` AND fixedCost = '${fixedCost}'`;
            console.log('SQLquery :', SQLquery);

            SQLquery +=
              `
                ORDER BY name ASC, accountId ASC;
              `;

            console.log('SQLquery :', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const accountId = req.body.accountId;
            const user = req.body.user;
            const fixedCost = req.body.fixedCost;

            const accountName = req.body.accountName;

            const SQLquery = `
            UPDATE accounts
            SET 
              user = '${user}',
              lastUpdate = '${lastUpdate}',
              name = '${accountName}',
              fixedCost = '${fixedCost}'
            WHERE accountId = ${accountId};`;
            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;
            const accountName = req.body.accountName;
            const fixedCost = req.body.fixedCost;

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

            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /accounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;

        }

        case 'delete': {

          try {

            const user = req.body.user;
            const accountId = req.body.accountId;

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

            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
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
    app.post("/users", async (req, res) => {

      const action = req.body.action;
      console.log('action :', action);
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          const condominiumId = Number(req.body.condominiumId);
          const resident = req.body.resident;
          try {

            let SQLquery = `
            SELECT * FROM users
              WHERE deleted <> 'Y'`;

            console.log('SQLquery: ', SQLquery);
            if (Number(condominiumId) !== nineNine) SQLquery += ` AND condominiumId = ${condominiumId}`;
            if (resident === 'Y' || resident === 'N') SQLquery += ` AND resident = '${resident}'`;

            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const resident = req.body.resident;
            const userId = req.body.userId;
            const user = req.body.user;

            const email = req.body.email;
            const condoId = req.body.condoId;
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const phone = req.body.phone;
            const securityLevel = req.body.securityLevel;
            let password = req.body.password;

            // Hash the password
            const saltRounds = 10;
            password = await bcrypt.hash(password, saltRounds);
            console.log('password :', password);

            const SQLquery =
              `
                UPDATE users
                SET
                  resident = '${resident}',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  email = '${email}',
                  condoId = ${condoId},
                  firstName = '${firstName}',
                  lastName = '${lastName}',
                  phone = '${phone}',
                  securityLevel = ${securityLevel},
                  password = '${password}'
                WHERE userId = ${userId};
              `;
            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const resident = req.body.resident;
            const user = req.body.user;

            const email = req.body.email;
            const condoId = req.body.condoId;
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const phone = req.body.phone;
            const securityLevel = req.body.securityLevel;
            const password = req.body.password;
            console.log('password :', password);

            // Insert new row
            const SQLquery =
              `
                INSERT INTO users(
                  deleted,
                  resident,
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
                  '${resident}',
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

            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          try {

            const user = req.body.user;

            const userId = req.body.userId;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /users:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        // validate user
        case 'validateUser': {

          console.log('validateUser');
          try {

            let isValid = false;

            const userId = req.body.userId;
            const password = req.body.password;

            // get password
            const SQLquery = `
            SELECT password FROM users
              WHERE 
                deleted = 'N'
              AND userId = ${userId};`;

            console.log('SQLquery :', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);

            console.log('Number of rows :', rows.length);
            if (rows.length === 1) isValid = true;
            console.log('valid 1:', isValid);
            //if (password === rows[0].password && isValid) isValid = true;
            if (isValid) {

              console.log('Password :', password);
              console.log('Password :', rows[0].password);
              console.log('Valid 2:', bcrypt.compare('12345', rows[0].password));
              isValid = await bcrypt.compare(password, rows[0].password);
              console.log('valid 3:', isValid);
              rows[0].password = (isValid) ? 'OK' : 'Not OK';

              // Send a JSON response to the client containing the data
              res.json(rows);
            }

          } catch (err) {

          }
          break;
        }
      }
    });

    // Requests for bank accounts
    //app.get("/bankaccounts", async (req, res) => {
    app.post("/bankaccounts", async (req, res) => {

      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {
          const condominiumId = Number(req.body.condominiumId);
          const bankAccountId = Number(req.body.bankAccountId);

          try {

            let SQLquery =
              `
                SELECT * FROM bankaccounts
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
              `;
            if (bankAccountId !== nineNine) SQLquery += `AND bankAccountId=${bankAccountId}`;

            SQLquery +=
              `
                ORDER BY bankAccountId;
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
          } catch (err) {

            console.log("Database error in /bankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const user = req.body.user;
            const bankAccount = req.body.bankAccount;
            const name = req.body.name;
            const openingBalance = req.body.openingBalance;
            const openingBalanceDate = req.body.openingBalanceDate;
            const closingBalance = req.body.closingBalance;
            const closingBalanceDate = req.body.closingBalanceDate;
            const bankAccountId = req.body.bankAccountId;

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
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;

            const bankAccount = req.body.bankAccount;
            const name = req.body.name;
            const openingBalanceDate = req.body.openingBalanceDate;
            const openingBalance = req.body.openingBalance;
            const closingBalanceDate = req.body.closingBalanceDate;
            const closingBalance = req.body.closingBalance;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
          } catch (err) {

            console.log("Database error in /bankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          try {

            const user = req.body.user;

            const bankAccountId = req.body.bankAccountId;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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
    //app.get("/condominiums", async (req, res) => {
    app.post("/condominiums", async (req, res) => {


      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          try {

            const SQLquery =
              `
                SELECT * FROM condominiums
                  WHERE deleted <> 'Y'
                ORDER BY condominiumId;
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;

            const name = req.body.name;
            const street = req.body.street;
            const address2 = req.body.address2;
            const postalCode = req.body.postalCode;
            const city = req.body.city;
            const phone = req.body.phone;
            const email = req.body.email;
            const incomeRemoteHeatingAccountId = req.body.incomeRemoteHeatingAccountId;
            const paymentRemoteHeatingAccountId = req.body.paymentRemoteHeatingAccountId;
            const commonCostAccountId = req.body.commonCostAccountId;
            const organizationNumber = req.body.organizationNumber;
            const importFileName = req.body.importFileName;

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
                  importFileName = '${importFileName}'
                WHERE condominiumId = ${condominiumId};
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery :', SQLquery);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const user = req.body.user;

            const name = req.body.name;
            const street = req.body.street;
            const address2 = req.body.address2;
            const postalCode = req.body.postalCode;
            const city = req.body.city;
            const phone = req.body.phone;
            const email = req.body.email;
            const incomeRemoteHeatingAccountId = req.body.incomeRemoteHeatingAccountId;
            const paymentRemoteHeatingAccountId = req.body.paymentRemoteHeatingAccountId;
            const commonCostAccountId = req.body.commonCostAccountId;
            const organizationNumber = req.body.organizationNumber;
            const importFileName = req.body.importFileName;

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
                  importFileName
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
                  '${importFileName}'
                );
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery :', SQLquery);
          } catch (err) {

            console.log("Database error in /condominiums:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          try {

            const user = req.body.user;

            const condominiumId = req.body.condominiumId;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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
    //app.get("/budgets", async (req, res) => {
    app.post("/budgets", async (req, res) => {


      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          try {

            const condominiumId = req.body.condominiumId;
            const year = Number(req.body.year);
            const accountId = Number(req.body.accountId);

            let SQLquery =
              `
                SELECT * FROM budgets
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
              `;

            if (year !== nineNine) {
              SQLquery +=
                `
                  AND year = ${year}
                `;
            }
            if (accountId !== nineNine) {
              SQLquery +=
                `
                  AND accountId = ${accountId}
                `;
            }

            SQLquery += `
              ORDER BY year,accountId;
            `;
            const [rows] = await mySqlDB.query(SQLquery);

            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const budgetId = req.body.budgetId;
            const user = req.body.user;
            const accountId = req.body.accountId;
            const amount = req.body.amount;
            const year = req.body.year;
            const text = req.body.text;

            // Update row
            const SQLquery =
              `
                UPDATE budgets
                SET
                  user = '${user}', 
                  lastUpdate = '${lastUpdate}',
                  accountId = ${accountId},
                  amount = ${amount},
                  year = ${year},
                  text = '${text}'
                WHERE budgetId = ${budgetId};
              `;

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;

            const accountId = req.body.accountId;
            const amount = req.body.amount;
            const year = req.body.year;
            const text = req.body.text;

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
                  year,
                  text
                  ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  ${accountId},
                  ${amount},
                  ${year},
                  '${text}'
                );
              `;

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /budgets:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          try {

            const budgetId = req.body.budgetId;
            const user = req.body.user;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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
    //app.get("/dues", async (req, res) => {
    app.post("/dues", async (req, res) => {

      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          try {
            const condominiumId = req.body.condominiumId;
            const accountId = Number(req.body.accountId);
            const condoId = Number(req.body.condoId);
            const fromDate = Number(req.body.fromDate);
            const toDate = Number(req.body.toDate);

            let SQLquery =
              `
                SELECT * FROM dues
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
              `;

            if (fromDate !== nineNine) {
              SQLquery +=
                `
                  AND date BETWEEN ${fromDate} AND ${toDate}
                `;
            }

            if (condoId !== nineNine) {
              SQLquery +=
                `
                  AND condoId = ${condoId}
                `;
            }

            if (accountId !== nineNine) {
              SQLquery +=
                `
                  AND accountId = ${accountId}
                `;
            }

            SQLquery +=
              `
                ORDER BY condoId, date DESC;
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
          } catch (err) {

            console.log("Database error in /dues:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const dueId = req.body.dueId;
            const user = req.body.user;
            const condoId = req.body.condoId;
            const accountId = req.body.accountId;
            const amount = req.body.amount;
            const date = req.body.date;
            const kilowattHour = req.body.kilowattHour;
            const text = req.body.text;

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
                  kilowattHour = ${kilowattHour}
                  text = '${text}'
                WHERE dueId = ${dueId};
              `;
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery: ', SQLquery);
          } catch (err) {

            console.log("Database error in /dues:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;
            const condoId = req.body.condoId;
            const accountId = req.body.accountId;
            const amount = req.body.amount;
            const date = req.body.date;
            const kilowattHour = req.body.kilowattHour;
            const text = req.body.text;

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
                  kilowattHour,
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
                  ${kilowattHour},
                  '${text}'
                );
              `;

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /dues:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'delete': {

          try {

            const dueId = req.body.dueId;
            const user = req.body.user;


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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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
    //app.get("/condo", async (req, res) => {
    app.post("/condo", async (req, res) => {

      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          try {

            const condominiumId = Number(req.body.condominiumId);

            const SQLquery =
              `
                SELECT * FROM condo
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY condoId;
              `;
            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);

          } catch (err) {

            console.log("Database error in /condo:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const condoId = req.body.condoId;
            console.log('condoId: ', condoId);
            const user = req.body.user;
            const name = req.body.name;
            const street = req.body.street;
            const address2 = req.body.address2;
            const postalCode = req.body.postalCode;
            const city = req.body.city;
            const squareMeters = req.body.squareMeters;

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

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery:', SQLquery);
          } catch (err) {

            console.log("Database error in /condo:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;
            const name = req.body.name;
            const street = req.body.street;
            const address2 = req.body.address2;
            const postalCode = req.body.postalCode;
            const city = req.body.city;
            const squareMeters = req.body.squareMeters;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /condo:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;

        }

        case 'delete': {

          try {

            const user = req.body.user;

            const condoId = req.body.condoId;
            console.log('condoId: ', condoId);

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

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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
    //app.get("/userbankaccounts", async (req, res) => {
    app.post("/userbankaccounts", async (req, res) => {


      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          const condominiumId = Number(req.body.condominiumId);
          const userId = Number(req.body.userId);
          const accountId = Number(req.body.accountId);

          try {
            let SQLquery =
              `
                SELECT * FROM userbankaccounts
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
               `;
            if (userId !== nineNine) {
              SQLquery +=
                `
                  AND userId = ${userId}
                `;
            }
            if (accountId !== nineNine) {
              SQLquery += `
                  AND accountId = ${accountId}
                `;
            }
            SQLquery += `
                ORDER BY name;
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
            console.log('SQLquery :', SQLquery);
          } catch (err) {

            console.log("Database error in /userbankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const user = req.body.user;
            const userId = req.body.userId;
            const accountId = req.body.accountId;
            const bankAccount = req.body.bankAccount;
            const userBankAccountId = req.body.userBankAccountId;

            // Update user bank account table
            const SQLquery =
              `
                UPDATE userBankAccounts
                SET 
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  userId = ${userId},
                  accountId = ${accountId},
                  bankAccount = '${bankAccount}'
                WHERE userBankAccountId = ${userBankAccountId};
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /userbankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;

            const userId = req.body.userId;
            const accountId = req.body.accountId;
            const bankAccount = req.body.bankAccount;

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
                  '',
                  '${bankAccount}'
                );
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /userbankaccounts:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }

        case 'delete': {

          try {

            const user = req.body.user;
            const userBankAccountId = req.body.userBankAccountId;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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
    //app.get("/suppliers", async (req, res) => {
    app.post("/suppliers", async (req, res) => {


      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          const condominiumId = Number(req.body.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM suppliers
                WHERE condominiumId = ${condominiumId}
                  AND deleted <> 'Y'
                ORDER BY supplierId;
              `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /suppliers:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const supplierId = req.body.supplierId;
            const user = req.body.user;
            const name = req.body.name;
            const street = req.body.street;
            const address2 = req.body.address2;
            const postalCode = req.body.postalCode;
            const city = req.body.city;
            const email = req.body.email;
            const phone = req.body.phone;
            const bankAccount = req.body.bankAccount;
            const accountId = req.body.accountId;
            const amountAccountId = req.body.amountAccountId;
            const amount = req.body.amount;
            const text = req.body.text;
            const textAccountId = req.body.textAccountId;

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
                  amount = ${amount},
                  amountAccountId = ${amountAccountId},
                  text = '${text}',
                  textAccountId = ${textAccountId}
                WHERE supplierId = ${supplierId};
              `;
            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /suppliers:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;
            const email = req.body.email;
            const name = req.body.name;
            const street = req.body.street;
            const address2 = req.body.address2;
            const postalCode = req.body.postalCode;
            const city = req.body.city;
            const phone = req.body.phone;
            const bankAccount = req.body.bankAccount;
            const accountId = req.body.accountId;
            const amount = req.body.amount;
            const amountAccountId = req.body.amountAccountId;
            const text = req.body.text;
            const textAccountId = req.body.textAccountId;

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
                  ${accountId},
                  ${amount},
                  ${amountAccountId},
                  '${text}',
                  ${textAccountId}
                );
              `;
            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /suppliers:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }

        case 'delete': {
          try {

            const user = req.body.user;

            const supplierId = req.body.supplierId.trim();

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

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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
    //app.get("/bankaccounttransactions", async (req, res) => {
    app.post("/bankaccounttransactions", async (req, res) => {

      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {

          const orderBy = req.body.orderBy;
          const condominiumId = Number(req.body.condominiumId);
          const deleted = req.body.deleted;
          const condoId = Number(req.body.condoId);
          const accountId = Number(req.body.accountId);
          const amount = Number(req.body.amount);
          const fromDate = Number(req.body.fromDate);
          const toDate = Number(req.body.toDate);

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
            if (condoId !== nineNine) {
              SQLquery +=
                `
                  AND condoId = ${condoId}
                `;
            }
            if (accountId !== nineNine) {
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

            if (orderBy) {

              SQLquery +=
                `
                ORDER BY ${orderBy};
              `;

            } else {

              SQLquery +=
                `
                  ORDER BY date DESC, income DESC;
                `;
            }

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'update': {

          try {

            const user = req.body.user;

            const condoId = req.body.condoId;
            const accountId = req.body.accountId;
            const income = req.body.income;
            const payment = req.body.payment;
            const kilowattHour = req.body.kilowattHour;
            const date = req.body.date;
            const text = req.body.text;
            const bankAccountTransactionId = req.body.bankAccountTransactionId;

            // Update bank account transactions table
            const SQLquery =
              `
                UPDATE bankaccounttransactions
                SET
                  deleted = 'N',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}',
                  condoId = ${condoId},
                  accountId = ${accountId},
                  income = ${income},
                  payment = ${payment},
                  kilowattHour = ${kilowattHour},
                  date = ${date},
                  text = '${text}'
                WHERE bankAccountTransactionId = ${bankAccountTransactionId};
            `;

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }
          break;
        }

        case 'insert': {

          try {

            const condominiumId = req.body.condominiumId;
            const user = req.body.user;

            const condoId = req.body.condoId;
            const accountId = req.body.accountId;
            const income = req.body.income;
            const payment = req.body.payment;
            const kilowattHour = req.body.kilowattHour;
            const date = req.body.date;
            const text = req.body.text;

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
                  kilowattHour,
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
                  ${kilowattHour},
                  ${date},
                  '${text}'
                );
              `;

            console.log('SQLquery: ', SQLquery);
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }

        case 'delete': {

          try {

            const user = req.body.user;

            const bankAccountTransactionId = req.body.bankAccountTransactionId;

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

            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
            res.json(rows);
          } catch (err) {

            console.log("Database error in /bankaccounttransactions:", err.message);
            res.status(500).json({ error: err.message });
          }

          break;
        }
      }
    });

    //app.get("/import-csvFile", async (req, res) => {
    app.post("/import-csvFile", async (req, res) => {

      console.log('import-csvFile');
      try {

        const csvFileName = req.body.csvFileName;
        console.log('csvFileName :', csvFileName);
        const data = await fs.readFile(csvFileName, "utf8");
        console.log('data :', data);
        res.json({ content: data });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Requests for menu
    //app.get("/menu", async (req, res) => {
    app.post("/menu", async (req, res) => {

      const action = req.body.action;
      const lastUpdate = today.toISOString();

      switch (action) {

        case 'select': {
          const condominiumId = Number(req.body.condominiumId);

          try {

            const SQLquery =
              `
                SELECT * FROM menu
                  WHERE deleted <> 'Y'
                ORDER BY menuId;
              `;
            const [rows] = await mySqlDB.query(SQLquery);
            // Send a JSON response to the client containing the data
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

  // Requests for remoteheatings table
  //app.get("/remoteheatings", async (req, res) => {
  app.post("/remoteheatings", async (req, res) => {

    const action = req.body.action;
    const lastUpdate = today.toISOString();

    switch (action) {

      case 'select': {

        try {

          const condominiumId = req.body.condominiumId;
          const year = Number(req.body.year);
          const condoId = Number(req.body.condoId);

          let SQLquery = `SELECT * FROM remoteheatings WHERE condominiumId = ${condominiumId} AND deleted <> 'Y'`;

          if (year !== nineNine) SQLquery += ` AND year = ${year}`;
          if (condoId !== nineNine) SQLquery += ` AND condoId = ${condoId}`;
          SQLquery += ` ORDER BY year,condoId;`;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatings:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'update': {

        try {

          const remoteHeatingId = req.body.remoteHeatingId;
          const user = req.body.user;
          const condoId = req.body.condoId;
          const year = req.body.year;
          const date = req.body.date;
          const kilowattHour = req.body.kilowattHour;
          const priceYear = req.body.priceYear;

          // Update row
          const SQLquery =
            `
              UPDATE remoteheatings
              SET
                user = '${user}', 
                lastUpdate = '${lastUpdate}',
                condoId = ${condoId},
                year = ${year},
                date = ${date},
                kilowattHour = ${kilowattHour},
                priceYear = ${priceYear}
              WHERE remoteHeatingId = ${remoteHeatingId};
            `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatings:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'insert': {

        try {

          const user = req.body.user;
          const condominiumId = req.body.condominiumId;
          const condoId = req.body.condoId;
          const year = req.body.year;
          const date = req.body.date;
          const kilowattHour = req.body.kilowattHour;
          const priceYear = req.body.priceYear;

          // Insert new row
          const SQLquery =
            `
                INSERT INTO remoteheatings (
                  deleted,
                  condominiumId,
                  user,
                  lastUpdate,
                  condoId,
                  year,
                  date,
                  kilowattHour,
                  priceYear
                  ) VALUES (
                  'N',
                  ${condominiumId},
                  '${user}',
                  '${lastUpdate}',
                  ${condoId},
                  ${year},
                  ${date},
                  ${kilowattHour},
                  ${priceYear}
                );
              `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatings:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'delete': {

        try {

          const remoteHeatingId = req.body.remoteHeatingId;
          const user = req.body.user;

          // Delete table
          const SQLquery =
            `
                UPDATE remoteheatings
                SET 
                  deleted = 'Y',
                  user = '${user}',
                  lastUpdate = '${lastUpdate}'
                WHERE remoteHeatingId = ${remoteHeatingId};
              `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatings:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }
    }
  });

  // Requests for remoteheatingprices table
  //app.get("/remoteheatingprices", async (req, res) => {
  app.post("/remoteheatingprices", async (req, res) => {

    const action = req.body.action;
    const lastUpdate = today.toISOString();

    switch (action) {

      case 'select': {

        try {

          const condominiumId = req.body.condominiumId;

          let SQLquery = `SELECT * FROM remoteheatingprices WHERE condominiumId = ${condominiumId} AND deleted <> 'Y'`;
          SQLquery += ` ORDER BY year;`;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatingprices:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'update': {

        try {

          const remoteHeatingPriceId = req.body.remoteHeatingPriceId;
          const user = req.body.user;
          const year = req.body.year;
          const priceKilowattHour = req.body.priceKilowattHour;

          // Update row
          const SQLquery =
            `
              UPDATE remoteheatingprices
              SET
                user = '${user}', 
                lastUpdate = '${lastUpdate}',
                year = ${year},
                priceKilowattHour = ${priceKilowattHour}
              WHERE remoteHeatingPriceId = ${remoteHeatingPriceId};
            `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatingprices:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'insert': {

        try {

          const user = req.body.user;
          const condominiumId = req.body.condominiumId;
          const year = req.body.year;
          const priceKilowattHour = req.body.priceKilowattHour;

          // Insert new row
          const SQLquery =
            `
              INSERT INTO remoteheatingprices (
                deleted,
                condominiumId,
                user,
                lastUpdate,
                year,
                priceKilowattHour
                ) VALUES (
                'N',
                ${condominiumId},
                '${user}',
                '${lastUpdate}',
                ${year},
                ${priceKilowattHour}
              );
            `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatingprices:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'delete': {

        try {

          const remoteHeatingPriceId = req.body.remoteHeatingPriceId;
          const user = req.body.user;

          // Delete table
          const SQLquery =
            `
              UPDATE remoteheatingprices
              SET 
                deleted = 'Y',
                user = '${user}',
                lastUpdate = '${lastUpdate}'
              WHERE remoteHeatingPriceId = ${remoteHeatingPriceId};
            `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /remoteheatingprices:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }
    }
  });

  // Requests for commoncosts table
  //app.get("/commoncosts", async (req, res) => {
  app.post("/commoncosts", async (req, res) => {

    const action = req.body.action;
    const lastUpdate = today.toISOString();

    switch (action) {

      case 'select': {

        try {

          const condominiumId = req.body.condominiumId;

          let SQLquery = `SELECT * FROM commoncosts WHERE condominiumId = ${condominiumId} AND deleted <> 'Y'`;
          SQLquery += ` ORDER BY year;`;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /commoncosts:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'update': {

        try {

          const commonCostId = req.body.commonCostId;
          const user = req.body.user;
          const year = req.body.year;
          const commonCostSquareMeter = req.body.commonCostSquareMeter;
          const fixedCostCondo = req.body.fixedCostCondo;

          // Update row
          const SQLquery =
            `
              UPDATE commoncosts
              SET
                user = '${user}', 
                lastUpdate = '${lastUpdate}',
                year = ${year},
                commonCostSquareMeter = ${commonCostSquareMeter},
                fixedCostCondo = ${fixedCostCondo}
              WHERE commonCostId = ${commonCostId};
            `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /commoncosts:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'insert': {

        try {

          const user = req.body.user;
          const condominiumId = req.body.condominiumId;
          const year = req.body.year;
          const commonCostSquareMeter = req.body.commonCostSquareMeter;
          const fixedCostCondo = req.body.fixedCostCondo;

          // Insert new row
          const SQLquery =
            `
              INSERT INTO commoncosts (
                deleted,
                condominiumId,
                user,
                lastUpdate,
                year,
                commonCostSquareMeter,
                fixedCostCondo
                ) VALUES (
                'N',
                ${condominiumId},
                '${user}',
                '${lastUpdate}',
                ${year},
                ${commonCostSquareMeter},
                ${fixedCostCondo}
              );
            `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /commoncosts:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }

      case 'delete': {

        try {

          const remoteHeatingPriceId = req.body.remoteHeatingPriceId;
          const user = req.body.user;

          // Delete table
          const SQLquery =
            `
              UPDATE commoncosts
              SET 
                deleted = 'Y',
                user = '${user}',
                lastUpdate = '${lastUpdate}'
              WHERE remoteHeatingPriceId = ${remoteHeatingPriceId};
            `;

          console.log('SQLquery: ', SQLquery);
          const [rows] = await mySqlDB.query(SQLquery);
          // Send a JSON response to the client containing the data
          res.json(rows);
        } catch (err) {

          console.log("Database error in /commoncosts:", err.message);
          res.status(500).json({ error: err.message });
        }
        break;
      }
    }
  });
}