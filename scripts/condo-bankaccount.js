// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objBankAccounts = new BankAccounts('bankaccounts');

const enableChanges = (objBankAccounts.securityLevel > 5);
const applicationName = "condo-bankaccount";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((objBankAccounts.condominiumId === 0) || (objBankAccounts.user === null)) {

  // LogIn is not valid
  const URL = (objUser.serverStatus === 1)
    ? 'http://ingegilje.no/condo-login.html'
    : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Show menu
  let html = objCondominium.showMenu(objBankAccounts.securityLevel);
  document.querySelector('.menuVertical').innerHTML = html;

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      const resident = 'Y';
      await objUser.loadUsersTable(objBankAccounts.condominiumId, resident, objBankAccounts.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId, objBankAccounts.nineNine);

      // Show filter
      // Get last id in last object in condominiums array
      let bankAccountId = (objCondominium.arrayCondominiums.length > 0)
        ? objCondominium.arrayCondominiums.at(-1)?.bankAccountId ?? 0
        : 0;
      showFilter(bankAccountId);

      // Show bank account
      bankAccountId = Number(document.querySelector('.filterBankAccountId').value);

      showBankAccount(bankAccountId);

      // Events
      events();
    } else {

      showMessageNew('Server er ikke startet.');
    }
  }
}

// Events for bankaccounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterBankAccountId')) {

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);

      // show filter
      showFilter(bankAccountId);

      // show bank account
      showBankAccount(bankAccountId);
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      updateBankAccountRow(bankAccountId);
    };
  });

  // Delete bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      let bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      await deleteBankAccountRow(bankAccountId);
    };
  });

  // Insert a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  /*
  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Show filter
      const bankAccountId = objCondominium.arrayCondominiums.at(-1)?.condominiumId ?? 0;
      await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId, bankAccountId);
      showFilter(bankAccountId);
      showBankAccount(bankAccountId);
    };
  });
  */

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objBankAccounts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

/*
async function deleteBankAccount() {

  const bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
  if (bankAccountId >= 0) {

    // Check if bank account exist
    const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // Delete bank bankaccounts row


      await objBankAccounts.deleteBankAccountsTable(bankAccountId, objBankAccounts.user);
    }
  }
}
*/

/*
// Delete one deleteBankAccount row
async function deleteBankAccount(bankAccountId) {

  // Check if bankaccount row exist
  bankAccountsRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.accountId === accountId);
  if (bankAccountsRowNumber !== -1) {

    // delete bankAccount row
    await objAccounts.deleteAccountsTable(accountId, objAccounts.user);
    await objAccounts.getHighestAccountId(objAccounts.condominiumId);
    accountId = objAccounts.arrayAccounts[0].accountId;
  }

  const fixedCost = 'A';
  await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

  // Show filter
  showFilter(accountId);

  // Show bankAccount
  showAccount(accountId);
}
*/


