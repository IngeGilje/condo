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
//exitIfNoActivity();

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
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId,fixedCost);

    // Show header
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
    showDues();

    // Bank account transactions
    showBankAccountTransactions();

    // show how much to pay
    showHowMuchToPay();

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
        if (validateFilter()) {

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
          showDues();

          // Bank account transactions
          showBankAccountTransactions();

          // show how much to pay
          showHowMuchToPay();
        }
      }
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:1100px;');

  // Main header
  html += showHTMLMainTableHeader('widht:250px;', 'Betalingsoversikt');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable('width:1100px;');

  // Header filter for search
  html += objOverview.showHTMLFilterHeader("width:250px;", '', '', '', '', '');
  html += objOverview.showHTMLFilterHeader("width:250px;", '', '', 'Velg leilighet', 'Fra dato', 'Til dato', '');

  // Filter for search
  html += "<tr><td></td><td></td>";

  // Show all selected condos
  // Get last id in last object in condo array
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  html += objCondo.showSelectedCondosNew('filterCondoId', 'width:100px;', condoId, '', '');

  // from date
  const year = String(today.getFullYear());
  let fromDate = "01.01." + year;
  html += objOverview.showInputHTMLNew('filterFromDate', fromDate, 10);

  // to date
  let toDate = getCurrentDate();
  html += objOverview.showInputHTMLNew('filterToDate', toDate, 10);

  html += "</tr>";

  // Header filter for search
  html += objOverview.showHTMLFilterHeader("width:250px;", '', '', '', '', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Show dues
function showDues() {

  // Start HTML table
  html = startHTMLTable('width:1100px;');

  let sumDue = 0;
  let rowNumber = 0;

  // Header
  html += objOverview.showHTMLMainTableHeaderNew('width:1100px;', 0, '', 'Leilighet', 'Forfallsdato', 'Beløp', 'Tekst');

  objDues.arrayDues.forEach((due) => {

    html += "<tr>";

    // Show menu
    rowNumber++;
    html += objDues.menuNew(rowNumber);

    // Delete
    //let className = `deleted${due.dueId}`;
    //html += objDues.showSelectedValuesNew(className, '', 'Nei', 'Nei', 'Ja')

    // condos
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondosNew(className, '', due.condoId, 'Ingen er valgt', '');

    // account
    //className = `account${due.dueId}`;
    //html += objAccounts.showSelectedAccountsNew(className, '', due.accountId, '', 'Ingen er valgt');

    // date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objDues.showInputHTMLNew(className, date, 10);

    // amount
    const amount = formatOreToKroner(due.amount);
    className = `income${due.dueId}`;
    html += objDues.showInputHTMLNew(className, amount, 10);

    // Text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objDues.showInputHTMLNew(className, text, 45);

    html += "</tr>";

    // accumulate
    sumDue += Number(due.amount);
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  //html += insertEmptyTableRow(rowNumber);

  // Sum row
  sumDue = formatOreToKroner(sumDue);
 
  // Show menu
  rowNumber++;
  html += objAccounts.menuNew(rowNumber);

  html += "<td></td>";

  // text sum
  html += "<td class='center bold'>Sum</td>";

  // due
  html += `<td class="center bold">${sumDue}</td>`;

  html += "<td></td>";
  html += "</tr>"

  // Show the rest of the menu
  rowNumber++;
  html += objOverview.showRestMenuNew(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.dues').innerHTML = html;
}

/*
// Insert empty table row
function insertEmptyTableRow(rowNumber) {
 
  let html = "<tr>";
 
  // Show menu
  html += objBankAccountTransactions.menuNew(rowNumber);
 
  html += "<td></td>";
 
  // condos
  className = `condo0`;
  html += objCondo.showSelectedCondosNew(className, '', '', 'Ingen er valgt', '');
 
  // account
  //className = `account0`;
  //html += objAccounts.showSelectedAccountsNew(className, '', '', '', 'Ingen er valgt');
 
  // date
  className = `date0`;
  html += objOverview.showInputHTMLNew(className, '', 10);
 
  // amount
  className = `amount0`;
  html += objOverview.showInputHTMLNew(className, '', 10);
 
  // Text
  className = `text0`;
  html += objOverview.showInputHTMLNew(className, '', 45);
 
  html += "</tr>";
  return html;
}
*/

// Bank account transactions
function showBankAccountTransactions() {

  // Start HTML table
  html = startHTMLTable('width:1100px;');

  let sumIncomes = 0;
  let sumPayments = 0;

  // Header
  html += objOverview.showHTMLFilterHeader('width:250px;', '', '', '', '', '');
  html += objOverview.showHTMLMainTableHeaderNew('width:1100px;', 0, '', 'Leilighet', 'Betalingsdato', 'Betaling', 'Tekst');

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    html += "<tr><td></td>";

    // condos
    className = `condo${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondosNew(className, '', Number(bankAccountTransaction.condoId), 'Ingen er valgt', '');

    // account
    //className = `account${bankAccountTransaction.bankAccountTransactionId}`;
    //html += objAccounts.showSelectedAccountsNew(className, '', bankAccountTransaction.accountId, '', 'Ingen er valgt');

    // date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, date, 10);

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, income, 10);

    // payment
    //const payment = formatOreToKroner(bankAccountTransaction.payment);
    //className = `payment${bankAccountTransaction.bankAccountTransactionId}`;
    //html += objBankAccountTransactions.showInputHTMLNew(className, payment, 10);

    // Text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, text, 45);

    html += "</tr>";

    // accumulate
    sumIncomes += Number(bankAccountTransaction.income);
    sumPayments += Number(bankAccountTransaction.payment);
  });

  // Make one last table row for insertion in table 


  // Insert empty table row for insertion
  //html += insertEmptyTableRow(rowNumber);

  // Sum row

  sumIncomes = formatOreToKroner(sumIncomes);
  sumPayments = formatOreToKroner(sumPayments);

  // Show table sum row
  //html += showTableSumRow(999999999, sumIncomes, sumPayments);

  html += "<tr>";

  // due date
  html += "<td></td><td></td>";

  // text sum
  html += "<td class='center bold'>Sum</td>";

  // due
  html += `<td class="center bold">${sumIncomes}</td>`;

  // Text
  html += "<td></td>";
  html += "</tr>"

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.bankAccountTransactions').innerHTML = html;
}

// show how much to pay
function showHowMuchToPay() {

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

  // Start HTML table
  html = startHTMLTable('width:1100px;');

  // Header
  html += objOverview.showHTMLFilterHeader('width:250px;', '', '', '', '', '');

  let overPay = sumIncome - sumToPay;
  html += (overPay > 0) ? showHTMLMainTableHeader('width:1100px;', '', 'Forfall', 'Betalt', 'Til gode') : showHTMLMainTableHeader('width:1100px;', 'Sum', 'Forfall', 'Betalt', 'Skyldig');

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatOreToKroner(overPay);
  sumIncome = formatOreToKroner(sumIncome);
  sumToPay = formatOreToKroner(sumToPay);
  //html += HTMLTableRow('Sum', sumToPay, sumIncome, owes);
  // Show table sum row
  //html += showTableSumRow(999999999, 'Sum', sumToPay, sumIncome, owes);
  html += "<tr>";

  // Show menu
  //html += objAccounts.menuNew(rowNumber);

  // condo
  //html += "<td></td>";

  // account
  //html += "<td></td>";

  // text sum
  html += "<td class='center bold'>Sum</td>";

  // due
  html += `<td class="center bold">${sumToPay}</td>`;

  // income
  html += `<td class="center bold">${sumIncome}</td>`;

  // overpay
  html += `<td class="center bold">${overPay}</td>`;

  // Text
  html += "<td></td>";
  html += "</tr>"

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.howMuchToPay').innerHTML = html;
}

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
