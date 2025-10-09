// maintenance of accounts

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objAccounts.menu();
objAccounts.markSelectedMenu('Konto');

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
    const accountId = objAccounts.getSelectedAccountId('select-accounts-accountId');

    // Show leading text
    showLeadingText(accountId);

    // Show all values for account
    showValues(accountId);

    // Make events
    createEvents();
  }
}

// Make events for accounts
function createEvents() {

  // Select Account
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-accounts-accountId')) {

      let accountId = Number(document.querySelector('.select-accounts-accountId').value);
      accountId = (accountId !== 0) ? accountId : objAccounts.arrayAccounts.at(-1).accountId;
      if (accountId) {
        showValues(accountId);
      }

      /*
      const accountId = Number(document.querySelector('.select-accounts-accountId').value);
      if (accountId) {
        showValues(accountId);
      }
      */
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-accounts-update')) {

      // Update accounts and reload accounts
      updateAccountSync();

      // Update account and reload accounts
      async function updateAccountSync() {

        // Load account
        let accountId;
        if (document.querySelector('.select-accounts-accountId').value === '') {

          // Insert new row into account table
          accountId = 0;
        } else {

          // Update existing row in accounts table
          accountId = Number(document.querySelector('.select-accounts-accountId').value);
        }

        if (validateValues()) {

          await updateAccount(accountId);
          await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

          // Select last accounts if accountId is 0
          if (accountId === 0) accountId = objAccounts.arrayAccounts.at(-1).accountId;

          // Show leading text
          showLeadingText(accountId);

          // Show all values for account
          showValues(accountId);
        }
      }
    }
  });
  /*
  // Update account row and reload accounts
  updateAccountSync();
  async function updateAccountSync() {
  
    let accountId;
    if (document.querySelector('.select-accounts-accountId').value === '') {
  
      // Insert new row into accounts table
      accountId = 0;
    } else {
  
      // Update existing row in accounts table
      accountId = Number(document.querySelector('.select-accounts-accountId').value);
    }
  
    updateAccount(accountId);
  
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
  
    // Select last account if accountId is 0
    if (accountId === 0) accountId = objAccounts.accountsArray.at(-1).accountId;
  
    // Show leading text
    showLeadingText(accountId);
  
    // Show values for selected account Id
    showValues(accountId);
  }
  */

  // Insert account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button--accounts-insert')) {

      resetValues();
    }
  });

  // Delete account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-accounts-delete')) {

      // Delete account and reload account
      deleteAccountSync();

      // Delete account
      async function deleteAccountSync() {

        await deleteAccount();
        await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

        // Show leading text
        const accountId = objAccounts.arrayAccounts.at(-1).accountId;
        showLeadingText(accountId);

        // Show all values for account
        showValues(accountId);
      };
    };
  });

  /*
  // Delete account and reload accounts
  deleteAccountSync();
  
  // Delete account and reload accounts
  async function deleteAccountSync() {
  
    deleteAccount();
  
    // Load accounts
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
  
    // Show leading text
    const accountId = objAccounts.accountsArray.at(-1).accountId;
    showLeadingText(accountId);
  
    // Show all values for account
    showValues(accountId);
  }
  */

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-accounts-cancel')) {

      // Reload account
      reloadAccountSync();
      async function reloadAccountSync() {

        let condominiumId = Number(objUserPassword.condominiumId);
        await objAccounts.loadAccountsTable(condominiumId);

        // Show leading text for maintenance
        // Select first account Id
        if (objAccounts.arrayAccounts.length > 0) {
          accountId = objAccounts.arrayAccounts[0].accountId;
          showLeadingText(accountId);
        }

        // Show all selected account
        objAccounts.showAllSelectedAccounts('accounts-accountId', accountId);

        // Show account Id
        showValues(accountId);
      }
    }
  });
}
  /*
  // cancel and reload accounts
  cancelAccountSync();

  // cancel account and reload accounts
  async function cancelAccountSync() {

    // Load accounts
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

    // Show leading text
    const accountId = objAccounts.accountsArray.at(-1).accountId;
    showLeadingText(accountId);

    // Show all values for account
    showValues(accountId);
  }
  */

async function updateAccount() {

  if (validateValues()) {

    // User
    const user = objUserPassword.email;
    // Account number
    const accountId = Number(document.querySelector('.select-accounts-accountId').value);
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

    if (accountId >= 0) {

      const lastUpdate = today.toISOString();
      const condominiumId = Number(objUserPassword.condominiumId);
      const accountRowNumberObj = objAccounts.accountsArray.findIndex(account => account.accountId === accountId);

      // Check if account number exist
      if (accountRowNumberObj !== -1) {

        // update account
        objAccounts.updateAccountsTable(user, accountId, fixedCost, lastUpdate, accountName);

      } else {

        // insert account
        objAccounts.insertAccountsTable(condominiumId, user, lastUpdate, accountName, fixedCost, accountName);
      }

      document.querySelector('.select-accounts-accountId').disabled = false;
      document.querySelector('.button-accounts-delete').disabled = false;
      document.querySelector('.button--accounts-insert').disabled = false;
    }
  }
}

async function deleteAccount() {

  // Check for valid account number
  const accountId = Number(document.querySelector('.select-accounts-accountId').value);

  if (accountId !== 1) {

    // Check if account number exist
    const accountRowNumberObj = objAccounts.accountsArray.findIndex(account => account.accountId === accountId);
    if (accountRowNumberObj !== -1) {

      // delete account row
      const user = objUserPassword.email;
      const lastUpdate = today.toISOString();
      objAccounts.deleteAccountsTable(accountId, user, lastUpdate);
    }
  }
}

// Show leading text for account
function showLeadingText(accountId) {

  // Show all accounts
  objAccounts.showAllAccounts('accounts-accountId', accountId);

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
function showValues(accountId) {

  // Check for valid income Id
  if (accountId >= 0) {

    // find object number for selected account 
    const accountRowNumberObj = objAccounts.accountsArray.findIndex(account => account.accountId === accountId);
    if (accountRowNumberObj !== -1) {

      // account name
      document.querySelector('.input-accounts-accountName').value = objAccounts.accountsArray[accountRowNumberObj].name;

      // fixed cost
      let fixedCost = objAccounts.accountsArray[accountRowNumberObj].fixedCost;
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
  document.querySelector('.select-accounts-accountId').value = '';

  // account Name
  document.querySelector('.input-accounts-accountName').value = '';

  // Fixed cost
  document.querySelector('.select-accounts-fixedCost').value = '';

  document.querySelector('.select-accounts-accountId').disabled = true;
  document.querySelector('.button-accounts-delete').disabled = true;
  document.querySelector('.button--accounts-insert').disabled = true;
}