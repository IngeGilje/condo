// Maintenance of user bank account

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objUserBankAccounts = new UserBankAccount('userbankaccount');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    const condominiumId = Number(sessionStorage.getItem("condominiumId"));
    const email = sessionStorage.getItem("email");
    if ((condominiumId === 0 || email === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

      const resident = 'A';
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
      await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, objUserBankAccounts.nineNine, objUserBankAccounts.nineNine);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      // Show accounts
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js har ikke startet.');
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
        .map(prefix => objUserBankAccounts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let userBankAccountId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
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

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objUserBankAccounts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objAccounts.getDeleteClass(event.target);
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

// Show header
function showHeader() {

  // Start table
  let html = objUserBankAccounts.startTable('width:1100px;');

  // show main header
  html += objUserBankAccounts.showTableHeader('width:250px;', 'Bankkonto for bruker');

  // The end of the table
  html += objUserBankAccounts.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  let html = objUserBankAccounts.startTable('width:1100px;');

  // Header filter
  rowNumber++;
  html += objUserBankAccounts.showTableHeaderMenu('width:150px;', rowNumber, '', 'Bruker', 'Konto', '');

  // start table body
  html += objUserBankAccounts.startTableBody();

  // insert table columns in start of a row
  html += objUserBankAccounts.insertTableColumns('', 0, '');

  // Show all selected users
  html += objUsers.showSelectedUsersNew('filterUserId', '', 0, '', 'Alle');

  // Show all selected accounts
  html += objAccounts.showSelectedAccounts('filterAccountId', '', 0, '', 'Alle');
  html += "</tr>";

  // insert table columns in start of a row
  html += objUserBankAccounts.insertTableColumns('', 0, '');

  // end table body
  html += objUserBankAccounts.endTableBody();

  // The end of the table
  html += objUserBankAccounts.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";

  // Show menu
  //html += objUserBankAccounts.verticalMenu(rowNumber);

  // insert table columns in start of a row
  rowNumber++;
  html += objUserBankAccounts.insertTableColumns('', rowNumber, 'Ny brukerkonto');

  // delete column
  //html += "<td class='center'>Ny brukerkonto</td>";

  // user column
  html += objUsers.showSelectedUsersNew('userId0', '', 0, 'Ingen er valgt', '');

  // Account column
  html += objAccounts.showSelectedAccounts('accountId0', '', 0, 'Ingen er valgt', '');

  // bank account number
  html += objUserBankAccounts.inputTableColumn('bankAccount0', '', 11);

  html += "</tr>";
  return html;
}

// Show user bank accounts
function showResult(rowNumber) {

  // start table
  let html = objUserBankAccounts.startTable('width:1100px;');

  // table header
  rowNumber++;
  html += objUserBankAccounts.showTableHeaderMenu('width:250px;', rowNumber, '', 'Slett', 'Bruker', 'Konto', 'Bankkonto');

  objUserBankAccounts.arrayUserBankAccounts.forEach((userBankAccount) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objUserBankAccounts.insertTableColumns('', rowNumber);

    // Delete
    let className = `delete${userBankAccount.userBankAccountId}`;
    const selectedChoice = 'Nei';
    html += objUserBankAccounts.showYesNo(className, selectedChoice);

    // user Id
    const userId = userBankAccount.userId;
    className = `userId${userBankAccount.userBankAccountId}`;
    html += objUsers.showSelectedUsersNew(className, '', userId, 'Ingen er valgt', '');

    // account Id
    const accountId = userBankAccount.accountId;
    className = `accountId${userBankAccount.userBankAccountId}`;
    html += objAccounts.showSelectedAccounts(className, '', accountId, 'Ingen er valgt', '');

    // bank account number
    className = `bankAccount${userBankAccount.userBankAccountId}`;
    html += objUserBankAccounts.inputTableColumn(className, userBankAccount.bankAccount, 11);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // The end of the table
  html += objUserBankAccounts.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Delete one account row
async function deleteAccountRow(userBankAccountId, className) {

  const user = objUserInfo.email;


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
  const user = objUserInfo.email;

  // Validate

  // User Id
  let className = `.userId${userBankAccountId}`;
  let userId = Number(document.querySelector(className).value);
  const validUserId = objUserBankAccounts.validateNumber(className, userId, 1, 999999998);

  // account Id
  className = `.accountId${userBankAccountId}`;
  let accountId = Number(document.querySelector(className).value);
  const validAccountId = objUserBankAccounts.validateNumber(className, accountId, 1, 999999998);

  // bank account
  className = `.bankAccount${userBankAccountId}`;
  const bankAccount = document.querySelector(className).value;
  className = `bankAccount${userBankAccountId}`;
  const validBankAccount = objUserBankAccounts.validateBankAccount(className, bankAccount);

  if (validUserId && validAccountId && validBankAccount) {

    // Check if the userbankaccounts row exist
    const rowNumberUserBankAccount = objUserBankAccounts.arrayUserBankAccounts.findIndex(userBankAccount => userBankAccount.userBankAccountId === userBankAccountId);
    if (rowNumberUserBankAccount !== -1) {

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
