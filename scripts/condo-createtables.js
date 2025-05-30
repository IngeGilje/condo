// Create tables for condos database

// Activate Account class
const objUser = new User('user');

// Connection to a server (node.js - condo-server-mysql.js)
let socket;
switch (objUser.serverStatus) {

  // Web server
  case 1: {
    socket = new WebSocket('ws://ingegilje.no:7000');
    break;
  }
  // Test web server/ local web server
  case 2: {
    socket = new WebSocket('ws://localhost:7000');
    break;
  }
  // Test server/ local test server
  case 3: {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const hostname = window.location.hostname || 'localhost';
    socket = new WebSocket(`${protocol}://${hostname}:6050`); break;
    break;
  }
  default:
    break;
}

let isEventsCreated = false;

const now = new Date();
const lastUpdate = now.toISOString();

// Send a message to the server
socket.onopen = () => {

  let SQLquery = "";

  deleteAllTables();

  createAllTables();

  insertRowAllTables(); 
}

// Handle errors
socket.onerror = (error) => {

  // Close socket on error and let onclose handle reconnection
  socket.close();
}

// Handle disconnection
socket.onclose = () => {
}

// Make events for condo
function condoEvents() {

  // Select condo
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-condo-condoId')) {
      showValues(Number(event.target.value));
    }
  });

  // New tables
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-createtables-new')) {
    }
  });

  // Delete tables
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-condo-delete')) {

      deleteTables()
    }
  });
}

function deleteAllTables() {

  // 10 Account movement
  console.log('DROP accountmovement Table');
  SQLquery =
    `
      DROP TABLE accountmovement;
    `;
  socket.send(SQLquery);

  // 9 Budget
  console.log('DROP budget Table');
  SQLquery =
    `
      DROP TABLE budget;
    `;
  socket.send(SQLquery);

  // 8 Due
  console.log('DROP due Table');
  SQLquery =
    `
      DROP TABLE due; 
    `;
  socket.send(SQLquery);

  // 7 Income
  console.log('DROP income Table');
  SQLquery =
    `
      DROP TABLE income;
    `;
  socket.send(SQLquery);

  // 6 Payment
  console.log('DROP payment Table');
  SQLquery =
    `
      DROP TABLE payment;
    `;
  socket.send(SQLquery);

  // 5 Account
  console.log('DROP account Table');
  SQLquery =
    `
      DROP TABLE account;
    `;
  socket.send(SQLquery);

  // 4 Bank account
  console.log('DROP bankaccount Table');
  SQLquery =
    `
      DROP TABLE bankaccount;
    `;
  socket.send(SQLquery);

   // 3 user
  console.log('DROP user Table');
  SQLquery =
    `
      DROP TABLE user;
    `;
  socket.send(SQLquery);

  // 2 Condo table
  console.log('DROP condo Table');
  SQLquery =
    `
      DROP TABLE condo;
    `;
  socket.send(SQLquery);

  // 1 condominium
  console.log('DROP condominium Table');
  SQLquery =
    `
      DROP TABLE condominium;
    `;
  socket.send(SQLquery);
}

