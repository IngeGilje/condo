// Search for bank account movements

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objDues = new Dues('dues');
const objCondo = new Condo('condo');
const objBankAccountMovements = new BankAccountMovements('bankaccountmovements');
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

    const year = String(today.getFullYear());
    let fromDate = "01.01." + year;
    fromDate = convertDateToISOFormat(fromDate);
    let toDate = getCurrentDate();
    toDate = convertDateToISOFormat(toDate);

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objDues.loadDuesTable(objUserPassword.condominiumId, 999999999, 999999999, fromDate, toDate);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objBankAccountMovements.loadBankAccountMovementsTable(objUserPassword.condominiumId, 999999999, 999999999, 0, fromDate, toDate);

    // Show filter
    showLeadingText();

    // Show all values for 
    showValues();

    // Make events
    createEvents();
  }
}

// Make overview events
function createEvents() {

  // Select condo
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-overview-condoId')) {

      // Search for overview and reload
      searchAccountOverviewSync();

      async function searchAccountOverviewSync() {

        const condominiumId = objUserPassword.condominiumId;

        // Include all accounts
        const accountId = 0;
        const condoId = Number(document.querySelector('.select-overview-condoId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-overview-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-overview-toDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, 999999999, 0, fromDate, toDate);
        await objDues.loadDuesTable(condominiumId, 999999999, condoId, fromDate, toDate);

        // Get selected Bank Account Movement Id
        showValues();
      }
    }
  });

  // From date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-overview-fromDate')) {

      // Search for overview and reload
      searchFromDateSync();

      async function searchFromDateSync() {

        const condominiumId = objUserPassword.condominiumId;

        // Include all accounts
        const accountId = 0;

        const condoId = Number(document.querySelector('.select-overview-condoId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-overview-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-overview-toDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, 999999999, accountId, 999999999, fromDate, toDate);
        await objDues.loadDuesTable(objUserPassword.condominiumId, 999999999, condoId, fromDate, toDate);

        // Show filter
        showLeadingText();

        // Show selected Bank Account Movements
        showValues();
      }
    };
  });

  // To date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-overview-toDate')) {

      // Search for overview and reload
      searchToDateSync();

      async function searchToDateSync() {

        const condominiumId = objUserPassword.condominiumId;

        // Include all accounts
        const accountId = 0;

        const condoId = Number(document.querySelector('.select-overview-condoId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-overview-fromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-overview-toDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, 999999999, accountId, 999999999, fromDate, toDate);
        await objDues.loadDuesTable(objUserPassword.condominiumId, 999999999, condoId, fromDate, toDate);

        // Show filter
        showLeadingText();

        // Show selected Bank Account Movements
        showValues();
      }
    };
  });
  return true;
}

// Show Filter
function showLeadingText() {

  // Show all condos
  const condoId = (isClassDefined('select-overview-condoId')) ? Number(document.querySelector('.select-overview-condoId').value) : 0;
  objCondo.showAllCondos('overview-condoId', condoId, 'Alle');

  // from date
  if (!isClassDefined('input-overview-fromDate')) {

    objOverview.showInput('overview-fromDate', 'Fra dato', 10, 'mm.dd.åååå');
    date = document.querySelector('.input-overview-fromDate').value;
    if (!validateEuroDateFormat(date)) {

      // From date is not ok
      const year =
        String(today.getFullYear());
      document.querySelector('.input-overview-fromDate').value =
        "01.01." + year;
    }
  }

  // To date
  if (!isClassDefined('input-overview-toDate')) {
    objOverview.showInput('overview-toDate', 'Til dato', 10, 'mm.dd.åååå');
    date = document.querySelector('.input-overview-toDate').value;
    if (!validateEuroDateFormat(date)) {

      // To date is not ok
      document.querySelector('.input-overview-toDate').value = getCurrentDate();
    }
  }

  /*
  // Show amount
  if (!isClassDefined('input-overiew-amount')) {
    objOverview.showInput('overview-amount', 'Beløp', 10, 'Alle');
  }
  */
}

