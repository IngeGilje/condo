// Maintenance of bankaccounts

// Activate objects
const objUser = new User('user');
const objBankAccount = new BankAccount('bankaccount');
const objAccount = new Account('account');

const objUserPassword = JSON.parse(localStorage.getItem('user'));

// Connection to a server
let socket;
(objUser.localServer)
  ? socket = new WebSocket('ws://localhost:8080')
  : socket = new WebSocket('ws://ingegilje.no:8080');

let isEventsCreated = false;

menu();
objBankAccount.markSelectedMenu('Bankkonto');

/*
// Send a message to the server
socket.onopen = () => {

  // Sends a request to the server to get all accounts
  //objAccount.getAccounts(socket);
  const SQLquery = `
    SELECT * FROM account
    ORDER BY accountId;
  `;
  socket.send(SQLquery);
};
*/
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

    // Check user/password
    (objUser.validateUser(objUserPassword.email, objUserPassword.password)) ? '' : window.location.href('file:///C:/inetpub/wwwroot/condo-login.html');

    // username and password is ok
    // Sends a request to the server to get all accounts
    //objAccount.getAccounts(socket);
    const SQLquery = `
      SELECT * FROM account
      ORDER BY accountId;
    `;
    socket.send(SQLquery);
  }

  // Create bankaccount array including objets
  if (message.includes('"tableName":"account"')) {

    // array including objects with account information
    accountArray = JSON.parse(message);

    // Sends a request to the server to get all bank accounts
    //objBankAccount.getBankAccounts(socket);
    const SQLquery = `
      SELECT * FROM bankaccount
      ORDER BY name;
    `;
    socket.send(SQLquery);
  }

  // Create bank account array including objets
  if (message.includes('"tableName":"bankaccount"')) {

    // bankaccount table
    console.log('bankaccountTable');

    // array including objects with bankaccount information
    bankAccountArray = JSON.parse(message);

    const bankAccountId = objBankAccount.getSelectedBankAccountId('bankAccountId');

    // Show all leading text
    showLeadingText(bankAccountId);

    // Show all values for bankaccount
    showValues(bankAccountId);

    // Make events
    if (!isEventsCreated) {
      createEvents();
      isEventsCreated = true;
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows":1')) {

      console.log('affectedRows');

      // Sends a request to the server to get all bankaccounts
      //objBankAccount.getAccounts(socket);
      const SQLquery = `
        SELECT * FROM account
        ORDER BY accountId;
      `;
      socket.send(SQLquery);
    }
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

// Make events for bankaccounts
function createEvents() {

  // Select BankAccount
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccount-bankAccountId')) {
      let bankAccountId = Number(document.querySelector('.select-bankaccount-bankAccountId').value);
      bankAccountId = (bankAccountId !== 0) ? bankAccountId : bankAccountArray.at(-1).bankAccountId;
      if (bankAccountId) {
        showValues(bankAccountId);
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccount-update')) {
      if (updateBankAccount()) {

        let bankAccountId = Number(document.querySelector('.select-bankaccount-bankAccountId').value);
        bankAccountId = (bankAccountId !== 0) ? bankAccountId : bankAccountArray.at(-1).bankAccountId;
        showValues(bankAccountId);
      }
    }
  });

  // New account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccount-new')) {

      resetValues();
    }
  });

  // Delete bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccount-delete')) {

      deleteAccountRow();

      // Sends a request to the server to get all bank account
      //objBankAccount.getBankAccounts(socket);
      const SQLquery = `
        SELECT * FROM bankaccount
        ORDER BY name;
      `;
      socket.send(SQLquery);
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccount-cancel')) {

      // Sends a request to the server to get all bank account
      //objBankAccount.getBankAccounts(socket);
      const SQLquery = `
        SELECT * FROM bankaccount
        ORDER BY name;
      `;
      socket.send(SQLquery);
    }
  });
}

function updateBankAccount() {

  let SQLquery = "";
  let isUpdated = false;

  if (validateValues()) {

    // Bank account id
    const bankAccountId =
      Number(document.querySelector('.select-bankaccount-bankAccountId').value);

    // Bank Account number
    const bankAccountNumber = document.querySelector('.input-bankaccount-bankAccountNumber').value;

    // BankAccount Name
    const name = document.querySelector('.input-bankaccount-bankAccountName').value;

    if (bankAccountId >= 0) {

      let SQLquery = '';
      const now = new Date();
      const lastUpdate = now.toISOString();

      const objectbankAccountId = bankAccountArray.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

      // Check if bank account number exist
      if (objectbankAccountId >= 0) {

        // Update table
        SQLquery = `
          UPDATE bankaccount
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            bankAccountNumber = '${bankAccountNumber}',
            name = '${name}'
          WHERE bankAccountId = ${bankAccountId};
        `;
      } else {

        // Insert new record
        SQLquery = `
        INSERT INTO bankaccount (
          tableName,
          user,
          lastUpdate,
          bankAccountNumber,
          name) 
        VALUES (
          'bankaccount',
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${bankAccountNumber}',
          '${name}'
        );
      `;
      }

      // Client sends a request to the server
      socket.send(SQLquery);

      document.querySelector('.select-bankaccount-bankAccountId').disabled =
        false;
      document.querySelector('.button-bankaccount-delete').disabled =
        false;
      document.querySelector('.button-bankaccount-new').disabled =
        false;
      //document.querySelector('.button-bankaccount-cancel').disabled =
      //  false;
      isUpdated = true;
    }
  }
  return isUpdated;
}

