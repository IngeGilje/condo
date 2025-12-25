// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objUserBankAccounts = new UserBankAccount('userbankaccount');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

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

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, 999999999, 999999999);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter()

    // Show accounts
    menuNumber = showResult(menuNumber);

    // Events
    events();
  }
}


// Events for user bank accounts
function events() {

  // user filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterUserId')
      || event.target.classList.contains('filterAccountId')) {

      filterSync();

      async function filterSync() {

        const userId = Number(document.querySelector('.filterUserId').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, userId, accountId);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });

  // update a user bank accounts row
  document.addEventListener('change', (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('userId'))
      || [...event.target.classList].some(cls => cls.startsWith('accountId'))
      || [...event.target.classList].some(cls => cls.startsWith('bankAccount'))) {

      const arrayPrefixes = ['userId', 'accountId', 'bankAccount'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let userBankAccountId = 0;
      let prefix = "";
      if (className) {
        prefix = prefixes.find(p => className.startsWith(p));
        userBankAccountId = Number(className.slice(prefix.length));
      }

      updateUserBankAccountSync();

      // Update user bank account
      async function updateUserBankAccountSync() {

        updateUserBankAccountsRow(userBankAccountId);
      }
    };
  });

  // Delete accounts row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const className = objAccounts.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const accountId = Number(className.substring(6));
        deleteAccountSync();

        async function deleteAccountSync() {

          deleteAccountRow(accountId, className);

          const fixedCost = 'A';
          await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });
}

