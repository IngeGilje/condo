// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUser = new User('user');
//const objAccount = new Account('account');
const objCondominium = new Condominium('condominium');
const objBankAccount = new BankAccount('bankaccount');

const enableChanges = (objBankAccount.securityLevel > 5);

const columnWidths = [175, 175, 175]

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

  // Show horizonal menu
  let html = objBankAccount.showHorizontalMenu();
  document.querySelector('.horizontalMenu').innerHTML = html;

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
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, objBankAccount.condominiumId);

      // Show result
      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      menuNumber = showBankAccounts(menuNumber, bankAccountId);

      // Events
      events();
    } else {

      objBankAccount.objBankAccount.showMessage(objBankAccount, '', 'Server er ikke startet.');
    }
  }
}

// Events for bankaccounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondominiumId')) {

      let menuNumber = 0;
      showHeader();

      // Show filter
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objBankAccount.loadBankAccountsTable(objBankAccount.condominiumId, objBankAccount.nineNine);

      menuNumber = 0;
      menuNumber = showFilter(menuNumber, condominiumId);
      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      menuNumber = showBankAccounts(menuNumber, bankAccountId);
    };
  });

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterBankAccountId')) {
      let menuNumber = 0;
      showHeader();

      // Show filter
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      menuNumber = showFilter(menuNumber, condominiumId);

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      await objBankAccount.loadBankAccountsTable(condominiumId, bankAccountId);

      menuNumber = 0;
      menuNumber = showFilter(menuNumber, condominiumId);
      menuNumber = showBankAccounts(menuNumber, bankAccountId);
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

      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      let bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      deleteBankAccountRow(bankAccountId);
      await objBankAccount.loadBankAccountsTable(condominiumId, objBankAccount.nineNine);
      bankAccountId = (objBankAccount.arrayBankAccounts.length === 0)
        ? 0
        : objBankAccount.arrayBankAccounts.at(-1).bankAccountId;

      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, condominiumId);
      menuNumber = showBankAccounts(menuNumber, bankAccountId);

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

      let menuNumber = 0;
      showHeader();

      // Show filter
      const bankAccountId = objCondominium.arrayCondominiums.at(-1).condominiumId;
      const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      await objBankAccount.loadBankAccountsTable(condominiumId, bankAccountId);
      menuNumber = showFilter(menuNumber, condominiumId);
      menuNumber = showBankAccounts(menuNumber, bankAccountId);
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
  html += objBankAccount.showTableHeaderLogOut('', 'Bankkonto sameie');
  html += "</tr>";

  // end table body
  html += objBankAccount.endTableBody();

  // The end of the table
  html += objBankAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show result
