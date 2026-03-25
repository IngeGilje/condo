// Bank account transaction search

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objCondominium = new Condominium('scondominium');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');

const disableChanges = (objAccount.securityLevel < 5);
const condominiumId = objAccount.condominiumId;
const user = objAccount.user;

const tableWidth = 'width:1650px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((condominiumId === 0 || objBankAccountTransaction.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1) 
      ? 'http://ingegilje.no/condo-login.html' 
      : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident,objBankAccountTransaction.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(condominiumId, objBankAccountTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(condominiumId, objBankAccountTransaction.nineNine, objBankAccountTransaction.nineNine);
      await objCondo.loadCondoTable(condominiumId);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const amount = Number(document.querySelector('.filterAmount').value);
      const deleted = 'N';
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      // Show result of filter
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Make Bank account transactions events
async function events() {

  // Show bankaccounttransactions after change of filter
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterCondoId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAccountId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAmount'))) {

      // Show bankaccounttransactions after change of filter

      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));

      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));

      let amount = document.querySelector('.filterAmount').value;
      amount = formatKronerToOre(amount);

      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      let menuNumber = 0;
      menuNumber = showResult(menuNumber);
    };
  });

  // update a bankAccountTransactions row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['condoId', 'accountId', 'kilowattHour', 'text'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBankAccountTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let bankAccountTransactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransactionId = Number(className.slice(prefix.length));
      }

      // Update a bankAccountTransactions row
      updateBankAccountTransactionRow(bankAccountTransactionId);

      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));

      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));

      let amount = document.querySelector('.filterAmount').value;
      amount = formatKronerToOre(amount);

      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      let menuNumber = 0;
      menuNumber = showResult(menuNumber);
    };
  });

  // Delete a bankaccounttransactions row
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDue.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      bankAccountTransationId = Number(className.substring(6));
      deleteBankAccountTransactionRow(bankAccountTransationId, className);

      const amount = 0;
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      let menuNumber = 0;
      menuNumber = showResult(menuNumber);
    };
  });

  // Show bank voucher
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {

      const arrayPrefixes = ['voucher'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBankAccountTransactions.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      let url = (objBankAccountTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-voucher.html?bankAccountTransactionId=${bankAccountTransationId}`;
      window.location.href = url;
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objBankAccountTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objBankAccountTransaction.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu('width:175px;', rowNumber, '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato', 'Beløp', '', '');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransaction.insertTableColumns('', rowNumber, '', '');

  // Show all selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', objBankAccountTransaction.nineNine, '', 'Vis alle');

  // Get condominiums row number
  const condominiumsRowNumber = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumsRowNumber !== -1) {

    const commonCostAccountId = objCondominium.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccount.showSelectedAccounts('filterAccountId', '', commonCostAccountId, '', 'Alle');
  }

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objBankAccountTransaction.inputTableColumn('filterFromDate', '', fromDate, 10, false);

  // Current date
  let toDate = getCurrentDate();
  html += objBankAccountTransaction.inputTableColumn('filterToDate', '', toDate, 10, false);

  // Amount
  html += objBankAccountTransaction.inputTableColumn('filterAmount', '', '', 10, false);

  html += "<td></td><td></td></tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransaction.insertTableColumns('', rowNumber, '', '', '', '', '', '', '', '', '');

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// update bankaccounttransactions row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  bankAccountTransactionId = Number(bankAccountTransactionId);

  // Get all column values from current bankaccounttransactions row
  // Check if the bankaccounttransactions row exist
  const bankAccountTransactionRowNumber = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransactions => bankAccountTransactions.bankAccountTransactionId === bankAccountTransactionId);
  if (bankAccountTransactionRowNumber !== -1) {

    // bankaccounttransactions row exist
    const income = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].income);
    const payment = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].payment);
    const date = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].date);

    // accountId
    className = `.accountId${bankAccountTransactionId}`;
    const accountId = Number(document.querySelector(className).value);
    className = `accountId${bankAccountTransactionId}`;
    const validAccountId = objBankAccountTransaction.validateNumber(className, accountId, 0, objBankAccountTransaction.nineNine)

    // condoId
    className = `.condoId${bankAccountTransactionId}`;
    const condoId = Number(document.querySelector(className).value);
    className = `condoId${bankAccountTransactionId}`;
    const validCondoId = objBankAccountTransaction.validateNumber(className, condoId, 0, objBankAccountTransaction.nineNine)

    // kilowattHour
    className = `.kilowattHour${bankAccountTransactionId}`;
    const kilowattHour = Number(formatKronerToOre(document.querySelector(className).value));
    className = `kilowattHour${bankAccountTransactionId}`;
    const validNumberKWHour = objBankAccountTransaction.validateNumber(className, kilowattHour, 0, objBankAccountTransaction.nineNine)

    // text
    className = `.text${bankAccountTransactionId}`;
    const text = document.querySelector(className).value;
    const validText = objBankAccountTransaction.validateText(text, 3, 255);

    // Validate bankAccountTransactions columns
    if (validCondoId && validAccountId && validNumberKWHour && validText) {

      // Check if the bankaccounttransactions row exist
      if (bankAccountTransactionRowNumber !== -1) {

        // update the bankaccounttransactions row
        await objBankAccountTransaction.updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, objBankAccountTransaction.user, condoId, accountId, income, payment, kilowattHour, date, text);
      }
    }
  }
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // show main header
  html += objBankAccountTransaction.showTableHeader('width:175px;','','','','', 'Bankkontotransaksjoner','','','','','');

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Delete bankaccounttransactions row
async function deleteBankAccountTransactionRow(bankAccountTransationId, className) {

  // Check if bankaccounttransaction row exist
  bankAccountTransactionsRowNumber = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankaccounttransaction => bankaccounttransaction.bankAccountTransationId === bankAccountTransationId);
  if (bankAccountTransactionsRowNumber !== -1) {

    // delete bankaccounttransaction row
    objBankAccountTransaction.deleteBankAccountTransationsTable(bankAccountTransationId, objBankAccountTransaction.user);
  }
  const amount = 0;
  const deleted = 'N';
  condoId = Number(document.querySelector('.filterCondoId').value);
  accountId = Number(document.querySelector('.filterAccountId').value);

  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(convertDateToISOFormat(fromDate));

  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(convertDateToISOFormat(toDate));

  const orderBy = 'date DESC, income DESC';
  await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);
}

// Show bankaccountransactions
function showResult(rowNumber) {

  // start table
  let html = objCondo.startTable(tableWidth);

  // table header
  rowNumber++;
  if (!disableChanges) {
    html += objCondo.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Slett', 'Leilighet', 'Dato', 'Konto', 'Inntekt', 'Utgift', 'Kilowattimer', 'Tekst', '');
  } else {
    html += objCondo.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Leilighet', 'Dato', 'Konto', 'Inntekt', 'Utgift', 'Kilowattimer', 'Tekst', '');
  }

  let sumIncome = 0;
  let sumPayment = 0;

  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    html += '<tr>';

    // Show menu
    rowNumber++;
    html += objAccount.insertTableColumns('', rowNumber);

    // Delete
    if (!disableChanges) {

      let selected = "Ugyldig verdi";
      if (bankAccountTransaction.deleted === 'Y') selected = "Ja";
      if (bankAccountTransaction.deleted === 'N') selected = "Nei";

      // delete
      let className = `delete${bankAccountTransaction.bankAccountTransactionId}`;
      html += objBankAccountTransaction.showSelectedValues(className, 'width:75px;', disableChanges,selected, 'Nei', 'Ja')
    }

    // condos
    className = `condoId${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondos(className, 'width:150px;', bankAccountTransaction.condoId, 'Ingen er valgt', '', disableChanges);

    // Date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', date, 10, true);

    // accounts
    className = `accountId${bankAccountTransaction.bankAccountTransactionId}`;

    // Mark invalid account red
    html += (bankAccountTransaction.accountId === 0)
      ? objAccount.showSelectedAccounts(className, 'width:175px;background-color: #f89595;', bankAccountTransaction.accountId, 'Ingen er valgt', '',disableChanges)
      : objAccount.showSelectedAccounts(className, 'width:175px;', bankAccountTransaction.accountId, 'Ingen er valgt', '', disableChanges);

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', income, 10, true);

    // payment
    const payment = formatOreToKroner(bankAccountTransaction.payment);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', payment, 10, true);

    // kilowattHour
    const kilowattHour = formatOreToKroner(bankAccountTransaction.kilowattHour);
    className = `kilowattHour${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', kilowattHour, 10, disableChanges);

    // text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:175px;', text, 45, disableChanges);

    // Show voucher
    className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.showButton('width:100px;', className, 'Vis bilag')
    html += "</tr>";

    // accumulate
    sumIncome += Number(bankAccountTransaction.income);
    sumPayment += Number(bankAccountTransaction.payment);
  });

  // Make one last table row for insertion in table 

  // Show table sum row
  sumIncome = formatOreToKroner(sumIncome);
  sumPayment = formatOreToKroner(sumPayment);

  rowNumber++;
  html += objBankAccountTransaction.insertTableColumns('font-weight: 600;', rowNumber, '', '', '', 'Sum', sumIncome, sumPayment, '', '', '');

  // Show the rest of the menu
  rowNumber++;
  html += objBankAccountTransaction.showRestMenu(rowNumber);

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.result').innerHTML = html;
}

// Show header
function showHeader() {

  // Start table
  html = objBankAccountTransaction.startTable(tableWidth);

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // show main header
  html += objBankAccountTransaction.showTableHeaderLogOut('width:175px;', '', '', '', '', 'Bankkontotransaksjoner', '', '', '', '');
  html += "</tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}
