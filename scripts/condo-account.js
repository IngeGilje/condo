// maintenance of accounts

// Activate Account class
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');

/*
let isEventsCreated = false;

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

objAccount.menu();
objAccount.markSelectedMenu('Konto');

// Send a message to the server
socket.onopen = () => {
*/

let isEventsCreated = false;

objAccount.menu();
objAccount.markSelectedMenu('Konto');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('account-login');
} else {

  // Send a message to the server
  socket.onopen = () => {
    // Sends a request to the server to get all users
    const SQLquery = `
    SELECT * FROM user
    ORDER BY userId;
  `;
    socket.send(SQLquery);
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let message = event.data;

    // Create user array including objets
    if (message.includes('"tableName":"user"')) {

      console.log('userTable');

      // user array including objects with user information
      userArray = JSON.parse(message);

      // Sends a request to the server to get all bankaccounts
      const SQLquery =
        `
          SELECT * FROM bankaccount
          ORDER BY name;
        `;
      socket.send(SQLquery);
    }

    // Create bank account array including objets
    if (message.includes('"tableName":"bankaccount"')) {

      // bank account table

      console.log('bankaccountTable');

      // array including objects with account information
      bankAccountArray = JSON.parse(message);

      // Sends a request to the server to get all accounts
      const SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
      socket.send(SQLquery);
    }

    // Create account array including objets
    if (message.includes('"tableName":"account"')) {

      console.log('accountTable');
      // account table

      // array including objects with account information
      accountArray = JSON.parse(message);

      // Show leading text
      const accountId = objAccount.getSelectedAccountId('account-accountId');
      showLeadingText(accountId);

      // Show all values for account
      showValues(accountId);

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update and delete
    if (message.includes('"fieldCount":0')) {

      // Query didn't return any fields
      console.log('fieldCount');
    }

    // Check for update and delete
    if (message.includes('"affectedRows":1')) {

      // One row was affected by the query
      console.log('affectedRows');

      // Sends a request to the server to get all accounts
      const SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
      socket.send(SQLquery);
    }
  };

  // Handle errors
  socket.onerror = (error) => {

    // Close socket on error and let onclose handle reconnection
    socket.close();
  }

  // Handle disconnection
  socket.onclose = () => {
  }
}

// Make events for accounts
function createEvents() {

  // Select Account
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-account-accountId')) {
      const accountId = Number(document.querySelector('.select-account-accountId').value);
      if (accountId) {
        showValues(accountId);
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-update')) {

      if (updateAccount()) {

        //let accountId = Number(document.querySelector('.select-account-accountId').value);
        //accountId = (accountId !== 0) ? accountId : accountArray.at(-1).accountId;
        //showValues(accountId);
      }
    }
  });

  // New account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-new')) {

      resetValues();
    }
  });

  // Delete account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-delete')) {
      deleteAccountRow();

      // Sends a request to the server to get all accounts
      //objAccount.getAccounts(socket);
      const SQLquery = `
        SELECT * FROM account
        ORDER BY accountId;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-account-cancel')) {

      // Sends a request to the server to get all accounts
      //objAccount.getAccounts(socket);
      const SQLquery = `
        SELECT * FROM account
        ORDER BY accountId;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateAccount() {

  let SQLquery = "";
  let isUpdated = false;

  if (validateValues()) {

    // Account number
    const accountId =
      Number(document.querySelector('.select-account-accountId').value);

    // Bank account Id
    const bankAccountId = document.querySelector('.select-account-bankAccountId').value;

    // Account Name
    const name = document.querySelector('.input-account-accountName').value;

    if (accountId >= 0) {

      const now = new Date();
      const lastUpdate = now.toISOString();

      const objectNumberAccount = accountArray.findIndex(account => account.accountId === accountId);

      // Check if account number exist
      if (objectNumberAccount >= 0) {

        // Update table
        SQLquery = `
          UPDATE account
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            bankAccountId = ${bankAccountId},
            name = '${name}',
            accountType = ''
          WHERE accountId = ${accountId};
        `;
      } else {

        // Insert new record
        SQLquery = `
        INSERT INTO account (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          bankAccountId,
          name,
          accountType
        ) 
        VALUES (
          'account',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          ${bankAccountId},
          '${name}',
          ''
        );
      `;
      }

      // Client sends a request to the server
      socket.send(SQLquery);

      document.querySelector('.select-account-accountId').disabled =
        false;
      document.querySelector('.button-account-delete').disabled =
        false;
      document.querySelector('.button-account-new').disabled =
        false;
      //document.querySelector('.button-account-cancel').disabled =
      //false;
      isUpdated = true;
    }
  }
  return isUpdated;
}