function deleteAccountRow() {

  let SQLquery = "";

  const bankAccountId = Number(document.querySelector('.select-bankaccount-bankAccountId').value);
  const bankAccountNumber = document.querySelector('.input-bankaccount-bankAccountNumber').value;
  const name = document.querySelector('.input-bankaccount-bankAccountName').value;
  if (bankAccountId > 1) {

    // Check if bank account exist
    const objectbankAccountId = bankAccountArray.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (objectbankAccountId >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM bankaccount
        WHERE bankAccountId = '${bankAccountId}';
      `;

    }
    // Client sends a request to the server
    socket.send(SQLquery);

    // Get bank account
    //objBankAccount.getBankAccounts(socket);
    const SQLquery = `
      SELECT * FROM bankaccount
      ORDER BY name;
    `;
    socket.send(SQLquery);
  }
}

// Show all leading text for account
function showLeadingText(bankAccountId) {

  // Show all bank accounts
  objBankAccount.showAllBankAccounts('bankAccountId', bankAccountId);

  // Show bank account number
  objBankAccount.showInput('bankaccount-bankAccountNumber', '* Kontonummer', 11, '');

  // bank account name
  objBankAccount.showInput('bankaccount-bankAccountName', '* Kontonavn', 50, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objBankAccount.showButton('bankaccount-update', 'Oppdater');

    // new button
    objBankAccount.showButton('bankaccount-new', 'Ny');

    // delete button
    objBankAccount.showButton('bankaccount-delete', 'Slett');

    // cancel button
    objBankAccount.showButton('bankaccount-cancel', 'Avbryt');
  }
}

// Show all values for bankAccount
function showValues(bankAccountId) {

  // Check for valid bankaccount Id
  if (bankAccountId > 1) {

    // find object number for selected account 
    const objectbankAccountId = bankAccountArray.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (objectbankAccountId >= 0) {

      // Select bank account
      const bankAccountId = bankAccountArray[objectbankAccountId].bankAccountId;
      objBankAccount.selectBankAccountId(bankAccountId, 'bankaccount-bankAccountId');

      // bank account number
      document.querySelector('.input-bankaccount-bankAccountNumber').value =
        bankAccountArray[objectbankAccountId].bankAccountNumber;

      // account name
      document.querySelector('.input-bankaccount-bankAccountName').value =
        bankAccountArray[objectbankAccountId].name;
    }
  }
}

// Check for valid values
function validateValues() {

  // Check bank account number
  const bankAccountNumber = document.querySelector('.input-bankaccount-bankAccountNumber').value;
  const validBankAccountNumber = checkBankAccount(bankAccountNumber, "bankaccount-bankAccountNumber", "Kontonummer");

  // Check bankaccount Name
  const name = document.querySelector('.input-bankaccount-bankAccountName').value;
  const validName = objBankAccount.validateText(name, "label-bankaccount-bankAccountName", "Kontonavn");

  return (validName && validBankAccountNumber) ? true : false;
}

function resetValues() {

  // Bank account Id
  document.querySelector('.select-bankaccount-bankAccountId').value = '';

  // Bank account number
  document.querySelector('.input-bankaccount-bankAccountNumber').value = '';

  // Bank account Name
  document.querySelector('.input-bankaccount-bankAccountName').value = '';

  document.querySelector('.select-bankaccount-bankAccountId').disabled =
    true;
  document.querySelector('.button-bankaccount-delete').disabled =
    true;
  document.querySelector('.button-bankaccount-new').disabled =
    true;
  //document.querySelector('.button-bankaccount-cancel').disabled =
  //  true;
}

/*
DROP TABLE bankaccount;
CREATE TABLE bankaccount (
  bankAccountId INT AUTO_INCREMENT PRIMARY KEY,
  tableName VARCHAR(50) NOT NULL,
  user VARCHAR (50),
  lastUpdate VARCHAR (40),
  bankAccountNumber VARCHAR(11) NOT NULL,
  name VARCHAR(50) NOT NULL
);
INSERT INTO bankaccount(
  tableName,
  user,
  lastUpdate,
  bankAccountNumber,
  name) 
VALUES (
  'bankaccount',
  'Initiation',
  '2099-12-31T23:59:59.596Z',
  '',
  ''
  );
*/
