// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objUserBankAccounts.menu();
objUserBankAccounts.markSelectedMenu('Bankkonto for bruker');

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

    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);

    // Find selected user bank accounts id
    const userBankAccountId = objUserBankAccounts.getSelectedUserBankAccountId('select-userBankAccountId');

    // Show leading text
    showLeadingText(userBankAccountId);

    // Show all values for user bank Accounts Id
    showValues(userBankAccountId);

    // Make events
    createEvents();
  }
}

/*
// Send a requests to the server
socket.onopen = () => {

  // Sends a request to the server to get users
  let SQLquery =
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

  // Sends a request to the server to get user bank accounts
  SQLquery =
    `
      SELECT * FROM userbankaccount
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY userBankAccountId;
    `;
  updateMySql(SQLquery, 'userbankaccount', 'SELECT');
  userBankAccountsArrayCreated =
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

        usersArray = objInfo.tableArray;
        userArrayCreated = true;
        break;

      case 'account':

        // account table
        console.log('accountTable');

        accountsArray = objInfo.tableArray;
        accountArrayCreated = true;
        break;

      case 'userbankaccount':

        // user bank account table
        console.log('userBankAccountTable');

        // array including objects with user bank account information
        userBankAccountsArray = objInfo.tableArray;
        userBankAccountsArrayCreated = true;

        if (userArrayCreated
          && accountArrayCreated
          && userBankAccountsArrayCreated) {

          // Find selected user Bank account id
          const userBankAccountId =
            objUserBankAccounts.getSelectedUserBankAccountId('select-userbankaccounts-userBankAccountId');

          // Show leading text
          showLeadingText(userBankAccountId);

          // Show all values for user Bank Account
          showValues(userBankAccountId);

          // Make events
          isEventsCreated = (isEventsCreated) ? true : createEvents();
        }
        break;
    }
  }

  if (objInfo.CRUD === 'UPDATE' || objInfo.CRUD === 'INSERT' || objInfo.CRUD === 'DELETE') {

    switch (objInfo.tableName) {
      case 'userbankaccount':

        // Sends a request to the server to get user bank accounts one more time
        SQLquery =
          `
            SELECT * FROM userbankaccount
            WHERE condominiumId = ${objUserPassword.condominiumId}
              AND deleted <> 'Y'
            ORDER BY userbankaccountId;
          `;
        updateMySql(SQLquery, 'userbankaccount', 'SELECT');
        userBankAccountsArrayCreated =
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

}
*/

// Make events for user bank accountId
function createEvents() {

  // Select user bank accountId
  document.addEventListener('change', (event) => {

    if (event.target.classList.contains('select-userbankaccounts-userBankAccountId')) {

      let userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);
      userBankAccountId =
        (userBankAccountId !== 0) ? userBankAccountId : userBankAccountsArray.at(-1).userBankAccountId;
      if (userBankAccountId) {
        showValues(userBankAccountId);
      }
    }
  });

  // Update bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccounts-update')) {

      // Update user bank account and reload user bank account
      updateUserBankAccountSync();

      // Update user bank account and reload user bank account
      async function updateUserBankAccountSync() {

        // Load user bank account
        let userBankAccountId;
        if (document.querySelector('.select-userbankaccounts-userBankAccountId').value === '') {

          // Insert new row into user bank account table
          userBankAccountId = 0;
        } else {

          // Update existing row in user bank account table
          userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);
        }

        await updateUserBankAccount(userBankAccountId);

        await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);

        // Select last user bank account if userBankAccountId is 0
        if (userBankAccountId === 0) userBankAccountId = objUserBankAccounts.userBankAccountsArray.at(-1).userBankAccountId;

        // Show leading text
        showLeadingText(userBankAccountId);

        // Show all values for user bank account
        showValues(userBankAccountId);
      }
    }
  });

  // New user bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccounts-insert')) {

      resetValues();
    }
  });

  // Delete user bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccounts-delete')) {

      // Delete user bank account and reload user bank accounts
      deleteUserBankAccountSync();

      // Delete condo and reload condos
      async function deleteUserBankAccountSync() {

        await deleteUserBankAccount();

        // Load user bank account
        await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);

        // Show leading text
        const userBankAccountId = objUserBankAccounts.userBankAccountsArray.at(-1).userBankAccountId;
        showLeadingText(userBankAccountId);

        // Show all values for condo
        showValues(userBankAccountId);
      };
    };
    /*
    const userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);
    deleteUserBankAccountRow(userBankAccountId);

    // Sends a request to the server to get all user bank account
    const SQLquery =
      `
        SELECT * FROM userbankaccount
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY userBankAccountId;
      `;
    updateMySql(SQLquery, 'userbankaccount', 'SELECT');
    userBankAccountsArrayCreated =
      false;
  }
  */
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-userbankaccounts-cancel')) {

      // Sends a request to the server to get all user
      const SQLquery =
        `
          SELECT * FROM userbankaccount
          WHERE condominiumId = ${objUserPassword.condominiumId}
            AND deleted <> 'Y'
          ORDER BY userBankAccountId;
        `;
      updateMySql(SQLquery, 'userbankaccount', 'SELECT');
      userBankAccountsArrayCreated =
        false;
    }
  });
  return true;
}


