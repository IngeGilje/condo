// Create tables for condos database

// Activate classes
const today = 
  new Date();

// 1 condominium
const createCondominiumTable =
  false;

// 2 Condo
const createCondoTable =
  false;

// 3 Bank account
const createBankAccountTable =
  false;

// 4 Account
const createAccountTable =
  false;

// 5 user
const createUserTable =
  false;

// 6 user bank account
const createUserBankAccountTable =
  false;

// 7 supplier
const createSupplierTable =
  false;

/*
// 8 budget period
const createBudgetperiodTable =
  false;
*/

/*
// 9 Income
const createIncomeTable =
  false;
*/

// 10 Due
const createDueTable =
  false;

// 11 Budget
const createBudgetTable =
  false;

// 12 Bank account transactions
const createBankAccountTransactionTable =
  false;

// Activate Account class
const objUser
 = new User('user');

// Connection to a server
socket = connectingToServer();

let isEventsCreated
 = false;

const lastUpdate
 = today.toISOString();

// Send a message to the server
socket.onopen = () => {

  let SQLquery = "";

  deleteAllTables();

  createAllTables();
}

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

function deleteAllTables() {

  // 12 Bank account transactions
  if (createBankAccountTransactionTable) {

    console.log('DROP bankaccounttransaction Table');
    SQLquery =
      `
        DROP TABLE bankaccounttransaction;
      `;
    updateMySql(SQLquery, 'bankaccounttransaction', 'DROP');
  }

  // 11 Budget
  if (createBudgetTable) {
    console.log('DROP budget Table');
    SQLquery =
      `
      DROP TABLE budget;
    `;
    updateMySql(SQLquery, 'budget', 'DROP');
  }

  // 10 Due
  if (createDueTable) {
    console.log('DROP due Table');
    SQLquery =
      `
      DROP TABLE due; 
    `;
    updateMySql(SQLquery, 'due', 'DROP');
  }

  /*
  // 9 Income
  if (createIncomeTable) {
    console.log('DROP income Table');
    SQLquery =
      `
      DROP TABLE income;
    `;
    socket.send(SQLquery);
  */


  /*
  // 8 budget period
  if (createBudgetperiodTable) {
    console.log('DROP budgetPeriod Table');
    SQLquery =
      `
      DROP TABLE budgetPeriod;
    `;
    socket.send(SQLquery);
  }
  */

  // 7 supplier
  if (createSupplierTable) {
    console.log('DROP supplier Table');
    SQLquery =
      `
      DROP TABLE supplier;
    `;
    updateMySql(SQLquery, 'supplier', 'DROP');
  }

  // 6 user bank account
  if (createUserBankAccountTable) {
    console.log('DROP userbankaccount Table');
    SQLquery =
      `
      DROP TABLE userbankaccount;
    `;
    updateMySql(SQLquery, 'userbankaccount', 'DROP');
  }

  // 5 user
  if (createUserTable) {
    console.log('DROP user Table');
    SQLquery =
      `
      DROP TABLE user;
    `;
    updateMySql(SQLquery, 'user', 'DROP');
  }

  // 4 Account
  if (createAccountTable) {
    console.log('DROP account Table');
    SQLquery =
      `
      DROP TABLE account;
    `;
    updateMySql(SQLquery, 'account', 'DROP');
  }

  // 3 Bank account
  if (createBankAccountTable) {
    console.log('DROP bankaccount Table');
    SQLquery =
      `
      DROP TABLE bankaccount;
    `;
    updateMySql(SQLquery, 'bankaccount', 'DROP');
  }

  // 2 Condo
  if (createCondoTable) {
    console.log('DROP condo Table');
    SQLquery =
      `
      DROP TABLE condo;
    `;
    updateMySql(SQLquery, 'condo', 'DROP');
  }

  // 1 condominium
  if (createCondominiumTable) {
    console.log('DROP condominium Table');
    SQLquery =
      `
        DROP TABLE condominium;
      `;
    updateMySql(SQLquery, 'condominium', 'DROP');
  }
}

