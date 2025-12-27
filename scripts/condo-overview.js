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

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main()

  // Main entry point
  async function main() {

    const condominiumId = Number(objUserPassword.condominiumId);

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondo.loadCondoTable(condominiumId);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter();

    const condoId = Number(document.querySelector('.filterCondoId').value);
    const accountId = 999999999;
    const deleted = 'N';
    let fromDate = document.querySelector('.filterFromDate').value;
    fromDate = convertDateToISOFormat(fromDate);
    let toDate = document.querySelector('.filterToDate').value;
    toDate = convertDateToISOFormat(toDate);
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

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
        const condoId = Number(document.querySelector('.filterFromDate').value);
        const validCondoId = objOverview.validateNumberNew(condoId, 1, 999999999);

        // from date
        let fromDate = document.querySelector('.filterFromDate').value;
        const validFromDate = objOverview.validateNorDateFormatNew(fromDate);

        // to date
        let toDate = document.querySelector('.filterFromDate').value;
        const validToDate = objOverview.validateNorDateFormatNew(toDate);

        // Validate interval
        fromDate = objOverview.formatNorDateToNumberNew(fromDate);
        toDate = objOverview.formatNorDateToNumberNew(toDate);
        const validDates = objOverview.validateIntervalNew(Number(fromDate), Number(fromDate), Number(toDate));

        if (validFromDate && validToDate && validDates && validCondoId) {

          const condominiumId = Number(objUserPassword.condominiumId);
          const condoId = Number(document.querySelector('.filterCondoId').value);
          const accountId = 999999999;
          const deleted = 'N';
          let fromDate = document.querySelector('.filterFromDate').value;
          fromDate = convertDateToISOFormat(fromDate);
          let toDate = document.querySelector('.filterToDate').value;
          toDate = convertDateToISOFormat(toDate);
          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
          const orderBy = 'condoId ASC, date DESC, income ASC';
          await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

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
  let html = objOverview.startTableNew('width:1100px;');

  // show main header
  html += objOverview.showTableHeaderNew('width:250px;', 'Betalingsoversikt');

  //html += objOverview.insertEmptyTableRowNew(0,'');

  // The end of the table header
  //html += objOverview.endTableHeaderNew();

  // The end of the table
  html += objOverview.endTableNew();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = objOverview.startTableNew('width:1100px;');

  // Header filter
  html += objOverview.showTableHeaderNew('width:250px;', '', '', 'Velg leilighet', 'Fra dato', 'Til dato', '');

  // start table body
  html += objOverview.startTableBodyNew();

  // insert table columns in start of a row
  html += objOverview.insertTableColumnsNew('', 0, '', '');

  // Show all selected condos
  // Get last id in last object in condo array
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  html += objCondo.showSelectedCondosNew('filterCondoId', 'width:100px;', condoId, '', '');

  // from date
  const year = String(today.getFullYear());
  let fromDate = "01.01." + year;
  html += objOverview.inputTableColumnNew('filterFromDate', fromDate, 10);

  // to date
  let toDate = getCurrentDate();
  html += objOverview.inputTableColumnNew('filterToDate', toDate, 10);

  html += "</tr>";

  //html += objOverview.insertEmptyTableRowNew(0, '');
  // insert table columns in start of a row
  html += objOverview.insertTableColumnsNew('', 0, '');

  // end table body
  html += objOverview.endTableBodyNew();

  // The end of the table
  html += objOverview.endTableNew();
  document.querySelector('.filter').innerHTML = html;
}


// Show dues
function showDues(rowNumber) {

  // Start HTML table
  html = objOverview.startTableNew('width:1100px;');

  let sumDue = 0;

  // Header
  html += objOverview.showTableHeaderNew('width:1100px;', '', 'Leilighet', 'Forfallsdato', 'Beløp', 'Tekst');

  objDues.arrayDues.forEach((due) => {

    //html += "<tr>";

    // Show menu
    //rowNumber++;
    //html += objDues.menuNew(rowNumber);

    // insert table columns in start of a row
    rowNumber++;
    html += objDues.insertTableColumnsNew('', rowNumber);

    // condos
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondosNew(className, '', due.condoId, 'Ingen er valgt', '');

    // date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objOverview.inputTableColumnNew(className, date, 10);

    // amount
    const amount = formatOreToKroner(due.amount);
    className = `income${due.dueId}`;
    html += objOverview.inputTableColumnNew(className, amount, 10);

    // Text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objOverview.inputTableColumnNew(className, text, 45);

    html += "</tr>";

    // accumulate
    sumDue += Number(due.amount);
  });

  // Sum row
  sumDue = formatOreToKroner(sumDue);

  rowNumber++;
  html += objOverview.insertTableColumnsNew('font-weight: 600;', rowNumber, '', 'Sum', sumDue);

  // due
  //html += `<td class="center bold">${sumDue}</td>`;

  html += "</tr>"

  rowNumber++;
  html += objOverview.insertTableColumnsNew('', rowNumber, '', '', '');

  html += "</tr>"

  // The end of the table
  html += objAccounts.endTableNew();
  document.querySelector('.dues').innerHTML = html;
  return rowNumber;
}

// Bank account transactions
function showBankAccountTransactions(rowNumber) {

  // Start table
  html = objOverview.startTableNew('width:1100px;');

  // Header
  rowNumber++;
  html += objOverview.showTableHeaderNew('width:1100px;', '', 'Leilighet', 'Betalingsdato', 'Betaling', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    //html += "<tr>";

    // Show menu
    //rowNumber++;
    //html += objDues.menuNew(rowNumber);
    // insert table columns in start of a row
    rowNumber++;
    html += objDues.insertTableColumnsNew('', rowNumber);

    // condos
    className = `condo${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondosNew(className, '', Number(bankAccountTransaction.condoId), 'Ingen er valgt', '');

    // date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, date, 10);

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, income, 10);

    // Text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumnNew(className, text, 45);

    html += "</tr>";

    // accumulate
    sumIncomes += Number(bankAccountTransaction.income);
    sumPayments += Number(bankAccountTransaction.payment);
  });

  // Sum row
  sumIncomes = formatOreToKroner(sumIncomes);
  sumPayments = formatOreToKroner(sumPayments);

  html += "<tr>";

  html += "<tr>";

  // Show menu
  //rowNumber++;
  //html += objDues.menuNew(rowNumber);

  // text sum
  //html += "<td class='center bold'>Sum</td>";

  // due
  //html += `<td class="center bold">${sumIncomes}</td>`;

  rowNumber++;
  html += objOverview.insertTableColumnsNew('font-weight: 600;', rowNumber, '', 'Sum', sumIncomes);

  html += "</tr>"

  rowNumber++;
  html += objOverview.insertTableColumnsNew('', rowNumber, '', '', '');

  // The end of the table
  html += objDues.endTableNew();
  document.querySelector('.bankAccountTransactions').innerHTML = html;

  return rowNumber;
}

// show how much to pay
function showHowMuchToPay(rowNumber) {

  // Start table
  let html = objOverview.startTableNew('width:1100px;');

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
  html += (overPay > 0) ? objOverview.showTableHeaderNew('width:1100px;', '', '', 'Forfall', 'Betalt', 'Til gode') : objOverview.showTableHeaderNew('width:1100px;', '', '', 'Forfall', 'Betalt', 'Skyldig');

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatOreToKroner(overPay);
  sumIncome = formatOreToKroner(sumIncome);
  sumToPay = formatOreToKroner(sumToPay);

  // Show menu
  rowNumber++;
  html += objOverview.insertTableColumnsNew('font-weight: 600;', rowNumber, 'Sum', sumToPay, sumIncome, overPay);

  // Show the rest of the menu
  rowNumber++;
  html += objOverview.showRestMenuNew(rowNumber);

  // The end of the table
  html += objOverview.endTableNew();
  document.querySelector('.howMuchToPay').innerHTML = html;

  return rowNumber;
}

/*
// valitadate filter
function validateFilter() {

  // condo
  const condoId = Number(document.querySelector('.filterFromDate').value);
  const validCondoId = objOverview.validateNumberNew(condoId, 1, 999999999);

  // from date
  let fromDate = document.querySelector('.filterFromDate').value;
  const validFromDate = objOverview.validateNorDateFormatNew(fromDate);

  // to date
  let toDate = document.querySelector('.filterFromDate').value;
  const validToDate = objOverview.validateNorDateFormatNew(toDate);

  // Validate interval
  fromDate = objOverview.formatNorDateToNumberNew(fromDate);
  toDate = objOverview.formatNorDateToNumberNew(toDate);
  const validDates = objOverview.validateIntervalNew(Number(fromDate), Number(fromDate), Number(toDate));

  return (validFromDate && validToDate && validDates && validCondoId);
}
*/
