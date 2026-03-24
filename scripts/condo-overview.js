// Search for dues

// Activate objects
const today = new Date();
const objUser = new User('user');
const objDue = new Due('due');
const objAccount = new Account('account');
const objCondo = new Condo('condo');
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');
const objOverview = new Overview('overview');

const disableChanges = (objOverview.securityLevel < 5);
const condominiumId = objOverview.condominiumId;
const user = objOverview.user;

const tableWidth = 'width:1250px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    securityLevel = sessionStorage.getItem("securityLevel");
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident);
      await objCondo.loadCondoTable(condominiumId);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = objOverview.nineNine;
      const deleted = 'N';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = convertDateToISOFormat(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = convertDateToISOFormat(toDate);
      await objDue.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, objOverview.nineNine, 0, fromDate, toDate);

      // Show dues
      menuNumber = showDues(menuNumber);

      // Bank account transactions
      menuNumber = showBankAccountTransactions(menuNumber);

      // show how much to pay
      menuNumber = showHowMuchToPay(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Create overview events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('filter'))) {

      // valitadate filter
      // condo
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const validCondoId = objOverview.validateNumber('filterCondoId', condoId, 1, objOverview.nineNine);

      // from date
      let fromDate = document.querySelector('.filterFromDate').value;
      const validFromDate = objOverview.validateNorDate('filterFromDate', fromDate);

      // to date
      let toDate = document.querySelector('.filterToDate').value;
      const validToDate = objOverview.validateNorDate('filterToDate', toDate);

      // Validate date interval
      let validDates = false;
      if (validFromDate && validToDate) {

        fromDate = objOverview.formatNorDateToNumber(fromDate);
        toDate = objOverview.formatNorDateToNumber(toDate);
        validDates = objOverview.validateNumber('filterFromDate', Number(fromDate), Number(fromDate), Number(toDate));
      }

      if (validFromDate && validToDate && validDates && validCondoId) {

        const condoId = Number(document.querySelector('.filterCondoId').value);
        const accountId = objOverview.nineNine;
        const deleted = 'N';
        let fromDate = document.querySelector('.filterFromDate').value;
        fromDate = convertDateToISOFormat(fromDate);
        let toDate = document.querySelector('.filterToDate').value;
        toDate = convertDateToISOFormat(toDate);
        await objDue.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, objOverview.nineNine, 0, fromDate, toDate);

        // Show result

        // Show dues
        let menuNumber = 0;
        menuNumber = showDues(menuNumber);

        // Bank account transactions
        menuNumber = showBankAccountTransactions(menuNumber);

        // show how much to pay
        menuNumber = showHowMuchToPay(menuNumber);
      }
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objOverview.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objOverview.startTable(tableWidth);

  // show main header
  html += objOverview.showTableHeader('width:175px;', '', '', '', 'Betalingsoversikt', '', '',);

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objOverview.startTable(tableWidth);

  // start table body
  html += objOverview.startTableBody();

  // show main header
  html += objOverview.showTableHeaderLogOut('width:175px;', '', '', '', '', 'Betalingsoversikt', '', '', '');
  html += "</tr>";

  // end table body
  html += objOverview.endTableBody();

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objOverview.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;', rowNumber, '', '2Velg leilighet', '3Fra dato', 'Til dato', '', '');

  // start table body
  html += objOverview.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objOverview.insertTableColumns('', rowNumber, '');

  // Show all selected condos
  // Get last id in last object in condo array
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', '');

  // from date
  const year = String(today.getFullYear());
  let fromDate = "01.01." + year;
  html += objOverview.inputTableColumn('filterFromDate', '', fromDate, 10);

  // to date
  let toDate = getCurrentDate();
  html += objOverview.inputTableColumn('filterToDate', '', toDate, 10);

  html += "<td></td><td></td></tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objOverview.insertTableColumns('', rowNumber, '');

  // end table body
  html += objOverview.endTableBody();

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show dues
function showDues(rowNumber) {

  // Start HTML table
  html = objOverview.startTable(tableWidth);

  let sumDue = 0;
  let sumKilowattHour = 0;

  // Header
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '', '', '', 'Forfall', '', '');
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Leilighet', 'Forfallsdato', 'Konto', 'Beløp', 'Kilowattimer', 'Tekst');

  objDue.arrayDues.forEach((due) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objDue.insertTableColumns('', rowNumber);

    // condo
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondos(className, '', due.condoId, 'Ingen er valgt', '', true);

    // date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', date, 10, true);

    // account
    className = `account${due.dueId}`;
    html += objAccount.showSelectedAccounts(className, '', due.accountId, 'Ingen er valgt', '', true);

    // amount
    const amount = formatOreToKroner(due.amount);
    className = `income${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', amount, 10, true);

    // kilowattHour
    const kilowattHour = formatOreToKroner(due.kilowattHour);
    className = `income${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', kilowattHour, 10, true);

    // Text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', text, 45, true);

    html += "</tr>";

    // accumulate
    sumDue += Number(due.amount);
    sumKilowattHour += Number(due.kilowattHour);
  });

  // Sum row
  sumDue = formatOreToKroner(sumDue);
  sumKilowattHour = formatOreToKroner(sumKilowattHour);

  rowNumber++;
  html += objOverview.insertTableColumns('font-weight: 600;', rowNumber, '', '2Sum', sumDue, sumKilowattHour, '', '');
  html += "</tr>"

  rowNumber++;
  html += objOverview.insertTableColumns('', rowNumber, '', '', '', '', '', '');
  html += "</tr>"

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.dues').innerHTML = html;
  return rowNumber;
}

