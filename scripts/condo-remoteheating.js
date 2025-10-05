// Overview of remote heating

// Activate objects
const today = new Date();
const objCondominiums = new Condominiums('condominiums');
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objBankAccountTransactions = new BankAccountTransactions('bankaccounttransactions');
const objRemoteheating = new Remoteheating('remoteheating');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();


objRemoteheating.menu();
objRemoteheating.markSelectedMenu('Fjernvarme');

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

    await objCondominiums.loadCondominiumsTable(objUserPassword.condominiumId);
    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

    amount = 0;
    condominiumId = objUserPassword.condominiumId;
    const condoId = 999999999;

    const condominiumRowNumberObj = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
    let accountId;
    if (condominiumRowNumberObj !== -1) {
      accountId = objCondominiums.arrayCondominiums[condominiumRowNumberObj].paymentRemoteHeatingAccountId;
    }
    let fromDate = "01.01." + String(today.getFullYear());
    fromDate = Number(convertDateToISOFormat(fromDate));
    let toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));
    await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

    // Show filter
    showFilter();

    // Get selected Bank Account Movements
    showSeletedBankAccountTransactions();

    // Make events
    createEvents();
  }
}

// Make remoteheating events
function createEvents() {

  // From date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-remoteheating-fromDate')) {

      // Get selected Bank Account Movements and show
      searchFromDateSync();

      // Get selected Bank Account Movements
      async function searchFromDateSync() {

        // Get selected Bank Account Movements
        const condominiumId = objUserPassword.condominiumId;
        const condoId = 999999999;

        const condominiumRowNumberObj = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
        let accountId;
        if (condominiumRowNumberObj !== -1) {
          accountId = objCondominiums.arrayCondominiums[condominiumRowNumberObj].paymentRemoteHeatingAccountId;
        }

        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-remoteheating-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-remoteheating-toDate').value));
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, condoId, accountId, 0, fromDate, toDate)

        // Show selected Bank Account Movements
        showSeletedBankAccountTransactions();
      }
    };
  });

  // To date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-remoteheating-toDate')) {

      // Get selected Bank Account Movements and show
      searchToDateSync();

      // Get selected Bank Account Movements
      async function searchToDateSync() {

        // Get selected Bank Account Movements
        const condominiumId = objUserPassword.condominiumId;
        const condoId = 999999999;

        const condominiumRowNumberObj = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objUserPassword.condominiumId);
        let accountId;
        if (condominiumRowNumberObj !== -1) {
          accountId = objCondominiums.arrayCondominiums[condominiumRowNumberObj].paymentRemoteHeatingAccountId;
        }
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-remoteheating-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-remoteheating-toDate').value));
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, condoId, accountId, 0, fromDate, toDate)

        // Show selected Bank Account Movements
        showSeletedBankAccountTransactions();
      }
    };
  });
}

