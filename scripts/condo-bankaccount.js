// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUser = new User('user');
//const objAccount = new Account('account');
const objCondominium = new Condominium('condominium');
const objBankAccount = new BankAccount('bankaccount');

const enableChanges = (objBankAccount.securityLevel > 5);

const columnWidths = [175, 175]

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
  let html = objBankAccount.showHorizontalMenu(objBankAccount.arrayMenuMain);
  document.querySelector('.menuMain').innerHTML = html;

  // Show condominium menu
  html = objBankAccount.showHorizontalMenu(objBankAccount.arrayMenuCondominium);
  document.querySelector('.menuCondominium').innerHTML = html;

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      const resident = 'Y';
      await objUser.loadUsersTable(objBankAccount.condominiumId, resident, objBankAccount.nineNine);
      const fixedCost = 'A';
      //await objAccount.loadAccountsTable(objBankAccount.condominiumId, fixedCost);
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
      await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, bankAccountId);

      showFilter();
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
      deleteBankAccountRow(bankAccountId);
      await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, objBankAccount.nineNine);
      bankAccountId = (objBankAccount.arrayBankAccounts.length === 0)
        ? 0
        : objBankAccount.arrayBankAccounts.at(-1).bankAccountId;

      //showHeader();

      // Show filter
      showFilter();
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


      //showHeader();

      // Show filter
      const bankAccountId = objCondominium.arrayCondominiums.at(-1).condominiumId;
      //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, bankAccountId);
      showFilter();
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

// Show header
function showHeader() {

  // Start table
  let html = objBankAccount.initializeTable(columnWidths);

  // start table body
  html += objBankAccount.startTableBody();

  // show main header
  html += objBankAccount.showTableHeaderLogOut('Bankkonto');
  html += "</tr>";

  // end table body
  html += objBankAccount.endTableBody();

  // The end of the table
  html += objBankAccount.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show bankaccounts
  // Get last id in last object in bankaccounts array
  const bankAccountId = (objBankAccount.arrayBankAccounts.lenght !== 0)
    ? objBankAccount.arrayBankAccounts.at(-1).bankAccountId
    : 0;
  html += objBankAccount.showSelectedBankAccountsNew('Bankkonto', 'filterBankAccountId', '', bankAccountId, '', '', true);

  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show bank account
function showBankAccount(bankAccountId) {

  // row number bank account
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

  let html = emptyRow();

  // name
  html += startRow();
  const name = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].name.trim();
  html += showTextNew('Navn', 'name', name, enableChanges, "Bankkonto navn");
  html += "</div>";

  // bank account number
  html += startRow();
  const bankAccount = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccount.trim();
  html += showTextNew('Bankkontonummer', 'bankAccount', bankAccount, enableChanges, "Bankkonto navn");
  html += "</div>";

  // opening balance date
  html += startRow();
  let openingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate.trim();

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  openingBalanceDate = formatNumberToISODate(openingBalanceDate);
  html += editDate('Dato', 'openingBalanceDate', openingBalanceDate, enableChanges);

  // opening balance
  let openingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance.trim();
  openingBalance = formatOreToKroner(openingBalance);
  html += showTextNew('Inngående saldo', 'openingBalance', openingBalance, enableChanges, "Inngående saldo");

  html += "</div>";

  // closing balance date
  html += startRow();
  let closingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate.trim();

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  closingBalanceDate = formatNumberToISODate(closingBalanceDate);
  html += editDate('Dato', 'closingBalanceDate', closingBalanceDate, enableChanges)
 
  // closing balance
  let closingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance.trim();
  closingBalance = formatOreToKroner(closingBalance);

  html += showTextNew('Utgående saldo', 'closingBalance', closingBalance, enableChanges, "Utgående saldo");
  html += "</div>";
  /*
  // closing balance
  const closingBalance = (rowNumberBankAccount === -1)
    ? ''
    : formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance)
  //const closingBalance = formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance);
  html += objBankAccount.editTableCell('closingBalance', closingBalance, 11, enableChanges);
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objBankAccount.insertTableRow('');
  html += "</tr>";
  */
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

  document.querySelector('.showBankAccount').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;
  /*
  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    html += objBankAccount.insertTableRow('');

    // Show buttons (<tr></td>)
    html += objBankAccount.showButton('update', 'Oppdater');
    html += objBankAccount.showButton('cancel', 'Angre');
    html += "</tr>";

    // insert a table row (<tr></td>)
    html += objBankAccount.insertTableRow('');

    // Show buttons (<tr></td>)
    html += objBankAccount.showButton('delete', 'Slett');
    html += objBankAccount.showButton('insert', 'Ny');
    html += "</tr>";
  }

  // The end of the table
  html += objBankAccount.endTable();
  document.querySelector('.showBankAccount').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;
  */
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  // condominium id
  //const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objBankAccount.validateText('name', columnWidths, '', 'Ugyldig navn', name, 3, 45);

  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  const validBankAccount = objBankAccount.validateBankAccount('bankAccount', columnWidths, true, bankAccount, '', 'Ugyldig bankkonto');

  // Opening balance date
  let validOpeningBalanceDate = true;
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  if (openingBalanceDate.length > 0) {
    openingBalanceDate = objBankAccount.formatDateToNumber(openingBalanceDate);
    validOpeningBalanceDate = objBankAccount.validateInterval('openingBalanceDate', columnWidths, '', 'Ugyldig dato', true, openingBalanceDate, 0, 20291231);
  }

  // Opening balance
  let validOpeningBalance = true;
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = formatKronerToOre(openingBalance);
  validOpeningBalance = objBankAccount.validateInterval('openingBalance', columnWidths, '', 'Ugyldig beløp', true, openingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine,);

  // Closing balance date
  let validClosingBalanceDate = true;
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = objBankAccount.formatDateToNumber(closingBalanceDate);
  validClosingBalanceDate = objBankAccount.validateInterval('closingBalanceDate', columnWidths, '', 'Ugyldig dato', true, closingBalanceDate, 0, 20291231);


  // Closing balance
  let validClosingBalance = true;
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatKronerToOre(closingBalance);
  validClosingBalance = objBankAccount.validateInterval('closingBalance', columnWidths, '', 'Ugyldig beløp', true, closingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine);


  // Validate date interval
  let validBalanceDates = true;
  if (validOpeningBalanceDate && validClosingBalanceDate) {
    validBalanceDates = objBankAccount.validateInterval('openingBalance', columnWidths, '', 'Ugyldig datointervall', true, Number(openingBalanceDate), Number(openingBalanceDate), Number(openingBalanceDate));
  }

  if (validBankAccount && validName && validBalanceDates && validOpeningBalanceDate && validOpeningBalance
    && validClosingBalanceDate && validOpeningBalance) {

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
      bankAccountId = objBankAccount.arrayBankAccounts.at(-1).bankAccountId;
    }

    //showHeader();

    objBankAccount.removeMessage();
    showFilter();
    showBankAccount(bankAccountId);
  }
}

