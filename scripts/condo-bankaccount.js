// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objCondominium = new Condominium('condominium');
const objBankAccount = new BankAccount('bankaccount');

const enableChanges = (objBankAccount.securityLevel > 5);

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
if ((condominiumId === 0 || objBankAccount.user === null)) {

  // LogIn is not valid
  const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
  window.location.href = URL;
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUser.checkServer()) {

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident, objBankAccount.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);
      await objCondominium.loadCondominiumsTable();
      await objBankAccount.loadBankAccountsTable(condominiumId, objBankAccount.nineNine);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(condominiumId, menuNumber);

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      await objBankAccount.loadBankAccountsTable(condominiumId, bankAccountId);

      // Show result
      menuNumber = showResult(bankAccountId, menuNumber);

      // Events
      events();
    } else {

      objBankAccount.objBankAccount.showMessage(objBankAccount, '', 'condo-server.js er ikke startet.');
    }
  }
}

// Events for bankaccounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (([...event.target.classList].some(cls => cls.startsWith('filterCondominiumId')))
      || ([...event.target.classList].some(cls => cls.startsWith('filterBankAccountId')))) {

      let menuNumber = 0;
      showHeader();

      // Show filter
      condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      menuNumber = showFilter(condominiumId, menuNumber);

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      await objBankAccount.loadBankAccountsTable(condominiumId, bankAccountId);

      menuNumber = showResult(bankAccountId, 3);
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      updateBankAccountRow(bankAccountId);
    };
  });

  // Delete bankaccounts row
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      deleteBankAccountRow(bankAccountId);

      let menuNumber = 0;
      showHeader();

      // Show filter
      condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      menuNumber = showFilter(condominiumId, menuNumber);

      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      await objBankAccount.loadBankAccountsTable(condominiumId, bankAccountId);

      menuNumber = showResult(bankAccountId, menuNumber);

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
      condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      menuNumber = showFilter(condominiumId, menuNumber);

      // Reload bankaccounts table
      const bankAccountId = objCondominium.arrayCondominiums.at(-1).condominiumId;
      await objBankAccount.loadBankAccountsTable(condominiumId, bankAccountId);

      menuNumber = showResult(bankAccountId, menuNumber);
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


      objBankAccount.deleteBankAccountsTable(bankAccountId, user);
    }
  }
}

