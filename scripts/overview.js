// Search for dues

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objCondo = new Condo('condo');
const objTransactions = new Transactions('transactions');
const objDues = new Dues('dues');

const enableChanges = (objDues.securityLevel > 5);
const applicationName = "overview";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    securityLevel = sessionStorage.getItem("securityLevel");
    if ((objDues.condominiumId === 0) || (objDues.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/login.html'
        : 'http://localhost/login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objDues.showMenu(objDues.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objDues.condominiumId, resident, objDues.nineNine);
      await objCondo.loadCondoTable(objDues.condominiumId);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objDues.condominiumId, fixedCost);

      // Show filter
      // get current condo id
      let condoId = 0;
      const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === objDues.userId);
      if (rowNumberUser !== -1) {
        condoId = objUsers.arrayUsers[rowNumberUser].condoId;
      }
      showFilter(condoId);

      condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = objDues.nineNine;
      const deleted = 'N';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = objDues.formatDateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = objDues.formatDateToNumber(toDate);
      await objDues.loadDuesTable(objDues.condominiumId);
      const orderBy = 'condoId ASC';
      await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, deleted, condoId, objDues.nineNine, objDues.nineNine, 0, fromDate, toDate);

      // Show dues
      showDues();

      // Transactions
      showTransactions();

      // show how much to pay
      showHowMuchToPay();

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Create overview events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondoId')
      || event.target.classList.contains('filterAccountId')
      || event.target.classList.contains('filterFromDate')
      || event.target.classList.contains('filterToDate')) {

      // condo
      const condoId = Number(document.querySelector('.filterCondoId').value);

      const accountId = objDues.nineNine;
      const deleted = 'N';

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);

      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);

      await objDues.loadDuesTable(objDues.condominiumId);
      const orderBy = 'condoId ASC';
      await objTransactions.loadTransactionsTable(orderBy, objDues.condominiumId, deleted, condoId, objDues.nineNine, objDues.nineNine, 0, fromDate, toDate);

      // Show dues
      showDues();

      // Transactions
      showTransactions();

      // show how much to pay
      showHowMuchToPay();
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objDues.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}login.html`;
      window.location.href = url;
    };
  });
}

// Show filter
function showFilter(condoId) {

  // Start filter
  let html = startLineFilter('filter-frame');

  // Show condos
  html += objCondo.showSelectedCondosNew('filterCondoId', 'Leilighet', condoId, '', 'Vis alle', true);

  // From date
  let fromDate = `${String(today.getFullYear())}-01-01`;
  html += inputDate('filterFromDate', 'Fra Dato', fromDate, true)

  // To date
  // Current date
  let toDate = getCurrentISODate();
  html += inputDate('filterToDate', 'Til Dato', toDate, true);

  // End filter
  html += endLineFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Show dues
function showDues() {

  let sumDue = 0;
  let sumKilowattHour = 0;

  const filterCondoId = Number(document.querySelector('.filterCondoId').value);
  let filterFromDate = document.querySelector('.filterFromDate').value;
  filterFromDate = formatISODateToNumber(filterFromDate);
  let filterToDate = document.querySelector('.filterToDate').value;
  filterToDate = formatISODateToNumber(filterToDate);

  // Start table
  let html = startTable("Forfall", "");
  html += tableHeader( 'Forfallsdato', 'Leilighet', 'Konto', 'Beløp', 'Kilowattimer', 'Tekst');

  objDues.arrayDues.forEach((due) => {

    if ((due.condoId === filterCondoId || filterCondoId === objDues.nineNine)
      && (due.date >= filterFromDate && due.date <= filterToDate)) {

      // insert a table row (<tr></td>)
      html += objDues.insertTableRow('');

      // date
      const date = formatNumberToNorDate(due.date);
      className = `date${due.dueId}`;
      html += showTableText(className, date);

      // condo
      className = `condo${due.dueId}`;
      //html += objCondo.showSelectedCondos(className, '', due.condoId, 'Velg leilighet', '', false);
      const condoName = objCondo.getCondoNameById(due.condoId);
      html += showTableText(className, condoName);

      // account
      className = `account${due.dueId}`;
      //html += objAccounts.showSelectedAccounts(className, '', due.accountId, 'Velg konto', '', false);
      const accountName = objAccounts.getAccountNameById(due.accountId);
      html += showTableText(className, accountName);

      // amount
      const amount = formatNumberToNorAmount(due.amount);
      className = `income${due.dueId}`;
      html += showTableText(className, amount);

      // kilowattHour
      const kilowattHour = formatNumberToNorAmount(due.kilowattHour);
      className = `income${due.dueId}`;
      html += showTableText(className, kilowattHour);

      // Text
      const text = due.text;
      className = `text${due.dueId}`;
      html += showTableText(className, text);

      html += "</tr>";

      // accumulate
      sumDue += Number(due.amount);
      sumKilowattHour += Number(due.kilowattHour);
    }
  });

  // Sum row
  sumDue = formatNumberToNorAmount(sumDue);
  sumKilowattHour = formatNumberToNorAmount(sumKilowattHour);

  html += objDues.insertTableRow('font-weight: 600;', '', '', 'Sum', sumDue, '', '');
  html += "</tr>"

  html += objDues.insertTableRow('', '', '', '', '', '', '');
  html += "</tr>"

  // The end of the table
  html += endTable();
  document.querySelector('.showDues').innerHTML = html;
}

// Transactions
function showTransactions() {

  const filterCondoId = Number(document.querySelector('.filterCondoId').value);
  let filterFromDate = document.querySelector('.filterFromDate').value;
  filterFromDate = formatISODateToNumber(filterFromDate);
  let filterToDate = document.querySelector('.filterToDate').value;
  filterToDate = formatISODateToNumber(filterToDate);

  let sumIncomes = 0;
  let sumPayments = 0;

  // Start table
  let html = startTable("Innbetalinger", "");
  html += tableHeader( '', 'Leilighet', 'Betalingsdato', 'Konto', 'Betaling', 'Tekst');

  objTransactions.arrayTransactions.forEach((bankTransaction) => {
    if ((bankTransaction.condoId === filterCondoId || filterCondoId === objDues.nineNine)
      && (bankTransaction.date >= filterFromDate && bankTransaction.date <= filterToDate)) {

      // insert a table row (<tr></td>)
      html += objDues.insertTableRow('', '');

      // condos
      className = `condo${bankTransaction.transactionId}`;
      //html += objCondo.showSelectedCondos(className, '', Number(bankTransaction.condoId), 'Velg leilighet', '', false);
      const condoName = objCondo.getCondoNameById(bankTransaction.condoId);
      html += showTableText(className, condoName);

      // date
      const date = formatNumberToNorDate(bankTransaction.date);
      className = `date${bankTransaction.transactionId}`;
      html += showTableText(className, date);

      // account
      className = `account${bankTransaction.transactionId}`;
      //html += objAccounts.showSelectedAccounts(className, '', Number(bankTransaction.accountId), 'Velg konto', '', false);
      const accountName = objAccounts.getAccountNameById(bankTransaction.accountId);
      html += showTableText(className, accountName);

      // income - payment
      let income = bankTransaction.income;
      const payment = bankTransaction.payment;
      income += payment;
      income = formatNumberToNorAmount(income);
      className = `income${bankTransaction.transactionId}`;
      html += showTableText(className, income);

      // Text
      const text = bankTransaction.text;
      className = `text${bankTransaction.transactionId}`;
      html += showTableText(className, text);
      html += "</tr>";

      // accumulate
      sumIncomes += Number(bankTransaction.income);
      sumPayments += Number(bankTransaction.payment);
    }
  });

  // Sum row
  sumIncomes += sumPayments;
  sumIncomes = formatNumberToNorAmount(sumIncomes);
  sumPayments = formatNumberToNorAmount(sumPayments);


  html += objDues.insertTableRow('font-weight: 600;', '', '', '', 'Sum', sumIncomes, '');
  html += "</tr>"

  html += objDues.insertTableRow('', '', '', '', '', '', '');

  // The end of the table
  html += endTable();
  document.querySelector('.showTransactions').innerHTML = html;
}

// show how much to pay
function showHowMuchToPay() {

  let sumIncome = 0;
  let sumPayment = 0;

  const filterCondoId = Number(document.querySelector('.filterCondoId').value);
  let filterFromDate = document.querySelector('.filterFromDate').value;
  filterFromDate = formatISODateToNumber(filterFromDate);
  let filterToDate = document.querySelector('.filterToDate').value;
  filterToDate = formatISODateToNumber(filterToDate);

  // How much to pay
  let sumToPay = 0;
  objDues.arrayDues.forEach((due) => {
    if ((due.condoId === filterCondoId || filterCondoId === objDues.nineNine)
      && (due.date >= filterFromDate && due.date <= filterToDate)) {

      sumToPay += due.amount;
    }
  });

  // How much is payd
  objTransactions.arrayTransactions.forEach((bankTransaction) => {

    if ((bankTransaction.condoId === filterCondoId || filterCondoId === objDues.nineNine)
      && (bankTransaction.date >= filterFromDate && bankTransaction.date <= filterToDate)) {

      // Accomulate
      sumIncome += Number(bankTransaction.income);
      sumPayment += Number(bankTransaction.payment);
    }
  });

  // Start table
  let html = startTable("Betalinger", "");

  // show main header
  sumIncome += sumPayment;
  let overPay = sumIncome - sumToPay;

  html += (overPay >= 0)
    ? tableHeader( '', '', '', 'Forfall', 'Betalt', 'Til gode')
    : tableHeader( '', '', '', 'Forfall', 'Betalt', 'Skyldig')

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatNumberToNorAmount(overPay);
  sumIncome = formatNumberToNorAmount(sumIncome);
  sumToPay = formatNumberToNorAmount(sumToPay);

  // Show sum
  let toDate = document.querySelector('.filterToDate').value;
  toDate = objDues.formatDateToNumber(toDate);

  // get current condo id
  let condoId = 0;
  const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === objDues.userId);
  if (rowNumberUser !== -1) {
    condoId = objUsers.arrayUsers[rowNumberUser].condoId;
  }
  let openingBalance = objTransactions.getTransactions(objDues.condominiumId, condoId, toDate);
  openingBalance += objDues.getDues(objDues.condominiumId, condoId, toDate);

  openingBalance = formatNumberToNorAmount(openingBalance);
  html += objDues.insertTableRow('font-weight: 600;', '', '', 'Sum', sumToPay, sumIncome, overPay);

  // The end of the table
  html += endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;
}