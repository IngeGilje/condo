// Overview of remote heating

// Activate objects
const today = new Date();
const objCondominiums = new Condominiums('condominiums');
const objUsers = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Account('account');
const objBankAccountTransactions = new BankAccountTransactions('bankaccounttransactions');
const objRemoteHeating = new Remoteheating('remoteheating');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();


objRemoteHeating.menu();
objRemoteHeating.markSelectedMenu('Fjernvarme');

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

    await objCondominiums.loadCondominiumsTable();
    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId,fixedCost);

    amount = 0;
    condominiumId = objUserPassword.condominiumId;
    const deleted = 'N';
    const condoId = 999999999;

    const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    let accountId;
    if (condominiumRowNumber !== -1) {
      accountId = objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId;
    }
    let fromDate = "01.01." + String(today.getFullYear());
    fromDate = Number(convertDateToISOFormat(fromDate));
    let toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));
    const orderBy = 'condoId ASC, date DESC, income ASC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

    // Show leding text filter
    showLeadingTextFilter();

    // Show values for Filter
    showValuesFilter();

    // Show Bank account transactions
    showBankAccountTransactions();

    // Events
    events();
  }
}

// Make remoteheating events
function events() {

  // From date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-fromDate')) {

      // Get selected Bank account transactions and show
      searchFromDateSync();

      // Get selected Bank account transactions
      async function searchFromDateSync() {

        // Get selected Bank account transactions
        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = 'N';
        const condoId = 999999999;

        const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
        let accountId;
        if (condominiumRowNumber !== -1) {
          accountId = objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId;
        }

        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, 0, fromDate, toDate)

        // Show selected Bank account transactions
        showBankAccountTransactions();
      }
    };
  });

  // To date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-filter-toDate')) {

      // Get selected Bank account transactions and show
      searchToDateSync();

      // Get selected Bank account transactions
      async function searchToDateSync() {

        // Get selected Bank account transactions
        const condominiumId = Number(objUserPassword.condominiumId);
        const deleted = 'N';
        const condoId = 999999999;

        const condominiumRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
        let accountId;
        if (condominiumRowNumber !== -1) {
          accountId = objCondominiums.arrayCondominiums[condominiumRowNumber].paymentRemoteHeatingAccountId;
        }
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-filter-toDate').value));
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, 0, fromDate, toDate)

        // Show selected Bank account transactions
        showBankAccountTransactions();
      }
    };
  });
}

// Show filter
function showLeadingTextFilter() {

  let html = "";

  html += startHTMLFilters();

  // from date
  html += objRemoteHeating.showInputHTML('input-filter-fromDate', 'Fra dato', 10, 'mm.dd.åååå');

  html += objRemoteHeating.showInputHTML('input-filter-toDate', 'Fra dato', 10, 'mm.dd.åååå');

  html += endHTMLFilters();

  document.querySelector('.div-grid-remoteheating-filter').innerHTML = html;
}

// Show selected bank account transactions
function showBankAccountTransactions() {

  // check for valid filter
  if (validateValues()) {

    // Accomulate
    let sumColumnPayment = 0;
    let sumColumnNumberKWHour = 0;
    let html = "";

    // Header bankaccounttransaction
    html = startHTMLTable();
    html += HTMLTableHeader('Betalings dato', 'Beløp', 'Kilowatt timer', 'Pris/Kilowatt timer', 'Tekst');
    html += startHTMLTableBody();

    // Make all columns
    let rowNumber = 0;

    objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankaccounttransaction) => {

      rowNumber++;

      // check if the number is odd
      const colorClass = (rowNumber % 2 !== 0) ? "green" : "";

      // date
      const date = formatToNorDate(bankaccounttransaction.date);

      // payment
      const strPayment = formatOreToKroner(bankaccounttransaction.payment);

      // Number of kw/h
      const strNumberKWHour = formatOreToKroner(bankaccounttransaction.numberKWHour);

      // Price per KWHour
      let payment = Number(bankaccounttransaction.payment);
      let numberKWHour = Number(bankaccounttransaction.numberKWHour);

      let priceKWHour = '';
      if (numberKWHour !== 0 && payment !== 0) {

        priceKWHour = (-1 * payment) / numberKWHour;
        priceKWHour = priceKWHour.toFixed(2);
        priceKWHour = formatOreToKroner(priceKWHour);
      }
      html += HTMLTableRow(date, strPayment, strNumberKWHour, priceKWHour, bankaccounttransaction.text)

      // Accomulate
      // payment
      sumColumnPayment += Number(bankaccounttransaction.payment);

      // KWHour
      sumColumnNumberKWHour += Number(bankaccounttransaction.numberKWHour);
    });

    // Show all sums
    const strColumnPayment = formatOreToKroner(sumColumnPayment);

    const strSumColumnNumberKWHour = formatOreToKroner(sumColumnNumberKWHour);

    // Price per KWHour
    payment = Number(sumColumnPayment);
    //sumColumnNumberKWHour = formatKronerToOre(sumColumnNumberKWHour);
    numberKWHour = Number(sumColumnNumberKWHour);

    let sumPriceKWHour = '';
    if (payment !== 0 && sumColumnNumberKWHour !== 0) {

      sumPriceKWHour = ((-1 * payment) / sumColumnNumberKWHour);
      sumPriceKWHour = sumPriceKWHour.toFixed(2);
      sumPriceKWHour = formatOreToKroner(sumPriceKWHour);
    }

    // Show sum
    html += HTMLTableRow('', strColumnPayment, strSumColumnNumberKWHour, sumPriceKWHour, '');

    // End table
    html += endHTMLTableBody();
    html += endHTMLTable();
    document.querySelector('.div-grid-remoteheating-remoteHeating').innerHTML = html;
  }
}

// Check for valid filter values
function validateValues() {

  let validValues = true;

  const fromDate = document.querySelector('.input-filter-fromDate').value;
  const toDate = document.querySelector('.input-filter-toDate').value;

  if (fromDate !== '') {

    // Check from date dd.mm.yyyy
    if (!validateEuroDateFormat(fromDate)) {
      document.querySelector('.label-remoteheating-fromDate').outerHTML =
        "<div class='label-remoteheating-fromDate-red'>Format dd.mm.åååå</div>";
      validValues = false;
    }
  }

  if (toDate !== '') {
    // Check to date dd.mm.yyyy
    if (!validateEuroDateFormat(toDate)) {
      document.querySelector('.label-remoteheating-fromDate').outerHTML =
        "<div class='label-remoteheating-fromDate-red'>Format dd.mm.åååå</div>";
      validValues = false;
    }
  }

  if (validValues) {

    if (fromDate !== '' && toDate !== '') {
      const flipedFromDate = convertDateToISOFormat(fromDate);
      const flipedToDate = convertDateToISOFormat(toDate);

      if (flipedFromDate > flipedToDate) {
        document.querySelector('.label-remoteheating-fromDate').outerHTML =
          "<div class='label-remoteheating-fromDate-red'>Dato er feil</div>";
        validValues = false;
      }
    }
  }

  return validValues;
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
  objRemoteHeating.showIcon('input-filter-fromDate');

  // to date
  date = document.querySelector('.input-filter-toDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-filter-toDate').value = getCurrentDate();
  }
  objRemoteHeating.showIcon('input-filter-toDate');
}
