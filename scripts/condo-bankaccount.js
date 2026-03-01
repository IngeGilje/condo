// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objCondominiums = new Condominium('condominium');
const objBankAccounts = new BankAccount('bankaccount');
 
let condominium = 0;

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
let condominiumId = Number(sessionStorage.getItem("condominiumId"));
const email = sessionStorage.getItem("email");
if ((condominiumId === 0 || email === null)) {

  // LogIn is not valid
  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      const resident = 'Y';
      await objUsers.loadUsersTable(condominiumId, resident);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(condominiumId, fixedCost);
      await objCondominiums.loadCondominiumsTable();
      await objBankAccounts.loadBankAccountsTable(condominiumId, objBankAccounts.nineNine);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(condominiumId, menuNumber);

      condominiumId = Number(document.querySelector('.filterCondominiumId').value);
      const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
      await objBankAccounts.loadBankAccountsTable(condominiumId, bankAccountId);

      // Show result
      menuNumber = showResult(bankAccountId, menuNumber);

      // Events
      events();
    } else {

      objBankAccounts.objBankAccounts.showMessage(objBankAccounts, 'Server condo-server.js har ikke startet.');
    }
  }
}

// Events for bankaccounts
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (([...event.target.classList].some(cls => cls.startsWith('filterCondominiumId')))
      || ([...event.target.classList].some(cls => cls.startsWith('filterBankAccountId')))) {

      filterSync();

      async function filterSync() {

        condominiumId = Number(document.querySelector('.filterCondominiumId').value);
        const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
        await objBankAccounts.loadBankAccountsTable(condominiumId, bankAccountId);

        let menuNumber = 0;
        menuNumber = showResult(bankAccountId, menuNumber);
      }
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      updateBankAccountRowSync();

      // Update a bankaccounts row
      async function updateBankAccountRowSync() {

        bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
        updateBankAccountRow(bankAccountId);
      }
    };
  });

  // Delete bankaccounts row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      deleteAccountSync();

      async function deleteAccountSync() {

        deleteBankAccountRow(bankAccountId);

        condominiumId = Number(document.querySelector('.filterCondominiumId').value);
        const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
        await objBankAccounts.loadBankAccountsTable(condominiumId, bankAccountId);

        let menuNumber = 0;
        menuNumber = showResult(bankAccountId, menuNumber);
      };
    };
  });

  // Insert a bankaccounts row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload bankaccounts table
      reloadBankAccountsSync();
      async function reloadBankAccountsSync() {

        let condominiumId = Number(document.querySelector('.filterCondominium').value);
        const bankAccountId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
        await objBankAccounts.loadBankAccountsTable(condominiumId, bankAccountId);

        let menuNumber = 0;
        menuNumber = showResult(bankAccountId, menuNumber);
      };
    };
  });
}

