// Account movement search

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objSuppliers = new Suppliers('suppliers');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');
const objBankAccountMovements = new BankAccountMovements('bankaccountmovements');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objBankAccountMovements.menu();
objBankAccountMovements.markSelectedMenu('Banktransaksjoner');

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

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

    amount = 0;
    condominiumId = objUserPassword.condominiumId;
    const condoId = 999999999;
    const accountId = 999999999;
    let fromDate = "01.01." + String(today.getFullYear());
    fromDate = Number(convertDateToISOFormat(fromDate));
    let toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));

    await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

    let bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
    showLeadingTextFilter(bankAccountMovementId);

    // Show leading text maintenance
    bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');

    showLeadingText(bankAccountMovementId);

    // Show bank account movements 
    showBankAccountMovements();

    // Show bank account movements Id
    objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

    // Get selected Bank Account Movement Id
    showValues(bankAccountMovementId);

    // Make events
    createEvents();
  }
}

// Make bank account movement events
function createEvents() {

  // Search for condos
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovements-filterCondoId')) {

      // Search bank account movement and reload bank account movement
      searchCondoBankAccountMovementSync();

      // Search for bank account movement
      async function searchCondoBankAccountMovementSync() {

        let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        showLeadingText(bankAccountMovementId);

        // Show bank account movements 
        showBankAccountMovements();

        // Show bank account movements Id
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountMovementId);
      }
    }
  });

  // Search for account Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovements-filterAccountId')) {

      // Search bank account movement and reload bank account movement
      searchAccountBankAccountMovementSync();

      // Search for bank account movement
      async function searchAccountBankAccountMovementSync() {

        let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        showLeadingText(bankAccountMovementId);

        // Show bank account movements 
        showBankAccountMovements();

        // Show bank account movements Id
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountMovementId);
      }
    }
  });

  // Search for from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccountmovements-filterFromDate')) {

      // Search bank account movement and reload bank account movement
      searchFromDateBankAccountMovementSync();

      // Search for bank account movement
      async function searchFromDateBankAccountMovementSync() {

        let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        showLeadingText(bankAccountMovementId);

        // Show bank account movements 
        showBankAccountMovements();

        // Show bank account movements Id
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountMovementId);
      }
    }
  });

  // Search for to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccountmovements-filterToDate')) {

      // Search bank account movement and reload bank account movement
      searchToDateBankAccountMovementSync();

      // Search for bank account movement
      async function searchToDateBankAccountMovementSync() {

        let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        showLeadingText(bankAccountMovementId);

        // Show bank account movements 
        showBankAccountMovements();

        // Show bank account movements Id
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountMovementId);
      }
    }
  });

  // Search for amount
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccountmovements-filterAmount')) {

      // Search bank account movement and reload bank account movement
      searchAmountBankAccountMovementSync();

      // Search for bank account movement
      async function searchAmountBankAccountMovementSync() {

        document.querySelector('.input-bankaccountmovements-filterAmount').value = formatAmountToEuroFormat(document.querySelector('.input-bankaccountmovements-filterAmount').value);

        let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        showLeadingText(bankAccountMovementId);

        // Show bank account movements 
        showBankAccountMovements();

        // Show bank account movements Id
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountMovementId);
      }
    }
  });

  // Select bank account movement Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccountmovements-bankAccountMovementId')) {

      // Show bank account movements
      const bankAccountMovementId = Number(document.querySelector('.select-bankaccountmovements-bankAccountMovementId').value);
      showValues(bankAccountMovementId);
    }
  });

  // update bank account movement
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovements-update')) {

      // Update bank account movement and reload bank account movement
      updateBankAccountMovementSync();

      // Update bank account movement and reload bank account movements
      async function updateBankAccountMovementSync() {

        let bankAccountMovementId = document.querySelector('.select-bankaccountmovements-bankAccountMovementId').value;
        await updateBankAccountMovement(bankAccountMovementId);

        let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        showLeadingText(bankAccountMovementId);

        // Show bank account movements 
        showBankAccountMovements();

        // Show bank account movements Id
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountMovementId);
      }
    }
  });

  // Reset bank account movement values
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovements-insert')) {

      resetValues();
    }
  });

  // Delete bank account movement
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovements-delete')) {

      // Delete bank account movement and reload bank account movement
      deleteBankAccountMovementSync();

      // Delete bank account movement
      async function deleteBankAccountMovementSync() {

        await deleteBankAccountMovement();

        // Load bank account movement
        let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));

        await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        showLeadingText(bankAccountMovementId);

        // Show bank account movements 
        showBankAccountMovements();

        // Show bank account movements Id
        bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
        objBankAccountMovements.showAllSelectedAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountMovementId);
      };
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccountmovements-cancel')) {

      // Sends a request to the server to get all bank account movements
      const SQLquery =
        `
          SELECT * FROM bankaccountmovement
          WHERE condominiumId = ${objUserPassword.condominiumId}
            AND deleted <> 'Y'
          ORDER BY date DESC;
        `;
      updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
      objBankAccountMovements.objBankAccountMovements.bankAccountMovementsArray.Created =
        false;
    }
  });
}