function createAllTables() {

  // 1 condominium
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
        phoneNumber VARCHAR(20),
        email VARCHAR(50),
        organizationNumber VARCHAR(9)
      );
    `;
  socket.send(SQLquery);

  // 2 Condo table
  console.log('CREATE condo Table');
  SQLquery =
    `         
      CREATE TABLE condo (
        condoId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50),
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        condoName VARCHAR(50) NOT NULL,
        street VARCHAR(50) NOT NULL,
        address2 VARCHAR(50),
        postalCode VARCHAR(4) NOT NULL,
        city VARCHAR(50) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
  socket.send(SQLquery);

  // 3 user
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
  socket.send(SQLquery);

  // 4 Bank account
  console.log('CREATE bankaccount Table');
  SQLquery =
    `         
      CREATE TABLE bankaccount (
        bankAccountId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VARCHAR (40),
        bankAccountNumber VARCHAR(11) NOT NULL,
        name VARCHAR(50) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
  socket.send(SQLquery);

  // 5 Account
  console.log('CREATE account Table');
  SQLquery =
    `
      CREATE TABLE account(
        accountId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
        condominiumId INT,
        user VARCHAR(50),
        lastUpdate VarChar(40),
        bankAccountId INT,
        name VARCHAR(50) NOT NULL,
        accountType VARCHAR(1),
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (bankAccountId) REFERENCES bankAccount(bankAccountId)
      );
    `;
  socket.send(SQLquery);

  // 6 Payment
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

  // 7 Income
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
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (accountId) REFERENCES account(accountId),
        FOREIGN KEY (condoId) REFERENCES condo(condoId)
      );
    `;
  socket.send(SQLquery);

  // 8 Due
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
        amount VARCHAR(10) NOT NULL,
        date VARCHAR(10) NOT NULL,
        text VARCHAR (255) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (condoId) REFERENCES condo(condoId)
      );
    `;
  socket.send(SQLquery);

  // 9 Budget
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
        budget VARCHAR(10) NOT NULL,
        year VARCHAR(4) NOT NULL,
        text VARCHAR(255) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (accountId) REFERENCES account(accountId)
      );
    `;
  socket.send(SQLquery);

  // 10 Account movement
  console.log('CREATE accountmovement Table');
  SQLquery =
    `         
      CREATE TABLE accountmovement (
        accountMovementId INT AUTO_INCREMENT PRIMARY KEY,
        tableName VARCHAR(50) NOT NULL,
        condominiumId INT,
        user VARCHAR (50),
        lastUpdate VarChar (40),
        condoId INT,
        accountId INT,
        amount VARCHAR(10) NOT NULL,
        date VARCHAR(10) NOT NULL,
        text VARCHAR (255) NOT NULL,
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId),
        FOREIGN KEY (accountId) REFERENCES account(accountId),
        FOREIGN KEY (condoId) REFERENCES condo(condoId)
      );
    `;
  socket.send(SQLquery);
}

function insertRowAllTables() {

  // 1 condominium
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
        phoneNumber,
        email,
        organizationNumber
      )
      VALUES (
        'condominium',
        'Initiation',
        '${lastUpdate}',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // 2 Condo table
  console.log('INSERT condo Table');
  SQLquery =
    `         
      INSERT INTO condo (
        tableName,
        condominiumId,
        user,
        lastUpdate,
        condoName,
        street,
        address2,
        postalCode,
        city)
      VALUES (
        'condo',
        1,
        'Initiation',
        '${lastUpdate}',
        '',
        '',
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // 3 user
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
        password) 
      VALUES (
        'user',
        1,
        'superuser@ingegilje.no',
        '${lastUpdate}',
        'superuser@ingegilje.no',
        1,
        'Super',
        'User',
        '12345678',
        9,
        'superuser'
      );
    `;
  socket.send(SQLquery);

  // 4 Bank account
  console.log('INSERT bankaccount Table');
  SQLquery =
    `         
      INSERT INTO bankaccount(
        tableName,
        condominiumId,
        user,
        lastUpdate,
        bankAccountNumber,
        name)
      VALUES(
        'bankaccount',
        1,
        'Initiation',
        '${lastUpdate}',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // 5 Account
  console.log('INSERT account Table');
  SQLquery =
    `
      INSERT INTO account(
        tableName,
        condominiumId,
        user,
        lastUpdate,
        bankAccountId,
        name,
        accountType)
      VALUES(
        'account',
        1,
        'Initiation',
        '${lastUpdate}',
        1,
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // 6 Payment
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
        'Initiation',
        '${lastUpdate}',
        1, 
        '',
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // 7 Income
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
        'Initiation',
        '${lastUpdate}',
        1,
        1, 
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // 8 Due
  console.log('INSERT due Table');
  SQLquery =
    `         
      INSERT INTO due (
        tableName,
        condominiumId,
        user,
        lastUpdate,
        condoId,
        amount,
        date,
        text)
      VALUES (
        'due',
        1,
        'Initiation',
        '${lastUpdate}',
        1,
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // 9 Budget
  console.log('INSERT budget Table');
  SQLquery =
    `
      INSERT INTO budget(
        tableName,
        condominiumId,
        user,
        lastUpdate,
        accountId,
        budget,
        year,
        text)
      VALUES(
        'budget',
        1,
        'Initiation',
        '${lastUpdate}',
        1,
        'budget',
        '9999',
        'text'
      );
    `;
  socket.send(SQLquery);

  // 10 Account movement
  console.log('INSERT accountmovement Table');
  SQLquery =
    `         
      INSERT INTO accountmovement(
        tableName,
        condominiumId,
        user,
        lastUpdate,
        condoId,
        accountId,
        amount,
        date,
        text)
      VALUES(
        'accountmovement',
        1,
        'Initiation',
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