function showBankAccounts(menuNumber, bankAccountId) {

  // start table
  let html = objBankAccount.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  menuNumber++;
  html += objBankAccount.showTableHeaderMenu(menuNumber, objBankAccount.accountMenu, '', 'Navn', 'Bankkontonummer');

  // Check if bankaccounts row exist
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);

  // name
  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu);

  // Show menu (<td></td>)
  //menuNumber++;
  //html += objBankAccount.showAccountMenu(menuNumber);

  const name = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].name;
  html += objBankAccount.inputTableColumn('name', '', name, 45, enableChanges);

  // account number
  const bankAccount = (rowNumberBankAccount === -1)
    ? ''
    : objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccount;

  html += objBankAccount.inputTableColumn('bankAccount', '', bankAccount, 11, enableChanges);
  html += "</tr>";

  // Show menu
  menuNumber++;
  html += objBankAccount.showTableHeaderMenu(menuNumber, objBankAccount.accountMenu, '', 'Dato', 'Inngående saldo');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu);

  // opening balance date
  const openingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : formatNumberToNorDate(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate)
  //const openingBalanceDate = formatNumberToNorDate(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate);
  html += objBankAccount.inputTableColumn('openingBalanceDate', '', openingBalanceDate, 10, enableChanges);

  // opening balance
  const openingBalance = (rowNumberBankAccount === -1)
    ? ''
    : formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance)
  //const openingBalance = formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance);
  html += objBankAccount.inputTableColumn('openingBalance', '', openingBalance, 11, enableChanges);
  html += "</tr>";

  // Show menu
  // Header for value 
  menuNumber++;
  html += objBankAccount.showTableHeaderMenu(menuNumber, objBankAccount.accountMenu, '', 'Dato', 'Utgående saldo');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu);

  // closing balance date
  const closingBalanceDate = (rowNumberBankAccount === -1)
    ? ''
    : formatNumberToNorDate(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);

  //const closingBalanceDate = formatNumberToNorDate(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
  html += objBankAccount.inputTableColumn('closingBalanceDate', '', closingBalanceDate, 10, enableChanges);

  // closing balance
  const closingBalance = (rowNumberBankAccount === -1)
    ? ''
    : formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance)
  //const closingBalance = formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance);
  html += objBankAccount.inputTableColumn('closingBalance', '', closingBalance, 11, enableChanges);
  html += "</tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu);
  html += "<td></td><td></td></tr>";

  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu);

    // Show buttons (<tr></td>)
    html += objBankAccount.showButton('update', 'Oppdater');
    html += objBankAccount.showButton('cancel', 'Angre');
    html += "</tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu);

    // Show buttons (<tr></td>)
    html += objBankAccount.showButton('delete', 'Slett');
    html += objBankAccount.showButton('insert', 'Ny');
    html += "</tr>";
  }

  // Show the rest of the menu
  menuNumber++;
  html += objBankAccount.showRestMenu(menuNumber, objBankAccount.accountMenu, '2', '3');

  // The end of the table
  html += objBankAccount.endTable();
  document.querySelector('.result').innerHTML = html;
  if (enableChanges) document.querySelector('.cancel').disabled = true;

  return menuNumber;
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  // condominium id
  const condominiumId = Number(document.querySelector('.filterCondominiumId').value);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objBankAccount.validateText('name', objBankAccount, columnwidths,    '', 'Ugyldig navn',name, 3, 45);
 
  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  const validBankAccount = objBankAccount.validateBankAccount('bankAccount', bankAccount, objBankAccount, '', 'Ugyldig bankkonto');

  // Opening balance date
  let validOpeningBalanceDate = true;
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  if (openingBalanceDate.length > 0) {
    openingBalanceDate = convertDateToISOFormat(openingBalanceDate);
    //validOpeningBalanceDate = objBankAccount.validateInterval('openingBalanceDate', openingBalanceDate, 20150101, 20291231, objBankAccount, '', 'Ugyldig dato');
    validOpeningBalanceDate = objBankAccount.validateInterval('openingBalanceDate', objBankAccount, columnWidths, '', 'Ugyldig dato', true, openingBalanceDate, 20150101, 20291231);
    //          className,          object, columnwidths, style,        message, showMessage = true, number, min, max
  }

  // Opening balance
  let validOpeningBalance = true;
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = formatKronerToOre(openingBalance);
  validOpeningBalance = objBankAccount.validateInterval('openingBalance', objBankAccount, columnwidths, '', 'Ugyldig beløp', true, openingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine,);

  // Closing balance date
  let validClosingBalanceDate = true;
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = convertDateToISOFormat(closingBalanceDate);
  //validClosingBalanceDate = objBankAccount.validateInterval('closingBalanceDate', closingBalanceDate, 20150101, 20291231, objBankAccount, '', 'Ugyldig dato')
  validClosingBalanceDate = objBankAccount.validateInterval('closingBalanceDate', objBankAccount, columnwidths, '', 'Ugyldig dato', true, closingBalanceDate, 20150101, 20291231);
  //          className,         object, columnwidths, style,       message, showMessage = true, number, min, max


  // Closing balance
  let validClosingBalance = true;
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatKronerToOre(closingBalance);
  //validClosingBalance = objBankAccount.validateInterval('closingBalance', closingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine, objBankAccount, '', 'Ugyldig beløp');
  validClosingBalance = objBankAccount.validateInterval('closingBalance', objBankAccount, columnwidths, '', 'Ugyldig beløp', true, closingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine);
  //                                                          className,         object, columnwidths, style, message, showMessage = true,        number,                          min,                     max


  // Validate date interval
  let validBalanceDates = true;
  if (validOpeningBalanceDate && validClosingBalanceDate) {
    validBalanceDates = objBankAccount.validateInterval('openingBalance', objBankAccount, columnwidths, '', 'Ugyldig datointervall', true, Number(openingBalanceDate), Number(openingBalanceDate), Number(openingBalanceDate));
  }

  if (validBankAccount && validName && validBalanceDates && validOpeningBalanceDate && validOpeningBalance
    && validClosingBalanceDate && validOpeningBalance) {

    document.querySelector('.message').style.display = "none";

    // Check if the account id exist
    const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // update the bankaccounts row
      await objBankAccount.updateBankAccountsTable(bankAccountId, objBankAccount.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
      await objBankAccount.loadBankAccountsTable(condominiumId, objBankAccount.nineNine);

    } else {

      // Insert the bankaccount row in bankaccounts table
      await objBankAccount.insertBankAccountsTable(condominiumId, objBankAccount.user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
      await objBankAccount.loadBankAccountsTable(condominiumId, objBankAccount.nineNine);
      bankAccountId = objBankAccount.arrayBankAccounts.at(-1).bankAccountId;
    }

    let menuNumber = 0;
    showHeader();

    objBankAccount.removeMessage();
    menuNumber = showFilter(menuNumber, condominiumId);
    menuNumber = showBankAccounts(menuNumber, bankAccountId);
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

// Show filter
function showFilter(menuNumber, condominiumId) {

  // Start table
  let html = objBankAccount.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objBankAccount.showTableHeaderMenu(menuNumber, objBankAccount.accountMenu, '', 'Sameie', 'Bankkonto');

  // start table body
  html += objBankAccount.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu);

  // Show selected condominiums 
  html += objCondominium.showSelectedCondominiums('filterCondominiumId', 'width:175px;', condominiumId, '', '', enableChanges);

  // Show all bankaccounts for selected condominiums
  // Get last id in last object in bankaccounts array
  const bankAccountId = (objBankAccount.arrayBankAccounts.lenght === 0)
    ? objBankAccount.arrayBankAccounts.at(-1).bankAccountId
    : 0;
  html += objBankAccount.showSelectedBankAccounts('filterBankAccountId', 'width:175px;', bankAccountId, '', '', enableChanges);

  html += "</tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccount.insertTableRow('', menuNumber, objBankAccount.accountMenu, '', '');

  // end table body
  html += objBankAccount.endTableBody();

  // The end of the table
  html += objBankAccount.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}
