// Account movement search

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objSuppliers = new Suppliers('suppliers');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');
const objBankAccountTransactions = new BankAccountTransactions('bankaccounttransactions');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objBankAccountTransactions.menu();
objBankAccountTransactions.markSelectedMenu('Banktransaksjoner');

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
    const condominiumId = objUserPassword.condominiumId;
    const deleted = 'N';
    const condoId = 999999999;
    const accountId = 999999999;
    let fromDate = "01.01." + String(today.getFullYear());
    fromDate = Number(convertDateToISOFormat(fromDate));
    let toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));

    await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

    let bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
    showLeadingTextFilter(bankAccountTransactionId);

    // Show leading text maintenance
    bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');

    showLeadingText(bankAccountTransactionId);

    // Show bank account transactions 
    showBankAccountTransactions();

    // Show bank account transactions Id
    objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

    // Get selected Bank Account Movement Id
    showValues(bankAccountTransactionId);

    // Make events
    createEvents();
  }
}

// Make Bank account transactions events
function createEvents() {

  // Search for condos
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccounttransactions-filterCondoId')) {

      // Search Bank account transactions and reload Bank account transactions
      searchCondoBankAccountTransactionSync();

      // Search for Bank account transactions
      async function searchCondoBankAccountTransactionSync() {

        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        const condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      }
    }
  });

  // Search for account Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccounttransactions-filterAccountId')) {

      // Search Bank account transactions and reload Bank account transactions
      searchAccountBankAccountTransactionSync();

      // Search for Bank account transactions
      async function searchAccountBankAccountTransactionSync() {

        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      }
    }
  });

  // Search for from date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccounttransactions-filterFromDate')) {

      // Search Bank account transactions and reload Bank account transactions
      searchFromDateBankAccountTransactionSync();

      // Search for Bank account transactions
      async function searchFromDateBankAccountTransactionSync() {

        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        const condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      }
    }
  });

  // Search for to date
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccounttransactions-filterToDate')) {

      // Search Bank account transactions and reload Bank account transactions
      searchToDateBankAccountTransactionSync();

      // Search for Bank account transactions
      async function searchToDateBankAccountTransactionSync() {

        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        const condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      }
    }
  });

  // Search for amount
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('input-bankaccounttransactions-filterAmount')) {

      // Search Bank account transactions and reload Bank account transactions
      searchAmountBankAccountTransactionSync();

      // Search for Bank account transactions
      async function searchAmountBankAccountTransactionSync() {

        document.querySelector('.input-bankaccounttransactions-filterAmount').value = formatAmountToEuroFormat(document.querySelector('.input-bankaccounttransactions-filterAmount').value);

        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        const condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        let bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      }
    }
  });

  // Select Bank account transactions Id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-bankaccounttransactions-bankAccountTransactionId')) {

      // Show bank account transactions
      const bankAccountTransactionId = Number(document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value);
      showValues(bankAccountTransactionId);
    }
  });

  // update Bank account transactions
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounttransactions-update')) {

      // Update Bank account transactions and reload Bank account transactions
      updateBankAccountTransactionSync();

      // Update Bank account transactions and reload bank account transactions
      async function updateBankAccountTransactionSync() {

        let bankAccountTransactionId = document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value;
        await updateBankAccountTransaction(bankAccountTransactionId);

        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        const condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      }
    }
  });

  // Reset Bank account transactions values
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounttransactions-insert')) {

      resetValues();
    }
  });

  // Delete Bank account transactions
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounttransactions-delete')) {

      // Delete Bank account transactions and reload Bank account transactions
      deleteBankAccountTransactionSync();

      // Delete Bank account transactions
      async function deleteBankAccountTransactionSync() {

        await deleteBankAccountTransaction();

        // Load Bank account transactions
        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        const condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        const bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      };
    }
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-bankaccounttransactions-cancel')) {

      // Cancel and reload Bank account transactions
      cancelBankAccountTransactionSync();

      async function cancelBankAccountTransactionSync() {

        let bankAccountTransactionId = document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value;

        let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
        amount = Number(formatKronerToOre(amount));
        const condominiumId = objUserPassword.condominiumId;
        const deleted = 'N';
        const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
        const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);
        const fromDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterFromDate').value));
        const toDate = Number(convertDateToISOFormat(document.querySelector('.input-bankaccounttransactions-filterToDate').value));

        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        // Show leading text maintenance
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        showLeadingText(bankAccountTransactionId);

        // Show bank account transactions 
        showBankAccountTransactions();

        // Show bank account transactions Id
        bankAccountTransactionId = objBankAccountTransactions.getSelectedBankAccountTransactionId('select-bankaccounttransactions-bankAccountTransactionId');
        objBankAccountTransactions.showSelectedAccountTransactionsounts('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId);

        // Get selected Bank Account Movement Id
        showValues(bankAccountTransactionId);
      }
    }
  });
}