// Show filter
function showLeadingTextFilter() {

  // Show all condos
  const condoId = (isClassDefined('select-bankaccountmovements-filterCondoId')) ? Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value) : 0;
  objCondo.showAllCondos('bankaccountmovements-filterCondoId', condoId, 'Alle');

  // Show all accounts
  const accountId = (isClassDefined('select-bankaccountmovements-filterAccountId')) ? Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value) : 0;
  objAccounts.showAllAccounts('bankaccountmovements-filterAccountId', accountId, 'Alle');

  // Show from date
  if (!isClassDefined('input-bankaccountmovements-filterFromDate')) {
    objBankAccountMovements.showInput('bankaccountmovements-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');
  }

  // Show to date
  if (!isClassDefined('input-bankaccountmovements-filterToDate')) {
    objBankAccountMovements.showInput('bankaccountmovements-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  }

  // Show amount
  if (!isClassDefined('input-bankaccountmovements-filterAmount')) {
    objBankAccountMovements.showInput('bankaccountmovements-filterAmount', 'Beløp', 10, 'Alle');
  }

  // Check for filter from date
  let date =
    document.querySelector('.input-bankaccountmovements-filterFromDate').value;
  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year =
      String(today.getFullYear());
    document.querySelector('.input-bankaccountmovements-filterFromDate').value =
      "01.01." + year;
  }

  // Check for filter to date
  date =
    document.querySelector('.input-bankaccountmovements-filterToDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    document.querySelector('.input-bankaccountmovements-filterToDate').value =
      getCurrentDate();
  }

  // Check for filter amount
  amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
  if (!objBankAccountMovements.validateAmount(amount)) {

    // Amount is not ok
    document.querySelector('.input-bankaccountmovements-filterAmount').value =
      '';
  }
}

// Show values for bank Account Movement
function showLeadingText(bankAccountMovementId) {

  // Show bank Account Movement Id
  //bankAccountMovementId = objBankAccountMovements.getSelectedBankAccountMovementId('select-bankaccountmovements-bankAccountMovementId');
  objBankAccountMovements.showAllBankAccountMovements('bankaccountmovements-bankAccountMovementId', bankAccountMovementId, '', 'Ingen er valgt');

  // Show all condos
  let condoId = objCondo.condoArray.at(-1).condoId;

  objCondo.showAllCondos('bankaccountmovements-condoId', condoId, '', 'Ingen er valgt');

  // Show all accounts
  let accountId = objAccounts.accountsArray.at(-1).accountId;;

  objAccounts.showAllAccounts('bankaccountmovements-accountId', accountId, '', 'Ingen er valgt');

  // Show date
  objBankAccountMovements.showInput('bankaccountmovements-date', '* Dato', 10, 'dd.mm.åååå');

  // Show income
  objBankAccountMovements.showInput('bankaccountmovements-income', 'Inntekt', 10, '');

  // Show kilo watt per hour
  objBankAccountMovements.showInput('bankaccountmovements-numberKWHour', 'Kilowatt/time', 10, '');

  // Show text
  objBankAccountMovements.showInput('bankaccountmovements-text', 'Tekst', 50, '');

  // Show payment
  objBankAccountMovements.showInput('bankaccountmovements-payment', 'Utgift', 10, '');

  // show update button 
  objBankAccountMovements.showButton('bankaccountmovements-update', 'Oppdater');

  // show insert button
  objBankAccountMovements.showButton('bankaccountmovements-insert', 'Ny');

  // show delete button
  objBankAccountMovements.showButton('bankaccountmovements-delete', 'Slett');

  // show cancel button
  objBankAccountMovements.showButton('bankaccountmovements-cancel', 'Avbryt');
}

