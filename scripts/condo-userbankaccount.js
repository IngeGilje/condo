// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objUserBankAccount = new UserBankAccount('userbankaccount');

const enableChanges = (objUserBankAccount.securityLevel > 5);
const tableWidth = 'width:950px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objUserBankAccount.condominiumId === 0) || (objUserBankAccount.user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objUserBankAccount.condominiumId, resident, objUserBankAccount.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objUserBankAccount.condominiumId, fixedCost);
      //await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, objUserBankAccount.userId);

      // Show accounts
        await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.userId, objUserBankAccount.nineNine);
      menuNumber = showUserBankAccount(menuNumber);

      // Events
      events();
    }
  } else {

    objUserBankAccount.showMessage(objUserBankAccount, '', 'condo-server.js er ikke startet.');
  }
}


// Events for user bank accounts
async function events() {

  // user filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserId')
      || event.target.classList.contains('filterAccountId')) {

      const userId = Number(document.querySelector('.filterUserId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, userId, accountId);

      showUserBankAccount(3);
    };
  });

  // update a user bank accounts row
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('userId'))
      || [...event.target.classList].some(cls => cls.startsWith('accountId'))
      || [...event.target.classList].some(cls => cls.startsWith('bankAccount'))) {

      const arrayPrefixes = ['userId', 'accountId', 'bankAccount'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objUserBankAccount.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let userBankAccountId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        userBankAccountId = Number(className.slice(prefix.length));
      }

      // Update user bank account
      updateUserBankAccountsRow(userBankAccountId);
    };
  });

  // Delete accounts row
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objUserBankAccount.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objAccount.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const accountId = Number(className.substring(6));
        deleteUserBankAccountRow(accountId, className);

        const userId = Number(document.querySelector('.filterUserId').value);
        await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);

        showUserBankAccount(3);
      };
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objUserBankAccount.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objUserBankAccount.startTable(tableWidth);

  // show main header
  html += objUserBankAccount.showTableHeader('width:175px;', 'Bankkonto for bruker');

  // The end of the table
  html += objUserBankAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objUserBankAccount.startTable(tableWidth);

  // start table body
  html += objUserBankAccount.startTableBody();

  // show main header
  html += objUserBankAccount.showTableHeaderLogOut('width:175px;', '', '', '', 'Bankkonto for bruker', '');
  html += "</tr>";

  // end table body
  html += objUserBankAccount.endTableBody();

  // The end of the table
  html += objUserBankAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, userId) {

  // Start table
  let html = objUserBankAccount.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objUserBankAccount.showTableHeaderMenu('width:175px;', menuNumber, '', 'Bruker', 'Konto', '');

  // start table body
  html += objUserBankAccount.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objUserBankAccount.insertTableColumns('', menuNumber, '');

  // Show all selected users
  html += objUser.showSelectedUsers('filterUserId', 'width:175px;', userId, '', 'Alle', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', '', 0, '', 'Alle', true);
  html += "</tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objUserBankAccount.insertTableColumns('', menuNumber, '', '', '', '');

  // end table body
  html += objUserBankAccount.endTableBody();

  // The end of the table
  html += objUserBankAccount.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // insert table columns in start of a row
  html += objUserBankAccount.insertTableColumns('', menuNumber, 'Ny brukerkonto');

  // user column
  html += objUser.showSelectedUsers('userId0', 'width:175px;', 0, 'Ingen er valgt', '', enableChanges);

  // Account column
  html += objAccount.showSelectedAccounts('accountId0', '', 0, 'Ingen er valgt', '', enableChanges);

  // bank account number
  html += objUserBankAccount.inputTableColumn('bankAccount0', '', '', 11, enableChanges);

  html += "</tr>";
  return html;
}

// Show user bank accounts
function showUserBankAccount(menuNumber) {

  // start table
  let html = objUserBankAccount.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objUserBankAccount.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Slett', 'Bruker', 'Konto', 'Bankkonto');

  objUserBankAccount.arrayUserBankAccounts.forEach((userBankAccount) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objUserBankAccount.insertTableColumns('', menuNumber);

    // Delete
    let className = `delete${userBankAccount.userBankAccountId}`;
    const selected = 'Nei';
    html += objUserBankAccount.showSelectedValues(className, '', enableChanges, selected, 'Nei', 'Ja')

    // user Id
    //const userId = userBankAccount.userId;
    className = `userId${userBankAccount.userBankAccountId}`;
    html += objUser.showSelectedUsers(className, 'width:175px;',userBankAccount.userId, 'Ingen er valgt', '', enableChanges);

    // account Id
    const accountId = userBankAccount.accountId;
    className = `accountId${userBankAccount.userBankAccountId}`;
    html += objAccount.showSelectedAccounts(className, '', accountId, 'Ingen er valgt', '', enableChanges);

    // bank account number
    className = `bankAccount${userBankAccount.userBankAccountId}`;
    html += objUserBankAccount.inputTableColumn(className, '', userBankAccount.bankAccount, 11, enableChanges);

    html += "</tr>";
  });

  // Insert empty table row for insertion
  if (enableChanges) {

    // Insert empty table row for insertion
    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  }

  // Show the rest of the menu
  menuNumber++;
  html += objUserBankAccount.showRestMenu(menuNumber);

  // The end of the table
  html += objUserBankAccount.endTable();
  document.querySelector('.result').innerHTML = html;

  return menuNumber;
}

// Delete one account row
async function deleteUserBankAccountRow(userBankAccountId, className) {

  // Check if account row exist
  accountsRowNumber = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
  if (accountsRowNumber !== -1) {

    // delete user bank account row
    objUserBankAccount.deleteUserBankAccountsTable(userBankAccountId, objUserBankAccount.user);
  }

  await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);
}

// Update userbankaccounts row
async function updateUserBankAccountsRow(userBankAccountId) {

  userBankAccountId = Number(userBankAccountId);

  // User Id
  let className = `userId${userBankAccountId}`;
  let userId = Number(document.querySelector(`.${className}`).value);
  const validUserId = objUserBankAccount.validateNumber(className, userId, 1, objUserBankAccount.nineNine, objUserBankAccount, '', 'Ugyldig bruker');

  // account Id
  className = `accountId${userBankAccountId}`;
  let accountId = Number(document.querySelector(`.${className}`).value);
  const validAccountId = objUserBankAccount.validateNumber(className, accountId, 1, objUserBankAccount.nineNine, objUserBankAccount, '', 'Ugyldig konto');

  // bank account
  className = `bankAccount${userBankAccountId}`;
  const bankAccount = document.querySelector(`.${className}`).value;
  const validBankAccount = objUserBankAccount.validateBankAccount(className, bankAccount, objUserBankAccount, '', 'Ugyldig bankkonto');

  if (validUserId && validAccountId && validBankAccount) {

    document.querySelector('.message').style.display = "none";

    // Check if the userbankaccounts row exist
    const rowNumberUserBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (rowNumberUserBankAccount !== -1) {

      // update the userbankaccounts row
      await objUserBankAccount.updateUserBankAccountsTable(userBankAccountId, objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);

    } else {

      // Insert the userbankaccounts row 
      await objUserBankAccount.insertUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);
    }

    userId = Number(document.querySelector('.filterUserId').value);
    accountId = Number(document.querySelector('.filterAccountId').value);
    await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, userId, accountId);

    menuNumber = showUserBankAccount(3);
  }
}