// Show filter
function showLeadingTextFilter() {

  // Show all condos
  const condoId = (isClassDefined('select-bankaccounttransactions-filterCondoId')) ? Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value) : 0;
  objCondo.showSelectedCondos('bankaccounttransactions-filterCondoId', condoId, 'Alle');

  // Show all accounts
  const accountId = (isClassDefined('select-bankaccounttransactions-filterAccountId')) ? Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value) : 0;
  objAccounts.showSelectedAccounts('bankaccounttransactions-filterAccountId', accountId, 'Alle');

  // Show from date
  if (!isClassDefined('input-bankaccounttransactions-filterFromDate')) {
    objBankAccountTransactions.showInput('bankaccounttransactions-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');
  }

  // Show to date
  if (!isClassDefined('input-bankaccounttransactions-filterToDate')) {
    objBankAccountTransactions.showInput('bankaccounttransactions-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  }

  // Show amount
  if (!isClassDefined('input-bankaccounttransactions-filterAmount')) {
    objBankAccountTransactions.showInput('bankaccounttransactions-filterAmount', 'Beløp', 10, 'Alle');
  }

  // Check for filter from date
  let date = document.querySelector('.input-bankaccounttransactions-filterFromDate').value;
  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-bankaccounttransactions-filterFromDate').value = "01.01." + year;
  }

  // Check for filter to date
  date = document.querySelector('.input-bankaccounttransactions-filterToDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    document.querySelector('.input-bankaccounttransactions-filterToDate').value =
      getCurrentDate();
  }

  // Check for filter amount
  amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
  if (!objBankAccountTransactions.validateAmount(amount)) {

    // Amount is not ok
    document.querySelector('.input-bankaccounttransactions-filterAmount').value = '';
  }
}

// Show values for bank Account Movement
function showLeadingText(bankAccountTransactionId) {

  // Show bank Account Movement Id
  objBankAccountTransactions.showSelectedBankAccountTransactions('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId, '', 'Ingen er valgt');

  // Show all condos
  let condoId = objCondo.arrayCondo.at(-1).condoId;

  objCondo.showSelectedCondos('bankaccounttransactions-condoId', condoId, '', 'Ingen er valgt');

  // Show all accounts
  let accountId = objAccounts.accountsArray.at(-1).accountId;;

  objAccounts.showSelectedAccounts('bankaccounttransactions-accountId', accountId, '', 'Ingen er valgt');

  // Show date
  objBankAccountTransactions.showInput('bankaccounttransactions-date', '* Dato', 10, 'dd.mm.åååå');

  // Show income
  objBankAccountTransactions.showInput('bankaccounttransactions-income', 'Inntekt', 10, '');

  // Show kilo watt per hour
  objBankAccountTransactions.showInput('bankaccounttransactions-numberKWHour', 'Kilowatt/time', 10, '');

  // Show text
  objBankAccountTransactions.showInput('bankaccounttransactions-text', 'Tekst', 50, '');

  // Show payment
  objBankAccountTransactions.showInput('bankaccounttransactions-payment', 'Utgift', 10, '');

  // show update button 
  objBankAccountTransactions.showButton('bankaccounttransactions-update', 'Oppdater');

  // show insert button
  objBankAccountTransactions.showButton('bankaccounttransactions-insert', 'Ny');

  // show delete button
  objBankAccountTransactions.showButton('bankaccounttransactions-delete', 'Slett');

  // show cancel button
  objBankAccountTransactions.showButton('bankaccounttransactions-cancel', 'Avbryt');
}

// Show values for bank account movementId
function showValues(bankAccountTransactionId) {

  // Check for valid bank Account Movement Id
  if (bankAccountTransactionId >= 0) {

    // Find object number in bank account movementId array
    const objBankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTranactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
    if (objBankAccountTransactionRowNumber !== -1) {

      // Show Bank account transactions id
      document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].bankAccountTransactionId;

      // Show condo id
      document.querySelector('.select-bankaccounttransactions-condoId').value = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].condoId;

      // Show account
      document.querySelector('.select-bankaccounttransactions-accountId').value = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].accountId;

      // Show date
      const date = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].date;
      document.querySelector('.input-bankaccounttransactions-date').value =
        formatToNorDate(date);

      // Show income
      const income = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].income;
      document.querySelector('.input-bankaccounttransactions-income').value = formatOreToKroner(income);

      // Show payment
      const payment = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].payment;
      document.querySelector('.input-bankaccounttransactions-payment').value = formatOreToKroner(payment);

      // Show kilo watt per hour
      const numberKWHour = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].numberKWHour;
      document.querySelector('.input-bankaccounttransactions-numberKWHour').value = formatOreToKroner(numberKWHour);

      // Show text
      const text = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].text;
      document.querySelector('.input-bankaccounttransactions-text').value = text;

      objBankAccountTransactions.showButton('bankaccounttransactions-cancel', 'Avbryt');
    }
  }
}

