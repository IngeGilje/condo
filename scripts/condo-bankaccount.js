// Maintenance of bankaccounts

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objCondominiums = new Condominium('condominium');
const objBankAccounts = new BankAccount('bankaccount');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

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

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
    await objCondominiums.loadCondominiumsTable();
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, 999999999);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter(objUserPassword.condominiumId);

    const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
    const bankAccountId = Number(document.querySelector('.filterBankAccountId').value);
    await objBankAccounts.loadBankAccountsTable(condominiumId, bankAccountId);

    // Show result
    showResult(bankAccountId, menuNumber);

    // Events
    events();
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

        const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
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

        const condominiumId = Number(document.querySelector('.filterCondominiumId').value);
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

/*
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
    const name = document.querySelector('.input-bankaccounts-name').value;
    const condominiumId = Number(objUserPassword.condominiumId);
    const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);

    // Check if bankAccount exist
    if (bankAccountRowNumber !== -1) {

      // update bankAccount
      objBankAccounts.updateBankAccountsTable(bankAccountId, condominiumId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    } else {

      // insert bankAccount
      objBankAccounts.insertBankAccountsTable(condominiumId, user, bankAccount, name, openingBalance, openingBalanceDate, closingBalance, closingBalanceDate);
    }

    document.querySelector('.select-bankaccounts-bankAccountId').disabled = false;
    document.querySelector('.button-bankaccounts-delete').disabled = false;
    document.querySelector('.button-bankaccounts-insert').disabled = false;
  }
}
*/

async function deleteBankAccount() {

  const bankAccountId = Number(document.querySelector('.select-bankaccounts-bankAccountId').value);
  if (bankAccountId >= 0) {

    // Check if bank account exist
    const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (bankAccountRowNumber !== -1) {

      // Delete bank bankaccounts row
      const user = objUserPassword.email;

      objBankAccounts.deleteBankAccountsTable(bankAccountId, user);
    }
  }
}

/*
// Show leading text for account
function showLeadingText(bankAccountId) {

  // Show all bankaccounts
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
*/

/*
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

      // bank account number
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
*/

/*
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
*/

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += objBankAccounts.showTableHeaderNew('widht:250px;', 'Bankkonto sameie');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Filter for search
function showHTMLFilterSearch() {

  let html = "<tr><td></td>";

  // Show all selected condominiums
  // Get last id in last object in condominiums array
  const condominiumId = objCondominiums.arrayCondominiums.at(-1).condominiumId;
  html += objCondominiums.showSelectedCondominiumsNew('filterCondominiumId', 'width:100px;', condominiumId, '', '');

  // Show all bankaccounts
  // Get last id in last object in bankaccounts array
  const bankAccountId = objBankAccounts.arrayBankAccounts.at(-1).bankAccountId;
  html += objBankAccounts.showSelectedBankAccountsNew('filterBankAccountId', 'width:100px;', bankAccountId, '', '');

  html += "<td></td></tr>";

  return html;
}