// Show filter
function showFilter() {

  // from date
  if (!isClassDefined('input-remoteheating-fromDate')) {

    objRemoteheating.showInput('remoteheating-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
    date = document.querySelector('.input-remoteheating-fromDate').value;
    if (!validateEuroDateFormat(date)) {

      // From date is not ok
      const year = String(today.getFullYear());
      document.querySelector('.input-remoteheating-fromDate').value =
        "01.01." + year;
    }
  }

  // To date
  if (!isClassDefined('input-remoteheating-toDate')) {
    objRemoteheating.showInput('remoteheating-toDate', 'Til dato', 10, 'mm.dd.åååå');
    date = document.querySelector('.input-remoteheating-toDate').value;
    if (!validateEuroDateFormat(date)) {

      // To date is not ok
      document.querySelector('.input-remoteheating-toDate').value =
        getCurrentDate();
    }
  }
}

// Show selected bank account movements
function showSeletedBankAccountTransactions() {

  // check for valid filter
  if (validateValues()) {

    // Accomulate
    let sumColumnPayment = 0;
    let sumColumnNumberKWHour = 0;

    // Header bankaccounttransaction
    let htmlColumnDate = '<div class="columnHeaderRight">Betalings dato</div><br>';
    let htmlColumnPayment = '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnNumberKWHour = '<div class="columnHeaderRight">Kilowatt timer</div><br>';
    let htmlColumnPriceKWHour = '<div class="columnHeaderRight">Pris/Kilowatt timer</div><br>';
    let htmlColumnText = '<div class="columnHeaderLeft">Tekst</div><br>';

    // Make all columns
    let rowNumber = 0;

    objBankAccountTransactions.bankAccountTranactionsArray.forEach((bankaccounttransaction) => {

      rowNumber++;

      // check if the number is odd
      const colorClass = (rowNumber % 2 !== 0) ? "green" : "";

      // date
      const date = formatToNorDate(bankaccounttransaction.date);
      htmlColumnDate +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${date}
          </div>
        `;

      // payment
      let payment = formatOreToKroner(bankaccounttransaction.payment);
      htmlColumnPayment +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${payment}
          </div>
        `;

      // Number of kw/h
      let numberKWHour = formatOreToKroner(bankaccounttransaction.numberKWHour);
      htmlColumnNumberKWHour +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${numberKWHour}
          </div>
        `;

      // Price per KWHour
      payment = Number(bankaccounttransaction.payment);
      numberKWHour = Number(bankaccounttransaction.numberKWHour);

      let priceKWHour = '-';
      if (numberKWHour !== 0 && payment !== 0) {

        priceKWHour = (-1 * payment) / numberKWHour;
        priceKWHour = priceKWHour.toFixed(2);
      }
      htmlColumnPriceKWHour +=
        `
          <div class="rightCell ${colorClass}"
          >
            ${priceKWHour}
          </div>
        `;

      htmlColumnText +=
        `
          <div 
            class="leftCell ${colorClass} one-line"
          >
            ${bankaccounttransaction.text}
          </div>
        `;

      // Accomulate
      // payment
      sumColumnPayment += Number(bankaccounttransaction.payment);

      // KWHour
      sumColumnNumberKWHour += Number(bankaccounttransaction.numberKWHour);
    });

    // Show all sums
    htmlColumnDate +=
      `
       <div class="sumCellRight">
     `;
    htmlColumnDate += 'Sum';
    htmlColumnDate +=
      `
       </div>
     `;

    // Payment
    htmlColumnPayment +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnPayment += formatOreToKroner(String(sumColumnPayment));
    htmlColumnPayment +=
      `
        </div>
      `;

    // Kilowatt/hour
    htmlColumnNumberKWHour +=
      `
        <div class="sumCellRight">
      `;
    htmlColumnNumberKWHour += formatOreToKroner(String(sumColumnNumberKWHour));
    htmlColumnNumberKWHour +=
      `
        </div>
      `;

    // Price per KWHour
    payment = Number(sumColumnPayment);
    numberKWHour = Number(sumColumnNumberKWHour);

    let sumPriceKWHour = '-';
    if (payment !== 0 && numberKWHour !== 0) {

      sumPriceKWHour = ((-1 * payment) / numberKWHour);
      sumPriceKWHour = sumPriceKWHour.toFixed(2);
    }

    htmlColumnPriceKWHour +=
      `
        <div class="sumCellRight">
          ${sumPriceKWHour}
        </div>
      `;

    // Text
    htmlColumnText +=
      `
        <div class="sumCellLeft">
          <br>
        </div>
      `;

    // Show all columns
    document.querySelector('.div-remoteheating-columnDate').innerHTML = htmlColumnDate;
    document.querySelector('.div-remoteheating-columnPayment').innerHTML = htmlColumnPayment;
    document.querySelector('.div-remoteheating-columnNumberKWHour').innerHTML = htmlColumnNumberKWHour;
    document.querySelector('.div-remoteheating-columnPriceKWHour').innerHTML = htmlColumnPriceKWHour;
    document.querySelector('.div-remoteheating-columnText').innerHTML = htmlColumnText;
  }
}

// Check for valid filter values
function validateValues() {

  let validValues = true;

  const fromDate =
    document.querySelector('.input-remoteheating-fromDate').value;
  const toDate =
    document.querySelector('.input-remoteheating-toDate').value;

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
