// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUsers = new Users('users');
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

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, 999999999, 999999999);

    // Show header
    showHeader();

    // Show filter
    showFilter();

    // Show accounts
    showUserBankAccounts();

    // Create events
    createEvents();
  }
}


// Make events for user bank accounts
function createEvents() {

  // user filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterUserId')
      || event.target.classList.contains('filterAccountId')) {

      filterSync();

      async function filterSync() {

        const userId = Number(document.querySelector('.filterUserId').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, userId, accountId);

        showUserBankAccounts();
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
      /*
      if (objDues.getUserClass(event.target)) className = objDues.getUserClass(event.target);
      if (objDues.getAccountClass(event.target)) className = objDues.getAccountClass(event.target);
     if (objDues.getBankAccountClass(event.target)) className = objDues.getBankAccountClass(event.target);

      if (objDues.getUserClass(event.target)) userBankAccountId = Number(className.substring(6));
      if (objDues.getAccountClass(event.target)) userBankAccountId = Number(className.substring(9));
      if (objDues.getBankAccountClass(event.target)) userBankAccountId = className.substring(11);
      */

      /*
      if ([...event.target.classList].some(cls => cls.startsWith('userId'))
        || [...event.target.classList].some(cls => cls.startsWith('accountId'))
        || [...event.target.classList].some(cls => cls.startsWith('bankAccount'))) {
  
        const className = objUserBankAccounts.getAccountClass(event.target);
        const userBankAccountId = Number(className.substring(9));
      */
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

          await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

          showUserBankAccounts();
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

    const lastUpdate = today.toISOString();

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
// Check for valid values
function validateValues() {

  // Check user Id
  const userId = Number(document.querySelector('.select-userbankaccounts-userId').value);
  const validUserId = validateNumber(userId, 1, 99999, "userbankaccounts-userId", "bruker");

  // Check account Id
  const accountId = Number(document.querySelector('.select-userbankaccounts-accountId').value);
  const validAccountId = validateNumber(accountId, 1, 99999, "userbankaccounts-accountId", "konto");

  // Check name
  const userBankAccountName = document.querySelector('.input-userbankaccounts-name').value;
  const validUserBankAccountName = objUserBankAccounts.validateText(userBankAccountName, "label-userbankaccounts-name", "Navn");

  // Check bank account
  const bankAccount = document.querySelector('.input-userbankaccounts-bankAccount').value;
  const validBankAccount = objUserBankAccounts.validateBankAccount(bankAccount, "label-userbankaccounts-bankAccount", "Bankkonto");

  return (validAccountId && validUserId && validBankAccount && validUserBankAccountName) ? true : false;
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
    const userBankAccountRowNumberObj = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (userBankAccountRowNumberObj !== -1) {

      // update user bank account
      await objUserBankAccounts.updateUserBankAccountsTable(userBankAccountId, condominiumId, user, lastUpdate, userId, accountId, name, bankAccount);
    } else {

      // Insert user bank account row in user bank account table
      await objUserBankAccounts.insertUserBankAccountsTable(userBankAccountId, condominiumId, user, lastUpdate, userId, accountId, name, bankAccount);
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
    const lastUpdate = today.toISOString();
    objUserBankAccounts.deleteUserBankAccountsTable(userBankAccountId, user, lastUpdate);
  }
}
*/

function showHeader() {

  // Start table
  let html = startHTMLTable();

  // Main header
  html += showHTMLMainTableHeader('', '', 'Bankkonto for bruker', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable();

  // Header filter for search
  html += showHTMLFilterHeader('', 'Bruker', 'Konto', '');

  // Filter for search
  html += showHTMLFilterSearch();

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Filter for search
function showHTMLFilterSearch() {

  let html =
    `
      <tr>
        <td></td>
    `;


  // Show all selected users
  html += objUsers.showSelectedUsersNew('filterUserId', 0, 'Alle', '');

  // Show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, 'Alle', '');

  html += "</tr>";

  return html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "<tr>";

  // Show menu
  html += objUserBankAccounts.menuNew(rowNumber - 1);

  // delete column
  html += "<td class='center'>Ny brukerkonto</td>";

  // user column
  html += objUsers.showSelectedUsersNew('userId0', 0, '', 'Ingen er valgt');

  // Account column
  html += objAccounts.showSelectedAccountsNew('accountId0', '', 0, '', 'Ingen er valgt');

  // bank account number
  html += objUserBankAccounts.showInputHTMLNew('bankAccount0', '', 11);

  html += "</tr>";
  return html;
}

// Show table sum row
function showTableSumRow(rowNumber, amount) {

  let html = "<tr>";

  // Show menu
  html += objUserBankAccounts.menuNew(rowNumber - 1);

  // condo
  html += "<td></td>";
  // Date
  html += "<td></td>";
  // account
  html += "<td></td>";
  // text sum
  html += "<td class='right bold'>Sum</td>";
  // Amount
  html += `<td class="center bold">${amount}</td>`;
  // Text
  html += "<td></td>";
  html += "</tr>"

  return html;
}

// Show user bank accounts
function showUserBankAccounts() {

  // Start HTML table
  html = startHTMLTable();

  // Header
  html += showHTMLMainTableHeader('Meny', 'Slett', 'Bruker', 'Konto', 'Bankkonto');

  //let sumAmount = 0;
  let rowNumber = 0;

  objUserBankAccounts.arrayUserBankAccounts.forEach((userBankAccount) => {

    rowNumber++;

    html += "<tr>";

    // Show menu
    html += objUserBankAccounts.menuNew(rowNumber - 1);

    // Delete
    let className = `delete${userBankAccount.userBankAccountId}`;
    const selectedChoice = 'Nei';
    html += objUserBankAccounts.showDelete(className, selectedChoice);

    // user
    const userId = userBankAccount.userId;
    className = `userId${userBankAccount.userBankAccountId}`;
    html += objUsers.showSelectedUsersNew(className, userId, '', 'Ingen er valgt');

    // account
    const accountId = userBankAccount.accountId;
    className = `accountId${userBankAccount.userBankAccountId}`;
    html += objAccounts.showSelectedAccountsNew(className, '', accountId, '', 'Ingen er valgt');

    // bank account number
    className = `bankAccount${userBankAccount.userBankAccountId}`;
    html += objUserBankAccounts.showInputHTMLNew(className, userBankAccount.bankAccount, 11);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.userbankaccount').innerHTML = html;
}

// Show the rest of the menu
function showRestMenu(rowNumber) {

  let html = "";
  for (; objUserBankAccounts.arrayMenu.length > rowNumber; rowNumber++) {

    html += "<tr>";

    // Show menu
    html += objUserBankAccounts.menuNew(rowNumber - 1);
    html += "</tr>"
  }

  return html;
}

// Delete one account row
async function deleteAccountRow(userBankAccountId, className) {

  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  // Check if account row exist
  accountsRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(account => userBankAccount.userBankAccountId === userBankAccountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    objUserBankAccounts.deleteAccountsTable(userBankAccountId, user, lastUpdate);
  }

  await objUserBankAccounts.loadAccountsTable(objUserPassword.condominiumId);
}

// Update userbankaccounts row
async function updateUserBankAccountsRow(userBankAccountId) {

  userBankAccountId = Number(userBankAccountId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

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
      await objUserBankAccounts.updateUserBankAccountsTable(userBankAccountId, condominiumId, user, lastUpdate, userId, accountId, bankAccount);

    } else {

      // Insert the userbankaccounts row 
      await objUserBankAccounts.insertUserBankAccountsTable(condominiumId, user, lastUpdate, userId, accountId, bankAccount);
    }

    userId = Number(document.querySelector('.filterUserId').value);
    accountId = Number(document.querySelector('.filterAccountId').value);
    await objUserBankAccounts.loadUserBankAccountsTable(condominiumId, userId, accountId);
    showUserBankAccounts();
  }
}

// Validate user bank account columns
function validateColumns(userBankAccountId) {

  // Check user account users columns
  let className = `.userId${userBankAccountId}`;
  const userId = Number(document.querySelector(className).value);
  const validateUserId = validateNumberNew(userId, 1, 999999998);

  className = `.accountId${userBankAccountId}`;
  const accountId = Number(document.querySelector(className).value);
  const validateAccountId = validateNumberNew(accountId, 1, 999999998);

  className = `.bankAccount${userBankAccountId}`;
  const bankAccount = document.querySelector(className).value;
  const validateBankAccount = objUserBankAccounts.validateBankAccount(bankAccount);

  return (validateUserId && validateAccountId && validateBankAccount) ? true : false;
}