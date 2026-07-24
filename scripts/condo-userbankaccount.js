// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objUserBankAccount = new UserBankAccount('userbankaccount');

const enableChanges = (objUserBankAccount.securityLevel > 5);
const applicationName = "condo-userbankaccount";

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
      let html = objUserBankAccount.showHorizontalMenu(objUserBankAccount.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = objUserBankAccount.showHorizontalMenu(objUserBankAccount.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;
      objUserBankAccount.markActivatedApplication(objUserBankAccount.arrayMenuUser, applicationName);

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

  // insert a new user bank accounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      // insert a new user bank account
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

  // Cancel insert of bankaccountaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      if (enableChanges) {
        disableButton('delete', false);
        disableButton('insert', false);
        disableButton('update', false);
        disableButton('cancel', true);
        disableButton('filterUserBankAccountId', false, 'white');

      }
      // Show last user bank account
      await objUserBankAccount.getHighestUserBankAccountId(objUserBankAccount.condominiumId);
      const userBankAccountId = objUserBankAccount.arrayUserBankAccounts[objUserBankAccount.arrayUserBankAccounts.length - 1].userBankAccountId;
      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);

      showFilter(userBankAccountId);
      showUserBankAccount(userBankAccountId);
    };
  });
}

// Show filter
function showFilter(userBankAccountId) {

  // Start frame
  let html = startFrame();

  // Show user bank accounts filter
  html += objUserBankAccount.showSelectedUserBankAccountsNew('Brukerkonto', 'filterUserBankAccountId', '', userBankAccountId, '', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

// Show user bank account
function showUserBankAccount(userBankAccountId) {

  const rowNumberUserBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);

  // Empty line
  let html = emptyLine();

  // user
  html += startLine();

  const userId = objUserBankAccount.arrayUserBankAccounts[rowNumberUserBankAccount]?.userId ?? 0;
  html += objUser.showSelectedUsersNew('Bruker', 'userId', '', userId, 'Velg bruker', '', true);
  html += "</div>";

  // account
  html += startLine();

  const accountId = objUserBankAccount.arrayUserBankAccounts[rowNumberUserBankAccount]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('Konto', 'accountId', '', accountId, 'Velg konto', '', true);
  html += "</div>";

  // bank account
  html += startLine();

  const bankAccount = objUserBankAccount.arrayUserBankAccounts[rowNumberUserBankAccount]?.bankAccount ?? '';
  html += showTextNew('Bankkonto', 'bankAccount', bankAccount, enableChanges, 'Oppgi Bankkonto');
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  document.querySelector('.showUserBankAccount').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterUserBankAccountId', false, 'white');
  }
}

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
  const validUserId = validateIntervalNew(className, '', 'Ugyldig Bruker', true, userId, 1, objUserBankAccount.nineNine, objUserBankAccount);

  // account Id
  className = 'accountId';
  let accountId = Number(document.querySelector(`.${className}`).value);
  const validAccountId = validateIntervalNew(className, '', 'Ugyldig konto', true, accountId, 1, objUserBankAccount.nineNine);

  // bank account
  className = 'bankAccount';
  const bankAccount = document.querySelector(`.${className}`).value;
  const validBankAccount = validateBankAccountNew(className, true, bankAccount, '', 'Ugyldig bankkonto');

  if (validUserId && validAccountId && validBankAccount) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the userbankaccounts row exist
    const rowNumberUserBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (rowNumberUserBankAccount !== -1) {

      // update the userbankaccounts row
      await objUserBankAccount.updateUserBankAccountsTable(userBankAccountId, objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);
      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);

    } else {

      // Insert the userbankaccounts row 
      await objUserBankAccount.insertUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);
      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);
      await objUserBankAccount.getHighestUserBankAccountId(objUserBankAccount.condominiumId);
      userBankAccountId = objUserBankAccount.arrayUserBankAccounts[objUserBankAccount.arrayUserBankAccounts.length - 1].userBankAccountId;
    }

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterUserBankAccountId', false, 'white');
    }

    // Show filter and user bank account
    showFilter(userBankAccountId);
    showUserBankAccount(userBankAccountId);
  }
  */
 document.querySelector('.showMessage').style.display = "none";

    // Check if the userbankaccounts row exist
    const rowNumberUserBankAccount = objUserBankAccount.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (rowNumberUserBankAccount !== -1) {

       // update the userbankaccounts row
      await objUserBankAccount.updateUserBankAccountsTable(userBankAccountId, objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);
    } else {

     // Insert the userbankaccounts row 
      await objUserBankAccount.insertUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.user, userId, accountId, bankAccount);
      await objUserBankAccount.getHighestUserBankAccountId(objUserBankAccount.condominiumId);
      userBankAccountId = objUserBankAccount.arrayUserBankAccounts[objUserBankAccount.arrayUserBankAccounts.length - 1].userBankAccountId;
    }

      await objUserBankAccount.loadUserBankAccountsTable(objUserBankAccount.condominiumId, objUserBankAccount.nineNine, objUserBankAccount.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterUserBankAccountId', false);
    }

    // Show filter
    showFilter(userBankAccountId);

    // Show user bank account
    showUserBankAccount(userBankAccountId);
  }
}

function resetValues() {

  // User Id
  document.querySelector('.filterUserBankAccountId').value = 0;

  // User Id
  document.querySelector('.userId').value = 0;

  // account Id
  document.querySelector('.accountId').value = 0;

  // bank account
  document.querySelector('.bankAccount').value = '';

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterUserBankAccountId', true);
  }
}
