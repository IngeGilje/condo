// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objBankAccounts.menu();
objBankAccounts.markSelectedMenu('Bankkonto sameie');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);

    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);

    // Find selected bank accounts id
    const bankAccountsId = objBankAccounts.getSelectedBankAccountsId('select-bankaccountsId');

    // Show leading text
    showLeadingText(bankAccountsId);

    // Show all values for bank Accounts Id
    showValues(bankAccountsId);

    // Make events
    createEvents();
  }
}

/*
// Send a requests to the server
socket.onopen = () => {

  // Sends a request to the server to get users
  SQLquery =
    `
      SELECT * FROM users
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY userId;
    `;
  updateMySql(SQLquery, 'user', 'SELECT');
  userArrayCreated =
    false;

  // Sends a request to the server to get accounts
  SQLquery =
    `
      SELECT * FROM accounts
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY accountId;
    `;

  updateMySql(SQLquery, 'account', 'SELECT');
  accountArrayCreated =
    false;

  // Sends a request to the server to get bank accountss
  SQLquery =
    `
      SELECT * FROM bankaccount
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY bankaccountId;
    `;

  updateMySql(SQLquery, 'bankaccount', 'SELECT');
  bankAccountArrayCreated =
    false;
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

        userArray = objInfo.tableArray;
        userArrayCreated =
          true;
        break;

      case 'account':

        // account table
        console.log('accountTable');

        accountsArray = objInfo.tableArray;
        accountArrayCreated =
          true;
        break;

      case 'bankaccount':

        // bankaccount table
        console.log('bankaccountTable');

        // array including objects with account information
        bankAccountArray = objInfo.tableArray;
        bankAccountArrayCreated =
          true;

        if (userArrayCreated
          && accountArrayCreated
          && bankAccountArrayCreated) {

          // Find selected account id
          const bankaccountId =
            objBankAccounts.getSelectedBankAccountId('select-bankaccount-accountId');

          // Show leading text
          showLeadingText(bankaccountId);

          // Show all values for bank account
          showValues(bankaccountId);

          // Make events
          isEventsCreated =
           (isEventsCreated) ? true : createEvents();
        }
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
              AND deleted <> 'Y'
            ORDER BY bankAccountId;
          `;
        updateMySql(SQLquery, 'bankaccount', 'SELECT');
        bankAccountArrayCreated =
          false;
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
*/

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
      //objBankAccounts.getBankAccounts(socket);
      const SQLquery = `
        SELECT * FROM bankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY name;
      `;
      updateMySql(SQLquery, 'bankaccount', 'SELECT');
      bankAccountArrayCreated =
        false;
    }
  });
  return true;
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
      const lastUpdate =
        today.toISOString();

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
        ) 
        VALUES (
          'N',
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
        UPDATE bankaccount
        SET 
          deleted = 'Y'
        WHERE bankAccountId = '${bankAccountId}';
      `;

      // Client sends a request to the server
      updateMySql(SQLquery, 'bankaccount', 'DELETE');
    }

    // Get bank account
    SQLquery = `
      SELECT * FROM bankaccount
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY name;
    `;
    // Client sends a request to the server
    updateMySql(SQLquery, 'bankaccount', 'SELECT');
    bankAccountArrayCreated =
      false;
  }
}

// Show leading text for account
function showLeadingText(bankAccountId) {

  // Show all bank accounts
  objBankAccounts.showAllBankAccounts('bankaccount-bankAccountId', bankAccountId);

  // Show bank account number
  objBankAccounts.showInput('bankaccount-bankAccount', '* Bankkontonummer', 11, '');

  // bank account name
  objBankAccounts.showInput('bankaccount-name', '* Kontonavn', 50, '');

  // Opening balance date
  objBankAccounts.showInput('bankaccount-openingBalanceDate', 'Dato inngående saldo', 10, '');

  // Opening balance
  objBankAccounts.showInput('bankaccount-openingBalance', 'Inngående saldo', 10, '');

  // Closing balance date
  objBankAccounts.showInput('bankaccount-closingBalanceDate', 'Dato utgående saldo', 10, '');

  // Closing balance
  objBankAccounts.showInput('bankaccount-closingBalance', 'Utgående saldo', 10, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objBankAccounts.showButton('bankaccount-update', 'Oppdater');

    // new button
    objBankAccounts.showButton('bankaccount-insert', 'Ny');

    // delete button
    objBankAccounts.showButton('bankaccount-delete', 'Slett');

    // cancel button
    objBankAccounts.showButton('bankaccount-cancel', 'Avbryt');
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
      objBankAccounts.selectBankAccountId(bankAccountId, 'bankaccount-bankAccountId');

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
    objBankAccounts.validateBankAccount(bankAccount, "label-bankaccount-bankAccount", "Bankkontonummer");

  // Check bankaccount Name
  const bankAccountName =
    document.querySelector('.input-bankaccount-name').value;
  const validName = objBankAccounts.validateText(bankAccountName, "label-bankaccount-name", "Kontonavn");

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