// Show result
//function showResult(bankAccountId, rowNumber) {
function showResult(bankAccountId, rowNumber) {

  // Check if bankaccounts row exist
  const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankAccount => bankAccount.bankAccountId === bankAccountId);
  if (bankAccountRowNumber !== -1) {

    // Start table
    html = startHTMLTable('width:750px;');

    // Main header
    //rowNumber++;
    html += objBankAccounts.showTableHeaderNew('widht:250px;', '', '', '');

    // Show menu
    // Header for value including menu
    rowNumber++;
    html += objBankAccounts.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Navn', 'Bankontonummer');

    html += "<tr>";

    // Show menu
    rowNumber++;
    html += objBankAccounts.menuNew(rowNumber);

    // name
    html += objBankAccounts.showInputHTMLNew('name', objBankAccounts.arrayBankAccounts[bankAccountRowNumber].name, 45);

    // account number
    html += objBankAccounts.showInputHTMLNew('bankAccount', objBankAccounts.arrayBankAccounts[bankAccountRowNumber].bankAccount, 11);

    html += "</tr>";

    // Show menu
    rowNumber++;
    html += objBankAccounts.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Dato', 'Inngående saldo');

    html += "<tr>";

    rowNumber++;
    html += objBankAccounts.menuNew(rowNumber);

    // opening balance date
    const openingBalanceDate = formatToNorDate(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalanceDate);
    html += objBankAccounts.showInputHTMLNew('openingBalanceDate', openingBalanceDate, 10);

    // opening balance
    const openingBalance = formatOreToKroner(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].openingBalance);
    html += objBankAccounts.showInputHTMLNew('openingBalance', openingBalance, 11);

    html += "</tr>";

    // Show menu
    // Header for value
    rowNumber++;
    html += objBankAccounts.showHTMLTableHeaderNew("width:250px;", rowNumber, 'Dato', 'Utgående saldo');

    html += "<tr>";

    // Show menu
    rowNumber++;
    html += objBankAccounts.menuNew(rowNumber);

    // closing balance date
    const closingBalanceDate = formatToNorDate(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalanceDate);
    html += objBankAccounts.showInputHTMLNew('closingBalanceDate', closingBalanceDate, 10);

    // closing balance
    const closingBalance = formatOreToKroner(objBankAccounts.arrayBankAccounts[bankAccountRowNumber].closingBalance);
    html += objBankAccounts.showInputHTMLNew('closingBalance', closingBalance, 11);

    html += "</tr>";

    // Show menu
    html += "<tr>";
    rowNumber++;
    html += objBankAccounts.menuNew(rowNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    rowNumber++;
    html += objBankAccounts.menuNew(rowNumber);

    html += objBankAccounts.showButtonNew('width:170px;', 'update', 'Oppdater');
    html += objBankAccounts.showButtonNew('width:170px;', 'cancel', 'Angre');
    html += "</tr>";

    // Show menu
    html += "<tr>";
    rowNumber++;
    html += objBankAccounts.menuNew(rowNumber);
    html += "</tr>";

    // show buttons
    html += "<tr>";
    // Show menu
    rowNumber++;
    html += objBankAccounts.menuNew(rowNumber);

    html += objBankAccounts.showButtonNew('width:170px;', 'delete', 'Slett');
    html += objBankAccounts.showButtonNew('width:170px;', 'insert', 'Ny');
    html += "</tr>";

    // Show the rest of the menu
    html += objBankAccounts.showRestMenuNew(rowNumber);

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a bankaccounts row
async function updateBankAccountRow(bankAccountId) {

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;

  // validate bank account number
  const bankAccount = document.querySelector('.bankAccount').value;
  //const validBankAccount = objBankAccounts.validateBankAccount(bankAccount, "label-bankaccounts-bankAccount", "Bankkontonummer");
  const validBankAccount = objBankAccounts.validateBankAccountNew(bankAccount);

  // validate name
  const name = document.querySelector('.name').value;
  const validName = objBankAccounts.validateTextNew(name, 3, 50);

  // Opening balance date
  let openingBalanceDate = document.querySelector('.openingBalanceDate').value;
  openingBalanceDate = convertDateToISOFormat(openingBalanceDate);
  const validopeningBalanceDate = objBankAccounts.validateIntervalNew(openingBalanceDate, 20200101, 20291231)

  // Opening balance
  let openingBalance = document.querySelector('.openingBalance').value;
  openingBalance = Number(formatKronerToOre(openingBalance));
  const validOpeningBalance = objBankAccounts.validateIntervalNew(openingBalance, -999999999, 999999999);

  // Closing balance date
  let closingBalanceDate = document.querySelector('.closingBalanceDate').value;
  closingBalanceDate = convertDateToISOFormat(closingBalanceDate);
  const validClosingBalanceDate = objBankAccounts.validateIntervalNew(closingBalanceDate, 20200101, 20291231)

  // Closing balance
  let closingBalance = document.querySelector('.closingBalance').value;
  closingBalance = formatKronerToOre(closingBalance);
  const validClosingBalance = objBankAccounts.validateIntervalNew(closingBalance, -999999999, 999999999);

  // Validate date interval
  const validBalanceDates = ((Number(openingBalanceDate) <= Number(closingBalanceDate))
    && (Number(openingBalanceDate) >= 20200101 && Number(openingBalanceDate) <= 20391231)
    && (Number(closingBalanceDate) >= 20200101 && Number(closingBalanceDate) <= 20391231)) ? true : false;

  if (validBankAccount && validName && validBalanceDates && validOpeningBalance && validClosingBalance) {

    // Check if the account id exist
    const bankAccountRowNumber = objBankAccounts.arrayBankAccounts.findIndex(bankaccount => bankaccount.bankAccountId === bankAccountId);
    if (bankAccountRowNumber !== -1) {

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

  const user = objUserPassword.email;


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
async function showFilter(condominiumId) {

  // Start table
  html = startHTMLTable('width:750px;');

  // Header filter for search
  //html += objBankAccounts.showHTMLFilterHeader("width:250px;",  0, '', '', '');
  //html += objBankAccounts.showTableHeaderNew("width:250px;", '', '', '');
    html += "<tr><td></td><td></td>";
  html += "</tr>";

  //html += objBankAccounts.showHTMLFilterHeader("width:250px;",  0,'', 'Velg leilighet', 'Bankkono');
  html += objBankAccounts.showTableHeaderNew("width:250px;", '', 'Velg leilighet', 'Bankkono');
  html += "<tr><td></td><td></td>";
  html += "<tr>";

  // Filter for search
  html += "<tr>";

  html += "<td></td>";

  // Show selected condominiums 
  html += objCondominiums.showSelectedCondominiumsNew('filterCondominiumId', 'width:100px;', condominiumId, '', '');

  // Show all bankaccounts for selected condominiums
  // Get last id in last object in bankaccounts array
  const bankAccountId = objBankAccounts.arrayBankAccounts.at(-1).bankAccountId;
  html += objBankAccounts.showSelectedBankAccountsNew('filterBankAccountId', 'width:100px;', bankAccountId, '', '');

  html += "</tr>";

  // Header filter for search
  //html += objBankAccounts.showHTMLFilterHeader("width:750px;", 0, '', '', '');
  //html += objBankAccounts.showTableHeaderNew("width:750px;", '', '', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}
