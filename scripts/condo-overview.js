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

//objOverview.menu();
//objOverview.markSelectedMenu('Bet.oversikt');

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
    await objAccounts.loadAccountsTable(condominiumId);

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

    // Create events
    createEvents();
  }
}

// Create overview events
function createEvents() {

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
/*
// Select condo
document.addEventListener('change', (event) => {
  if (event.target.classList.contains('select-filter-condoId')) {

    // Search for overview and reload
    searchAccountOverviewSync();

    async function searchAccountOverviewSync() {

      const condominiumId = Number(objUserPassword.condominiumId);
      const deleted = 'N';

      const condoId = Number(document.querySelector('.select-filter-condoId').value);
      const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
      const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));

      await objDues.loadDuesTable(condominiumId, 999999999, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

      // show dues
      showDues();

      // Bank account transactions
      showBankAccountMovements();

      // Show how much to pay
      showHowMuchToPay();
    }
  }
});
*/

/*
// From date
document.addEventListener('change', (event) => {
  if (event.target.classList.contains('input-filter-fromDate')) {

    // Search for overview and reload
    searchFromDateSync();

    async function searchFromDateSync() {

      const condominiumId = Number(objUserPassword.condominiumId);

      const condoId = Number(document.querySelector('.select-filter-condoId').value);
      const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
      const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));

      await objDues.loadDuesTable(condominiumId, 999999999, condoId, fromDate, toDate);
      const deleted = 'N';
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

      // show dues
      showDues();

      // Show bank account transactions
      showBankAccountMovements();

      // show how much to pay
      showHowMuchToPay();
    }
  };
});
*/

/*
// To date
document.addEventListener('change', (event) => {
  if (event.target.classList.contains('input-filter-toDate')) {

    // Search for overview and reload
    searchToDateSync();

    async function searchToDateSync() {

      const condominiumId = Number(objUserPassword.condominiumId);
      const deleted = 'N';

      const condoId = Number(document.querySelector('.select-filter-condoId').value);
      const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
      const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));

      await objDues.loadDuesTable(condominiumId, 999999999, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

      // Show dues
      showDues();

      // Bank account transactions
      showBankAccountMovements();

      // show how much to pay
      showHowMuchToPay();
    }
  };
});
return true;
}
*/

/*
// Show leading text Filter
function showLeadingTextFilter() {
 
  let html = startHTMLFilters();
 
  // Show all condos
  const condoId = objCondo.arrayCondo.at(-1).condoId;
  html += objCondo.showSelectedCondosHTML('select-filter-condoId', condoId, "Alle");
 
  // from date
  html += objOverview.showInputHTML('input-filter-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
 
  // to date
  html += objOverview.showInputHTML('input-filter-toDate', 'Fra dato', 10, 'mm.dd.åååå');
 
  html += endHTMLFilters();
  document.querySelector('.div-grid-overview-filter').innerHTML = html;
}
*/

/*
// Show values for filter
function showValuesFilter() {
 
  // From date
  date = document.querySelector('.input-filter-fromDate').value;
  if (!validateEuroDateFormat(date)) {
 
    // From date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-filter-fromDate').value = "01.01." + year;
  }
  objOverview.showIcon('input-filter-fromDate');
 
  // to date
  date = document.querySelector('.input-filter-toDate').value;
  if (!validateEuroDateFormat(date)) {
 
    // To date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-filter-toDate').value = getCurrentDate();
  }
  objOverview.showIcon('input-filter-toDate');
}
*/

/*
// Show dues
function showDues() {
 
  let html = startHTMLTable('width:1100px;');
  html += HTMLTableHeader('Leilighet', 'Forfallsdato', 'Forfallsbeløp', `Tekst`);
 
  // Filter
  let fromDate = convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value);
  let toDate = convertDateToISOFormat(document.querySelector('.input-filter-toDate').value);
  toDate = (toDate === 0) ? 99999999 : toDate;
 
  const condoId = Number(document.querySelector('.select-filter-condoId').value);
 
  let rowNumber = 0;
  let sumDues = 0;
 
  objDues.arrayDues.forEach((due) => {
 
    rowNumber++;
 
    // check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";
 
    const name = objCondo.getCondoName(due.condoId);
    const date = formatToNorDate(due.date);
    const amount = formatOreToKroner(due.amount);
 
    html += HTMLTableRow(name, date, amount, due.text);
 
    // Accomulate
    // due
    sumDues += due.amount;
  });
 
  // Sum line
  sumDues = formatOreToKroner(sumDues);
  html += HTMLTableRow('Sum', '', sumDues, '');
 
  html += endHTMLTableBody();
  html += endHTMLTable();
 
  document.querySelector('.div-grid-overview-dues').innerHTML = html;
}
*/

/*
// Show bank account transactions
function showBankAccountMovements() {
 
  let html = startHTMLTable('width:1100px;');
  html += HTMLTableHeader('Leilighet', 'Dato', 'Innbetalt', 'Tekst');
 
  let sumIncome = 0;
 
  // How much is payd
  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {
 
    if (Number(bankAccountTransaction.condoId) !== 0) {
 
      // condo name
      const name = (bankAccountTransaction.condoId) ? objCondo.getCondoName(bankAccountTransaction.condoId) : "-";
 
      // date
      const date = formatToNorDate(bankAccountTransaction.date);
 
      // income
      const income = formatOreToKroner(bankAccountTransaction.income);
 
      // text
      const text = bankAccountTransaction.text;
 
      html += HTMLTableRow(name, date, income, text);
 
      // Accomulate
      sumIncome += Number(bankAccountTransaction.income);
    }
  });
 
  // Sum row
  sumIncome = formatOreToKroner(sumIncome);
  html += HTMLTableRow('Sum', '', sumIncome, '');
 
  html += endHTMLTableBody();
  html += endHTMLTable();
 
  document.querySelector('.div-grid-overview-bankAccountTransactions').innerHTML = html;
}
*/

/*
// show how much to pay
function showHowMuchToPay() {
 
  let sumIncome = 0;
 
  // How much is payd
  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {
 
    // Accomulate
    sumIncome += Number(bankAccountTransaction.income);
  });
 
  // How much to pay
  let sumToPay = 0;
  objDues.arrayDues.forEach((due) => {
 
    sumToPay += due.amount;
  });
 
  // Header
  let html = startHTMLTable('width:1100px;');
 
  let owes = sumIncome - sumToPay;
  html += (owes > 0) ? HTMLTableHeader('Sum', 'Forfall', 'Betalt', 'Til gode') : HTMLTableHeader('Sum', 'Forfall', 'Betalt', 'Skyldig');
 
  // Sum line
  if (owes < 0) owes = (owes * -1);
  owes = formatOreToKroner(owes);
  sumIncome = formatOreToKroner(sumIncome);
  sumToPay = formatOreToKroner(sumToPay);
  html += HTMLTableRow('Sum', sumToPay, sumIncome, owes);
 
  html += endHTMLTableBody();
  html += endHTMLTable();
 
  document.querySelector('.div-grid-overview-howMuchToPay').innerHTML = html;
}
*/

/*
// Header
let htmlBankAccountTransactionCondoName = '<div class="columnHeaderRight">Leiliget</div><br>';
let htmlBankAccountTransactionDate = '<div class="columnHeaderRight">Betalingsdato</div><br>';
let htmlBankAccountTransactionAmount = '<div class="columnHeaderRight">Beløp</div><br>';
let htmlBankAccountTransactionText = '<div class="columnHeaderLeft">Tekst</div><br>';
 
let sumColumnBankAccountTransaction = 0;
 
rowNumber = 0;
 
objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {
 
  rowNumber++;
 
  // check if the number is odd
  const colorClass = (rowNumber % 2 !== 0) ? "green" : "";
 
  // condo name
  const condoName = (bankAccountTransaction.condoId) ? objCondo.getCondoName(bankAccountTransaction.condoId) : "-";
  htmlBankAccountTransactionCondoName +=
    `
      <div class="rightCell ${colorClass}">
        ${condoName}
      </div>
    `;
 
  // date
  const date = formatToNorDate(bankAccountTransaction.date);
  htmlBankAccountTransactionDate +=
    `
      <div class="rightCell ${colorClass}"
      >
        ${date}
      </div>
    `;
 
  // income
  const income = formatOreToKroner(bankAccountTransaction.income);
  htmlBankAccountTransactionAmount +=
    `
      <div 
        class="rightCell ${colorClass}"
      >
        ${income}
      </div>
    `;
 
  // Text has to fit into the column
  htmlBankAccountTransactionText +=
    `
      <div
        class="leftCell one-line ${colorClass}"
      >
        ${bankAccountTransaction.text}
      </div>
    `;
 
  // Accomulate
  sumColumnBankAccountTransaction += bankAccountTransaction.income;
});
 
// Show total line
htmlColumnDueCondoName +=
  `
    <div class="sumCellLeft">
      Sum
    </div>
  `;
 
htmlColumnDueDate +=
  `
    <div class="sumCellLeft">
      -
    </div>
  `;
 
// Sum due
htmlColumnDueAmount +=
  `
    <div class="sumCellRight">
  `;
htmlColumnDueAmount += formatOreToKroner(String(sumColumnDue));
htmlColumnDueAmount +=
  `
    </div>
  `;
 
// sum Bank account transactions
htmlBankAccountTransactionAmount +=
  `
    <div class="sumCellRight">
  `;
htmlBankAccountTransactionAmount += formatOreToKroner(String(sumColumnBankAccountTransaction));
htmlBankAccountTransactionAmount +=
  `
    </div>
  `;
 
// sum guilty
htmlBankAccountTransactionText +=
  `
    <div class="sumCellLeft"
    >
  `;
const guilty = sumColumnDue - sumColumnBankAccountTransaction;
htmlBankAccountTransactionText +=
  `Skyldig ` + formatOreToKroner(String(guilty));
htmlBankAccountTransactionText +=
  `
    </div>
  `;
 
// Show due rows
document.querySelector('.div-overview-columnDueCondoName').innerHTML = htmlColumnDueCondoName;
document.querySelector('.div-overview-columnDueDate').innerHTML = htmlColumnDueDate;
document.querySelector('.div-overview-columnDueAmount').innerHTML = htmlColumnDueAmount;
document.querySelector('.div-overview-columnDueText').innerHTML = htmlColumnDueText;
 
// Show bankaccounttransaction rows
document.querySelector('.div-overview-columnBankAccountTransactionCondoName').innerHTML =
  htmlBankAccountTransactionCondoName;
document.querySelector('.div-overview-columnBankAccountTransactionDate').innerHTML =
  htmlBankAccountTransactionDate;
document.querySelector('.div-overview-columnBankAccountTransactionAmount').innerHTML =
  htmlBankAccountTransactionAmount;
document.querySelector('.div-overview-columnBankAccountTransactionText').innerHTML =
  htmlBankAccountTransactionText;
}
}
*/

/*
// Check for valid filter values
function validateValues() {
 
  let fromDate = document.querySelector('.input-filter-fromDate').value;
  const validFromDate = validateNorDate(fromDate, 'filter-fromDate', 'Fra dato');
 
  let toDate = document.querySelector('.input-filter-toDate').value;
  const validToDate = validateNorDate(toDate, 'filter-toDate', 'Fra dato');
 
  // Check date interval
  fromDate = Number(convertDateToISOFormat(fromDate));
  toDate = Number(convertDateToISOFormat(toDate));
 
  validDateInterval = (fromDate <= toDate) ? true : false;
 
  fromDate = formatToNorDate(fromDate);
  toDate = formatToNorDate(toDate);
 
  if (toDate !== '') {
    // Check to date dd.mm.yyyy
    if (!validateEuroDateFormat(toDate)) {
      document.querySelector('.label-overview-fromDate').outerHTML =
        "<div class='label-overview-fromDate-red'>Format dd.mm.åååå</div>";
      validValues = false;
    }
  }
 
  if (validFromDate && validToDate && validDateInterval) {
 
    if (fromDate !== '' && toDate !== '') {
      const flipedFromDate = convertDateToISOFormat(fromDate);
      const flipedToDate = convertDateToISOFormat(toDate);
 
      if (flipedFromDate > flipedToDate) {
        document.querySelector('.label-overview-fromDate').outerHTML = "<div class='label-overview-fromDate-red label-overview-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }
 
  return (validFromDate && validToDate && validDateInterval) ? true : false;
}
*/

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
  html += showHTMLFilterHeader("width:250px;", '', '', '', '', '');
  html += showHTMLFilterHeader("width:250px;", '', '', 'Velg leilighet', 'Fra dato', 'Til dato', '');

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
  html += showHTMLFilterHeader("width:250px;", '', '', '', '', '');

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
  html += showHTMLMainTableHeader('width:1100px;', '', 'Leilighet', 'Forfallsdato', 'Beløp', 'Tekst');

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
    html += objCondo.showSelectedCondosNew(className, '', due.condoId, '', 'Ingen er valgt');

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

  // Show table sum row
  //rowNumber++;
  //html += showTableSumRow(rowNumber, sumDue);

  // Show menu
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
  html += objCondo.showSelectedCondosNew(className, '', '', '', 'Ingen er valgt');
 
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
  html += showHTMLFilterHeader('width:250px;', '', '', '', '', '');
  html += showHTMLMainTableHeader('width:1100px;', '', 'Leilighet', 'Betalingsdato', 'Betaling', 'Tekst');

  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

    html += "<tr><td></td>";

    // Show menu
    //html += objBankAccountTransactions.menuNew(999999999);

    // Delete
    //let className = `deleted${bankAccountTransaction.bankAccountTransactionId}`;
    //html += objBankAccountTransactions.showSelectedValuesNew(className, '', 'Nei', 'Nei', 'Ja')

    // condos
    className = `condo${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondosNew(className, '', Number(bankAccountTransaction.condoId), '', 'Ingen er valgt');

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

  // Show the rest of the menu
  //html += objOverview.showRestMenuNew(999999999);

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
  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

    // Accomulate
    sumIncome += Number(bankAccountTransaction.income);
  });

  // Start HTML table
  html = startHTMLTable('width:1100px;');

  // Header
  html += showHTMLFilterHeader('width:250px;', '', '', '', '', '');

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
