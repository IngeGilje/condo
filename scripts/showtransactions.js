// Show bank account transactions

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAppartments = new Appartments('appartments');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objSuppliers = new Suppliers('suppliers');
const objCondominiums = new Condominiums('scondominiums');
const objUserBankAccounts = new UserBankAccounts('userbankaccounts');
const objTransactions = new Transactions('transactions');

const enableChanges = (objTransactions.securityLevel > 5);
const applicationName = "showtransactions";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramTransactionId = Number(queryParameters.get("transactionId"));
const paramCondoId = Number(queryParameters.get("appartmentId"));
const paramAccountId = Number(queryParameters.get("accountId"));
const paramProjectId = Number(queryParameters.get("projectId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));
const paramAmount = Number(queryParameters.get("amount"));
const paramBackApplication = queryParameters.get("backApplication");

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objTransactions.condominiumId === 0) || (objTransactions.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/login.html'
        : 'http://localhost/login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      const html = objTransactions.showMenu(objTransactions.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objTransactions.condominiumId, resident, objTransactions.nineNine);
      //const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objTransactions.condominiumId);
      await objBankAccounts.loadBankAccountsTable(objTransactions.condominiumId);
      await objUserBankAccounts.loadUserBankAccountsTable(objTransactions.condominiumId, objTransactions.nineNine, objTransactions.nineNine);
      await objAppartments.loadAppartmentsTable(objTransactions.condominiumId);
      await objCondominiums.loadCondominiumsTable();
      await objSuppliers.loadSuppliersTable(objTransactions.condominiumId);

      if ((paramTransactionId === 0)
        && (paramCondoId === 0)
        && (paramAccountId === 0)
        && (paramProjectId === 0)
        && (paramFromDate === 0)
        && (paramToDate === 0)
        && (paramAmount === 0)) {

        const amount = 0;
        let appartmentId = objTransactions.nineNine;
        let accountId = objTransactions.nineNine;

        // From date
        let month = today.getMonth();
        month = (month < 10) ? `0${month}` : `${month}`;
        const fromDate = Number(`${String(today.getFullYear())}${month}01`);

        // Current date
        let toDate = getCurrentISODate();
        toDate = Number(formatISODateToNumber(toDate));

        showFilter(appartmentId, accountId, fromDate, toDate, amount);
      } else {

        showFilter(paramCondoId, paramAccountId, paramFromDate, paramToDate, paramAmount);
      }

      //const orderBy = 'date DESC, income DESC';
      //await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, 'N', objTransactions.nineNine, objTransactions.nineNine, objTransactions.nineNine, objTransactions.nineNine, 20200101, objTransactions.nineNine);
      await objTransactions.loadTransactionsTableNew(objTransactions.condominiumId);
      objTransactions.arrayTransactions.sort((a, b) => b.date - a.date);

      // Show transactions
      showTransactions();

      // Events
      events();
    }
  } else {

    showMessage('Server er ikke startet.');
  }
}

