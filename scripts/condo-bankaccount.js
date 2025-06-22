// Maintenance of bankaccounts

// Activate objects
const objUser = new User('user');
const objBankAccount = new BankAccount('bankaccount');
const objAccount = new Account('account');

testMode();

let isEventsCreated = false;

objBankAccount.menu();
objBankAccount.markSelectedMenu('Bankkonto sameie');

let socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  showLoginError('bankaccount-login');
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

      // Show leading text
      showLeadingText(bankAccountId);

      // Show all values for bankaccount
      showValues(bankAccountId);

      // Make events
      if (!isEventsCreated) {
        createEvents();
        isEventsCreated = true;
      }
    }

    // Check for update, delete ...
    if (message.includes('"affectedRows":1')) {

      console.log('affectedRows');

      // Sends a request to the server to get all bank accounts
      const SQLquery = `
        SELECT * FROM bankaccount
        ORDER BY bankAccountId;
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

  if (validateValues()) {

    // Bank account id
    const bankAccountId =
      Number(document.querySelector('.select-bankaccount-bankAccountId').value);

    // Bank Account number
    const bankAccount =
      document.querySelector('.input-bankaccount-bankAccount').value;

    // BankAccount Name
    const bankAccountName =
      document.querySelector('.input-bankaccount-name').value;

    // Opening balance
    const openingBalance =
      document.querySelector('.input-bankaccount-openingBalance').value;

    // Opening balance date
    const openingBalanceDate =
      document.querySelector('.input-bankaccount-openingBalanceDate').value;

    // Closing balance
    const closingBalance =
      document.querySelector('.input-bankaccount-closingBalance').value;

    // Closing balance date
    const closingBalanceDate =
      document.querySelector('.input-bankaccount-closingBalanceDate').value;

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
            name = '${bankAccountName}',
            openingBalance = '${openingBalance}',
            openingBalanceDate = '${openingBalanceDate}',
            closingBalance = '${closingBalance}',
            closingBalanceDate = '${closingBalanceDate}'
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
          name,
          openingBalance, 
          openingBalanceDate,
          closingBalance, 
          closingBalanceDate
        ) 
        VALUES (
          'bankaccount',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${bankAccount}',
          '${bankAccountName}',
          '${openingBalance}',
          '${openingBalanceDate}',
          '${closingBalance}',
          '${closingBalanceDate}'
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
    }
  }
}

function deleteAccountRow() {

  let SQLquery = "";

  const bankAccountId = Number(document.querySelector('.select-bankaccount-bankAccountId').value);
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

// Show leading text for account
function showLeadingText(bankAccountId) {

  // Show all bank accounts
  objBankAccount.showAllBankAccounts('bankaccount-bankAccountId', bankAccountId);

  // Show bank account number
  objBankAccount.showInput('bankaccount-bankAccount', '* Bankkontonummer', 11, '');

  // bank account name
  objBankAccount.showInput('bankaccount-name', '* Kontonavn', 50, '');

  // Opening balance
  objBankAccount.showInput('bankaccount-openingBalance', 'Inngående saldo', 10, '');

  // Opening balance date
  objBankAccount.showInput('bankaccount-openingBalanceDate', 'Dato', 10, '');

  // Closing balance
  objBankAccount.showInput('bankaccount-closingBalance', 'Utgående saldo', 10, '');

  // Closing balance date
  objBankAccount.showInput('bankaccount-closingBalanceDate', 'Dato', 10, '');

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

      // account name
      document.querySelector('.input-bankaccount-name').value =
        bankAccountArray[objectbankAccountId].name;

      // account number
      document.querySelector('.input-bankaccount-bankAccount').value =
        bankAccountArray[objectbankAccountId].bankAccount;

      // opening balance date
      document.querySelector('.input-bankaccount-openingBalanceDate').value =
        convertToEurDateFormat(bankAccountArray[objectbankAccountId].openingBalanceDate);

      // opening balance
      document.querySelector('.input-bankaccount-openingBalance').value =
        formatFromOreToKroner(bankAccountArray[objectbankAccountId].openingBalance);

      // closing balance date
      document.querySelector('.input-bankaccount-closingBalanceDate').value =
        convertToEurDateFormat(bankAccountArray[objectbankAccountId].closingBalanceDate);

      // closing balance
      document.querySelector('.input-bankaccount-closingBalance').value =
        formatFromOreToKroner(bankAccountArray[objectbankAccountId].closingBalance);
    }
  }
}

// Check for valid values
function validateValues() {

  // Check bank account number
  const bankAccount =
   document.querySelector('.input-bankaccount-bankAccount').value;
  const validBankAccount =
   objBankAccount.validateBankAccount(bankAccount, "label-bankaccount-bankAccount", "Bankkontonummer");

  // Check bankaccount Name
  const bankAccountName = 
  document.querySelector('.input-bankaccount-name').value;
  const validName = objBankAccount.validateText(bankAccountName, "label-bankaccount-name", "Kontonavn");

  return (validName && validBankAccount) ? true : false;
}

function resetValues() {

  // Bank account Id
  document.querySelector('.select-bankaccount-bankAccountId').value =
    '';

  // Bank account number
  document.querySelector('.input-bankaccount-bankAccount').value =
    '';

  // Bank account Name
  document.querySelector('.input-bankaccount-name').value =
    '';

  // Opening balance
  document.querySelector('.input-bankaccount-openingBalance').value =
    '';

  // Opening balance date
  document.querySelector('.input-bankaccount-openingBalanceDate').value =
    '';

  // Closing balance
  document.querySelector('.input-bankaccount-closingBalance').value =
    '';

  // Closing balance date
  document.querySelector('.input-bankaccount-closingBalanceDate').value =
    '';

  document.querySelector('.select-bankaccount-bankAccountId').disabled =
    true;
  document.querySelector('.button-bankaccount-delete').disabled =
    true;
  document.querySelector('.button-bankaccount-new').disabled =
    true;
  //document.querySelector('.button-bankaccount-cancel').disabled =
  //  true;
}