// Bank account transactions
function showBankAccountTransactions(rowNumber) {

  // Start table
  html = objOverview.startTable(tableWidth);

  // Header
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '', '', '', 'Innbetalinger', '', '');
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '', 'Leilighet', 'Betalingsdato', 'Konto', 'Betaling', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objDue.insertTableColumns('', rowNumber, '');

    // condos
    className = `condo${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondos(className, '', Number(bankAccountTransaction.condoId), 'Ingen er valgt', '', true);

    // date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, '', date, 10, true);

    // account
    className = `account${bankAccountTransaction.bankAccountTransactionId}`;
    html += objAccount.showSelectedAccounts(className, '', Number(bankAccountTransaction.accountId), 'Ingen er valgt', '', true);

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, '', income, 10, true);

    // Text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, '', text, 45, true);

    html += "</tr>";

    // accumulate
    sumIncomes += Number(bankAccountTransaction.income);
    sumPayments += Number(bankAccountTransaction.payment);
  });

  // Sum row
  sumIncomes = formatOreToKroner(sumIncomes);
  sumPayments = formatOreToKroner(sumPayments);

  rowNumber++;
  html += objOverview.insertTableColumns('font-weight: 600;', rowNumber, '', '', '', 'Sum', sumIncomes, '');

  html += "</tr>"

  rowNumber++;
  html += objOverview.insertTableColumns('', rowNumber, '', '', '', '', '', '');

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.bankAccountTransactions').innerHTML = html;

  return rowNumber;
}

// show how much to pay
function showHowMuchToPay(rowNumber) {

  // Start table
  let html = objOverview.startTable(tableWidth);

  let sumIncome = 0;

  // How much to pay
  let sumToPay = 0;
  objDue.arrayDues.forEach((due) => {

    sumToPay += due.amount;
  });

  // How much is payd
  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    // Accomulate
    sumIncome += Number(bankAccountTransaction.income);
  });

  // show main header
  let overPay = sumIncome - sumToPay;
  rowNumber++;
  html += (overPay >= 0) ? objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '', '', '3Til gode', '', '', '') : objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '', '', '', 'Skyldig', '', '');
  rowNumber++;
  html += (overPay >= 0) ? objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '', '', '3Forfall', 'Betalt', 'Til gode', '') : objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '', '', '', 'Forfall', 'Betalt', 'Skyldig');

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatOreToKroner(overPay);
  sumIncome = formatOreToKroner(sumIncome);
  sumToPay = formatOreToKroner(sumToPay);

  // Show menu
  rowNumber++;
  html += objOverview.insertTableColumns('font-weight: 600;', rowNumber, '', '', '3Sum', sumToPay, sumIncome, overPay);

  // Show the rest of the menu
  rowNumber++;
  html += objOverview.showRestMenu(rowNumber);

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;

  return rowNumber;
}

/*
// show horizontal menu
function showHorizontalMenu() {

  html = objDue.showHorizontalMenu();

  document.querySelector('.horizontalMenu').innerHTML = html;
};
*/