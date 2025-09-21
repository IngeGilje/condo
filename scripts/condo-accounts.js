// maintenance of accounts

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

let isEventsCreated

objAccounts.menu();
objAccounts.markSelectedMenu('Konto');

//let socket;
//socket = connectingToServer();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);

    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

    // Find selected account id
    const accountsId = objAccounts.getSelectedAccountId('select-accounts-accountsId');

    // Show leading text
    showLeadingText(accountsId);

    // Show all values for account
    showValues(accountsId);

    // Make events
    isEventsCreated = (isEventsCreated) ? true : createEvents();
  }
}

// Make events for accounts
function createEvents() {

  // Select Account
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-accounts-accountsId')) {
      const accountsId =
        Number(document.querySelector('.select-accounts-accountsId').value);
      if (accountsId) {
        showValues(accountsId);
      }
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-accounts-update')) {

      updateAccount();
    }
  });

  // Insert account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button--accounts-insert')) {

      resetValues();
    }
  });

  // Delete account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-accounts-delete')) {
      deleteAccountRow();

      // Sends a request to the server to get all accounts
      const SQLquery = `
        SELECT * FROM accounts
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY accountsId;
      `;
      updateMySql(SQLquery, 'account', 'SELECT');
      accountsArrayCreated = false;
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-accounts-cancel')) {

      // Sends a request to the server to get all accounts
      const SQLquery = `
        SELECT * FROM accounts
        WHERE condominiumId = ${objUserPassword.condominiumId}
          AND deleted <> 'Y'
        ORDER BY accountsId;
      `;
      updateMySql(SQLquery, 'account', 'SELECT');
      accountsArrayCreated = false;
    }
  });
  return true;
}

function updateAccount() {

  let SQLquery = "";

  if (validateValues()) {

    // Account number
    const accountsId = Number(document.querySelector('.select-accounts-accountsId').value);

    // Account Name
    const accountName = document.querySelector('.input-accounts-accountName').value;

    // Fixed cost
    let fixedCost = document.querySelector('.select-accounts-fixedCost').value;

    switch (fixedCost) {

      case 'Ja':
        fixedCost = 'Y';
        break;

      case 'Nei':
        fixedCost = 'N';
        break;

      default:
        fixedCost = 'Y';
        break;
    }

    if (accountsId >= 0) {

      const lastUpdate =
        today.toISOString();

      const objAccountRowNumber =
        accountsArray.findIndex(account => account.accountsId === accountsId);

      // Check if account number exist
      if (objAccountRowNumber !== -1) {

        // Update table
        SQLquery = `
          UPDATE account
          SET 
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}',
            name = '${accountName}',
            fixedCost = '${fixedCost}'
          WHERE accountsId = ${accountsId};
        `;

        // Client sends a request to the server
        updateMySql(SQLquery, 'account', 'UPDATE');
      } else {

        // Insert new record
        SQLquery = `
        INSERT INTO account (
          deleted,
          condominiumId,
          user,
          lastUpdate,
          name,
          fixedCost
        ) 
        VALUES (
          'N',
          ${objUserPassword.condominiumId},
          '${objUserPassword.email}',
          '${lastUpdate}',
          '${accountName}',
          '${fixedCost}'
        );
      `;
        // Client sends a request to the server
        updateMySql(SQLquery, 'account', 'INSERT');
      }

      document.querySelector('.select-accounts-accountsId').disabled =
        false;
      document.querySelector('.button-accounts-delete').disabled =
        false;
      document.querySelector('.button--accounts-insert').disabled =
        false;
    }
  }
}

function deleteAccountRow() {

  let SQLquery = "";

  // Check for valid account number
  const accountsId =
    Number(document.querySelector('.select-accounts-accountsId').value);

  if (accountsId !== 1) {

    // Check if account number exist
    const objAccountRowNumber =
      accountsArray.findIndex(account => account.accountsId === accountsId);
    if (objAccountRowNumber !== -1) {

      // Delete table
      SQLquery = `
       UPDATE account
          SET 
            deleted = 'Y'
          WHERE accountsId = ${accountsId};
      `;
      // Client sends a request to the server
      updateMySql(SQLquery, 'account', 'SELECT');
    }
    // Get accounts
    SQLquery = `
      SELECT * FROM accounts
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      ORDER BY accountsId;
    `;
    updateMySql(SQLquery, 'account', 'SELECT');
    accountsArrayCreated = false;
  }
}

// Show leading text for account
function showLeadingText(accountsId) {

  // Show all accounts
  objAccounts.showAllAccounts('accounts-accountsId', accountsId);

  // account name
  objAccounts.showInput('accounts-accountName', '* Kontonavn', 50, '');

  // fixed cost
  objAccounts.showSelectedValues('accounts-fixedCost', 'No', 'Fast kostnad', 'Ja', 'Nei');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objAccounts.showButton('accounts-update', 'Oppdater');

    // new button
    objAccounts.showButton('-accounts-insert', 'Ny');

    // delete button
    objAccounts.showButton('accounts-delete', 'Slett');

    // cancel button
    objAccounts.showButton('accounts-cancel', 'Avbryt');
  }
}

// Show all values for account
function showValues(accountsId) {

  // Check for valid income Id
  if (accountsId >= 0) {

    // find object number for selected account 
    const objAccountRowNumber =
      accountsArray.findIndex(account => account.accountsId === accountsId);
    if (objAccountRowNumber !== -1) {

      // account name
      document.querySelector('.input-accounts-accountName').value = accountsArray[objAccountRowNumber].name;

      // fixed cost
      let fixedCost = accountsArray[objAccountRowNumber].fixedCost;
      switch (fixedCost) {
        case 'Y':
          fixedCost = 'Ja';
          break;

        case 'N':
          fixedCost = 'Nei';
          break;

        default:
          fixedCost = 'Nei';
          break;
      }
      document.querySelector('.select-accounts-fixedCost').value =
        fixedCost;
    }
  }
}

// Check for valid values
function validateValues() {

  // Check account Name
  const accountName = document.querySelector('.input-accounts-accountName').value;
  const validName = objAccounts.validateText(accountName, "label-accounts-accountName", "Kontonavn");

  const fixedCost = document.querySelector('.select-accounts-fixedCost').value;
  const validFixedCost = objAccounts.validateText(fixedCost, "label-accounts-fixedCost", "Fast kostnad");

  return (validName && validFixedCost) ? true : false;
}

function resetValues() {

  // account Id
  document.querySelector('.select-accounts-accountsId').value =
    '';

  // account Name
  document.querySelector('.input-accounts-accountName').value =
    '';

  // Fixed cost
  document.querySelector('.select-accounts-fixedCost').value =
    '';

  document.querySelector('.select-accounts-accountsId').disabled =
    true;
  document.querySelector('.button-accounts-delete').disabled =
    true;
  document.querySelector('.button--accounts-insert').disabled =
    true;
}

// Load tables (users and accounts)
async function loadTables() {

  // Get users
  try {
    const response = await fetch("http://localhost:3000/users?info=moreinformation");
    if (!response.ok) throw new Error("Network error (users)");
    usersArray = await response.json();
  } catch (error) {
    console.log("Error loading users:", error);
  }

  // Get accounts
  try {
    const response = await fetch("http://localhost:3000/accounts");
    if (!response.ok) throw new Error("Network error (accounts)");
    accountsArray = await response.json();
  } catch (error) {
    console.log("Error loading accounts:", error);
  }
}