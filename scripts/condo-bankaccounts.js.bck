// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccounts('bankaccounts');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objBankAccounts.menu();
objBankAccounts.markSelectedMenu('Bankkonto sameie');

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
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);

    // Find selected bank account id
    const bankAccountId = objBankAccounts.getSelectedBankAccountId('select-bankAccountId');

    // Show leading text
    showLeadingText(bankAccountId);

    // Show all values for bank Account Id
    showValues(bankAccountId);

    // Make events
    createEvents();
  }
}

// Make events for bankaccounts
function createEvents() {

  // Select BankAccount
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccounts-bankAccountId')) {

      let bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
      bankAccountId = (bankAccountId !== 0) ? bankAccountId : objBankAccounts.arrayBankAccounts.at(-1).bankAccountId;
      if (bankAccountId) {
        showValues(bankAccountId);
      }
      /*
      let bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
      bankAccountId =
        (bankAccountId !== 0) ? bankAccountId : objBankAccounts.arrayBankAccounts.at(-1).bankAccountId;
      if (bankAccountId) {
        showValues(bankAccountId);
      }
      */
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounts-update')) {
      // Update bankaccounts and reload bankaccounts
      updateBankAccountSync();

      // Update bankaccount and reload bankaccounts
      async function updateBankAccountSync() {

        // Load bankaccount
        let bankAccountId;
        if (document.querySelector('.select-bankaccounts-bankAccountId').value === '') {

          // Insert new row into bankaccount table
          bankAccountId = 0;
        } else {

          // Update existing row in bankaccounts table
          bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
        }

        if (validateValues()) {

          await updateBankAccount(bankAccountId);
          await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);

          // Select last bankaccounts if bankAccountId is 0
          if (bankAccountId === 0) bankAccountId = objBankAccounts.arrayBankAccounts.at(-1).bankAccountId;

          // Show leading text
          showLeadingText(bankAccountId);

          // Show all values for bankaccount
          showValues(bankAccountId);
        }
      }
    }
  });

  // Insert account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounts-insert')) {

      resetValues();
    }
  });

  // Delete bank account
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounts-delete')) {

      // Delete bankaccount and reload bankaccount
      deleteBankAccountSync();

      // Delete bankaccount
      async function deleteBankAccountSync() {

        await deleteBankAccount(objUserPassword.condominiumId);
        await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);

        // Show leading text
        const bankAccountId = objBankAccounts.arrayBankAccounts.at(-1).bankAccountId;
        showLeadingText(bankAccountId);

        // Show all values for bankaccount
        showValues(bankAccountId);
      };
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounts-cancel')) {

      // Reload bankaccount
      reloadBankAccountSync();
      async function reloadBankAccountSync() {

        let condominiumId = Number(objUserPassword.condominiumId);
        await objBankAccounts.loadBankAccountsTable(condominiumId);

        // Show leading text for maintenance
        // Select first bankaccount Id
        if (objBankAccounts.arrayBankAccounts.length > 0) {
          bankAccountId = objBankAccounts.arrayBankAccounts[0].bankAccountId;
          showLeadingText(bankAccountId);
        }

        // Show all selected bankaccounts
        objBankAccounts.showSeletedBankaccounts('bankaccounts-bankAccountId', bankAccountId);

        // Show bankaccount Id
        showValues(bankAccountId);
      }
    }
  });
}

async function updateBankAccount() {

  // Bank account id
  const bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);

  if (bankAccountId >= 0) {

    // Bank Account number
    const bankAccount = document.querySelector('.input-bankaccounts-bankAccount').value;

    // BankAccount Name
    const bankAccountName = document.querySelector('.input-bankaccounts-name').value;

    // Opening balance date
    let openingBalanceDate = document.querySelector('.input-bankaccounts-openingBalanceDate').value;
    openingBalanceDate = convertDateToISOFormat(openingBalanceDate);

    // Opening balance
    const openingBalance = document.querySelector('.input-bankaccounts-openingBalance').value;

    // Closing balance date
    let closingBalanceDate = document.querySelector('.input-bankaccounts-closingBalanceDate').value;
    closingBalanceDate = convertDateToISOFormat(closingBalanceDate);

    // Closing balance
    const closingBalance = document.querySelector('.input-bankaccounts-closingBalance').value;

    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    const name = document.querySelector('.input-bankaccounts-name').value;
    const condominiumId = Number(objUserPassword.condominiumId);
    const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);

    // Check if bankAccount exist
    if (bankAccountRowNumber !== -1) {

      // update bankAccount
      objBankAccounts.updateBankAccountsTable(bankAccountId, condominiumId, user, lastUpdate, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    } else {

      // insert bankAccount
      objBankAccounts.insertBankAccountsTable(condominiumId, user, lastUpdate, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    }

    document.querySelector('.select-bankaccounts-bankAccountId').disabled = false;
    document.querySelector('.button-bankaccounts-delete').disabled = false;
    document.querySelector('.button-bankaccounts-insert').disabled = false;
  }
}


async function deleteBankAccount() {

  const bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
  if (bankAccountId >= 0) {

    // Check if bank account exist
    const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (bankAccountRowNumber !== -1) {

      // Delete bank accounts row
      const user = objUserPassword.email;
      const lastUpdate = today.toISOString();
      objBankAccounts.deleteBankAccountsTable(bankAccountId, user, lastUpdate);
    }
  }
}

