// Search for dues

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objDues = new Dues('dues');
const objCondo = new Condo('condo');
const objBankAccountTransactions = new BankAccountTransactions('bankaccounttransactions');
const objOverview = new Overview('overview');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objOverview.menu();
objOverview.markSelectedMenu('Bet.oversikt');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const condominiumId = Number(objUserPassword.condominiumId);

    await objUsers.loadUsersTable(condominiumId);
    await objCondo.loadCondoTable(condominiumId);

    // Show leading text Filter
    showLeadingTextFilter();

    // Show values for Filter
    showValuesFilter();

    //const condoId = objCondo.arrayCondo.at(-1).condoId;
    const condoId = 999999999;
    const accountId = 999999999;
    const deleted = 'N';
    const year = String(today.getFullYear());
    let fromDate = "01.01." + year;
    fromDate = convertDateToISOFormat(fromDate);
    let toDate = getCurrentDate();
    toDate = convertDateToISOFormat(toDate);
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
    await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

    /*
    // Show leading text Filter
    showLeadingTextFilter();

    // Show values for Filter
    showValuesFilter();
    */

    // Show dues
    showDues();

    // Bank account transactions
    showBankAccountMovements();

    // show how much to pay
    showHowMuchToPay();

    // Create events
    createEvents();
  }
}

// Create overview events
function createEvents() {

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
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

        // show dues
        showDues();

        // Bank account transactions
        showBankAccountMovements();

        // Show how much to pay
        showHowMuchToPay();
      }
    }
  });

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
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

        // show dues
        showDues();

        // Show bank account transactions
        showBankAccountMovements();

        // show how much to pay
        showHowMuchToPay();
      }
    };
  });

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
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, 999999999, 0, fromDate, toDate);

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

// Show dues
function showDues() {

  let html = startHTMLTable();
  html += HTMLTableHeader('Leilighet', 'Forfallsdato', 'Forfallsbeløp', `Tekst`);

  // Filter
  let fromDate = convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value);
  let toDate = convertDateToISOFormat(document.querySelector('.input-filter-toDate').value);
  toDate = (toDate === 0) ? 99999999 : toDate;

  const condoId = Number(document.querySelector('.select-filter-condoId').value);

  let lineNumber = 0;
  let sumDues = 0;

  objDues.arrayDues.forEach((due) => {

    lineNumber++;

    // check if the number is odd
    const colorClass = (lineNumber % 2 !== 0) ? "green" : "";

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

// Show bank account transactions
function showBankAccountMovements() {

  let html = startHTMLTable();
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

  // Sum line
  sumIncome = formatOreToKroner(sumIncome);
  html += HTMLTableRow('Sum', '', sumIncome, '');

  html += endHTMLTableBody();
  html += endHTMLTable();

  document.querySelector('.div-grid-overview-bankAccountTransactions').innerHTML = html;
}

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
  let html = startHTMLTable();

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

/*
// Header
let htmlBankAccountTransactionCondoName = '<div class="columnHeaderRight">Leiliget</div><br>';
let htmlBankAccountTransactionDate = '<div class="columnHeaderRight">Betalingsdato</div><br>';
let htmlBankAccountTransactionAmount = '<div class="columnHeaderRight">Beløp</div><br>';
let htmlBankAccountTransactionText = '<div class="columnHeaderLeft">Tekst</div><br>';

let sumColumnBankAccountTransaction = 0;

lineNumber = 0;

objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

  lineNumber++;

  // check if the number is odd
  const colorClass = (lineNumber % 2 !== 0) ? "green" : "";

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