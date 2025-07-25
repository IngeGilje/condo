// Maintenance of bankaccounts

// Activate objects
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');

testMode();

// Redirect application after 2 hours
setTimeout(() => {
  window.location.href = 'http://localhost/condo/condo-login.html'
}, 1 * 60 * 60 * 1000);

let isEventsCreated

objBankAccount.menu();
objBankAccount.markSelectedMenu('Bankkonto sameie');

let socket;
socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(localStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo/condo-login.html';
} else {
  // Send a requests to the server
  socket.onopen = () => {

    // Sends a request to the server to get users
    SQLquery =
      `
        SELECT * FROM user
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY userId;
      `;
    updateMySql(SQLquery, 'user', 'SELECT');

    // Sends a request to the server to get accounts
    SQLquery =
      `
        SELECT * FROM account
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY accountId;
      `;

    updateMySql(SQLquery, 'account', 'SELECT');

    // Sends a request to the server to get bank accountss
    SQLquery =
      `
        SELECT * FROM bankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY bankaccountId;
      `;

    updateMySql(SQLquery, 'bankaccount', 'SELECT');
  };

  // Handle incoming messages from server
  socket.onmessage = (event) => {

    let messageFromServer =
      event.data;

    //Converts a JavaScript Object Notation (JSON) string into an object
    objInfo =
      JSON.parse(messageFromServer);

    if (objInfo.CRUD === 'SELECT') {
      switch (objInfo.tableName) {
        case 'user':

          // user table
          console.log('userTable');

          userArray =
            objInfo.tableArray;
          break;

        case 'account':

          // account table
          console.log('accountTable');

          accountArray =
            objInfo.tableArray;
          break;

        case 'bankaccount':

          // bankaccount table
          console.log('bankaccountTable');

          // array including objects with account information
          bankAccountArray =
            objInfo.tableArray;

          // Find selected account id
          const bankaccountId =
            objBankAccount.getSelectedBankAccountId('select-bankaccount-accountId');

          // Show leading text
          showLeadingText(bankaccountId);

          // Show all values for bank account
          showValues(bankaccountId);

          // Make events
          isEventsCreated = (isEventsCreated) ? true : condominiumEvents();
          break;
      }
    }

    if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

      switch (objInfo.tableName) {
        case 'bankaccount':

          // Sends a request to the server to get bankaccounts one more time
          SQLquery =
            `
              SELECT * FROM bankaccount
              WHERE condominiumId = ${objUserPassword.condominiumId}
              ORDER BY bankAccountId;
            `;
          updateMySql(SQLquery, 'bankaccount', 'SELECT');
          break;
      };
    }

    // Handle errors
    socket.onerror = (error) => {

      // Close socket on error and let onclose handle reconnection
      socket.close();
    }

    // Handle disconnection
    socket.onclose = () => {
    }
  }

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
      bankAccountId =
        (bankAccountId !== 0) ? bankAccountId : bankAccountArray.at(-1).bankAccountId;
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

  // Insert account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccount-insert')) {

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
        WHERE condominiumId = ${objUserPassword.condominiumId}
        ORDER BY name;
      `;
      updateMySql(SQLquery, 'bankaccount', 'SELECT');
    }
  });
}

function updateBankAccount() {

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
    let openingBalanceDate =
      document.querySelector('.input-bankaccount-openingBalanceDate').value;
    openingBalanceDate =
      convertDateToISOFormat(openingBalanceDate);

    // Closing balance
    const closingBalance =
      document.querySelector('.input-bankaccount-closingBalance').value;

    // Closing balance date
    let closingBalanceDate =
      document.querySelector('.input-bankaccount-closingBalanceDate').value;
    closingBalanceDate =
      convertDateToISOFormat(closingBalanceDate);

    if (bankAccountId >= 0) {

      let SQLquery = '';
      const now = new Date();
      const lastUpdate = now.toISOString();

      const objAccountRowNumber =
        bankAccountArray.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

      // Check if bank account number exist
      if (objAccountRowNumber !== -1) {

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
        updateMySql(SQLquery, 'bankaccount', 'UPDATE');
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
        // Client sends a request to the server
        updateMySql(SQLquery, 'bankaccount', 'INSERT');
      }

      document.querySelector('.select-bankaccount-bankAccountId').disabled =
        false;
      document.querySelector('.button-bankaccount-delete').disabled =
        false;
      document.querySelector('.button-bankaccount-insert').disabled =
        false;
    }
  }
}

function deleteAccountRow() {

  let SQLquery = "";

  const bankAccountId = Number(document.querySelector('.select-bankaccount-bankAccountId').value);
  if (bankAccountId >= 0) {

    // Check if bank account exist
    const objAccountRowNumber =
      bankAccountArray.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (objAccountRowNumber !== -1) {

      // Delete table
      SQLquery = `
        DELETE FROM bankaccount
        WHERE bankAccountId = '${bankAccountId}';
      `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'bankaccount', 'DELETE');
    }

    // Get bank account
    SQLquery = `
      SELECT * FROM bankaccount
      WHERE condominiumId = ${objUserPassword.condominiumId}
      ORDER BY name;
    `;
    // Client sends a request to the server
    updateMySql(SQLquery, 'bankaccount', 'SELECT');
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

  // Opening balance date
  objBankAccount.showInput('bankaccount-openingBalanceDate', 'Dato inngående saldo', 10, '');

  // Opening balance
  objBankAccount.showInput('bankaccount-openingBalance', 'Inngående saldo', 10, '');

  // Closing balance date
  objBankAccount.showInput('bankaccount-closingBalanceDate', 'Dato utgående saldo', 10, '');

  // Closing balance
  objBankAccount.showInput('bankaccount-closingBalance', 'Utgående saldo', 10, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objBankAccount.showButton('bankaccount-update', 'Oppdater');

    // new button
    objBankAccount.showButton('bankaccount-insert', 'Ny');

    // delete button
    objBankAccount.showButton('bankaccount-delete', 'Slett');

    // cancel button
    objBankAccount.showButton('bankaccount-cancel', 'Avbryt');
  }
}

// Show all values for bankAccount
function showValues(bankAccountId) {

  // Check for valid bankaccount Id
  if (bankAccountId >= 0) {

    // find object number for selected account 
    const objAccountRowNumber =
      bankAccountArray.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (objAccountRowNumber !== -1) {

      // Select bank account
      const bankAccountId =
        bankAccountArray[objAccountRowNumber].bankAccountId;
      objBankAccount.selectBankAccountId(bankAccountId, 'bankaccount-bankAccountId');

      // account name
      document.querySelector('.input-bankaccount-name').value =
        bankAccountArray[objAccountRowNumber].name;

      // account number
      document.querySelector('.input-bankaccount-bankAccount').value =
        bankAccountArray[objAccountRowNumber].bankAccount;

      // opening balance date
      document.querySelector('.input-bankaccount-openingBalanceDate').value =
        formatToNorDate(bankAccountArray[objAccountRowNumber].openingBalanceDate);

      // opening balance
      document.querySelector('.input-bankaccount-openingBalance').value =
        formatOreToKroner(bankAccountArray[objAccountRowNumber].openingBalance);

      // closing balance date
      document.querySelector('.input-bankaccount-closingBalanceDate').value =
        formatToNorDate(bankAccountArray[objAccountRowNumber].closingBalanceDate);

      // closing balance
      document.querySelector('.input-bankaccount-closingBalance').value =
        formatOreToKroner(bankAccountArray[objAccountRowNumber].closingBalance);
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

  // Opening balance date
  let openingBalanceDate =
    document.querySelector('.input-bankaccount-openingBalanceDate').value;
  openingBalanceDate =
    convertDateToISOFormat(openingBalanceDate);

  // Closing balance date
  let closingBalanceDate =
    document.querySelector('.input-bankaccount-closingBalanceDate').value;
  closingBalanceDate =
    convertDateToISOFormat(closingBalanceDate);

  const validOpeningDate =
    validateInterval('label-bankaccount-openingBalanceDate', 'Dato inngående saldo', openingBalanceDate, closingBalanceDate);
  const validClosingDate =
    validateInterval('label-bankaccount-closingBalanceDate', 'Dato utgående saldo', openingBalanceDate, closingBalanceDate);

  return (validOpeningDate && validClosingDate && validName && validBankAccount) ? true : false;
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
  document.querySelector('.button-bankaccount-insert').disabled =
    true;
}