// Show leading text for account
function showLeadingText(bankAccountId) {

  // Show all bank accounts
  objBankAccounts.showSeletedBankaccounts('bankaccounts-bankAccountId', bankAccountId);

  // Show bank account number
  objBankAccounts.showInput('bankaccounts-bankAccount', '* Bankkontonummer', 11, '');

  // bank account name
  objBankAccounts.showInput('bankaccounts-name', '* Kontonavn', 50, '');

  // Opening balance date
  objBankAccounts.showInput('bankaccounts-openingBalanceDate', 'Dato inngående saldo', 10, '');

  // Opening balance
  objBankAccounts.showInput('bankaccounts-openingBalance', 'Inngående saldo', 10, '');

  // Closing balance date
  objBankAccounts.showInput('bankaccounts-closingBalanceDate', 'Dato utgående saldo', 10, '');

  // Closing balance
  objBankAccounts.showInput('bankaccounts-closingBalance', 'Utgående saldo', 10, '');

  // update button
  if (Number(objUserPassword.securityLevel) >= 9) {
    objBankAccounts.showButton('bankaccounts-update', 'Oppdater');

    // new button
    objBankAccounts.showButton('bankaccounts-insert', 'Ny');

    // delete button
    objBankAccounts.showButton('bankaccounts-delete', 'Slett');

    // cancel button
    objBankAccounts.showButton('bankaccounts-cancel', 'Avbryt');
  }
}

// Show all values for bankAccount
function showValues(bankAccountId) {

  // Check for valid bankaccount Id
  if (bankAccountId >= 0) {

    // find object number for selected account 
    const accountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (accountRowNumber !== -1) {

      // Select bank account
      const bankAccountId = objBankAccounts.arrayBankAccounts[accountRowNumber].bankAccountId;
      objBankAccounts.selectBankAccountId(bankAccountId, 'bankaccounts-bankAccountId');

      // account name
      document.querySelector('.input-bankaccounts-name').value = objBankAccounts.arrayBankAccounts[accountRowNumber].name;

      // account number
      document.querySelector('.input-bankaccounts-bankAccount').value = objBankAccounts.arrayBankAccounts[accountRowNumber].bankAccount;

      // opening balance date
      document.querySelector('.input-bankaccounts-openingBalanceDate').value = formatToNorDate(objBankAccounts.arrayBankAccounts[accountRowNumber].openingBalanceDate);

      // opening balance
      document.querySelector('.input-bankaccounts-openingBalance').value = formatOreToKroner(objBankAccounts.arrayBankAccounts[accountRowNumber].openingBalance);

      // closing balance date
      document.querySelector('.input-bankaccounts-closingBalanceDate').value = formatToNorDate(objBankAccounts.arrayBankAccounts[accountRowNumber].closingBalanceDate);

      // closing balance
      document.querySelector('.input-bankaccounts-closingBalance').value = formatOreToKroner(objBankAccounts.arrayBankAccounts[accountRowNumber].closingBalance);
    }
  }
}

// Check for valid values
function validateValues() {

  // Check bank account number
  const bankAccount = document.querySelector('.input-bankaccounts-bankAccount').value;
  const validBankAccount = objBankAccounts.validateBankAccount(bankAccount, "label-bankaccounts-bankAccount", "Bankkontonummer");

  // Check bankaccount Name
  const bankAccountName = document.querySelector('.input-bankaccounts-name').value;
  const validName = objBankAccounts.validateText(bankAccountName, "label-bankaccounts-name", "Kontonavn");

  // Opening balance date
  let openingBalanceDate = document.querySelector('.input-bankaccounts-openingBalanceDate').value;
  openingBalanceDate = convertDateToISOFormat(openingBalanceDate);

  // Closing balance date
  let closingBalanceDate = document.querySelector('.input-bankaccounts-closingBalanceDate').value;
  closingBalanceDate = convertDateToISOFormat(closingBalanceDate);

  const validOpeningDate = validateInterval('label-bankaccounts-openingBalanceDate', 'Dato inngående saldo', openingBalanceDate, closingBalanceDate);
  const validClosingDate = validateInterval('label-bankaccounts-closingBalanceDate', 'Dato utgående saldo', openingBalanceDate, closingBalanceDate);

  return (validOpeningDate && validClosingDate && validName && validBankAccount) ? true : false;
}

function resetValues() {

  // Bank account Id
  document.querySelector('.select-bankaccounts-bankAccountId').value =
    '';

  // Bank account number
  document.querySelector('.input-bankaccounts-bankAccount').value =
    '';

  // Bank account Name
  document.querySelector('.input-bankaccounts-name').value =
    '';

  // Opening balance
  document.querySelector('.input-bankaccounts-openingBalance').value =
    '';

  // Opening balance date
  document.querySelector('.input-bankaccounts-openingBalanceDate').value =
    '';

  // Closing balance
  document.querySelector('.input-bankaccounts-closingBalance').value =
    '';

  // Closing balance date
  document.querySelector('.input-bankaccounts-closingBalanceDate').value =
    '';

  document.querySelector('.select-bankaccounts-bankAccountId').disabled =
    true;
  document.querySelector('.button-bankaccounts-delete').disabled =
    true;
  document.querySelector('.button-bankaccounts-insert').disabled =
    true;
}