// Show values for due and bank account movements for selected condo
function showValues() {

  // check for valid filter
  if (validateValues()) {

    // Header due
    let htmlColumnDueCondoName = '<div class="columnHeaderRight">Leilighet</div><br>';
    let htmlColumnDueDate = '<div class="columnHeaderRight">Forfallsdato</div><br>';
    let htmlColumnDueAmount = '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlColumnDueText = '<div class="columnHeaderLeft">Tekst</div><br>';

    // Filter
    let fromDate = convertDateToISOFormat(document.querySelector('.input-overview-fromDate').value);
    let toDate = convertDateToISOFormat(document.querySelector('.input-overview-toDate').value);
    toDate = (toDate === 0) ? 99999999 : toDate;

    const condoId = Number(document.querySelector('.select-overview-condoId').value);

    let lineNumber = 0;

    let sumColumnDue = 0;
    objDues.duesArray.forEach((due) => {

      lineNumber++;

      // check if the number is odd
      const colorClass =
        (lineNumber % 2 !== 0) ? "green" : "";

      // condo name
      const condoName =
        objCondo.getCondoName(due.condoId);
      htmlColumnDueCondoName +=
        `
          <div class="rightCell ${colorClass}">
            ${condoName}
          </div>
        `;

      // date
      const date =
        formatToNorDate(due.date);
      htmlColumnDueDate +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${date}
          </div>
        `;

      // amount
      htmlColumnDueAmount +=
        `
          <div class="rightCell ${colorClass}">
        `;
      htmlColumnDueAmount +=
        formatOreToKroner(due.amount);
      htmlColumnDueAmount +=
        `
          </div>
        `;

      htmlColumnDueText +=
        `
          <div 
            class="leftCell one-line  ${colorClass}"
          >
            ${due.text}
          </div>
        `;

      // Accomulate
      // due
      sumColumnDue +=
        due.amount;
    });

    // Show bank account movement

    // Header
    let htmlBankAccountMovementCondoName =
      '<div class="columnHeaderRight">Leiliget</div><br>';
    let htmlBankAccountMovementDate =
      '<div class="columnHeaderRight">Betalingsdato</div><br>';
    let htmlBankAccountMovementAmount =
      '<div class="columnHeaderRight">Beløp</div><br>';
    let htmlBankAccountMovementText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumColumnBankAccountMovement = 0;

    lineNumber = 0;

    objBankAccountMovements.bankAccountMovementsArray.forEach((bankAccountMovement) => {

      lineNumber++;

      // check if the number is odd
      const colorClass =
        (lineNumber % 2 !== 0) ? "green" : "";

      // condo name
      const condoName = (bankAccountMovement.condoId) ? objCondo.getCondoName(bankAccountMovement.condoId) : "-";
      htmlBankAccountMovementCondoName +=
        `
          <div class="rightCell ${colorClass}">
            ${condoName}
          </div>
        `;

      // date
      const date = formatToNorDate(bankAccountMovement.date);
      htmlBankAccountMovementDate +=
        `
          <div class="rightCell ${colorClass}"
          >
            ${date}
          </div>
        `;

      // income
      const income =
        formatOreToKroner(bankAccountMovement.income);
      htmlBankAccountMovementAmount +=
        `
          <div 
            class="rightCell ${colorClass}"
          >
            ${income}
          </div>
        `;

      // Text has to fit into the column
      htmlBankAccountMovementText +=
        `
          <div
            class="leftCell one-line ${colorClass}"
          >
            ${bankAccountMovement.text}
          </div>
        `;

      // Accomulate
      sumColumnBankAccountMovement +=
        bankAccountMovement.income;
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
    htmlColumnDueAmount +=
      formatOreToKroner(String(sumColumnDue));
    htmlColumnDueAmount +=
      `
        </div>
      `;

    // sum bank account movement
    htmlBankAccountMovementAmount +=
      `
        <div class="sumCellRight">
      `;
    htmlBankAccountMovementAmount +=
      formatOreToKroner(String(sumColumnBankAccountMovement));
    htmlBankAccountMovementAmount +=
      `
        </div>
      `;

    // sum guilty
    htmlBankAccountMovementText +=
      `
        <div class="sumCellLeft"
        >
      `;
    const guilty =
      sumColumnDue - sumColumnBankAccountMovement;
    htmlBankAccountMovementText +=
      `Skyldig ` + formatOreToKroner(String(guilty));
    htmlBankAccountMovementText +=
      `
        </div>
      `;

    // Show due rows
    document.querySelector('.div-overview-columnDueCondoName').innerHTML =
      htmlColumnDueCondoName;
    document.querySelector('.div-overview-columnDueDate').innerHTML =
      htmlColumnDueDate;
    document.querySelector('.div-overview-columnDueAmount').innerHTML =
      htmlColumnDueAmount;
    document.querySelector('.div-overview-columnDueText').innerHTML =
      htmlColumnDueText;

    // Show bankaccountmovement. rows
    document.querySelector('.div-overview-columnBankAccountMovementCondoName').innerHTML =
      htmlBankAccountMovementCondoName;
    document.querySelector('.div-overview-columnBankAccountMovementDate').innerHTML =
      htmlBankAccountMovementDate;
    document.querySelector('.div-overview-columnBankAccountMovementAmount').innerHTML =
      htmlBankAccountMovementAmount;
    document.querySelector('.div-overview-columnBankAccountMovementText').innerHTML =
      htmlBankAccountMovementText;
  }
}

// Check for valid filter values
function validateValues() {

  let fromDate = document.querySelector('.input-overview-fromDate').value;
  const validFromDate = validateNorDate(fromDate, 'overview-fromDate', 'Fra dato');

  let toDate = document.querySelector('.input-overview-toDate').value;
  const validToDate = validateNorDate(toDate, 'overview-toDate', 'Fra dato');

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