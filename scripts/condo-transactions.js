// Show bank account transactions

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objCondominium = new Condominium('scondominium');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objTransaction = new Transaction('transaction');
const objTransactions = new Transactions('transactions');

const enableChanges = (objTransactions.securityLevel > 5);
const applicationName = "condo-transactions";

const columnWidths = [125, 175, 125, 125, 125, 100, 100];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramTransactionId = Number(queryParameters.get("transactionId"));
const paramCondoId = Number(queryParameters.get("condoId"));
const paramAccountId = Number(queryParameters.get("accountId"));
const paramProjectId = Number(queryParameters.get("projectId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));
const paramAmount = Number(queryParameters.get("amount"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objTransaction.condominiumId === 0) || (objTransaction.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

            // Show vertical menu
      let html = objTransactions.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objTransactions.showHorizontalMenu("filter-frame", objTransactions.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show transaction menu
      html = objTransactions.showHorizontalMenu("filter-frame", objTransactions.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objTransactions.markActivatedApplication(objTransactions.arrayMenuTransaction, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objTransaction.condominiumId, resident, objTransaction.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine, objTransaction.nineNine);
      await objCondo.loadCondoTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(objTransaction.condominiumId);

      if ((paramTransactionId === 0)
        && (paramCondoId === 0)
        && (paramAccountId === 0)
        && (paramProjectId === 0)
        && (paramFromDate === 0)
        && (paramToDate === 0)
        && (paramAmount === 0)) {

        const amount = 0;
        let condoId = objTransaction.nineNine;
        let accountId = objTransaction.nineNine;

        // From date
        let month = today.getMonth();
        month = (month < 10) ? `0${month}` : `${month}`;
        const fromDate = Number(`${String(today.getFullYear())}${month}01`);

        // Current date
        let toDate = getCurrentISODate();
        toDate = Number(formatISODateToNumber(toDate));

        showFilter(condoId, accountId, fromDate, toDate, amount);
      } else {

        showFilter(paramCondoId, paramAccountId, paramFromDate, paramToDate, paramAmount);
      }

      const orderBy = 'date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', objTransaction.nineNine, objTransaction.nineNine, objTransaction.nineNine, objTransaction.nineNine, 20200101, objTransaction.nineNine);

      // Show transactions
      showTransactions();

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Make Transactions events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterCondoId'))
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
        .map(prefix => objTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);
      let amount = document.querySelector('.filterAmount').value;
      amount = formatNorAmountToNumber(amount);
      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-voucher.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}&amount=${amount}`;
      window.location.href = URL;
    };
  });

  // change bank account transaction
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {
      const arrayPrefixes = ['change'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objTransaction.getClassByPrefix(event.target, prefix))
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
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);
      let amount = document.querySelector('.filterAmount').value;
      amount = formatNorAmountToNumber(amount);
      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      //URL = `${URL}condo-transaction.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}&amount=${amount}&projectId=${projectId}`;
      URL = `${URL}condo-transaction.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}&amount=${amount}&projectId=${projectId}&backApplication=${applicationName}.html`;

      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(condoId, accountId, fromDate, toDate, amount) {

  // Start frame
  let html = startFrame('filter-frame');

  // Show condos
  html += objCondo.showSelectedCondosNew('Leilighet', 'filterCondoId', '', condoId, '', 'Vis alle', true);

  // Show accounts
  html += objAccounts.showSelectedAccountsNew('Konto', 'filterAccountId', '', accountId, '', 'Vis alle', true);

  // From date
  fromDate = formatNumberToISODate(fromDate);
  html += showDate('Fra Dato', 'filterFromDate', fromDate, true)

  // To date
  toDate = formatNumberToISODate(toDate);
  html += showDate('Til Dato', 'filterToDate', toDate, true)

  // Amount
  amount = formatNumberToNorAmount(amount);
  html += showAmount('Beløp', 'filterAmount', amount, true);

  // End filter frame
  html += "</div>";
  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame", "Filter");
}

// Show transactions
function showTransactions() {

  // Filter values
  // date
  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(objTransactions.formatDateToNumber(fromDate));
  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(objTransactions.formatDateToNumber(toDate));

  // condoId
  let fromCondoId = Number(document.querySelector('.filterCondoId').value);
  if (fromCondoId === objTransaction.nineNine) fromCondoId = 0;
  let toCondoId = Number(document.querySelector('.filterCondoId').value);
  if (toCondoId === objTransaction.nineNine) toCondoId = objTransaction.nineNine;

  // accountId
  let fromAccountId = Number(document.querySelector('.filterAccountId').value);
  if (fromAccountId === objTransaction.nineNine) fromAccountId = 0;
  let toAccountId = Number(document.querySelector('.filterAccountId').value);
  if (toAccountId === objTransaction.nineNine) toAccountId = objTransaction.nineNine;

  // amount
  let amount = document.querySelector('.filterAmount').value;
  amount = formatNorAmountToNumber(amount);
   if (amount !== 0) fromAmount = amount;
  if (amount !== 0) toAmount = amount;
  if (amount === 0) fromAmount = objTransaction.minusNineNine;
  if (amount === 0) toAmount = objTransaction.nineNine;

  let html = emptyLine();

  // Start table
  html += objTransactions.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objTransactions.showTableHeader('center', 'Dato', 'Konto', 'Leilighet', 'Inntekter', 'Utbetalinger', '', '');
  let sumIncome = 0;
  let sumPayment = 0;

  //for (const bankTransaction of objTransactions.arrayTransactions) {
  objTransactions.arrayTransactions.forEach(bankTransaction => {

    let amount = bankTransaction.income;
    if (bankTransaction.income === 0) amount = bankTransaction.payment;

    // Check for valid transaction
    if ((bankTransaction.date >= fromDate && bankTransaction.date <= toDate)
      && (bankTransaction.condoId >= fromCondoId && bankTransaction.condoId <= toCondoId)
      && (bankTransaction.accountId >= fromAccountId && bankTransaction.accountId <= toAccountId)
      && (amount >= fromAmount && amount <= toAmount)) {

      html += objTransaction.insertTableRow('');

      // Date
      const date = formatNumberToNorDate(bankTransaction.date);
      let className = `date${bankTransaction.transactionId}`;
      html += editTableCell(className, date, 10, false);

      // account
      className = `accountId${bankTransaction.transactionId}`;
      html += objAccounts.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

      // condos
      className = `condoId${bankTransaction.transactionId}`;
      html += objCondo.showSelectedCondos(className, '', bankTransaction.condoId, '-', '', false);

      // accounts
      className = `accountId${bankTransaction.transactionId}`;
      objAccounts.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

      // income
      let income = bankTransaction.income;
      income = formatNumberToNorAmount(income);
      className = `income${bankTransaction.transactionId}`;
      html += editTableCell(className, income, 10, false);

      // payment
      let payment = bankTransaction.payment;
      payment = formatNumberToNorAmount(payment);
      className = `payment${bankTransaction.transactionId}`;
      html += editTableCell(className, payment, 10, false);

      // Show button for voucher
      className = `voucher${bankTransaction.transactionId}`;
      html += objTransactions.showButton(className, 'Vis bilag');

      // Show button for change of bank account transaction
      className = `change${bankTransaction.transactionId}`;
      html += objTransactions.showButton(className, 'Rediger');
      html += "</tr>";

      // accumulate
      sumIncome += Number(bankTransaction.income);
      sumPayment += Number(bankTransaction.payment);
    }
  });

  // Show table sum row
  let sumAmount = sumIncome + sumPayment;
  sumAmount = formatNumberToNorAmount(sumAmount);
  sumIncome = formatNumberToNorAmount(sumIncome);
  sumPayment = formatNumberToNorAmount(sumPayment);

  html += objTransaction.insertTableRow('', '', '', 'Sum', sumIncome, sumPayment, sumAmount, '', '');

  // get from date
  let bankBalance = objTransactions.getBankBalance(toDate);
  bankBalance = formatNumberToNorAmount(bankBalance);
  html += objTransaction.insertTableRow('', '', '', 'Saldo', bankBalance, '', '', '', '');

  // The end of the table
  html += objTransactions.endTable();
  document.querySelector('.result').innerHTML = html;
}