// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objBankAccount = new BankAccount('bankaccount');

// Fixed values
const enableChanges = (objBankAccount.securityLevel > 5);
const applicationName = "condo-bankaccount";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((objBankAccount.condominiumId === 0) || (objBankAccount.user === null)) {

  // LogIn is not valid
  const URL = (objUser.serverStatus === 1)
    ? 'http://ingegilje.no/condo-login.html'
    : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Show main menu
  let html = objBankAccount.showHorizontalMenu("filter-frame", objBankAccount.arrayMainMenu);
  document.querySelector('.menuMain').innerHTML = html;

  // Show condominium menu
  html = objBankAccount.showHorizontalMenu("filter-frame", objBankAccount.arrayMenuCondominium);
  document.querySelector('.menuCondominium').innerHTML = html;
  objBankAccount.markActivatedApplication(objBankAccount.arrayMenuCondominium, applicationName);

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      const resident = 'Y';
      await objUser.loadUsersTable(objBankAccount.condominiumId, resident, objBankAccount.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, objBankAccount.nineNine);

      // Show header
      //showHeader();

      // Show filter
      showFilter();

      // Show bank account
      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
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
      //await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, bankAccountId);

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
      await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, objBankAccount.nineNine);
      bankAccountId = (objBankAccount.arrayBankAccounts.length === 0)
        ? 0
        : objBankAccount.arrayBankAccounts.at(-1)?.bankAccountId ?? 0
      //const bankAccountId = (objBankAccount.arrayBankAccounts.length === 0)
      //  ? 0 ;

      //showHeader();

      // Show filter
      showFilter(bankAccountId);
      showBankAccount(bankAccountId);

    };
  });

  // Insert a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Show filter
      const bankAccountId = objCondominium.arrayCondominiums.at(-1)?.condominiumId ?? 0;
      await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, bankAccountId);
      showFilter(bankAccountId);
      showBankAccount(bankAccountId);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objBankAccount.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

async function deleteBankAccount() {

  const bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
  if (bankAccountId >= 0) {

    // Check if bank account exist
    const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // Delete bank bankaccounts row


      await objBankAccount.deleteBankAccountsTable(bankAccountId, objBankAccount.user);
    }
  }
}

// Show filter
function showFilter(bankAccountId) {

  // Start frame
  let html = startFrame('filter-frame');

  /*
  // Show bankaccounts
  // Get last id in last object in bankaccounts array
  const bankAccountId = (objBankAccount.arrayBankAccounts.length !== 0)
    ? objBankAccount.arrayBankAccounts.at(-1)?.bankAccountId ?? 0
    : 0;
  */
  html += objBankAccount.showSelectedBankAccountsNew('Bankkonto', 'filterBankAccountId', '', bankAccountId, '', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  // validate name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig navn', true, name, 3, 45)

  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  const validBankAccount = validateBankAccountNew('bankAccount', true, bankAccount, '', 'Ugyldig bankkonto');

  // Opening balance date
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  openingBalanceDate = formatISODateToNumber(openingBalanceDate);
  const validOpeningBalanceDate = validateIntervalNew('openingBalanceDate', '', 'Ugyldig Dato inngående saldo', true, openingBalanceDate, 20200101, 20291231);

  // Opening balance
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = formatNorAmountToNumber(openingBalance);
  const validOpeningBalance = validateIntervalNew('openingBalance', '', 'Ugyldig beløp inngående saldo', true, openingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine);

  // Closing balance date
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = formatISODateToNumber(closingBalanceDate)
  const validClosingBalanceDate = validateIntervalNew('closingBalanceDate', '', 'Ugyldig Dato utgående saldo', true, closingBalanceDate, 20200101, 20291231);

  // Closing balance
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatNorAmountToNumber(closingBalance);
  const validClosingBalance = validateIntervalNew('closingBalance', '', 'Ugyldig beløp utgående saldo', true, closingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine);

  if (validBankAccount && validName && validBalanceDates && validOpeningBalanceDate && validOpeningBalance
    && validClosingBalanceDate && validOpeningBalance) {

    /*
  document.querySelector('.showMessage').style.display = "none";
 
  // Check if the account id exist
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
  if (rowNumberBankAccount !== -1) {
 
    // update the bankaccounts row
    await objBankAccount.updateBankAccountsTable(bankAccountId, objBankAccount.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, objBankAccount.nineNine);
 
  } else {
 
    // Insert the bankaccount row in bankaccounts table
    await objBankAccount.insertBankAccountsTable(objBankAccount.condominiumId, objBankAccount.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, objBankAccount.nineNine);
    bankAccountId = objBankAccount.arrayBankAccounts.at(-1)?.bankAccountId ?? 0;
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
      await objBankAccounts.updateAccountsTable(objBankAccount.user, bankAccountId, fixedCost, name);
    } else {

      // Insert a bankAccounts row
      await objBankAccount.insertAccountsTable(objBankAccount.condominiumId, objBankAccount.user, year, priceKilowattHour);
      await objBankAccount.getHighestAccountId(objBankAccount.condominiumId);
      bankAccountId = objBankAccount.arrayBankAccounts[0].bankAccountId;
    }

    await objBankAccounts.loadBankAccountsTable(objBankAccount.condominiumId, fixedCost);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterBankAccountId', false);
    }

    // Show filter
    showFilter(bankAccountId);

    // Show bankAccount
    showBankAccount(bankAccountId);
  }
}

// Delete one bankaccounts row
async function deleteBankAccountRow(bankAccountId) {

  // Check if bankaccount row exist
  bankAccountsRowNumber = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (bankAccountsRowNumber !== -1) {

    // delete bankaccount row
    await objBankAccount.deleteBankAccountsTable(bankAccountId, objBankAccount.user);
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
    disableButton('cancel', false);
    disableButton('filterBankAccountId', true);
  }
}

// Show bank account
function showBankAccount(bankAccountId) {

  // row number bank account
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

  // Empty line
  let html = emptyLine();

  // name
  html += startLine();
  const name = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].name.trim();
  html += showTextNew('Navn', 'name', name, enableChanges, "Bankkonto navn");
  html += "</div>";

  // bank account number
  html += startLine();
  const bankAccount = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccount.trim();
  html += showTextNew('Bankkontonummer', 'bankAccount', bankAccount, enableChanges, "Bankkonto navn");
  html += "</div>";

  // opening balance date
  html += startLine();
  let openingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate.trim();

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  openingBalanceDate = formatNumberToISODate(openingBalanceDate);
  html += showDate('Dato', 'openingBalanceDate', openingBalanceDate, enableChanges);

  // opening balance
  let openingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance.trim();
  openingBalance = formatNumberToNorAmount(openingBalance);
  html += showTextNew('Inngående saldo', 'openingBalance', openingBalance, enableChanges, "Inngående saldo");
  html += "</div>";

  // closing balance date
  html += startLine();
  let closingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate.trim();

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  closingBalanceDate = formatNumberToISODate(closingBalanceDate);
  html += showDate('Dato', 'closingBalanceDate', closingBalanceDate, enableChanges)

  // closing balance
  let closingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance.trim();
  closingBalance = formatNumberToNorAmount(closingBalance);

  html += showTextNew('Utgående saldo', 'closingBalance', closingBalance, enableChanges, "Utgående saldo");
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

  document.querySelector('.showBankAccount').innerHTML = html;

  //if (enableChanges) document.querySelector('.cancel').disabled = true;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterBankAccountId', false, 'white');
  }
}
