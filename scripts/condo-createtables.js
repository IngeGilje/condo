// Create tables for condos database

// Activate classes
const now = new Date();

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
// 8 payment
const createPaymentTable =
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

// 12 Bank account movement
const createBankAccountMovementTable =
  false;

// Activate Account class
const objUser
 = new User('user');

// Connection to a server
socket = connectingToServer();

let isEventsCreated
 = false;

const lastUpdate
 = now.toISOString();

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

  // 12 Bank account movement
  if (createBankAccountMovementTable) {

    console.log('DROP bankaccountmovement Table');
    SQLquery =
      `
        DROP TABLE bankaccountmovement;
      `;
    updateMySql(SQLquery, 'bankaccountmovement', 'DROP');
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
  // 8 payment
  if (createPaymentTable) {
    console.log('DROP payment Table');
    SQLquery =
      `
      DROP TABLE payment;
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
        condominiumId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50),
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
        importPath VARCHAR(50)
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
        condoId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50),
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        name VARCHAR(50) NOT NULL,
        street VARCHAR(50) NOT NULL,
        address2 VARCHAR(50),
        postalCode VARCHAR(4) NOT NULL,
        city VARCHAR(50) NOT NULL,
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
        bankAccountId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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
        accountId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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
        userId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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
        userBankAccountId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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
        supplierId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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
        account2Id INT,
        amount VARCHAR(10),
        FOREIGN KEY (accountId) REFERENCES account(accountId),
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    updateMySql(SQLquery, 'supplier', 'CREATE');
  }

  /*
  // 8 payment
  if (createPaymentTable) {
    console.log('CREATE payment Table');
    SQLquery =
      `         
      CREATE TABLE payment (
        paymentId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        accountId INT,
        amount VARCHAR(10) NOT NULL,
        numberKWHour VARCHAR(10),
        date VARCHAR(10) NOT NULL,
        text VARCHAR (255) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (accountId) REFERENCES account(accountId)
      );
    `;
    socket.send(SQLquery);
  }
  */

  /*
  // 9 Income
  if (createIncomeTable) {
    console.log('CREATE income Table');
    SQLquery =
      `         
      CREATE TABLE income (
        incomeId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        condoId INT,
        accountId INT,
        amount VARCHAR(10) NOT NULL,
        date VARCHAR(10) NOT NULL,
        text VARCHAR (255) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
    socket.send(SQLquery);
  }
  */

  // 10 Due
  if (createDueTable) {
    console.log('CREATE due Table');
    SQLquery =
      `         
      CREATE TABLE due (
        dueId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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
        budgetId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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

  // 12 Bank account movement
  if (createBankAccountMovementTable) {
    console.log('CREATE bankaccountmovement Table');
    SQLquery =
      `         
      CREATE TABLE bankaccountmovement (
        bankAccountMovementId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
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
    updateMySql(SQLquery, 'bankaccountmovement', 'CREATE');
  }
}


function insertRowAllTables() {

  // 1 condominium
  if (createCondominiumTable) {
    console.log('INSERT condominium Table');
    SQLquery =
      `
      INSERT INTO condominium (
        tableName,
        user,
        lastUpdate,
        name,
        street,
        address2,
        postalCode,
        city,
        phone,
        email,
        accountId,
        organizationNumber,
        importPath
      )
      VALUES (
        'condominium',
        'superuser@ingegilje.no',
        '${lastUpdate}',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        0,
        '',
        ''
      );
    `;
    updateMySql(SQLquery, 'condoinium', 'INSERT');
  }

  // 2 Condo
  if (createCondoTable) {
    console.log('INSERT condo Table');
    SQLquery =
      `         
      INSERT INTO condo (
        tableName,
        condominiumId,
        user,
        lastUpdate,
        name,
        street,
        address2,
        postalCode,
        city
      )
      VALUES (
        'condo',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        '',
        '',
        '',
        '',
        ''
      );
    `;
    updateMySql(SQLquery, 'condo', 'INSERT');
  }

  // 3 Bank account
  if (createBankAccountTable) {
    console.log('INSERT bankaccount Table');
    SQLquery =
      `         
      INSERT INTO bankaccount(
        tableName,
        condominiumId,
        user,
        lastUpdate,
        bankAccount,
        name,
        openingBalance, 
        openingBalanceDate,
        closingBalance, 
        closingBalanceDate
      )
      VALUES(
        'bankaccount',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        '',
        '',
        '',
        '',
        '',
        ''
      );
    `;
    updateMySql(SQLquery, 'bankaccount', 'INSERT');
  }

  // 4 Account
  if (createAccountTable) {
    console.log('INSERT account Table');
    SQLquery =
      `
      INSERT INTO account(
        tableName,
        condominiumId,
        user,
        lastUpdate,
        name
      )
      VALUES(
        'account',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        ''
      );
    `;
    updateMySql(SQLquery, 'account', 'INSERT');
  }

  // 5 user
  if (createUserTable) {
    console.log('INSERT user Table');
    SQLquery =
      `         
      INSERT INTO user(
        tableName,
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
      VALUES (
        'user',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        'superuser@ingegilje.no',
        1,
        'Super',
        'User',
        '',
        9,
        'superuser'
      );
    `;
    updateMySql(SQLquery, 'user', 'INSERT');
  }

  // 6 user bank account
  if (createUserBankAccountTable) {
    console.log('INSERT userbankaccount Table');
    SQLquery =
      `         
      INSERT INTO userbankaccount(
        tableName,
        condominiumId,
        user,
        lastUpdate,
        userId,
        accountId,
        name,
        bankAccount
      ) 
      VALUES (
        'userbankaccount',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        1,
        1,
        'Ugyldig bank nummer',
        '12345678901'
      );
    `;
    updateMySql(SQLquery, 'userbankaccount', 'INSERT');
  }

  // 7 supplier
  if (createSupplierTable) {
    console.log('INSERT supplier Table');
    SQLquery =
      `         
      INSERT INTO supplier(
        tableName,
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
        amount,
        accountId
      ) 
      VALUES (
        'supplier',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        'superuser@ingegilje.no',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        1
      );
    `;
    updateMySql(SQLquery, 'supplier', 'INSERT');
  }

  /*
  // 8 payment
  if (createPaymentTable) {
    console.log('INSERT payment Table');
    SQLquery =
      `         
      INSERT INTO payment (
        tableName,
        condominiumId,
        user,
        lastUpdate,
        accountId,
        amount,
        numberKWHour,
        date,
        text)
      VALUES (
        'payment',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        1, 
        '',
        '',
        '',
        ''
      );
    `;
    socket.send(SQLquery);
  }
  */

  /*
  // 9 Income
  if (createIncomeTable) {
    console.log('INSERT income Table');
    SQLquery =
      `         
      INSERT INTO income (
        tableName,
        condominiumId,
        user,
        lastUpdate,
        condoId,
        accountId,
        amount,
        date,
        text)
      VALUES (
        'income',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        1,
        1, 
        '',
        '',
        ''
      );
    `;
    socket.send(SQLquery);
  }
  */

  // 10 Due
  if (createDueTable) {
    console.log('INSERT due Table');
    SQLquery =
      `         
    INSERT INTO due (
      tableName,
      condominiumId,
      user,
      lastUpdate,
      condoId,
      accountId,
      amount,
      date,
      text)
    VALUES (
      'due',
      1,
      'superuser@ingegilje.no',
      '${lastUpdate}',
      1,
      1,
      '',
      '',
      ''
    );
  `;
    updateMySql(SQLquery, 'due', 'INSERT');
  }

  // 11 Budget
  if (createBudgetTable) {
    console.log('INSERT budget Table');
    SQLquery =
      `
    INSERT INTO budget(
      tableName,
      condominiumId,
      user,
      lastUpdate,
      accountId,
      amount,
      year(
      'budget',
      1,
      'superuser@ingegilje.no',
      '${lastUpdate}',
      1,
      '0',
      ''
    );
  `;
    updateMySql(SQLquery, 'budget', 'INSERT');
  }

  // 12 Bank account movement
  if (createBankAccountMovementTable) {
    console.log('INSERT bankaccountmovement Table');
    SQLquery =
      `         
      INSERT INTO bankaccountmovement(
        tableName,
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
      )
      VALUES(
        'bankaccountmovement',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        1,
        1,
        '',
        '',
        '',
        '',
        ''
      );
    `;
    updateMySql(SQLquery, 'bankaccountmovement', 'INSERT');
  }
}