function deleteAccountRow() {

  let SQLquery = "";

  // Check for valid account number
  const accountId = Number(document.querySelector('.select-account-accountId').value);
  const name = document.querySelector('.input-account-accountName').value;
  if (accountId !== 1) {

    // Check if account number exist
    const objectNumberAccount = accountArray.findIndex(account => account.accountId === accountId);
    if (objectNumberAccount >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM account
        WHERE accountId = ${accountId};
      `;
      // Client sends a request to the server
      socket.send(SQLquery);
    }
    // Get accounts
    //objAccount.getAccounts(socket);
    SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
    socket.send(SQLquery);
  }
}

// Show leading text for account
function showLeadingText(accountId) {

  // Show all accounts
  objAccount.showAllAccounts('account-accountId', accountId);

  // Show all bank accounts
  const bankAccountId = bankAccountArray.at(-1).bankAccountId;
  objBankAccount.showAllBankAccounts('account-bankAccountId', bankAccountId);

  // account name
  objAccount.showInput('account-accountName', '* Kontonavn', 50, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objAccount.showButton('account-update', 'Oppdater');

    // new button
    objAccount.showButton('account-new', 'Ny');

    // delete button
    objAccount.showButton('account-delete', 'Slett');

    // cancel button
    objAccount.showButton('account-cancel', 'Avbryt');
  }
}

// Show all values for account
function showValues(accountId) {

  // Check for valid income Id
  if (accountId > 1) {

    // find object number for selected account 
    const objectNumberAccount = accountArray.findIndex(account => account.accountId === accountId);
    if (objectNumberAccount > 0) {

      // Select account id
      const accountId = accountArray[objectNumberAccount].accountId;
      objAccount.selectAccountId(accountId, 'account-accountId');

      // Select bank account
      const bankAccountId = accountArray[objectNumberAccount].bankAccountId;
      objAccount.selectBankAccountId(bankAccountId, 'account-bankAccountId')

      // account name
      document.querySelector('.input-account-accountName').value =
        accountArray[objectNumberAccount].name;
    }
  }
}

// Check for valid values
function validateValues() {

  // Check bank account
  const bankAccountId =
    Number(document.querySelector('.select-account-bankAccountId').value);
  const validBankAccountId =
    validateNumber(bankAccountId, 1, 99999, "account-bankAccountId", "Vis konto");

  // Check account Name
  const name =
    document.querySelector('.input-account-accountName').value;
  const validName =
    objAccount.validateText(name, "label-account-accountName", "Kontonavn");

  return (validName && validBankAccountId) ? true : false;
}

function resetValues() {

  // account Id
  document.querySelector('.select-account-accountId').value =
    '';

  // account Name
  document.querySelector('.input-account-accountName').value =
    '';

  document.querySelector('.select-account-accountId').disabled =
    true;
  document.querySelector('.button-account-delete').disabled =
    true;
  document.querySelector('.button-account-new').disabled =
    true;
  //document.querySelector('.button-account-cancel').disabled =
  //true;
}

/*
DROP TABLE account;
CREATE TABLE account (
  accountId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  condominiumId INT,
  user VARCHAR (50),
  lastUpdate VarChar (40),
  bankAccountId INT,
  name VARCHAR(50) NOT NULL,
  accountType VARCHAR(1),
  FOREIGN KEY (condominiumId) REFERENCES bankaccount(bankAccountId)
);
ALTER TABLE account ENGINE=InnoDB;
INSERT INTO account(
  tableName,
  condominiumId,
  user,
  lastUpdate,
  bankAccountId,
  name,
  accountType) 
VALUES (
  'account',
  1,
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  0,
  '',
  ''
  );
*/