// Show selected bank account transactions
function showBankAccountTransactions() {

  // Validate search filter
  if (validateFilter()) {

    // Header
    let htmlColumnLine = '<div class="columnHeaderCenter">Linje</div><br>';
    let htmlColumnCondoName = '<div class="columnHeaderLeft">Leilighet</div><br>';
    let htmlColumnAccountName = '<div class="columnHeaderLeft">Konto</div><br>';
    let htmlColumnDate = '<div class="columnHeaderRight">Dato</div><br>';
    let htmlColumnIncome = '<div class="columnHeaderRight">Inntekt</div><br>';
    let htmlColumnPayment = '<div class="columnHeaderRight">Utgift</div><br>';
    let htmlColumnKiloWattHour = '<div class="columnHeaderRight">Kilovatttimer</div><br>';
    let htmlColumnText = '<div class="columnHeaderLeft">Tekst</div><br>';

    let sumIncome = 0;
    let sumPayment = 0;
    let sumKiloWattHour = 0;
    let lineNumber = 0;

    let fromDate = document.querySelector('.input-bankaccounttransactions-filterFromDate').value;
    fromDate = convertDateToISOFormat(fromDate);
    let toDate = document.querySelector('.input-bankaccounttransactions-filterToDate').value;
    toDate = convertDateToISOFormat(toDate);

    let amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
    amount = Number(formatKronerToOre(amount));

    //const condoId = Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value);
    //const accountId = Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value);

    objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

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
      if (bankAccountTransaction.condoId) {
        const condoId = Number(bankAccountTransaction.condoId);
        condoName = objCondo.getCondoName(condoId);
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
      const accountName = objAccounts.getAccountName(bankAccountTransaction.accountId);
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
      const date = formatToNorDate(bankAccountTransaction.date);
      htmlColumnDate +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${date}
          </div >
        `;

      // income
      const income = formatOreToKroner(bankAccountTransaction.income);
      htmlColumnIncome +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${income}
          </div>
        `;

      // payment
      const payment = formatOreToKroner(bankAccountTransaction.payment);
      htmlColumnPayment +=
        `
          <div
            class="rightCell ${colorClass}"
          >
            ${payment}
          </div>
        `;

      // KiloWatt/Hour
      const kiloWattHour = formatOreToKroner(bankAccountTransaction.numberKWHour);
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
            ${bankAccountTransaction.text}
          </div>
        `;

      // accumulate
      sumIncome += Number(bankAccountTransaction.income);
      sumPayment += Number(bankAccountTransaction.payment);
      sumKiloWattHour += Number(bankAccountTransaction.numberKWHour);
    });

    // Sum line

    // income
    income = formatOreToKroner(sumIncome);
    htmlColumnIncome +=
      `
        <div
          class="sumCellRight"
        >
          ${income}
        </div >
      `;

    // payment
    payment = formatOreToKroner(sumPayment);
    htmlColumnPayment +=
      `
        <div
          class="sumCellRight"
        >
          ${payment}
        </div >
      `;

    // KiloWatt/Hour
    kiloWattHour = formatOreToKroner(sumKiloWattHour);
    htmlColumnKiloWattHour +=
      `
        <div
          class="sumCellRight"
        >
          ${kiloWattHour}
        </div >
      `;

    // Show line number
    document.querySelector('.div-bankaccounttransactions-columnLine').innerHTML = htmlColumnLine;

    // Show condo name
    document.querySelector('.div-bankaccounttransactions-columnCondoName').innerHTML = htmlColumnCondoName;

    // Show bank account name
    document.querySelector('.div-bankaccounttransactions-columnAccountName').innerHTML = htmlColumnAccountName;

    // Show date
    document.querySelector('.div-bankaccounttransactions-columnDate').innerHTML = htmlColumnDate;

    // Show income
    document.querySelector('.div-bankaccounttransactions-columnIncome').innerHTML = htmlColumnIncome;

    // Show payment
    document.querySelector('.div-bankaccounttransactions-columnPayment').innerHTML = htmlColumnPayment;

    // Show KiloWatt/hour
    document.querySelector('.div-bankaccounttransactions-columnNumberKWHour').innerHTML = htmlColumnKiloWattHour;

    // Show text
    document.querySelector('.div-bankaccounttransactions-columnText').innerHTML = htmlColumnText;
  }
}

// Check for valid filter
function validateFilter() {

  // Check account movement
  const accountId =
    document.querySelector('.select-bankaccounttransactions-filterAccountId').value;
  const validAccountId =
    validateNumber(accountId, 1, 999999999, 'bankaccounttransactions-filterAccountId', 'Konto');

  const condoId = document.querySelector('.select-bankaccounttransactions-filterCondoId').value;
  const validCondoId = validateNumber(accountId, 1, 999999999, 'bankaccounttransactions-filterCondoId', 'Leilighet');

  const fromDate = document.querySelector('.input-bankaccounttransactions-filterFromDate').value;
  const validFromDate = validateNorDate(fromDate, 'bankaccounttransactions-filterFromDate', 'Fra dato');

  const toDate =
    document.querySelector('.input-bankaccounttransactions-filterToDate').value;
  const validToDate = validateNorDate(toDate, 'bankaccounttransactions-filterToDate', 'Til dato');

  const amount = (document.querySelector('.input-bankaccounttransactions-filterAmount').value) ? document.querySelector('.input-bankaccounttransactions-filterAmount').value : '0';
  const validAmount = objBankAccountTransactions.validateAmount(amount, 'bankaccounttransactions-filterAmount', 'Beløp');

  return (validAccountId && validCondoId && validFromDate && validToDate && validAmount) ? true : false;
}

async function updateBankAccountTransaction(bankAccountTransactionId) {

  // Check values
  if (validateValues()) {

    bankAccountTransactionId = Number(bankAccountTransactionId);
    const condominiumId = Number(objUserPassword.condominiumId);
    const user = objUserPassword.email;
    const condoId = Number(document.querySelector('.select-bankaccounttransactions-condoId').value);
    const accountId = Number(document.querySelector('.select-bankaccounttransactions-accountId').value);

    let date = document.querySelector('.input-bankaccounttransactions-date').value;
    date = convertDateToISOFormat(date);

    let income = document.querySelector('.input-bankaccounttransactions-income').value;
    income = Number(formatAmountToOre(income));

    let payment = document.querySelector('.input-bankaccounttransactions-payment').value;
    payment = formatAmountToOre(payment);

    let numberKWHour = document.querySelector('.input-bankaccounttransactions-numberKWHour').value;
    numberKWHour = Number(formatAmountToOre(numberKWHour));

    const text = document.querySelector('.input-bankaccounttransactions-text').value;

    // current date
    const lastUpdate = today.toISOString();

    // Check if Bank account transactions exist
    const objBankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTranactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
    if (objBankAccountTransactionRowNumber !== -1) {

      // update Bank account transactions
      await objBankAccountTransactions.updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text);

    } else {

      // insert Bank account transactions
      await objBankAccountTransactions.insertBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text);
    }
  }

  document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').disabled = false;
  document.querySelector('.button-bankaccounttransactions-delete').disabled = false;
  document.querySelector('.button-bankaccounttransactions-insert').disabled = false;
}

// Check for valid bank account values
function validateValues() {

  // Check account Id
  let accountId = document.querySelector('.select-bankaccounttransactions-accountId').value;
  accountId = (accountId) ? Number(accountId) : 0;
  const validAccountId = validateNumber(accountId, 1, 999999999, 'bankaccounttransactions-accountId', 'Konto');

  const date = document.querySelector('.input-bankaccounttransactions-date').value;
  const validDate = validateNorDate(date, 'bankaccounttransactions-date', 'Dato');

  return (validAccountId && validDate) ? true : false;
}

// Delete Bank account transactions
async function deleteBankAccountTransaction() {

  // Check for Bank account transactions Id
  const bankAccountTransactionId = Number(document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value);

  // Check if Bank account transactions id exist
  const objBankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTranactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (objBankAccountTransactionRowNumber !== -1) {

    // delete Bank account transactions row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objBankAccountTransactions.deleteBankAccountTransactionsTable(bankAccountTransactionId, user, lastUpdate);
  }
}

function resetValues() {

  document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value = '';
  document.querySelector('.select-bankaccounttransactions-condoId').value = '';
  document.querySelector('.select-bankaccounttransactions-accountId').value = '';
  document.querySelector('.input-bankaccounttransactions-date').value = '';
  document.querySelector('.input-bankaccounttransactions-payment').value = '';
  document.querySelector('.input-bankaccounttransactions-income').value = '';
  document.querySelector('.input-bankaccounttransactions-numberKWHour').value = '';
  document.querySelector('.input-bankaccounttransactions-text').value = '';
  document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').disabled = true;
  document.querySelector('.button-bankaccounttransactions-insert').disabled = true;
  document.querySelector('.button-bankaccounttransactions-delete').disabled = true;
}