/*
// Select user bank accountId
document.addEventListener('change', (event) => {

  if (event.target.classList.contains('select-userbankaccounts-userBankAccountId')) {

    let userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);
    userBankAccountId = (userBankAccountId !== 0) ? userBankAccountId : arrayUserBankAccounts.at(-1).userBankAccountId;
    if (userBankAccountId) {
      showValues(userBankAccountId);
    }
  }
});

// Update bank account
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-userbankaccounts-update')) {

    // Update userbankaccounts and reload userbankaccounts
    updateUserBankAccountSync();

    // Update user bank account and reload user bank accounts
    async function updateUserBankAccountSync() {

      // Load user bank account
      let userBankAccountId;
      if (document.querySelector('.select-userbankaccounts-userBankAccountId').value === '') {

        // Insert new row into user bank account table
        userBankAccountId = 0;
      } else {

        // Update existing row in user bank accounts table
        userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);
      }

      if (validateValues()) {

        await updateUserBankAccount(userBankAccountId);
        await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);

        // Select last user bank accounts if userBankAccountId is 0
        if (userBankAccountId === 0) userBankAccountId = objUserBankAccounts.arrayUserBankAccounts.at(-1).userBankAccountId;

        // Show leading text
        showLeadingText(userBankAccountId);

        // Show all values for user bank account
        showValues(userBankAccountId);
      }
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

    // Delete user bank account and reload user bank account
    deleteUserBankAccountSync();

    // Delete user bank account
    async function deleteUserBankAccountSync() {

      await deleteUserBankAccount();
      await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);

      // Show leading text
      const userBankAccountId = objUserBankAccounts.arrayUserBankAccounts.at(-1).userBankAccountId;
      showLeadingText(userBankAccountId);

      // Show all values for user bank account
      showValues(userBankAccountId);
    };
  };
});
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
arrayUserBankAccountsCreated =
  false;
}

// Cancel
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('button-userbankaccounts-cancel')) {

    // Reload user bank account
    reloadUserBankAccountSync();
    async function reloadUserBankAccountSync() {

      let condominiumId = Number(objUserPassword.condominiumId);
      await objUserBankAccounts.loadUserBankAccountsTable(condominiumId);

      // Show leading text for maintenance
      // Select first user bank account Id
      if (objUserBankAccounts.arrayUserBankAccounts.length > 0) {
        userBankAccountId = objUserBankAccounts.arrayUserBankAccounts[0].userBankAccountId;
        showLeadingText(userBankAccountId);
      }

      // Show all selected user bank account
      objUserBankAccounts.showAllSelectedUserBankAccounts('userbankaccounts-userBankAccountId', userBankAccountId);

      // Show user bank account Id
      showValues(userBankAccountId);
    }
  }
});
*/



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

    

    const bankAccountRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);

    // Check if user bank account exist
    if (bankAccountRowNumber !== -1) {

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
/*
// Show leading text for user bank account
function showLeadingText(userBankAccountId) {

  // Show all user bank accounts
  objUserBankAccounts.showAllSelectedUserBankAccounts('userbankaccounts-userBankAccountId', userBankAccountId);

  // Show all users
  const userId = objUsers.arrayUsers.at(-1).userId;
  objUsers.showAllUsers('userbankaccounts-userId', userBankAccountId);

  // Show all accounts
  const accountId = objAccounts.arrayAccounts.at(-1).accountId;
  objAccounts.showSelectedAccounts('userbankaccounts-accountId', accountId);

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
*/
/*
// Show all values for user bank account
function showValues(userBankAccountId) {

  // Check for valid user bank account
  if (userBankAccountId >= 0) {

    // find object number for selected user bank accountId
    const bankAccountRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (bankAccountRowNumber !== -1) {

      // Select userId
      document.querySelector('.select-userbankaccounts-userId').value = objUserBankAccounts.arrayUserBankAccounts[bankAccountRowNumber].userId;

      // Select accountId
      document.querySelector('.select-userbankaccounts-accountId').value = objUserBankAccounts.arrayUserBankAccounts[bankAccountRowNumber].accountId;

      // Show bank account name
      document.querySelector('.input-userbankaccounts-name').value = objUserBankAccounts.arrayUserBankAccounts[bankAccountRowNumber].name;

      // Show bank account
      document.querySelector('.input-userbankaccounts-bankAccount').value = objUserBankAccounts.arrayUserBankAccounts[bankAccountRowNumber].bankAccount;
    }
  }
}
*/

/*
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
*/

/*
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
    

    // User Id
    const userId = Number(document.querySelector('.select-userbankaccounts-userId').value);

    // Account Id
    const accountId = document.querySelector('.select-userbankaccounts-accountId').value

    // name
    const name = document.querySelector('.input-userbankaccounts-name').value;

    // Bank account
    const bankAccount = document.querySelector('.input-userbankaccounts-bankAccount').value;

    // Check if user Bank Account id exist
    const userBankAccountRowNumberObj = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (userBankAccountRowNumberObj !== -1) {

      // update user bank account
      await objUserBankAccounts.updateUserBankAccountsTable(userBankAccountId, condominiumId, user, userId, accountId, name, bankAccount);
    } else {

      // Insert user bank account row in user bank account table
      await objUserBankAccounts.insertUserBankAccountsTable(userBankAccountId, condominiumId, user, userId, accountId, name, bankAccount);
    }
  }
}
*/
/*
// Delete user bank account
async function deleteUserBankAccount() {

  // Check for valid user bank account Id
  const userBankAccountId = Number(document.querySelector('.select-userbankaccounts-userBankAccountId').value);

  // Check if user bank account id exist
  const userBankAccountRowNumberObj = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
  if (userBankAccountRowNumberObj !== -1) {

    // delete user bank account row
    const user = objUserPassword.email;
    
    objUserBankAccounts.deleteUserBankAccountsTable(userBankAccountId, user);
  }
}
*/

/*
// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += objUserBankAccounts.showTableHeaderNew('width:250px;', 'Bankkonto for bruker');

  // The end of the table
  html += endTableNew();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objUserBankAccounts.startTableNew('width:750px;');

  // show main header
  html += objUserBankAccounts.showTableHeaderNew('width:250px;', 'Bankkonto for bruker');

  //html += objUserBankAccounts.insertEmptyTableRowNew(0,'');

  // The end of the table header
  //html += objUserBankAccounts.endTableHeaderNew();

  // The end of the table
  html += objUserBankAccounts.endTableNew();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  let html = objUserBankAccounts.startTableNew('width:750px;');

  // Header filter
  html += objUserBankAccounts.showTableHeaderNew("width:250px;", '', 'Bruker', 'Konto', '');

  // start table body
  html += objUserBankAccounts.startTableBodyNew();

  // insert table columns in start of a row
  html += objUserBankAccounts.insertTableColumnsNew('', 0, '');

  // Show all selected users
  html += objUsers.showSelectedUsersNew('filterUserId', '', 0, '', 'Alle');

  // Show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, '', 'Alle');
  html += "</tr>";

  //html += objUserBankAccounts.insertEmptyTableRowNew(0,'');
  // insert table columns in start of a row
  html += objUserBankAccounts.insertTableColumnsNew('', 0, '');

  // end table body
  html += objUserBankAccounts.endTableBodyNew();

  // The end of the table
  html += objUserBankAccounts.endTableNew();
  document.querySelector('.filter').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";

  // Show menu
  //html += objUserBankAccounts.menuNew(rowNumber);

  // insert table columns in start of a row
  rowNumber++;
  html += objUserBankAccounts.insertTableColumnsNew('', rowNumber, 'Ny brukerkonto');

  // delete column
  //html += "<td class='center'>Ny brukerkonto</td>";

  // user column
  html += objUsers.showSelectedUsersNew('userId0', '', 0, 'Ingen er valgt', '');

  // Account column
  html += objAccounts.showSelectedAccountsNew('accountId0', '', 0, 'Ingen er valgt', '');

  // bank account number
  html += objUserBankAccounts.inputTableColumnNew('bankAccount0', '', 11);

  html += "</tr>";
  return html;
}

// Show user bank accounts
function showResult(rowNumber) {

  // start table
  let html = objUserBankAccounts.startTableNew('width:750px;');

  // table header
  html += objUserBankAccounts.showTableHeaderNew('width:250px;', '', 'Slett', 'Bruker', 'Konto', 'Bankkonto');

  /*
  // Start HTML table
  html = startHTMLTable('width:750px;');

  // Header
  html += objUserBankAccounts.showTableHeaderNew('width:250px;', '', 'Slett', 'Bruker', 'Konto', 'Bankkonto');
  */

  objUserBankAccounts.arrayUserBankAccounts.forEach((userBankAccount) => {

    //let html = "";

    // Show menu
    //rowNumber++;
    //html += objUserBankAccounts.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objUserBankAccounts.insertTableColumnsNew('', rowNumber);

    // Delete
    let className = `delete${userBankAccount.userBankAccountId}`;
    const selectedChoice = 'Nei';
    html += objUserBankAccounts.showYesNo(className, selectedChoice);

    // user
    const userId = userBankAccount.userId;
    className = `userId${userBankAccount.userBankAccountId}`;
    html += objUsers.showSelectedUsersNew(className, '', userId, 'Ingen er valgt', '');

    // account
    const accountId = userBankAccount.accountId;
    className = `accountId${userBankAccount.userBankAccountId}`;
    html += objAccounts.showSelectedAccountsNew(className, '', accountId, 'Ingen er valgt', '');

    // bank account number
    className = `bankAccount${userBankAccount.userBankAccountId}`;
    html += objUserBankAccounts.inputTableColumnNew(className, userBankAccount.bankAccount, 11);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // The end of the table
  html += objUserBankAccounts.endTableNew();
  document.querySelector('.userbankaccount').innerHTML = html;

  return rowNumber;
}

// Delete one account row
async function deleteAccountRow(userBankAccountId, className) {

  const user = objUserPassword.email;


  // Check if account row exist
  accountsRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(account => userBankAccount.userBankAccountId === userBankAccountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    objUserBankAccounts.deleteAccountsTable(userBankAccountId, user);
  }

  const fixedCost = 'A';
  await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
}

// Update userbankaccounts row
async function updateUserBankAccountsRow(userBankAccountId) {

  userBankAccountId = Number(userBankAccountId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;

  // Validate userbankaccounts columns
  if (validateColumns(userBankAccountId)) {

    // Check userbankaccounts columns
    let className = `.userId${userBankAccountId}`;
    let userId = Number(document.querySelector(className).value);

    className = `.accountId${userBankAccountId}`;
    let accountId = Number(document.querySelector(className).value);

    className = `.bankAccount${userBankAccountId}`;
    let bankAccount = document.querySelector(className).value;

    // Check if the userbankaccounts row exist
    userBankAccountRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (userBankAccountRowNumber !== -1) {

      // update the userbankaccounts row
      await objUserBankAccounts.updateUserBankAccountsTable(userBankAccountId, condominiumId, user, userId, accountId, bankAccount);

    } else {

      // Insert the userbankaccounts row 
      await objUserBankAccounts.insertUserBankAccountsTable(condominiumId, user, userId, accountId, bankAccount);
    }

    userId = Number(document.querySelector('.filterUserId').value);
    accountId = Number(document.querySelector('.filterAccountId').value);
    await objUserBankAccounts.loadUserBankAccountsTable(condominiumId, userId, accountId);
    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Validate user bank account columns
function validateColumns(userBankAccountId) {

  // Check user account users columns
  let className = `.userId${userBankAccountId}`;
  const userId = Number(document.querySelector(className).value);
  const validUserId = validateNumberNew(userId, 1, 999999998);

  className = `.accountId${userBankAccountId}`;
  const accountId = Number(document.querySelector(className).value);
  const validAccountId = validateNumberNew(accountId, 1, 999999998);

  className = `.bankAccount${userBankAccountId}`;
  const bankAccount = document.querySelector(className).value;
  const validBankAccount = objUserBankAccounts.validateBankAccountNew(bankAccount);

  return (validUserId && validAccountId && validBankAccount) ? true : false;
}

