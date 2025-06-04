// Maintenance of bankaccounts

// Activate objects
const objUser = new User('user');
const objBankAccount = new BankAccount('bankaccount');
const objAccount = new Account('account');

const objUserPassword = JSON.parse(localStorage.getItem('user'));
console.log('objUserPassword.condominiumId:', objUserPassword.condominiumId);

// Connection to a server
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

objBankAccount.menu();
objBankAccount.markSelectedMenu('Bankkonto');

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
    (objUser.validateUser(objUserPassword.email, objUserPassword.password)) ? '' : window.location.href('http://localhost/condo-login.html');

    // username and password is ok
    // Sends a request to the server to get all accounts
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

      // Sends a request to the server to get all bank accounts
      const SQLquery = `
        SELECT * FROM bankaccount
        ORDER BY bankaccountId;
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
    const bankAccount = document.querySelector('.input-bankaccount-bankAccount').value;

    // BankAccount Name
    const name = document.querySelector('.input-bankaccount-name').value;

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
            bankAccount = '${bankAccount}',
            name = '${name}'
          WHERE bankAccountId = ${bankAccountId};
        `;
      } else {

        // Insert new record
        SQLquery = `
        INSERT INTO bankaccount (
          tableName,
          condominiumId,
          user,
          lastUpdate,
          bankAccount,
          name) 
        VALUES (
          'bankaccount',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${bankAccount}',
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
  const bankAccount = document.querySelector('.input-bankaccount-bankAccount').value;
  const name = document.querySelector('.input-bankaccount-name').value;
  if (bankAccountId > 1) {

    // Check if bank account exist
    const objectbankAccountId = bankAccountArray.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (objectbankAccountId >= 0) {

      // Delete table
      SQLquery = `
        DELETE FROM bankaccount
        WHERE bankAccountId = '${bankAccountId}';
      `;

      // Client sends a request to the server
      socket.send(SQLquery);
    }

    // Get bank account
    SQLquery = `
      SELECT * FROM bankaccount
      ORDER BY name;
    `;
    socket.send(SQLquery);
  }
}

// Show all leading text for account
function showLeadingText(bankAccountId) {

  // Show all bank accounts
  objBankAccount.showAllBankAccounts('bankaccount-bankAccountId', bankAccountId);

  // Show bank account number
  objBankAccount.showInput('bankaccount-bankAccount', '* Kontonummer', 11, '');

  // bank account name
  objBankAccount.showInput('bankaccount-name', '* Kontonavn', 50, '');

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
      document.querySelector('.input-bankaccount-bankAccount').value =
        bankAccountArray[objectbankAccountId].bankAccount;

      // account name
      document.querySelector('.input-bankaccount-name').value =
        bankAccountArray[objectbankAccountId].name;
    }
  }
}

// Check for valid values
function validateValues() {

  // Check bank account number
  const bankAccount = document.querySelector('.input-bankaccount-bankAccount').value;
  const validBankAccount = checkBankAccount(bankAccount, "bankaccount-bankAccount", "Kontonummer");

  // Check bankaccount Name
  const name = document.querySelector('.input-bankaccount-name').value;
  const validName = objBankAccount.validateText(name, "label-bankaccount-name", "Kontonavn");

  return (validName && validBankAccount) ? true : false;
}

function resetValues() {

  // Bank account Id
  document.querySelector('.select-bankaccount-bankAccountId').value = '';

  // Bank account number
  document.querySelector('.input-bankaccount-bankAccount').value = '';

  // Bank account Name
  document.querySelector('.input-bankaccount-name').value = '';

  document.querySelector('.select-bankaccount-bankAccountId').disabled =
    true;
  document.querySelector('.button-bankaccount-delete').disabled =
    true;
  document.querySelector('.button-bankaccount-new').disabled =
    true;
  //document.querySelector('.button-bankaccount-cancel').disabled =
  //  true;
}