/*
function updateUserBankAccount() {

  if (validateValues()) {

    // user Bank Account Id
    const userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);

    // user id
    const userId = Number(document.querySelector('.select-userbankaccounts-userId').value);

    // account id
    const accountId = Number(document.querySelector('.select-userbankaccounts-accountId').value);

    // name
    const bankAccountName = document.querySelector('.input-userbankaccounts-name').value;

    // bank account
    const bankAccount = document.querySelector('.input-userbankaccounts-bankAccount').value;

    let SQLquery = '';

    const lastUpdate = today.toISOString();

    const objBankAccountRowNumber = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);

    // Check if user bank account exist
    if (objBankAccountRowNumber !== -1) {

      // Update table
      SQLquery =
        `
          UPDATE userBankAccount
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            userId = ${userId},
            accountId = ${accountId},
            name = '${bankAccountName}',
            bankAccount = '${bankAccount}'
          WHERE userBankAccountId = ${userBankAccountId}
          ;
        `;
      updateMySql(SQLquery, 'userbankaccount', 'UPDATE');
    } else {

      // Insert new record
      SQLquery =
        `
          INSERT INTO userBankAccount (
            deleted,
            condominiumId,
            user,
            lastUpdate,
            userId,
            accountId,
            name,
            bankAccount
          ) 
          VALUES (
            'N',
            ${objUserPassword.condominiumId},
            '${objUserPassword.email}',
            '${lastUpdate}',
            ${userId},
            ${accountId},
            '${bankAccountName}',
            '${bankAccount}'
          );
        `;
      updateMySql(SQLquery, 'userbankaccount', 'INSERT');
    }

    document.querySelector('.select-userbankaccounts-userBankAccountId').disabled =
      false;
    document.querySelector('.button-userbankaccounts-delete').disabled =
      false;
    document.querySelector('.button-userbankaccounts-insert').disabled =
      false;
  }
}
*/

// Show leading text for user bank account
function showLeadingText(userBankAccountId) {

  // Show all user bank accounts
  objUserBankAccounts.showAllUserBankAccounts('userbankaccounts-userBankAccountId', userBankAccountId);

  // Show all users
  const userId = objUsers.usersArray.at(-1).userId;
  objUsers.showAllUsers('userbankaccounts-userId', userBankAccountId);

  // Show all accounts
  const accountId = objAccounts.accountsArray.at(-1).accountId;
  objAccounts.showAllAccounts('userbankaccounts-accountId', accountId);

  // name
  objUserBankAccounts.showInput('userbankaccounts-name', '* Navn', 50, '');

  // bank account
  objUserBankAccounts.showInput('userbankaccounts-bankAccount', '* Bankkonto', 11, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objUserBankAccounts.showButton('userbankaccounts-update', 'Oppdater');

    // new button
    objUserBankAccounts.showButton('userbankaccounts-insert', 'Ny');

    // delete button
    objUserBankAccounts.showButton('userbankaccounts-delete', 'Slett');

    // cancel button
    objUserBankAccounts.showButton('userbankaccounts-cancel', 'Avbryt');
  }
}