function createAllTables() {

  // 1 condominium
  if (createCondominiumTable) {
    console.log('CREATE condominium Table');
    SQLquery =
      `
      CREATE TABLE condominium (
        deleted VARCHAR(1),
        condominiumId INT AUTO_INCREMENT PRIMARY KEY,
        user VARCHAR (50),
        lastUpdate VARCHAR (40),
        name VARCHAR(50) NOT NULL,
        street VARCHAR(50) NOT NULL,
        address2 VARCHAR(50),
        postalCode VARCHAR(4) NOT NULL,
        city VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(50),
        accountId INT,
        organizationNumber VARCHAR(9),
        importFileName VARCHAR(50)
      );
    `;
    updateMySql(SQLquery, 'condominium', 'CREATE');
  }

  // 2 Condo
  if (createCondoTable) {
    console.log('CREATE condo Table');
    SQLquery =
      `         
      CREATE TABLE condo (
        deleted VARCHAR(1),
        condoId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        name VARCHAR(50) NOT NULL,
        street VARCHAR(50) NOT NULL,
        address2 VARCHAR(50),
        postalCode VARCHAR(4) NOT NULL,
        city VARCHAR(50) NOT NULL,
        squareMeters VARCHAR(5) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'condo', 'CREATE');
  }

  // 3 Bank account
  if (createBankAccountTable) {
    console.log('CREATE bankaccount Table');
    SQLquery =
      `         
      CREATE TABLE bankaccount (
        deleted VARCHAR(1),
        bankAccountId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VARCHAR (40),
        bankAccount VARCHAR(11) NOT NULL,
        name VARCHAR(50) NOT NULL,
        openingBalance VARCHAR (10),
        openingBalanceDate VARCHAR (10),
        closingBalance VARCHAR (10),
        closingBalanceDate VARCHAR (10),
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'bankaccount', 'CREATE');
  }

  // 4 Account
  if (createAccountTable) {
    console.log('CREATE account Table');
    SQLquery =
      `
      CREATE TABLE account(
        deleted VARCHAR(1),
        accountId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR(50),
        lastUpdate VarChar(40),
        name VARCHAR(50) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'account', 'CREATE');
  }

  // 5 user
  if (createUserTable) {
    console.log('CREATE user Table');
    SQLquery =
      `         
      CREATE TABLE user (
        deleted VARCHAR(1),
        userId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR(50) NOT NULL,
        lastUpdate VARCHAR (40),
        email VARCHAR(50) NOT NULL,
        condoId INT,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        securityLevel INT,
        password VARCHAR(50) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (condoId) REFERENCES condo(condoId)
      );
    `;
    updateMySql(SQLquery, 'user', 'CREATE');
  }

  // 6 user bank account
  if (createUserBankAccountTable) {
    console.log('CREATE userbankaccount Table');
    SQLquery =
      `         
      CREATE TABLE userbankaccount (
        deleted VARCHAR(1),
        userBankAccountId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR(50) NOT NULL,
        lastUpdate VARCHAR (40),
        userId INT,
        accountId INT,
        name VARCHAR(50) NOT NULL,
        bankAccount VARCHAR(11) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (userId) REFERENCES user(userId),
        FOREIGN KEY (accountId) REFERENCES account(accountId)
      );
    `;
    updateMySql(SQLquery, 'userbankaccount', 'CREATE');
  }

  // 7 supplier
  if (createSupplierTable) {
    console.log('CREATE supplier Table');
    SQLquery =
      `         
      CREATE TABLE supplier (
        deleted VARCHAR(1),
        supplierId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR(50) NOT NULL,
        lastUpdate VARCHAR (40),
        name VARCHAR(50) NOT NULL,
        street VARCHAR(50) NOT NULL,
        address2 VARCHAR(50),
        postalCode VARCHAR(4) NOT NULL,
        city VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        bankAccount VARCHAR(11),
        accountId INT,
        amountAccountId INT,
        amount VARCHAR(10),
        FOREIGN KEY (accountId) REFERENCES account(accountId),
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'supplier', 'CREATE');
  }

/*
 // 8 budget period
  if (createBudgetPeriodTable) {
    console.log('CREATE budget period Table');
    SQLquery =
      `         
      CREATE TABLE budgetperiod (
        deleted VARCHAR(1),
        budgetPeriodId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR(50) NOT NULL,
        lastUpdate VARCHAR (40),
        year VARCHAR(4) NOT NULL,
        fromDate VARCHAR(8) NOT NULL,
        toDate VARCHAR(8) NOT NULL,
      FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'budgetperiod', 'CREATE');
  }
*/

  // 10 Due
  if (createDueTable) {
    console.log('CREATE due Table');
    SQLquery =
      `         
      CREATE TABLE due (
        deleted VARCHAR(1),
        dueId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        condoId INT,
        accountId INT,
        amount VARCHAR(10) NOT NULL,
        date VARCHAR(10) NOT NULL,
        text VARCHAR (255) NOT NULL,
        FOREIGN KEY (condoId) REFERENCES condo(condoId),
        FOREIGN KEY (accountId) REFERENCES account(accountId),
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'due', 'CREATE');
  }

  // 11 Budget
  if (createBudgetTable) {
    console.log('CREATE budget Table');
    SQLquery =
      `
      CREATE TABLE budget(
        deleted VARCHAR(1),
        budgetId INT AUTO_INCREMENT PRIMARY KEY,
        condominiumId INT,
        user VARCHAR(50),
        lastUpdate VarChar(40),
        accountId INT,
        amount VARCHAR(10) NOT NULL,
        year VARCHAR(4) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (accountId) REFERENCES account(accountId)
      );
    `;
    updateMySql(SQLquery, 'budget', 'CREATE');
  }

  // 12 Bank account transactions
  if (createBankAccountTransactionTable) {
    console.log('CREATE bankaccounttransaction Table');
    SQLquery =
      `         
      CREATE TABLE bankaccounttransaction (
        deleted VARCHAR(1),
        bankAccountTransactionId INT AUTO_INCREMENT PRIMARY KEY,
        deleted VARCHAR(1),
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        condoId INT,
        accountId INT,
        income VARCHAR(10) NOT NULL,
        payment VARCHAR(10) NOT NULL,
        numberKWHour VARCHAR(10) NOT NULL,
        date VARCHAR(10) NOT NULL,
        text VARCHAR (255) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'bankaccounttransaction', 'CREATE');
  }
}