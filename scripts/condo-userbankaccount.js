// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');

const enableChanges = (objUserBankAccounts.securityLevel > 5);
const applicationName = "condo-userbankaccount";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objUserBankAccounts.condominiumId === 0) || (objUserBankAccounts.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objUserBankAccounts.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      //setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objUserBankAccounts.showHorizontalMenu("filter-frame", objUserBankAccounts.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show user menu
      html = objUserBankAccounts.showHorizontalMenu("filter-frame", objUserBankAccounts.arrayMenuUser);
      document.querySelector('.menuUser').innerHTML = html;
      objUserBankAccounts.markActivatedApplication(objUserBankAccounts.arrayMenuUser, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objUserBankAccounts.condominiumId, resident, objUserBankAccounts.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objUserBankAccounts.condominiumId, fixedCost);
      await objUserBankAccounts.loadUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);

      // Show header
      //showHeader();

      // Show filter
      const userBankAccountId = objUserBankAccounts.arrayUserBankAccounts[0]?.userBankAccountId ?? 0;
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

      await objUserBankAccounts.loadUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);

      userBankAccountId = objUserBankAccounts.arrayUserBankAccounts[0]?.userBankAccountId ?? 0;
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
      await objUserBankAccounts.getHighestUserBankAccountId(objUserBankAccounts.condominiumId);
      const userBankAccountId = objUserBankAccounts.arrayUserBankAccounts[objUserBankAccounts.arrayUserBankAccounts.length - 1].userBankAccountId;
      await objUserBankAccounts.loadUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);

      showFilter(userBankAccountId);
      showUserBankAccount(userBankAccountId);
    };
  });
}

// Show filter
function showFilter(userBankAccountId) {

  // Start filter
  let html = startFilter("Bankkonto");

  // Show user bank accounts filter
  html += objUserBankAccounts.showSelectedUserBankAccountsNew('filterUserBankAccountId', 'Brukerkonto', userBankAccountId, '', '', true);

  // End filter
  html += endFilter();

  document.querySelector(".showFilter").innerHTML = html;

  // Change frame title
  //setFrameTitle("filter-frame","Filter");
}

// Show user bank account
function showUserBankAccount(userBankAccountId) {

  const rowNumberUserBankAccount = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);

  let html = startContent('Bankkonto');

  // user
  const userId = objUserBankAccounts.arrayUserBankAccounts[rowNumberUserBankAccount]?.userId ?? 0;
  //html += objUser.showSelectedUsersNew('Bruker', 'userId', userId, 'Velg bruker', '', true);
  //html += "</div>";
  html += objUser.showSelectedUsersNew('userId', 'Bruker', userId, 'Velg bruker', '', true);
  html += "<div></div>";
  html += "<div></div>";

  // account
  const accountId = objUserBankAccounts.arrayUserBankAccounts[rowNumberUserBankAccount]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId','Konto',  accountId, 'Velg konto', '', true);
  html += "<div></div>";
  html += "<div></div>";

  // bank account
  const bankAccount = objUserBankAccounts.arrayUserBankAccounts[rowNumberUserBankAccount]?.bankAccount ?? '';
  html += showTextNew('bankAccount','Bankkonto',  bankAccount, enableChanges, 'Oppgi Bankkonto');
  html += "<div></div>";
  html += "<div></div>";

  /*
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
  */
  html += endContent();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update primary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("cancel secondary", "Angre", "reset");
    html += inputButton("back secondary", "Tilbake", "button");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showUserBankAccount').innerHTML = html;

  /*
  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterUserBankAccountId', false, 'white');
  }
  */
}

// Delete userbankaccounts  row
async function deleteUserBankAccountRow(userBankAccountId) {

  // Check if account row exist
  accountsRowNumber = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
  if (accountsRowNumber !== -1) {

    // delete user bank account row
    await objUserBankAccounts.deleteUserBankAccountsTable(userBankAccountId, objUserBankAccounts.user);
  }

  await objUserBankAccounts.loadUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);
}

// Update userbankaccounts row
async function updateUserBankAccountsRow(userBankAccountId) {

  userBankAccountId = Number(userBankAccountId);

  // User Id
  let className = 'userId';
  let userId = Number(document.querySelector(`.${className}`).value);
  const validUserId = validateIntervalNew(className,  'Ugyldig Bruker', true, userId, 1, objUserBankAccounts.nineNine, objUserBankAccount);

  // account Id
  className = 'accountId';
  let accountId = Number(document.querySelector(`.${className}`).value);
  const validAccountId = validateIntervalNew(className,  'Ugyldig konto', true, accountId, 1, objUserBankAccounts.nineNine);

  // bank account
  className = 'bankAccount';
  const bankAccount = document.querySelector(`.${className}`).value;
  const validBankAccount = validateBankAccountNew(className, true, bankAccount, '', 'Ugyldig bankkonto');

  if (validUserId && validAccountId && validBankAccount) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the userbankaccounts row exist
    const rowNumberUserBankAccount = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (rowNumberUserBankAccount !== -1) {

      // update the userbankaccounts row
      await objUserBankAccounts.updateUserBankAccountsTable(userBankAccountId, objUserBankAccounts.condominiumId, objUserBankAccounts.user, userId, accountId, bankAccount);
      await objUserBankAccounts.loadUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);

    } else {

      // Insert the userbankaccounts row 
      await objUserBankAccounts.insertUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.user, userId, accountId, bankAccount);
      await objUserBankAccounts.loadUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);
      await objUserBankAccounts.getHighestUserBankAccountId(objUserBankAccounts.condominiumId);
      userBankAccountId = objUserBankAccounts.arrayUserBankAccounts[objUserBankAccounts.arrayUserBankAccounts.length - 1].userBankAccountId;
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
    const rowNumberUserBankAccount = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (rowNumberUserBankAccount !== -1) {

      // update the userbankaccounts row
      await objUserBankAccounts.updateUserBankAccountsTable(userBankAccountId, objUserBankAccounts.condominiumId, objUserBankAccounts.user, userId, accountId, bankAccount);
    } else {

      // Insert the userbankaccounts row 
      await objUserBankAccounts.insertUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.user, userId, accountId, bankAccount);
      await objUserBankAccounts.getHighestUserBankAccountId(objUserBankAccounts.condominiumId);
      userBankAccountId = objUserBankAccounts.arrayUserBankAccounts[objUserBankAccounts.arrayUserBankAccounts.length - 1].userBankAccountId;
    }

    await objUserBankAccounts.loadUserBankAccountsTable(objUserBankAccounts.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);

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
