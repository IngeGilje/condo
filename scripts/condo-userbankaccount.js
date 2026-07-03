// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
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
      let html = showHorizontalMenu(objUserBankAccount.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = showHorizontalMenu(objUserBankAccount.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objUserBankAccount.condominiumId, resident, objUserBankAccount.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objUserBankAccount.condominiumId, fixedCost);
      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);

      // Show header
      //showHeader();

      // Show filter
      const userBankAccountId = objUserBankAccount.arrayUserBankAccounts[0]?.userBankAccountId ?? 0;
      showFilter(userBankAccountId);

      showUserBankAccount(userBankAccountId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for user bank accounts
async function events() {

  // user filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterUserBankAccountId')) {

      const userBankAccountId = Number(document.querySelector('.filterUserBankAccountId').value);
      showUserBankAccount(userBankAccountId);
    };
  });

  // update a user bank accounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update user bank account
      const userBankAccountId = Number(document.querySelector('.filterUserBankAccountId').value);
      updateUserBankAccountsRow(userBankAccountId);
    };
  });

  // create new user bank accounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      // Create new user bank account
      debugger;
      resetValues();
    };
  });

  // Delete accounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      // Delete user bank account
      let userBankAccountId = Number(document.querySelector('.filterUserBankAccountId').value);
      await deleteUserBankAccountRow(userBankAccountId);

      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);

      userBankAccountId = objUserBankAccount.arrayUserBankAccounts[0]?.userBankAccountId ?? 0;
      showFilter(userBankAccountId);
      showUserBankAccount(userBankAccountId);
    };
  });

  /*
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
  */
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
function showFilter(userBankAccountId) {

  // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show user bank accounts filter
  html += objUserBankAccount.showSelectedUserBankAccountsNew('Brukerkonto', 'filterUserBankAccountId', '', userBankAccountId, '', '', true);
  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

/*
// Show user bank accounts
function showUserBankAccount(userBankAccountId) {

  // Empty row
  // Empty line
let html = emptyLine();

  objUserBankAccount.arrayUserBankAccounts.forEach((userBankAccount) => {

    html += startRow();

    // Show user
    let className = `userId${userBankAccount.userBankAccountId}`;
    html += objUser.showSelectedUsersNew('Bruker', className, '', userBankAccount.userId, 'Velg bruker', '', enableChanges);

    // Show accounts
    className = `accountId${userBankAccount.userBankAccountId}`;
    html += objAccounts.showSelectedAccountsNew('Konto', className, '', userBankAccount.accountId, 'Velg konto', '', enableChanges);

    // bank account number
    className = `bankAccount${userBankAccount.userBankAccountId}`;
    html += showTextNew('Bankkonto', className, userBankAccount.bankAccount, enableChanges, 'Bankkonto');

    // Buttons
    if (enableChanges) {

      className = `delete${userBankAccount.userBankAccountId}`;
      html += showButtonNew(className, 'Slett');
    }

    html += "</div>";
  });

  // Make one last table row for insertion in table 
  if (enableChanges) {

    // Insert empty table row for insertion
    html += insertEmptyTableRow();
  };

  document.querySelector('.showUserBankAccount').innerHTML = html;
}
*/

// Show user bank account
function showUserBankAccount(userBankAccountId) {

  const rowNumberUserBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);

  // Empty line
  let html = emptyLine();

  // user
  html += startRow();

  const userId = objUserBankAccount.arrayUserBankAccounts[rowNumberUserBankAccount]?.userId ?? '';
  html += objUser.showSelectedUsersNew('Bruker', 'userId', '', userId, 'Velg bruker', '', true);
  html += "</div>";

  // account
  html += startRow();

  const accountId = objUserBankAccount.arrayUserBankAccounts[rowNumberUserBankAccount]?.accountId ?? '';
  html += objAccounts.showSelectedAccountsNew('Konto', 'accountId', '', accountId, 'Velg konto', '', true);
  html += "</div>";

  // bank account
  html += startRow();

  const bankAccount = objUserBankAccount.arrayUserBankAccounts[rowNumberUserBankAccount]?.bankAccount ?? '';
  html += showTextNew('Bankkonto', 'bankAccount', bankAccount, enableChanges, 'Bankkonto');
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startRow();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startRow();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  html += startRow();
  html += showButtonNew('back', 'Tilbake');
  html += "</div>";

  document.querySelector('.showUserBankAccount').innerHTML = html;
}

