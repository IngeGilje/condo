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

// Send a message to the server
socket.onopen = () => {

  let SQLquery = "";

  const now = new Date();
  const lastUpdate = now.toISOString();

  // Drop all tables

  // Delete all foreign keys

  /*
  // Account
  console.log('DROP FOREIGN KEY fk_condominium_account');
  SQLquery =
    `         
      ALTER TABLE account
      DROP FOREIGN KEY fk_condominium_account;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_bankaccount_account 1.2');
  SQLquery =
    `         
      ALTER TABLE account
      DROP FOREIGN KEY fk_bankaccount_account;
    `;
  socket.send(SQLquery);

  // Account movement
  console.log('DROP FOREIGN KEY fk_condominium_accountmovement');
  SQLquery =
    `         
      ALTER TABLE accountmovement
      DROP FOREIGN KEY fk_condominium_accountmovement;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_condo_accountmovement');
  SQLquery =
    `         
      ALTER TABLE accountmovement
      DROP FOREIGN KEY fk_condo_accountmovement;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_account_accountmovement');
  SQLquery =
    `         
      ALTER TABLE accountmovement
      DROP FOREIGN KEY fk_account_accountmovement;
    `;
  socket.send(SQLquery);

  // Bank Account
  console.log('DROP FOREIGN KEY fk_condominium_bankaccount');
  SQLquery =
    `         
      ALTER TABLE bankaccount
      DROP FOREIGN KEY fk_condominium_bankaccount;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_account_budget');
  SQLquery =
    `         
      ALTER TABLE budget
      DROP FOREIGN KEY fk_account_budget;
    `;
  socket.send(SQLquery);

  // Condo
  console.log('DROP FOREIGN KEY fk_condominium_condo');
  SQLquery =
    `         
      ALTER TABLE condo
      DROP FOREIGN KEY fk_condominium_condo;
    `;
  socket.send(SQLquery);

  // Due
  console.log('DROP FOREIGN KEY fk_condominium_due');
  SQLquery =
    `         
      ALTER TABLE due
      DROP FOREIGN KEY fk_condominium_due;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_condo_due');
  SQLquery =
    `         
      ALTER TABLE due
      DROP FOREIGN KEY fk_condo_due;
    `;
  socket.send(SQLquery);

  // income
  console.log('DROP FOREIGN KEY fk_condominium_income');
  SQLquery =
    `         
      ALTER TABLE income
      DROP FOREIGN KEY fk_condominium_income;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_condo_income');
  SQLquery =
    `         
      ALTER TABLE income
      DROP FOREIGN KEY fk_condo_income;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_account_income');
  SQLquery =
    `         
      ALTER TABLE income
      DROP FOREIGN KEY fk_account_income;
    `;
  socket.send(SQLquery);

  // payment
  console.log('DROP FOREIGN KEY fk_condominium_payment');
  SQLquery =
    `         
      ALTER TABLE payment
      DROP FOREIGN KEY fk_condominium_payment;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_account_payment');
  SQLquery =
    `         
      ALTER TABLE payment
      DROP FOREIGN KEY fk_account_payment;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_condo_payment');
  SQLquery =
    `         
      ALTER TABLE payment
      DROP FOREIGN KEY fk_condo_payment;
    `;
  socket.send(SQLquery);

  // user
  console.log('DROP FOREIGN KEY fk_condominium_user');
  SQLquery =
    `         
       ALTER TABLE user
      DROP FOREIGN KEY fk_condominium_user;
    `;
  socket.send(SQLquery);

  console.log('DROP FOREIGN KEY fk_condo_user');
  SQLquery =
    `         
       ALTER TABLE user
      DROP FOREIGN KEY fk_condo_user;
    `;
  socket.send(SQLquery);

  */

  // Create tables

  // Sends a request to create condominium tabel
  console.log('DROP account Table');
  SQLquery =
    `
      DROP TABLE account;
    `;
  socket.send(SQLquery);

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
        INDEX (condominiumId),
        INDEX (bankAccountId),
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
  socket.send(SQLquery);

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
        0,
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  /*
  // Account Movement
  console.log('DROP accountmovement Table');
  SQLquery =
    `
      DROP TABLE accountmovement;
    `;
  socket.send(SQLquery);

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
        text VARCHAR (255) NOT NULL
      );
    `;
  socket.send(SQLquery);

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
        0,
        0,
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);
  */

  // Bank account
  console.log('DROP bankaccount Table');
  SQLquery =
    `
      DROP TABLE bankaccount;
    `;
  socket.send(SQLquery);

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
        INDEX (condominiumId),
        FOREIGN KEY (condominiumId) REFERENCES condominium(condominiumId)
      );
    `;
  socket.send(SQLquery);

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
        '2099-12-31T23:59:59.596Z',
        '',
        ''
      );
    `;
  socket.send(SQLquery);
  
  /*
  // Budget
  console.log('DROP budget Table');
  SQLquery =
    `
      DROP TABLE budget;
    `;
  socket.send(SQLquery);

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
        text VARCHAR(255) NOT NULL
      );
    `;
  socket.send(SQLquery);

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
        0,
        'budget',
        '9999',
        'text'
      );
    `;
  socket.send(SQLquery);

  // Condo table
  console.log('DROP condo Table');
  SQLquery =
    `
      DROP TABLE condo;
    `;
  socket.send(SQLquery);

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
        city VARCHAR(50) NOT NULL
      );
    `;
  socket.send(SQLquery);

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

  // Due table
  console.log('DROP due Table');
  SQLquery =
    `
      DROP TABLE due; 
    `;
  socket.send(SQLquery);

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
        text VARCHAR (255) NOT NULL
      );
    `;
  socket.send(SQLquery);

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
        0,
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // Income
  console.log('DROP income Table');
  SQLquery =
    `
      DROP TABLE income;
    `;
  socket.send(SQLquery);

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
        text VARCHAR (255) NOT NULL
      );
    `;
  socket.send(SQLquery);

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
        0,
        0, 
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // Payment
  console.log('DROP payment Table');
  SQLquery =
    `
      DROP TABLE payment;
    `;
  socket.send(SQLquery);

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
        condoId INT,
        amount VARCHAR(10) NOT NULL,
        numberKWHour VARCHAR(10),
        date VARCHAR(10) NOT NULL,
        text VARCHAR (255) NOT NULL
      );
    `;
  socket.send(SQLquery);

  console.log('INSERT payment Table');
  SQLquery =
    `         
      INSERT INTO payment (
        tableName,
        condominiumId,
        user,
        lastUpdate,
        accountId,
        condoId,
        amount,
        numberKWHour,
        date,
        text)
      VALUES (
        'payment',
        1,
        'Initiation',
        '${lastUpdate}',
        0, 
        0,
        '',
        '',
        '',
        ''
      );
    `;
  socket.send(SQLquery);

  // user
  console.log('DROP user Table');
  SQLquery =
    `
      DROP TABLE user;
    `;
  socket.send(SQLquery);

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
        password VARCHAR(50) NOT NULL
      );
    `;
  socket.send(SQLquery);

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
  */

   // condominium
  console.log('DROP condominium Table');
  SQLquery =
    `
      DROP TABLE condominium;
    `;
  socket.send(SQLquery);

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

  /*
  // Tables use the InnoDB storage engine

  // Account
  SQLquery =
    `         
      ALTER TABLE account ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  /*
  // Account movement
  SQLquery =
    `         
      ALTER TABLE accountmovement ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  // Bank Account
  SQLquery =
    `         
      ALTER TABLE bankaccount ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  /*
  // Budget
  SQLquery =
    `         
      ALTER TABLE budget ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  // Condo
  SQLquery =
    `         
      ALTER TABLE condo ENGINE = InnoDB;
    `;
  socket.send(SQLquery);


  // Condominium
  SQLquery =
    `         
      ALTER TABLE condominium ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  // Due
  SQLquery =
    `         
      ALTER TABLE due ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  // income
  SQLquery =
    `         
      ALTER TABLE income ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  // payment
  SQLquery =
    `         
      ALTER TABLE payment ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  // user
  SQLquery =
    `         
      ALTER TABLE user ENGINE = InnoDB;
    `;
  socket.send(SQLquery);

  // Insert foreign key in existing tables

  // account
  console.log('ADD CONSTRAINT fk_condominium_account');
  SQLquery =
    `         
      ALTER TABLE account
      ADD CONSTRAINT fk_condominium_account
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_bankaccount_account');
  SQLquery =
    `         
      ALTER TABLE account
      ADD CONSTRAINT fk_bankaccount_account
      FOREIGN KEY (bankAccountId)
      REFERENCES bankaccount(bankAccountId);
    `;
  socket.send(SQLquery);

  // account movement
  console.log('ADD CONSTRAINT fk_account_accountmovement');
  SQLquery =
    `         
      ALTER TABLE accountmovement
      ADD CONSTRAINT fk_account_accountmovement
      FOREIGN KEY (accountId)
      REFERENCES account(accountId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_condo_accountmovement');
  SQLquery =
    `         
      ALTER TABLE accountmovement
      ADD CONSTRAINT fk_condo_accountmovement
      FOREIGN KEY (condoId)
      REFERENCES condo(condoId);
    `;
  socket.send(SQLquery);

  // bank account
  console.log('ADD CONSTRAINT fk_condominium_bankaccount');
  SQLquery =
    `         
      ALTER TABLE bankaccount
      ADD CONSTRAINT fk_condominium_bankaccount
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  // Budget
  console.log('ADD CONSTRAINT fk_condominium_budget');
  SQLquery =
    `         
      ALTER TABLE budget
      ADD CONSTRAINT fk_condominium_budget
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_account_budget');
  SQLquery =
    `         
      ALTER TABLE budget
      ADD CONSTRAINT fk_account_budget
      FOREIGN KEY (accountId)
      REFERENCES account(accountId);
    `;
  socket.send(SQLquery);

  // Condo
  console.log('ADD CONSTRAINT fk_condominium_condo');
  SQLquery =
    `         
      ALTER TABLE condo
      ADD CONSTRAINT fk_condominium_condo
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  // Condominium

  // Due
  console.log('ADD CONSTRAINT fk_condominium_due');
  SQLquery =
    `         
      ALTER TABLE due
      ADD CONSTRAINT fk_condominium_due
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_condo_due');
  SQLquery =
    `         
      ALTER TABLE due
      ADD CONSTRAINT fk_condo_due
      FOREIGN KEY (condoId)
      REFERENCES condo(condoId);
    `;
  socket.send(SQLquery);

  // Income
  console.log('ADD CONSTRAINT fk_condominium_income');
  SQLquery =
    `         
      ALTER TABLE income
      ADD CONSTRAINT fk_condominium_income
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_condo_income');
  SQLquery =
    `         
      ALTER TABLE income
      ADD CONSTRAINT fk_condo_income
      FOREIGN KEY (condoId)
      REFERENCES condo(condoId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_account_income');
  SQLquery =
    `         
      ALTER TABLE income
      ADD CONSTRAINT fk_account_income
      FOREIGN KEY (accountId)
      REFERENCES account(accountId);
    `;
  socket.send(SQLquery);

  // Payment
  console.log('ADD CONSTRAINT fk_condominium_payment');
  SQLquery =
    `         
      ALTER TABLE payment
      ADD CONSTRAINT fk_condominium_payment
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_account_payment');
  SQLquery =
    `         
      ALTER TABLE payment
      ADD CONSTRAINT fk_account_payment
      FOREIGN KEY (accountId)
      REFERENCES account(accountId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_condo_payment');
  SQLquery =
    `         
      ALTER TABLE payment
      ADD CONSTRAINT fk_condo_payment
      FOREIGN KEY (condoId)
      REFERENCES condo(condoId);
    `;
  socket.send(SQLquery);

  // User
  console.log('ADD CONSTRAINT fk_condominium_user');
  SQLquery =
    `         
      ALTER TABLE user
      ADD CONSTRAINT fk_condominium_user
      FOREIGN KEY (condominiumId)
      REFERENCES condominium(condominiumId);
    `;
  socket.send(SQLquery);

  console.log('ADD CONSTRAINT fk_condo_user');
  SQLquery =
    `         
      ALTER TABLE user
      ADD CONSTRAINT fk_condo_user
      FOREIGN KEY (condoId)
      REFERENCES condo(condoId);
    `;
  socket.send(SQLquery);
  */
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