// Show values for bank account movementId
function showValues(bankAccountMovementId) {

  // Check for valid bank Account Movement Id
  if (bankAccountMovementId >= 0) {

    // Find object number in bank account movementId array
    const objBankAccountMovementRowNumber = objBankAccountMovements.bankAccountMovementsArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
    if (objBankAccountMovementRowNumber !== -1) {

      // Show bank account movement id
      document.querySelector('.select-bankaccountmovements-bankAccountMovementId').value = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].bankAccountMovementId;

      // Show condo id
      document.querySelector('.select-bankaccountmovements-condoId').value = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].condoId;

      // Show account
      document.querySelector('.select-bankaccountmovements-accountId').value = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].accountId;

      // Show date
      const date = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].date;
      document.querySelector('.input-bankaccountmovements-date').value =
        formatToNorDate(date);

      // Show income
      const income = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].income;
      document.querySelector('.input-bankaccountmovements-income').value = formatOreToKroner(income);

      // Show payment
      const payment = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].payment;
      document.querySelector('.input-bankaccountmovements-payment').value = formatOreToKroner(payment);

      // Show kilo watt per hour
      const numberKWHour = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].numberKWHour;
      document.querySelector('.input-bankaccountmovements-numberKWHour').value = formatOreToKroner(numberKWHour);

      // Show text
      const text = objBankAccountMovements.bankAccountMovementsArray[objBankAccountMovementRowNumber].text;
      document.querySelector('.input-bankaccountmovements-text').value = text;

      objBankAccountMovements.showButton('bankaccountmovements-cancel', 'Avbryt');
    }
  }
}

// Show selected bank account movements
function showBankAccountMovements() {

  // Validate search filter
  if (validateFilter()) {

    // Header
    let htmlColumnLine =
      '<div class="columnHeaderCenter">Linje</div><br>';
    let htmlColumnCondoName =
      '<div class="columnHeaderLeft">Leilighet</div><br>';
    let htmlColumnAccountName =
      '<div class="columnHeaderLeft">Konto</div><br>';
    let htmlColumnDate =
      '<div class="columnHeaderRight">Dato</div><br>';
    let htmlColumnIncome =
      '<div class="columnHeaderRight">Inntekt</div><br>';
    let htmlColumnPayment =
      '<div class="columnHeaderRight">Utgift</div><br>';
    let htmlColumnKiloWattHour =
      '<div class="columnHeaderRight">Kilovatttimer</div><br>';
    let htmlColumnText =
      '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumIncome = 0;
    let sumPayment = 0;
    let sumKiloWattHour = 0;
    let lineNumber = 0;

    let fromDate = document.querySelector('.input-bankaccountmovements-filterFromDate').value;
    fromDate = convertDateToISOFormat(fromDate);
    let toDate = document.querySelector('.input-bankaccountmovements-filterToDate').value;
    toDate = convertDateToISOFormat(toDate);

    let amount = document.querySelector('.input-bankaccountmovements-filterAmount').value;
    amount = Number(formatKronerToOre(amount));

    const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
    const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);

    objBankAccountMovements.bankAccountMovementsArray.forEach((bankAccountMovement) => {

      lineNumber++;

      // check if the number is odd
      const colorClass = (lineNumber % 2 !== 0) ? "green" : "";

      // bank Account Movement Id
      htmlColumnLine +=
        `
          <div 
            class="centerCell ${colorClass}"
          >
            ${lineNumber}
          </div >
        `;

      // condo name
      let condoName = "-";
      if (bankAccountMovement.condoId) {
        const condoId =
          Number(bankAccountMovement.condoId);
        condoName =
          objCondo.getCondoName(condoId);
      }
      htmlColumnCondoName +=
        `
          <div 
            class="leftCell ${colorClass} one-line"
          >
            ${condoName}
          </div >
        `;

      // account name
      const accountName =
        objAccounts.getAccountName(bankAccountMovement.accountId);
      const colorClassAccountName =
        (accountName === '-') ? 'red' : colorClass;
      htmlColumnAccountName +=
        `
          <div
            class="leftCell ${colorClassAccountName} one-line"
          >
            ${accountName}    
          </div >
        `;

      // date
      const date =
        formatToNorDate(bankAccountMovement.date);
      htmlColumnDate +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${date}
          </div >
        `;

      // income
      const income =
        formatOreToKroner(bankAccountMovement.income);
      htmlColumnIncome +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${income}
          </div>
        `;

      // payment
      const payment =
        formatOreToKroner(bankAccountMovement.payment);
      htmlColumnPayment +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${payment}
          </div>
        `;

      // KiloWatt/Hour
      const kiloWattHour =
        formatOreToKroner(bankAccountMovement.numberKWHour);
      htmlColumnKiloWattHour +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${kiloWattHour}
          </div>
        `;

      // text
      htmlColumnText +=
        `
          <div
            class="leftCell ${colorClass} one-line"
          >
            ${bankAccountMovement.text}
          </div>
        `;

      // accumulate
      sumIncome +=
        Number(bankAccountMovement.income);
      sumPayment +=
        Number(bankAccountMovement.payment);
      sumKiloWattHour +=
        Number(bankAccountMovement.numberKWHour);
    });

    // Sum line

    // income
    income =
      formatOreToKroner(sumIncome);
    htmlColumnIncome +=
      `
        <div
          class="sumCellRight"
        >
          ${income}
        </div >
      `;

    // payment
    payment =
      formatOreToKroner(sumPayment);
    htmlColumnPayment +=
      `
        <div
          class="sumCellRight"
        >
          ${payment}
        </div >
      `;

    // KiloWatt/Hour
    kiloWattHour =
      formatOreToKroner(sumKiloWattHour);
    htmlColumnKiloWattHour +=
      `
        <div
          class="sumCellRight"
        >
          ${kiloWattHour}
        </div >
      `;

    // Show line number
    document.querySelector('.div-bankaccountmovements-columnLine').innerHTML =
      htmlColumnLine;

    // Show condo name
    document.querySelector('.div-bankaccountmovements-columnCondoName').innerHTML =
      htmlColumnCondoName;

    // Show bank account name
    document.querySelector('.div-bankaccountmovements-columnAccountName').innerHTML =
      htmlColumnAccountName;

    // Show date
    document.querySelector('.div-bankaccountmovements-columnDate').innerHTML =
      htmlColumnDate;

    // Show income
    document.querySelector('.div-bankaccountmovements-columnIncome').innerHTML =
      htmlColumnIncome;

    // Show payment
    document.querySelector('.div-bankaccountmovements-columnPayment').innerHTML =
      htmlColumnPayment;

    // Show KiloWatt/hour
    document.querySelector('.div-bankaccountmovements-columnNumberKWHour').innerHTML =
      htmlColumnKiloWattHour;

    // Show text
    document.querySelector('.div-bankaccountmovements-columnText').innerHTML =
      htmlColumnText;
  }
}

