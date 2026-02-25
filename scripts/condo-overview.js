// Search for dues

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objDues = new Due('due');
const objAccounts = new Account('account');
const objCondo = new Condo('condo');
const objBankAccountTransactions = new BankAccountTransaction('bankaccounttransaction');
const objOverview = new Overview('overview');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    const condominiumId = Number(sessionStorage.getItem("condominiumId"));
    const email = sessionStorage.getItem("email");
    if ((condominiumId === 0 || email === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

    const condominiumId = Number(objUserPassword.condominiumId);

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondo.loadCondoTable(condominiumId);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

    // Show horizontal menu
    showHorizontalMenu();

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
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, objOverview.nineNine, 0, fromDate, toDate);

    // Show result

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

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js har ikke startet.');
  }
}

// Create overview events
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('filter'))) {

      filterSync();

      async function filterSync() {

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

          const condominiumId = Number(objUserPassword.condominiumId);
          const condoId = Number(document.querySelector('.filterCondoId').value);
          const accountId = objOverview.nineNine;
          const deleted = 'N';
          let fromDate = document.querySelector('.filterFromDate').value;
          fromDate = convertDateToISOFormat(fromDate);
          let toDate = document.querySelector('.filterToDate').value;
          toDate = convertDateToISOFormat(toDate);
          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
          const orderBy = 'condoId ASC, date DESC, income ASC';
          await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, objOverview.nineNine, 0, fromDate, toDate);

          // Show result

          // Show dues
          let menuNumber = 0;
          menuNumber = showDues(menuNumber);

          // Bank account transactions
          menuNumber = showBankAccountTransactions(menuNumber);

          // show how much to pay
          menuNumber = showHowMuchToPay(menuNumber);
        }
      }
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objOverview.startTable('width:1100px;');

  // show main header
  html += objOverview.showTableHeader('width:175px;', '', '', '', 'Betalingsoversikt', '', '',);

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objOverview.startTable('width:1100px;');

  // Header filter
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;', rowNumber, '1', '2', '3 Velg leilighet', '4 Fra dato', '5 Til dato');

  // start table body
  html += objOverview.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objOverview.insertTableColumns('', rowNumber, '', '');

  // Show all selected condos
  // Get last id in last object in condo array
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  html += objCondo.showSelectedCondos('filterCondoId', 'width:100px;', condoId, '', '');

  // from date
  const year = String(today.getFullYear());
  let fromDate = "01.01." + year;
  html += objOverview.inputTableColumn('filterFromDate', '', fromDate, 10);

  // to date
  let toDate = getCurrentDate();
  html += objOverview.inputTableColumn('filterToDate','', toDate, 10);

  html += "</tr>";

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
  html = objOverview.startTable('width:1100px;');

  let sumDue = 0;
  let sumKilowattHour = 0;

  // Header
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '1', '2', '3', '4 Forfall', '5');
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;', rowNumber++, '1 Leilighet', '2 Forfallsdato', '3 Beløp', '4 kilowattimer', '5 Tekst');

  objDues.arrayDues.forEach((due) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objDues.insertTableColumns('', rowNumber);

    // condo
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondos(className, '', due.condoId, 'Ingen er valgt', '', true);

    // date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', date, 10, true);

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
  html += objOverview.insertTableColumns('font-weight: 600;', rowNumber, '', '', 'Sum', sumDue, sumKilowattHour);
  html += "</tr>"

  rowNumber++;
  html += objOverview.insertTableColumns('', rowNumber, '', '', '');
  html += "</tr>"

  // The end of the table
  html += objAccounts.endTable();
  document.querySelector('.dues').innerHTML = html;
  return rowNumber;
}

// Bank account transactions
function showBankAccountTransactions(rowNumber) {

  // Start table
  html = objOverview.startTable('width:1100px;');

  // Header
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '1', '2', '3 Innbetalinger', '4', '5');
  rowNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;', rowNumber++, '1', '2 Leilighet', '3 Betalingsdato', '4 Betaling', '5 Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objDues.insertTableColumns('', rowNumber, '');

    // condos
    className = `condo${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondos(className, '', Number(bankAccountTransaction.condoId), 'Ingen er valgt', '', true);

    // date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', date, 10, true);

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', income, 10, true);

    // Text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', text, 45, true);

    html += "</tr>";

    // accumulate
    sumIncomes += Number(bankAccountTransaction.income);
    sumPayments += Number(bankAccountTransaction.payment);
  });

  // Sum row
  sumIncomes = formatOreToKroner(sumIncomes);
  sumPayments = formatOreToKroner(sumPayments);

  rowNumber++;
  html += objOverview.insertTableColumns('font-weight: 600;', rowNumber, '', '', 'Sum', sumIncomes);

  html += "</tr>"

  rowNumber++;
  html += objOverview.insertTableColumns('', rowNumber, '', '', '');

  // The end of the table
  html += objDues.endTable();
  document.querySelector('.bankAccountTransactions').innerHTML = html;

  return rowNumber;
}

// show how much to pay
function showHowMuchToPay(rowNumber) {

  // Start table
  let html = objOverview.startTable('width:1100px;');

  let sumIncome = 0;

  // How much to pay
  let sumToPay = 0;
  objDues.arrayDues.forEach((due) => {

    sumToPay += due.amount;
  });

  // How much is payd
  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    // Accomulate
    sumIncome += Number(bankAccountTransaction.income);
  });

  // show main header
  let overPay = sumIncome - sumToPay;
  rowNumber++;
  html += (overPay >= 0) ? objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '1', '2', '3 Til gode', '4', '5') : objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '1', '2', '3', '4 Skyldig', '5');
  rowNumber++;
  html += (overPay >= 0) ? objOverview.showTableHeaderMenu('width:175px;', rowNumber, '1', '2', '3 Forfall', '4 Betalt', '5 Til gode') : objOverview.showTableHeaderMenu('width:175px;', rowNumber, '1', '2', '3 Forfall', '4 Betalt', '5 Skyldig');

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatOreToKroner(overPay);
  sumIncome = formatOreToKroner(sumIncome);
  sumToPay = formatOreToKroner(sumToPay);

  // Show menu
  rowNumber++;
  html += objOverview.insertTableColumns('font-weight: 600;', rowNumber, '1', '2 Sum', sumToPay, sumIncome, overPay);

  // Show the rest of the menu
  rowNumber++;
  html += objOverview.showRestMenu(rowNumber);

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;

  return rowNumber;
}

// show horizontal menu
function showHorizontalMenu() {

  html = objDues.showHorizontalMenu();

  document.querySelector('.horizontalMenu').innerHTML = html;
};