// Show filter
function showFilter(bankAccountId) {

  // Start filter
  let html = startGridFilter("Sameie");

  // Show bankaccounts
  html += objBankAccounts.showSelectedBankAccountsNew('filterBankAccountId', 'Bankkonto', bankAccountId, '', '', true);

  // End filter
  html += endGridFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show bank account
function showBankAccount(bankAccountId) {

  // row number bank account
  const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

  let html = startGrid('Sameie');

  // name
  /*
  const name = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].name.trim();
  */
  const name = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.name ?? '';
  //html += showTextNew('Navn', 'name', name, enableChanges, "Bankkonto navn");
  html += inputText('name', 'Navn', name, enableChanges);
  html += "<div></div>";

  // bank account number
  /*
  const bankAccount = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccount.trim();
  */
  const bankAccount = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.bankAccount.trim() ?? '';
  html += inputText('bankAccount', 'Bankkontonummer', bankAccount, enableChanges);
  html += "<div></div>";

  // opening balance date
  /*
  let openingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate.trim();
  */
  let openingBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.openingBalanceDate.trim() ?? '';
  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  openingBalanceDate = formatNumberToISODate(openingBalanceDate);
  html += inputDate('openingBalanceDate', 'Dato', openingBalanceDate, enableChanges);

  // opening balance
  /*
  let openingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalance.trim();
  */
  let openingBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.openingBalance.trim() ?? '';
  openingBalance = formatNumberToNorAmount(openingBalance);
  //html += showTextNew('Inngående saldo', 'openingBalance', openingBalance, enableChanges, "Inngående saldo");
  html += inputText('openingBalance', 'Inngående saldo', openingBalance, enableChanges)

  // closing balance date

  /*
  let closingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate;
  */
  let closingBalanceDate = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.closingBalanceDate ?? '';
  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  closingBalanceDate = formatNumberToISODate(closingBalanceDate);
  //html += showDate('Dato', 'closingBalanceDate', closingBalanceDate, enableChanges);
  html += inputDate('closingBalanceDate', 'Dato', closingBalanceDate, enableChanges);

  // closing balance
  /*
  let closingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalance;
  */
  let closingBalance = objBankAccounts.arrayBankAccounts[rowNumberBankAccount]?.closingBalance ?? '';
  closingBalance = formatNumberToNorAmount(closingBalance);

  //html += showTextNew('Utgående saldo', 'closingBalance', closingBalance, enableChanges, "Utgående saldo");
  html += inputText('closingBalance', 'Utgående saldo', closingBalance, enableChanges)

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showBankAccount').innerHTML = html;
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  // validate name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', 'Ugyldig navn', true, name, 3, 45)

  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  const validBankAccount = validateBankAccountNew('bankAccount', true, bankAccount, '', 'Ugyldig bankkonto');

  // Opening balance date
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  openingBalanceDate = formatISODateToNumber(openingBalanceDate);
  const validOpeningBalanceDate = validateIntervalNew('openingBalanceDate', 'Ugyldig Dato inngående saldo', true, openingBalanceDate, 20200101, 20291231);

  // Opening balance
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = formatNorAmountToNumber(openingBalance);
  const validOpeningBalance = validateIntervalNew('openingBalance', 'Ugyldig beløp inngående saldo', true, openingBalance, objBankAccounts.minusNineNine, objBankAccounts.nineNine);

  // Closing balance date
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = formatISODateToNumber(closingBalanceDate)
  const validClosingBalanceDate = validateIntervalNew('closingBalanceDate', 'Ugyldig Dato utgående saldo', true, closingBalanceDate, 20200101, 20291231);

  // Closing balance
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatNorAmountToNumber(closingBalance);
  const validClosingBalance = validateIntervalNew('closingBalance', 'Ugyldig beløp utgående saldo', true, closingBalance, objBankAccounts.minusNineNine, objBankAccounts.nineNine);

  if (validBankAccount && validName && validOpeningBalanceDate && validOpeningBalance
    && validClosingBalanceDate && validOpeningBalance) {

    /*
  document.querySelector('.showMessage').style.display = "none";
 
  // Check if the account id exist
  const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
  if (rowNumberBankAccount !== -1) {
 
    // update the bankaccounts row
    await objBankAccounts.updateBankAccountsTable(bankAccountId, objBankAccounts.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId, objBankAccounts.nineNine);
 
  } else {
 
    // Insert the bankaccount row in bankaccounts table
    await objBankAccounts.insertBankAccountsTable(objBankAccounts.condominiumId, objBankAccounts.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId, objBankAccounts.nineNine);
    bankAccountId = objBankAccounts.arrayBankAccounts.at(-1)?.bankAccountId ?? 0;
  }
 
  removeMessage();
 
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('filterBankAccountId', false, 'white');
    disableButton('cancel', true);
  }
 
  // show filter
  showFilter(bankAccountId);
 
  // Show account
  showAccount(bankAccountId);
}
*/
    document.querySelector('.showMessage').style.display = "none";

    // Check if the bankAccount Id exist
    const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // update a bankAccounts row
      await objBankAccounts.updateBankAccountsTable(bankAccountId, objBankAccounts.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    } else {

      // Insert a bankAccounts row
      await objBankAccounts.insertBankAccountsTable(objBankAccounts.condominiumId, objBankAccounts.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
      await objBankAccounts.getHighestBankAccountId(objBankAccounts.condominiumId);
      bankAccountId = objBankAccounts.arrayBankAccounts[0].bankAccountId;
    }

    await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId, objBankAccounts.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      //disableButton('cancel', true);
      disableButton('filterBankAccountId', false);
    }

    // Show filter
    showFilter(bankAccountId);

    // Show bankAccount
    showBankAccount(bankAccountId);
  }
}

// Reset values
function resetValues() {

  // Bank account Id
  document.querySelector('.filterBankAccountId').value = '';

  // Bank account number
  document.querySelector('.bankAccount').value = '';

  // Bank account Name
  document.querySelector('.name').value = '';

  // Opening balance
  document.querySelector('.openingBalance').value = '';

  // Opening balance date
  document.querySelector('.openingBalanceDate').value = '';

  // Closing balance
  document.querySelector('.closingBalance').value = '';

  // Closing balance date
  document.querySelector('.closingBalanceDate').value = '';

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    //disableButton('cancel', false);
    disableButton('filterBankAccountId', true);
  }
}

/*
// Delete one bankaccounts row
async function deleteBankAccountRow(bankAccountId) {

  // Check if bankaccount row exist
  bankAccountsRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (bankAccountsRowNumber !== -1) {

    // delete bankaccount row
    await objBankAccounts.deleteBankAccountsTable(bankAccountId, objBankAccounts.user);
  }
*/

// Delete one bankAccounts row
async function deleteBankAccountRow(bankAccountId) {

  // Check if bankaccount row exist
  bankAccountsRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.accountId === accountId);
  if (bankAccountsRowNumber !== -1) {

    // delete bankaccounts row
    await objBankAccounts.deleteAccountsTable(accountId, objBankAccounts.user);
    await objBankAccounts.getHighestAccountId(objBankAccounts.condominiumId);
    bankAccountId = objBankAccounts.arrayBankAccounts[0].bankAccountId;
  }

  await objBankAccounts.loadBankAccountsTable(objBankAccounts.condominiumId);

  // Show filter
  showFilter(bankAccountId);

  // Show bankAccount
  showAccount(bankAccountId);
}