// Make Transactions events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterAppartmentId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAccountId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAmount'))) {

      showTransactions();
    };
  });

  // Show bank voucher
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {

      const arrayPrefixes = ['voucher'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objTransactions.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

      const appartmentId = Number(document.querySelector('.filterAppartmentId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);
      let amount = document.querySelector('.filterAmount').value;
      amount = formatNorAmountToNumber(amount);
      let URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}voucher.html?backApplication=${applicationName}.html&transactionId=${transactionId}&appartmentId=${appartmentId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}&amount=${amount}`;
      window.location.href = URL;
    };
  });

  // change bank account transaction
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {

      const arrayPrefixes = ['change'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objTransactions.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

      // Project id
      let projectId = 0;
      const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
      if (rowNumberTransaction !== -1) {
        projectId = objTransactions.arrayTransactions[rowNumberTransaction].projectId
      }
      const appartmentId = Number(document.querySelector('.filterAppartmentId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);
      let amount = document.querySelector('.filterAmount').value;
      amount = formatNorAmountToNumber(amount);
      let URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      //URL = `${URL}transaction.html?transactionId=${transactionId}&appartmentId=${appartmentId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}&amount=${amount}&projectId=${projectId}`;
      URL = `${URL}transaction.html?transactionId=${transactionId}&appartmentId=${appartmentId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}&amount=${amount}&projectId=${projectId}&backApplication=${applicationName}.html`;

      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(appartmentId, accountId, fromDate, toDate, amount) {

  // Start frame
  //let html = startLineFilter('filter-frame');
  html = startLineFilter();

  // Show condos
  //html += objAppartments.showSelectedAppartmentsNew('filterAppartmentId', 'Leilighet', appartmentId, '', 'Vis alle', true);
  html += objAppartments.showLineFilterAppartments('filterAppartmentId', 'Leilighet', appartmentId, '', 'Vis alle', true);

  // Show accounts
  html += objAccounts.showLineFilterAccounts('filterAccountId', 'Konto', accountId, '', 'Vis alle', true);

  // From date
  fromDate = formatNumberToISODate(fromDate);
  //html += showDate('Fra Dato', 'filterFromDate', fromDate, true)
  html += inputLineFilterDate('filterFromDate', 'Fra Dato', fromDate, true);

  // To date
  toDate = formatNumberToISODate(toDate);
  //html += showDate('Til Dato', 'filterToDate', toDate, true)
  html += inputLineFilterDate('filterToDate', 'Til Dato', toDate, true)

  // Amount
  amount = formatNumberToNorAmount(amount);
  //html += showAmount('Beløp', 'filterAmount', amount, true);
  html += inputLineFilterText('filterAmount', 'Beløp', amount, 11, true);

  // End filter
  //html += endLineFilter();
  html += endLineFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Show transactions
function showTransactions() {

  // Filter values
  // date
  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(objTransactions.formatDateToNumber(fromDate));
  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(objTransactions.formatDateToNumber(toDate));

  // appartmentId
  let fromCondoId = Number(document.querySelector('.filterAppartmentId').value);
  if (fromCondoId === objTransactions.nineNine) fromCondoId = 0;
  let toCondoId = Number(document.querySelector('.filterAppartmentId').value);
  if (toCondoId === objTransactions.nineNine) toCondoId = objTransactions.nineNine;

  // accountId
  let fromAccountId = Number(document.querySelector('.filterAccountId').value);
  if (fromAccountId === objTransactions.nineNine) fromAccountId = 0;
  let toAccountId = Number(document.querySelector('.filterAccountId').value);
  if (toAccountId === objTransactions.nineNine) toAccountId = objTransactions.nineNine;

  // amount
  let amount = document.querySelector('.filterAmount').value;
  amount = formatNorAmountToNumber(amount);
  if (amount !== 0) fromAmount = amount;
  if (amount !== 0) toAmount = amount;
  if (amount === 0) fromAmount = objTransactions.minusNineNine;
  if (amount === 0) toAmount = objTransactions.nineNine;

  let sumIncome = 0;
  let sumPayment = 0;

  // Start table
  let html = startTable("Kontobevegelser", "");
  html += tableHeader('Dato', 'Konto', 'Leilighet', 'Innbetalinger', 'Utbetalinger', '');

  objTransactions.arrayTransactions.forEach(transaction => {
    if (transaction.deleted === "N") {

      let amount = transaction.income;
      if (transaction.income === 0) amount = transaction.payment;

      // Check for valid transaction
      if ((transaction.date >= fromDate && transaction.date <= toDate)
        && (transaction.appartmentId >= fromCondoId && transaction.appartmentId <= toCondoId)
        && (transaction.accountId >= fromAccountId && transaction.accountId <= toAccountId)
        && ((amount >= fromAmount && amount <= toAmount))) {

        let amount = transaction.income;
        if (transaction.income === 0) amount = transaction.payment;

        // New table row
        html += "<tr>";

        // Date
        const date = formatNumberToNorDate(transaction.date);
        let className = `date${transaction.transactionId}`;
        html += showTableText(className, date);

        // account
        className = `accountId${transaction.transactionId}`;
        const accountName = objAccounts.getAccountNameById(transaction.accountId);
        html += showTableText(className, accountName);

        // condos
        className = `appartmentId${transaction.transactionId}`;
        //html += objAppartments.showSelectedAppartments(className, '', transaction.appartmentId, '-', '', false);
        const appartmentName = objAppartments.getAppartmentNameById(transaction.appartmentId);
        html += showTableText(className, appartmentName);

        // income
        let income = transaction.income;
        income = formatNumberToNorAmount(income);
        className = `income${transaction.transactionId}`;
        html += showTableText(className, income);

        // payment
        let payment = transaction.payment;
        payment = formatNumberToNorAmount(payment);
        className = `payment${transaction.transactionId}`;
        html += showTableText(className, payment);

         // Change transaction
        className = `change${transaction.transactionId}`;
        html += showTableButton(className, 'Rediger');
        html += "</tr>";

        // accumulate
        sumIncome += Number(transaction.income);
        sumPayment += Number(transaction.payment);
      }
    }
  });

  // Show table sum row
  let sumAmount = sumIncome + sumPayment;
  sumAmount = formatNumberToNorAmount(sumAmount);
  sumIncome = formatNumberToNorAmount(sumIncome);
  sumPayment = formatNumberToNorAmount(sumPayment);

  html += objTransactions.insertTableRow('', '', '', 'Sum', sumIncome, sumPayment, sumAmount);

  // get from date
  let bankBalance = objTransactions.getBankBalance(toDate);
  bankBalance = formatNumberToNorAmount(bankBalance);
  //html += objTransactions.insertTableRow('', '','',  'Saldo', bankBalance, '', '');

  // The end of the table
  html += endTable();
  document.querySelector('.showTransactions').innerHTML = html;
}