/*
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
  html += objAccounts.showSelectedAccounts(className, '', accountId, 'Velg konto', '', enableChanges);
 
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
*/
/*
// Insert empty table row
function insertEmptyTableRow() {

  let html = "";

  // Insert a table row (<tr></td>)
  html += objUserBankAccount.insertTableRow('');

  // user column
  html += objUser.showSelectedUsers('userId0', '', 0, 'Velg bruker', '', enableChanges);

  // Account column
  html += objAccounts.showSelectedAccounts('accountId0', '', 0, 'Velg konto', '', enableChanges);

  // Bank account number
  html += objUserBankAccount.editTableCell('bankAccount0', '', '', 11, enableChanges);

  html += "<td>Ny brukerkonto</td></tr>";
  return html;

  // Empty row
  // Empty line
  let html = emptyLine();

  html += startRow();

  // Show user
  let className = 'userId0';
  html += objUser.showSelectedUsersNew('Bruker', className, '', '', 'Velg bruker', '', enableChanges);

  // Show accounts
  className = 'accountId0';
  html += objAccounts.showSelectedAccountsNew('Konto', className, '', 0, 'Velg konto', '', enableChanges);

  // bank account number
  className = 'bankAccount';
  html += showTextNew('Bankkonto', className, '', enableChanges, 'Bankkonto');

  // label for insert
  html += `
    <div 
      style='width:250px;' 
        <label>
          Ny bankkonto
        </label>
    </div>`;

  // end of row
  html += "</div>";
  return html;
}
*/

// Delete userbankaccounts  row
async function deleteUserBankAccountRow(userBankAccountId) {

  // Check if account row exist
  accountsRowNumber = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
  if (accountsRowNumber !== -1) {

    // delete user bank account row
    await objUserBankAccount.deleteUserBankAccountsTable(userBankAccountId, objUserBankAccount.user);
  }

  await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);
}

// Update userbankaccounts row
async function updateUserBankAccountsRow(userBankAccountId) {

  userBankAccountId = Number(userBankAccountId);

  // User Id
  let className = 'userId';
  let userId = Number(document.querySelector(`.${className}`).value);
  const validUserId = validateInterval(className, '', 'Ugyldig bruker', true, userId, 1, objUserBankAccount.nineNine, objUserBankAccount);

  // account Id
  className = 'accountId';
  let accountId = Number(document.querySelector(`.${className}`).value);
  const validAccountId = validateInterval(className, columnWidths, '', 'Ugyldig konto', true, accountId, 1, objUserBankAccount.nineNine);

  // bank account
  className = 'bankAccount';
  const bankAccount = document.querySelector(`.${className}`).value;
  const validBankAccount = objUserBankAccount.validateBankAccount(className, columnWidths, true, bankAccount, '', 'Ugyldig bankkonto');

  if (validUserId && validAccountId && validBankAccount) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the userbankaccounts row exist
    const rowNumberUserBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (rowNumberUserBankAccount !== -1) {

      // update the userbankaccounts row
      await objUserBankAccount.updateUserBankAccountsTable(userBankAccountId, objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);

    } else {

      // Insert the userbankaccounts row 
      await objUserBankAccount.insertUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);
    }

    if (enableChanges) {
      document.querySelector('.delete').disabled = false;
      document.querySelector('.insert').disabled = false;
      document.querySelector('.filterUserBankAccountId').disabled = false;
      document.querySelector('.cancel').disabled = true;
    }
    userId = Number(document.querySelector('.filterUserId').value);
    accountId = Number(document.querySelector('.filterAccountId').value);
    await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, userId, accountId);

    showUserBankAccount(userBankAccountId);
  }
}

function resetValues() {

  // User Id
  document.querySelector('.filterUserBankAccountId').value = '';

  // User Id
  document.querySelector('.userId').value = '';

  // account Id
  document.querySelector('.accountId').value = '';

  // bank account
  document.querySelector('.bankAccount').value = '';

  objUserBankAccount.removeMessage();
  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.filterUserBankAccountId').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}