// Check for valid filter
function validateFilter() {

  // Check account movement
  const accountId =
    document.querySelector('.select-bankaccountmovements-filterAccountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'bankaccountmovements-filterAccountId', 'Konto');

  const condoId = document.querySelector('.select-bankaccountmovements-filterCondoId').value;
  const validCondoId = validateNumber(accountId, 1, 999999999, 'bankaccountmovements-filterCondoId', 'Leilighet');

  const fromDate = document.querySelector('.input-bankaccountmovements-filterFromDate').value;
  const validFromDate = validateNorDate(fromDate, 'bankaccountmovements-filterFromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-bankaccountmovements-filterToDate').value;
  const validToDate = validateNorDate(toDate, 'bankaccountmovements-filterToDate', 'Til dato');

  const amount = (document.querySelector('.input-bankaccountmovements-filterAmount').value) ? document.querySelector('.input-bankaccountmovements-filterAmount').value : '0';
  const validAmount = objBankAccountMovements.validateAmount(amount, 'bankaccountmovements-filterAmount', 'Beløp');

  return (validAccountId && validCondoId && validFromDate && validToDate && validAmount) ? true : false;
}

async function updateBankAccountMovement(bankAccountMovementId) {

  // Check values
  if (validateValues()) {

    const condominiumId = objUserPassword.condominiumId;

    const user = objUserPassword.email;

    const condoId = Number(document.querySelector('.select-bankaccountmovements-condoId').value);

    const accountId = Number(document.querySelector('.select-bankaccountmovements-accountId').value);

    let date = document.querySelector('.input-bankaccountmovements-date').value;
    date = convertDateToISOFormat(date);

    let income = document.querySelector('.input-bankaccountmovements-income').value;
    income = Number(formatAmountToOre(income));

    let payment = document.querySelector('.input-bankaccountmovements-payment').value;
    payment = formatAmountToOre(payment);

    let numberKWHour = document.querySelector('.input-bankaccountmovements-numberKWHour').value;
    numberKWHour = Number(formatAmountToOre(numberKWHour));

    const text = document.querySelector('.input-bankaccountmovements-text').value;

    // current date
    const lastUpdate = today.toISOString();

    // Check if bank account movement exist
    const objBankAccountMovementRowNumber = objBankAccountMovements.bankAccountMovementsArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
    if (objBankAccountMovementRowNumber !== -1) {

      // update bank account movement
      objBankAccountMovements.updateBankAccountMovementsTable(bankAccountMovementId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text);

    } else {

      // insert bank account movement
      objBankAccountMovements.insertBankAccountMovementsTable(bankAccountMovementId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text);
    }
  }

  document.querySelector('.select-bankaccountmovements-bankAccountMovementId').disabled = false;
  document.querySelector('.button-bankaccountmovements-delete').disabled = false;
  document.querySelector('.button-bankaccountmovements-insert').disabled = false;
}

// Check for valid bank account values
function validateValues() {

  // Check account Id
  let accountId = document.querySelector('.select-bankaccountmovements-accountId').value;
  accountId = (accountId) ? Number(accountId) : 0;
  const validAccountId = validateNumber(accountId, 1, 999999999, 'bankaccountmovements-accountId', 'Konto');

  const date = document.querySelector('.input-bankaccountmovements-date').value;
  const validDate = validateNorDate(date, 'bankaccountmovements-date', 'Dato');

  return (validAccountId && validDate) ? true : false;
}

// Delete bank account movement
async function deleteBankAccountMovement() {

  // Check for bank account movement Id
  const bankAccountMovementId = Number(document.querySelector('.select-bankaccountmovements-bankAccountMovementId').value);

  // Check if bank account movement id exist
  const objBankAccountMovementRowNumber = objBankAccountMovements.bankAccountMovementsArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
  if (objBankAccountMovementRowNumber !== -1) {

    // delete bank account movement row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objBankAccountMovements.deleteBankAccountMovementsTable(bankAccountMovementId, user, lastUpdate);
  }
}
/*
async function deleteBankAccountMovement() {

  let SQLquery = "";

  // Check for valid Bank Account Movement Id
  const bankAccountMovementId =
    Number(document.querySelector('.select-bankaccountmovements-bankAccountMovementId').value);
  if (bankAccountMovementId >= 0) {

    // Check if Bank Account Movement Id exist
    const objBankAccountMovementRowNumber = objBankAccountMovements.bankAccountMovementsArray.findIndex(bankAccountMovement => bankAccountMovement.bankAccountMovementId === bankAccountMovementId);
    if (objBankAccountMovementRowNumber !== -1) {

      // current date
      const lastUpdate =
        today.toISOString();

      SQLquery =
        `
        UPDATE bankaccountmovement
          SET 
            deleted = 'Y',
            user = '${objUserPassword.email}',
            lastUpdate = '${lastUpdate}'
          WHERE bankAccountMovementId = ${bankAccountMovementId};
        `;
      updateMySql(SQLquery, 'bankaccountmovement', 'UPDATE');
    }
  }
}
*/

function resetValues() {

  document.querySelector('.select-bankaccountmovements-bankAccountMovementId').value = '';

  document.querySelector('.select-bankaccountmovements-condoId').value = '';

  document.querySelector('.select-bankaccountmovements-accountId').value = '';

  document.querySelector('.input-bankaccountmovements-date').value = '';

  document.querySelector('.input-bankaccountmovements-payment').value = '';

  document.querySelector('.input-bankaccountmovements-income').value = '';

  document.querySelector('.input-bankaccountmovements-numberKWHour').value = '';

  document.querySelector('.input-bankaccountmovements-text').value = '';

  document.querySelector('.select-bankaccountmovements-bankAccountMovementId').disabled = true;
  document.querySelector('.button-bankaccountmovements-insert').disabled = true;
  document.querySelector('.button-bankaccountmovements-delete').disabled = true;
}

// Get selected bank account movements
async function getSelectedBankAccountMovements() {

  const condoId = Number(document.querySelector('.select-bankaccountmovements-filterCondoId').value);
  const accountId = Number(document.querySelector('.select-bankaccountmovements-filterAccountId').value);
  const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterFromDate').value));
  const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccountmovements-filterToDate').value));
  const amount = Number(formatAmountToOre(document.querySelector('.input-bankaccountmovements-filterAmount').value));

  await objBankAccountMovements.loadBankAccountMovementsTable(condominiumId, condoId, accountId, amount, fromDate, toDate);
  /*
  let SQLquery =
    `
      SELECT * FROM bankaccountmovement
      WHERE condominiumId = ${objUserPassword.condominiumId}
        AND deleted <> 'Y'
      AND date BETWEEN ${fromDate} AND ${toDate}
    `;

  if (condoId !== 999999999) {
    SQLquery +=
      `
        AND condoId = ${condoId}
      `;
  }

  if (accountId !== 999999999) {
    SQLquery +=
      `
        AND accountId = ${accountId}
      `;
  }

  if (amount !== 0) {
    SQLquery +=
      `
        AND income = ${amount} OR payment = ${amount}
      `;
  }

  SQLquery +=
    `
      ORDER BY date DESC, income DESC;
    `;

  updateMySql(SQLquery, 'bankaccountmovement', 'SELECT');
  objBankAccountMovements.objBankAccountMovements.bankAccountMovementsArray.Created =
    false;
  */
}
