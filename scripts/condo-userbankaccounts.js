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

      // Delete user bank account and reload user bank account
      async function deleteUserBankAccountSync() {

        await deleteUserBankAccount();

        // Load user bank account
        await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);

        // Show leading text
        const userBankAccountId = objUserBankAccounts.userBankAccountsArray.at(-1).userBankAccountId;
        showLeadingText(userBankAccountId);

        // Show all values for supplier
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

    const bankAccountRowNumberObj = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);

    // Check if user bank account exist
    if (bankAccountRowNumberObj !== -1) {

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
  const userId = objUsers.arrayUsers.at(-1).userId;
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
    const bankAccountRowNumberObj = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (bankAccountRowNumberObj !== -1) {

      // Select userId
      document.querySelector('.select-userbankaccounts-userId').value = objUserBankAccounts.userBankAccountsArray[bankAccountRowNumberObj].userId;

      // Select accountId
      document.querySelector('.select-userbankaccounts-accountId').value = objUserBankAccounts.userBankAccountsArray[bankAccountRowNumberObj].accountId;

      // Show bank account name
      document.querySelector('.input-userbankaccounts-name').value = objUserBankAccounts.userBankAccountsArray[bankAccountRowNumberObj].name;

      // Show bank account
      document.querySelector('.input-userbankaccounts-bankAccount').value = objUserBankAccounts.userBankAccountsArray[bankAccountRowNumberObj].bankAccount;
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
    const condominiumId = Number(objUserPassword.condominiumId);

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
    const userBankAccountRowNumberObj = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (userBankAccountRowNumberObj !== -1) {

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
  const userBankAccountRowNumberObj = objUserBankAccounts.userBankAccountsArray.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
  if (userBankAccountRowNumberObj !== -1) {

    // delete user bank account row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objUserBankAccounts.deleteUserBankAccountsTable(userBankAccountId, user, lastUpdate);
  }
}