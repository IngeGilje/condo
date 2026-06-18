// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objUserBankAccount = new UserBankAccount('userbankaccount');

const enableChanges = (objUserBankAccount.securityLevel > 5);

const columnWidths = [175, 175, 175, 175];

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
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objUserBankAccount.showHorizontalMenu(objUserBankAccount.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = objUserBankAccount.showHorizontalMenu(objUserBankAccount.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objUserBankAccount.condominiumId, resident, objUserBankAccount.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objUserBankAccount.condominiumId, fixedCost);

      // Show header
      showHeader();

      // Edit filter
      editFilter(objUserBankAccount.userId);

      // Show accounts
      userId = Number(document.querySelector('.filterUserId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, userId, accountId);

      showUserBankAccount();

      // Events
      events();
    }
  } else {

    objUserBankAccount.showMessageNew(columnWidths, '', 'Server er ikke startet.');
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

    const arrayPrefixes = ['userId', 'accountId', 'bankAccount'];

    if ([...event.target.classList].some(cls => cls.startsWith('userId'))
      || [...event.target.classList].some(cls => cls.startsWith('accountId'))
      || [...event.target.classList].some(cls => cls.startsWith('bankAccount'))) {

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
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

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

      const classNameDelete = `${className}`
      deleteUserBankAccountRow(userBankAccountId, className);

      userId = Number(document.querySelector('.filterUserId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, userId, accountId);

      showUserBankAccount(3);
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

// Show header
function showHeader() {

  // Start table
  let html = objUserBankAccount.initializeTable(columnWidths);

  // start table body
  html += objUserBankAccount.startTableBody();

  // show main header
  html += objUserBankAccount.showTableHeaderLogOut('', '', 'Bankkonto');
  html += "</tr>";

  // end table body
  html += objUserBankAccount.endTableBody();

  // The end of the table
  html += objUserBankAccount.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function editFilter(userId) {

  // Start table
  let html = objUserBankAccount.initializeTable(columnWidths);

  // Header filter (<tr></tr>)

  html += objUserBankAccount.showTableHeaderMenu('', 'center', '', 'Bruker', 'Konto', '');

  // start table body
  html += objUserBankAccount.startTableBody();

  // insert a table row (<tr></td>)

  html += objUserBankAccount.insertTableRow('', '');

  // Show all selected users
  html += objUser.showSelectedUsers('filterUserId', '', userId, '', 'Alle', enableChanges);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', '', 0, '', 'Alle', true);
  html += "</tr>";

  // insert a table row (<tr></td>)

  html += objUserBankAccount.insertTableRow('', '', '', '', '');

  // end table body
  html += objUserBankAccount.endTableBody();

  // The end of the table
  html += objUserBankAccount.endTable();
  document.querySelector('.editFilter').innerHTML = html;


}

// Insert empty table row
function insertEmptyTableRow() {

  let html = "";

  // Insert a table row (<tr></td>)
  html += objUserBankAccount.insertTableRow('');

  // user column
  html += objUser.showSelectedUsers('userId0', '', 0, 'Velg bruker', '', enableChanges);

  // Account column
  html += objAccount.showSelectedAccounts('accountId0', '', 0, 'Velg konto', '', enableChanges);

  // Bank account number
  html += objUserBankAccount.editTableCell('bankAccount0', '', '', 11, enableChanges);

  html += "<td>Ny brukerkonto</td></tr>";
  return html;
}

// Show user bank accounts
function showUserBankAccount() {

  // start table
  let html = objUserBankAccount.initializeTable(columnWidths);

  // Table header (<tr></tr>)

  html += objUserBankAccount.showTableHeaderMenu('#e0f0e0', 'center', 'Bruker', 'Konto', 'Bankkonto', '');

  objUserBankAccount.arrayUserBankAccounts.forEach((userBankAccount) => {

    // insert a table row (<tr></td>)

    html += objUserBankAccount.insertTableRow('');

    // user Id
    //const userId = userBankAccount.userId;
    let className = `userId${userBankAccount.userBankAccountId}`;
    html += objUser.showSelectedUsers(className, '', userBankAccount.userId, 'Velg bruker', '', enableChanges);

    // account Id
    const accountId = userBankAccount.accountId;
    className = `accountId${userBankAccount.userBankAccountId}`;
    html += objAccount.showSelectedAccounts(className, '', accountId, 'Velg konto', '', enableChanges);

    // bank account number
    className = `bankAccount${userBankAccount.userBankAccountId}`;
    html += objUserBankAccount.editTableCell(className, userBankAccount.bankAccount, 11, enableChanges);

    // Delete
    className = `delete${userBankAccount.userBankAccountId}`;
    html += objUserBankAccount.showButton(className, 'Slett');

    html += "</tr>";
  });

  // Insert empty table row for insertion
  if (enableChanges) {

    // Insert empty table row for insertion

    html += insertEmptyTableRow();
  }

  // The end of the table
  html += objUserBankAccount.endTable();
  document.querySelector('.result').innerHTML = html;


}

// Delete one account row
async function deleteUserBankAccountRow(userBankAccountId, className) {

  // Check if account row exist
  accountsRowNumber = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
  if (accountsRowNumber !== -1) {

    // delete user bank account row
    await objUserBankAccount.deleteUserBankAccountsTable(userBankAccountId, objUserBankAccount.user);
  }

  userId = Number(document.querySelector('.filterUserId').value);
  accountId = Number(document.querySelector('.filterAccountId').value);
  await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, userId, accountId);
}

// Update userbankaccounts row
async function updateUserBankAccountsRow(userBankAccountId) {

  userBankAccountId = Number(userBankAccountId);

  // User Id
  let className = `userId${userBankAccountId}`;
  let userId = Number(document.querySelector(`.${className}`).value);
  const validUserId = objUserBankAccount.validateInterval(className, columnWidths, '', 'Ugyldig bruker', true, userId, 1, objUserBankAccount.nineNine, objUserBankAccount);

  // account Id
  className = `accountId${userBankAccountId}`;
  let accountId = Number(document.querySelector(`.${className}`).value);
  const validAccountId = objUserBankAccount.validateInterval(className, columnWidths, '', 'Ugyldig konto', true, accountId, 1, objUserBankAccount.nineNine);

  // bank account
  className = `bankAccount${userBankAccountId}`;
  const bankAccount = document.querySelector(`.${className}`).value;
  const validBankAccount = objUserBankAccount.validateBankAccount(className, columnWidths, true, bankAccount, '', 'Ugyldig bankkonto');

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

    showUserBankAccount(3);
  }
}