// Delete one bankaccounts row
async function deleteBankAccountRow(bankAccountId) {

  // Check if bankaccount row exist
  bankAccountsRowNumber = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (bankAccountsRowNumber !== -1) {

    // delete bankaccount row
    objBankAccount.deleteBankAccountsTable(bankAccountId, objBankAccount.user);
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

  objBankAccount.removeMessage();
  if (enableChanges) {
    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}

// Show bank account
function showBankAccount(bankAccountId) {

  // row number bank account
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

  let html = emptyRow();

  // name
  html += startRow();
  const name = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].name.trim();
  html += showTextNew('Navn', 'name', name, enableChanges, "Bankkonto navn");
  html += "</div>";

  // bank account number
  html += startRow();
  const bankAccount = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccount.trim();
  html += showTextNew('Bankkontonummer', 'bankAccount', bankAccount, enableChanges, "Bankkonto navn");
  html += "</div>";

  // opening balance date
  html += startRow();
  let openingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate.trim();

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  openingBalanceDate = formatNumberToISODate(openingBalanceDate);
  html += editDate('Dato', 'openingBalanceDate', openingBalanceDate, enableChanges);

  // opening balance
  let openingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance.trim();
  openingBalance = formatOreToKroner(openingBalance);
  html += showTextNew('Inngående saldo', 'openingBalance', openingBalance, enableChanges, "Inngående saldo");
  html += "</div>";

  // closing balance date
  html += startRow();
  let closingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate.trim();

  // Format date from yyyymmdd -> yyyy-mm-dd (ISO format)
  closingBalanceDate = formatNumberToISODate(closingBalanceDate);
  html += editDate('Dato', 'closingBalanceDate', closingBalanceDate, enableChanges)
 
  // closing balance
  let closingBalance = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance.trim();
  closingBalance = formatOreToKroner(closingBalance);

  html += showTextNew('Utgående saldo', 'closingBalance', closingBalance, enableChanges, "Utgående saldo");
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

  document.querySelector('.showBankAccount').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;
}