async function deleteBankAccount() {

  const bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
  if (bankAccountId >= 0) {

    // Check if bank account exist
    const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // Delete bank bankaccounts row
      const user = objUserInfo.email;

      objBankAccounts.deleteBankAccountsTable(bankAccountId, user);
    }
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objBankAccounts.startTable('width:600px;');

  // show main header
  html += objBankAccounts.showTableHeader('width:175px;', 'Bankkonto sameie');

  // The end of the table
  html += objBankAccounts.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show result
function showResult(bankAccountId, rowNumber) {

  // start table
  let html = objBankAccounts.startTable('width:600px;');

  // table header
  rowNumber++;
  html += objBankAccounts.showTableHeaderMenu("width:175px;", rowNumber, 'Navn', 'Bankkontonummer');

  // Check if bankaccounts row exist
  const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (rowNumberBankAccount !== -1) {

    // Start table
    html += "<tr>";

    // Show menu
    rowNumber++;
    html += objBankAccounts.verticalMenu(rowNumber);

    // name
    html += objBankAccounts.inputTableColumn('name', 'width:175px;', objBankAccounts.arrayBankAccounts[rowNumberBankAccount].name, 45);
     // account number
    html += objBankAccounts.inputTableColumn('bankAccount', 'width:175px;', objBankAccounts.arrayBankAccounts[rowNumberBankAccount].bankAccount, 11);
    html += "</tr>";

    // Show menu
    rowNumber++;
    html += objBankAccounts.showTableHeaderMenu("width:175px;", rowNumber, 'Dato', 'Inngående saldo');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccounts.insertTableColumns('', rowNumber);

    // opening balance date
    const openingBalanceDate = formatToNorDate(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalanceDate);
    html += objBankAccounts.inputTableColumn('openingBalanceDate', 'width:175px;', openingBalanceDate, 10);

    // opening balance
    const openingBalance = formatOreToKroner(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].openingBalance);
    html += objBankAccounts.inputTableColumn('openingBalance', 'width:175px;', openingBalance, 11);

    html += "</tr>";

    // Show menu
    // Header for value
    rowNumber++;
    html += objBankAccounts.showTableHeaderMenu("width:175px;", rowNumber, 'Dato', 'Utgående saldo');

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccounts.insertTableColumns('', rowNumber);

    // closing balance date
    const closingBalanceDate = formatToNorDate(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalanceDate);
    html += objBankAccounts.inputTableColumn('closingBalanceDate', 'width:175px;', closingBalanceDate, 10);

    // closing balance
    const closingBalance = formatOreToKroner(objBankAccounts.arrayBankAccounts[rowNumberBankAccount].closingBalance);
    html += objBankAccounts.inputTableColumn('closingBalance', 'width:175px;', closingBalance, 11);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccounts.insertTableColumns('', rowNumber);

    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccounts.insertTableColumns('', rowNumber);

    // Show buttons
    html += objBankAccounts.showButton('width:175px;', 'update', 'Oppdater');
    html += objBankAccounts.showButton('width:175px;', 'cancel', 'Angre');
    html += "</tr>";

    // insert table columns in start of a row
    rowNumber++;
    html += objBankAccounts.insertTableColumns('', rowNumber);

    // Show buttons
    html += objBankAccounts.showButton('width:175px;', 'delete', 'Slett');
    html += objBankAccounts.showButton('width:175px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    rowNumber++;
    html += objBankAccounts.showRestMenu(rowNumber);

    // The end of the table
    html += objBankAccounts.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  condominiumId = Number(condominiumId);
  const user = objUserInfo.email;

  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  const validBankAccount = objBankAccounts.validateBankAccount('bankAccount', bankAccount);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objBankAccounts.validateText(name, 3, 50);

  // Opening balance date
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  openingBalanceDate = convertDateToISOFormat(openingBalanceDate);
  const validopeningBalanceDate = objBankAccounts.validateNumber('openingBalanceDate', openingBalanceDate, 20200101, 20291231)

  // Opening balance
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = Number(formatKronerToOre(openingBalance));
  const validOpeningBalance = objBankAccounts.validateNumber('openingBalance', openingBalance, objBankAccounts.minusNineNine, objBankAccounts.nineNine);

  // Closing balance date
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = convertDateToISOFormat(closingBalanceDate);
  const validClosingBalanceDate = objBankAccounts.validateNumber('closingBalanceDate', closingBalanceDate, 20200101, 20291231)

  // Closing balance
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatKronerToOre(closingBalance);
  const validClosingBalance = objBankAccounts.validateNumber('closingBalance', closingBalance, objBankAccounts.minusNineNine, objBankAccounts.nineNine);

  // Validate date interval
  const validBalanceDates = ((Number(openingBalanceDate) <= Number(closingBalanceDate))
    && (Number(openingBalanceDate) >= 20100101 && Number(openingBalanceDate) <= 20391231)
    && (Number(closingBalanceDate) >= 20100101 && Number(closingBalanceDate) <= 20391231)) ? true : false;

  if (validBankAccount && validName && validBalanceDates && validOpeningBalance && validClosingBalance) {

    // Check if the account id exist
    const rowNumberBankAccount = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (rowNumberBankAccount !== -1) {

      // update the bankaccounts row
      await objBankAccounts.updateBankAccountsTable(bankAccountId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);

    } else {

      // Insert the bankaccount row in bankaccounts table
      await objBankAccounts.insertBankAccountsTable(condominiumId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    }

    await objBankAccounts.loadBankAccountsTable(condominiumId, bankAccountId);

    let rowNumber = 0;
    rowNumber = showResult(bankAccountId, rowNumber);
  }
}

// Delete one bankaccounts row
async function deleteBankAccountRow(bankAccountId) {

  const user = objUserInfo.email;


  // Check if bankaccount row exist
  bankAccountsRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (bankAccountsRowNumber !== -1) {

    // delete bankaccount row
    objAccounts.deleteBankAccountsTable(bankAccountId, user);
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
function showFilter(condominiumId, rowNumber) {

  // Start table
  html = objBankAccounts.startTable('width:600px;');

  // Header filter
  rowNumber++;
  html += objBankAccounts.showTableHeaderMenu('width:150px;', rowNumber, 'Velg Sameie', 'Bankkonto');

  // start table body
  html += objBankAccounts.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccounts.insertTableColumns('', rowNumber);

  // Show selected condominiums 
  html += objCondominiums.showSelectedCondominiums('filterCondominiumId', 'width:175px;', condominiumId, '', '');
 
  // Show all bankaccounts for selected condominiums
  // Get last id in last object in bankaccounts array
  const bankAccountId = objBankAccounts.arrayBankAccounts.at(-1).bankAccountId;
  html += objBankAccounts.showSelectedBankAccounts('filterBankAccountId', 'width:175px;', bankAccountId, '', '');

  html += "</tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccounts.insertTableColumns('', rowNumber, '','');

  // end table body
  html += objBankAccounts.endTableBody();

  // The end of the table
  html += objBankAccounts.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}