// Show all values for user bank account
function showValues(userBankAccountId) {

  // Check for valid user bank account
  if (userBankAccountId >= 0) {

    // find object number for selected user bank accountId
    const objBankAccountRowNumber = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (objBankAccountRowNumber !== -1) {

      // Select userId
      document.querySelector('.select-userbankaccounts-userId').value = objUserBankAccounts.userBankAccountsArray[objBankAccountRowNumber].userId;

      // Select accountId
      document.querySelector('.select-userbankaccounts-accountId').value = objUserBankAccounts.userBankAccountsArray[objBankAccountRowNumber].accountId;

      // Show bank account name
      document.querySelector('.input-userbankaccounts-name').value = objUserBankAccounts.userBankAccountsArray[objBankAccountRowNumber].name;

      // Show bank account
      document.querySelector('.input-userbankaccounts-bankAccount').value = objUserBankAccounts.userBankAccountsArray[objBankAccountRowNumber].bankAccount;
    }
  }
}

// Check for valid values
function validateValues() {

  // Check user Id
  const userId =
    Number(document.querySelector('.select-userbankaccounts-userId').value);
  const validUserId =
    validateNumber(userId, 1, 99999, "userbankaccounts-userId", "bruker");

  // Check account Id
  const accountId =
    Number(document.querySelector('.select-userbankaccounts-accountId').value);
  const validAccountId =
    validateNumber(accountId, 1, 99999, "userbankaccounts-accountId", "konto");

  // Check name
  const userBankAccountName =
    document.querySelector('.input-userbankaccounts-name').value;
  const validUserBankAccountName =
    objUserBankAccounts.validateText(userBankAccountName, "label-userbankaccounts-name", "Navn");

  // Check bank account
  const bankAccount =
    document.querySelector('.input-userbankaccounts-bankAccount').value;
  const validBankAccount =
    objUserBankAccounts.validateBankAccount(bankAccount, "label-userbankaccounts-bankAccount", "Bankkonto");

  return (validAccountId && validUserId && validBankAccount && validUserBankAccountName) ? true : false;
}

function resetValues() {

  // user bank account
  document.querySelector('.select-userbankaccounts-userBankAccountId').value = 0;

  // reset user Id
  document.querySelector('.select-userbankaccounts-userId').value = 0;

  // reset account Id
  document.querySelector('.select-userbankaccounts-accountId').value = 0;


  // reset bank account name
  document.querySelector('.input-userbankaccounts-name').value = '';

  // reset bank account number
  document.querySelector('.input-userbankaccounts-bankAccount').value = '';

  document.querySelector('.select-userbankaccounts-userBankAccountId').disabled = true;
  document.querySelector('.button-userbankaccounts-delete').disabled = true;
  document.querySelector('.button-userbankaccounts-insert').disabled = true;
}

// Update user bank account
async function updateUserBankAccount(userBankAccountId) {

  // Check values
  if (validateValues()) {

    // user bank account id
    const userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);

    // Condominium
    const condominiumId = objUserPassword.condominiumId;

    // user
    const user = objUserPassword.email;

    // current date
    const lastUpdate = today.toISOString();

    // User Id
    const userId = Number(document.querySelector('.select-userbankaccounts-userId').value);

    // Account Id
    const accountId = document.querySelector('.select-userbankaccounts-accountId').value

    // name
    const name = document.querySelector('.input-userbankaccounts-name').value;


    // Bank account
    const bankAccount = document.querySelector('.input-userbankaccounts-bankAccount').value;

    // Check if user Bank Account id exist
    const objUserBankAccountRowNumber = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (objUserBankAccountRowNumber !== -1) {

      // update user bank account
      await objUserBankAccounts.updateUserBankAccountsTable(userBankAccountId, condominiumId, user, lastUpdate, userId, accountId, name, bankAccount);
    } else {

      // Insert user bank account row in user bank account table
      await objUserBankAccounts.insertUserBankAccountsTable(userBankAccountId, condominiumId, user, lastUpdate, userId, accountId, name, bankAccount);
    }
  }
}

// Delete user bank account
async function deleteUserBankAccount() {

  // Check for valid user bank account Id
  const userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);

  // Check if user bank account id exist
  const objUserBankAccountsRowNumber = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
  if (objUserBankAccountsRowNumber !== -1) {

    // delete user bank account row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objUserBankAccounts.deleteUserBankAccountsTable(userBankAccountId, user, lastUpdate);
  }
}