// Show header
function showHeader() {

  // Start table
  html = objBankAccount.startTable(tableWidth);

  // start table body
  html += objBankAccount.startTableBody();

  // show main header
  html += objBankAccount.showTableHeaderLogOut('width:175px;', '', 'Bankkonto sameie', '');
  html += "</tr>";

  // end table body
  html += objBankAccount.endTableBody();

  // The end of the table
  html += objBankAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show result
function showResult(bankAccountId, menuNumber) {

  // start table
  let html = objBankAccount.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objBankAccount.showTableHeaderMenu("width:175px;", menuNumber, 'Navn', 'Bankkontonummer');

  // Check if bankaccounts row exist
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (rowNumberBankAccount !== -1) {

    // Start table
    html += "<tr>";

    // Show menu
    menuNumber++;
    html += objBankAccount.verticalMenu(menuNumber);

    // name
    html += objBankAccount.inputTableColumn('name', 'width:175px;', objBankAccount.arrayBankAccounts[rowNumberBankAccount].name, 45, enableChanges);
    // account number
    html += objBankAccount.inputTableColumn('bankAccount', 'width:175px;', objBankAccount.arrayBankAccounts[rowNumberBankAccount].bankAccount, 11, enableChanges);
    html += "</tr>";

    // Show menu
    menuNumber++;
    html += objBankAccount.showTableHeaderMenu("width:175px;", menuNumber, 'Dato', 'Inngående saldo');

    // insert table columns in start of a row
    menuNumber++;
    html += objBankAccount.insertTableColumns('', menuNumber);

    // opening balance date
    const openingBalanceDate = formatToNorDate(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate);
    html += objBankAccount.inputTableColumn('openingBalanceDate', 'width:175px;', openingBalanceDate, 10, enableChanges);

    // opening balance
    const openingBalance = formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance);
    html += objBankAccount.inputTableColumn('openingBalance', 'width:175px;', openingBalance, 11, enableChanges);

    html += "</tr>";

    // Show menu
    // Header for value
    menuNumber++;
    html += objBankAccount.showTableHeaderMenu("width:175px;", menuNumber, 'Dato', 'Utgående saldo');

    // insert table columns in start of a row
    menuNumber++;
    html += objBankAccount.insertTableColumns('', menuNumber);

    // closing balance date
    const closingBalanceDate = formatToNorDate(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
    html += objBankAccount.inputTableColumn('closingBalanceDate', 'width:175px;', closingBalanceDate, 10, enableChanges);

    // closing balance
    const closingBalance = formatOreToKroner(objBankAccount.arrayBankAccounts[rowNumberBankAccount].closingBalance);
    html += objBankAccount.inputTableColumn('closingBalance', 'width:175px;', closingBalance, 11, enableChanges);

    html += "</tr>";

    // insert table columns in start of a row
    menuNumber++;
    html += objBankAccount.insertTableColumns('', menuNumber);

    html += "</tr>";

    // Show buttons
    if (enableChanges) {

      // insert table columns in start of a row
      menuNumber++;
      html += objBankAccount.insertTableColumns('', menuNumber);

      // Show buttons
      html += objBankAccount.showButton('width:175px;', 'update', 'Oppdater');
      html += objBankAccount.showButton('width:175px;', 'cancel', 'Angre');
      html += "</tr>";

      // insert table columns in start of a row
      menuNumber++;
      html += objBankAccount.insertTableColumns('', menuNumber);

      // Show buttons
      html += objBankAccount.showButton('width:175px;', 'delete', 'Slett');
      html += objBankAccount.showButton('width:175px;', 'insert', 'Ny');
      html += "</tr>";
    }

    // Show the rest of the menu
    menuNumber++;
    html += objBankAccount.showRestMenu(menuNumber);

    // The end of the table
    html += objBankAccount.endTable();
    document.querySelector('.result').innerHTML = html;

    return menuNumber;
  }
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  const validBankAccount = objBankAccount.validateBankAccount('bankAccount', bankAccount);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objBankAccount.validateText(name, 3, 50);

  // Opening balance date
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  openingBalanceDate = convertDateToISOFormat(openingBalanceDate);
  const validopeningBalanceDate = objBankAccount.validateNumber('openingBalanceDate', openingBalanceDate, 20200101, 20291231)

  // Opening balance
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = Number(formatKronerToOre(openingBalance));
  const validOpeningBalance = objBankAccount.validateNumber('openingBalance', openingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine);

  // Closing balance date
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = convertDateToISOFormat(closingBalanceDate);
  const validClosingBalanceDate = objBankAccount.validateNumber('closingBalanceDate', closingBalanceDate, 20200101, 20291231)

  // Closing balance
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatKronerToOre(closingBalance);
  const validClosingBalance = objBankAccount.validateNumber('closingBalance', closingBalance, objBankAccount.minusNineNine, objBankAccount.nineNine);

  // Validate date interval
  const validBalanceDates = ((Number(openingBalanceDate) <= Number(closingBalanceDate))
    && (Number(openingBalanceDate) >= 20100101 && Number(openingBalanceDate) <= 20391231)
    && (Number(closingBalanceDate) >= 20100101 && Number(closingBalanceDate) <= 20391231)) ? true : false;

  if (validBankAccount && validName && validBalanceDates && validOpeningBalance && validClosingBalance) {

    // Check if the account id exist
    const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // update the bankaccounts row
      await objBankAccount.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);

    } else {

      // Insert the bankaccount row in bankaccounts table
      await objBankAccount.insertBankAccountsTable(condominiumId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    }

    await objBankAccount.loadBankAccountsTable(condominiumId, bankAccountId);

    let menuNumber = 0;
    showHeader();

    // Show filter
    //condominiumId = Number(document.querySelector('.filterCondominiumId').value);
    menuNumber = showFilter(condominiumId, menuNumber);
    menuNumber = showResult(bankAccountId, menuNumber);
  }
}

// Delete one bankaccounts row
async function deleteBankAccountRow(bankAccountId) {




  // Check if bankaccount row exist
  bankAccountsRowNumber = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (bankAccountsRowNumber !== -1) {

    // delete bankaccount row
    objAccount.deleteBankAccountsTable(bankAccountId, user);
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

  document.querySelector('.delete').disabled = true;
  document.querySelector('.insert').disabled = true;
}

// Show filter
function showFilter(condominiumId, menuNumber) {

  // Start table
  html = objBankAccount.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objBankAccount.showTableHeaderMenu('width:150px;', menuNumber, 'Velg Sameie', 'Bankkonto');

  // start table body
  html += objBankAccount.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objBankAccount.insertTableColumns('', menuNumber);

  // Show selected condominiums 
  html += objCondominium.showSelectedCondominiums('filterCondominiumId', 'width:175px;', condominiumId, '', '');

  // Show all bankaccounts for selected condominiums
  // Get last id in last object in bankaccounts array
  const bankAccountId = objBankAccount.arrayBankAccounts.at(-1).bankAccountId;
  html += objBankAccount.showSelectedBankAccounts('filterBankAccountId', 'width:175px;', bankAccountId, '', '');

  html += "</tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objBankAccount.insertTableColumns('', menuNumber, '', '');

  // end table body
  html += objBankAccount.endTableBody();

  // The end of the table
  html += objBankAccount.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}
