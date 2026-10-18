// Search for dues

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objAppartments = new Appartments('appartments');
const objTransactions = new Transactions('transactions');
const objDues = new Dues('dues');

const enableChanges = (objDues.securityLevel > 5);
const applicationName = "overview";

// Create array of paid dues
const arrayPaid = [];

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
      const html = objDues.showMenu(objDues.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objDues.condominiumId, resident, objDues.nineNine);
      await objAppartments.loadAppartmentsTable(objDues.condominiumId);
      //const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objDues.condominiumId);

      // Show filter
      // get current appartment id
      let appartmentId = 0;
      const rowNumberUser = objUsers.arrayUsers.findIndex(user => user.userId === objDues.userId);
      if (rowNumberUser !== -1) {
        appartmentId = objUsers.arrayUsers[rowNumberUser].appartmentId;
      }
      showFilter(appartmentId);

      appartmentId = Number(document.querySelector('.filterAppartmentId').value);
      const accountId = objDues.nineNine;
      const deleted = 'N';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = objDues.formatDateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = objDues.formatDateToNumber(toDate);
      await objDues.loadDuesTable(objDues.condominiumId);
      //const orderBy = 'date DESC';
      //await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, deleted, appartmentId, objDues.nineNine, objDues.nineNine, 0, fromDate, toDate);
      await objTransactions.loadTransactionsTable(objTransactions.condominiumId);
      objTransactions.arrayTransactions.sort((a, b) => b.date - a.date);

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

    showMessage('Server er ikke startet.');
  }
}

// Create overview events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterAppartmentId')
      || event.target.classList.contains('filterAccountId')
      || event.target.classList.contains('filterFromDate')
      || event.target.classList.contains('filterToDate')) {

      // appartment
      const appartmentId = Number(document.querySelector('.filterAppartmentId').value);

      const accountId = objDues.nineNine;
      const deleted = 'N';

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);

      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);

      await objDues.loadDuesTable(objDues.condominiumId);
      //const orderBy = 'appartmentId ASC';
      //await objTransactions.loadTransactionsTable(orderBy, objDues.condominiumId, deleted, appartmentId, objDues.nineNine, objDues.nineNine, 0, fromDate, toDate);

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
function showFilter(appartmentId) {

  // Start filter
  let html = startLineFilter('filter-frame');

  // Show appartments
  html += objAppartments.showSelectedAppartmentsNew('filterAppartmentId', 'Leilighet', appartmentId, '', 'Vis alle', true);

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

  const filterAppartmentId = Number(document.querySelector('.filterAppartmentId').value);
  let filterFromDate = document.querySelector('.filterFromDate').value;
  filterFromDate = formatISODateToNumber(filterFromDate);
  let filterToDate = document.querySelector('.filterToDate').value;
  filterToDate = formatISODateToNumber(filterToDate);

  // Start table
  let html = startTable("Forfall", "");
  html += tableHeader('Forfallsdato', 'Leilighet', 'Konto', 'Beløp', 'Kilowattimer', 'Tekst', 'Betalt');

  objDues.arrayDues.forEach((due) => {

    if ((due.delted = "N")
      && (due.appartmentId === filterAppartmentId || filterAppartmentId === objDues.nineNine)
      && (due.date >= filterFromDate && due.date <= filterToDate)
      && (due.appartmentId > 0)) {

      html += objDues.insertTableRow('');

      // date
      const date = formatNumberToNorDate(due.date);
      className = `date${due.dueId}`;
      html += showTableText(className, date);

      // appartment Id
      className = `appartmentId${due.dueId}`;
      //html += objAppartments.showSelectedAppartments(className, '', due.appartmentId, 'Velg leilighet', '', false);
      const appartmentName = objAppartments.getAppartmentNameById(due.appartmentId);
      html += showTableText(className, appartmentName);

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

      // Paid
      const paid = checkIfPaid(due.amount, due.date) ? 'Ja' : 'Nei';
      className = `paid${due.dueId}`;
      html += showTableText(className, paid);

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

  const filterAppartmentId = Number(document.querySelector('.filterAppartmentId').value);
  let filterFromDate = document.querySelector('.filterFromDate').value;
  filterFromDate = formatISODateToNumber(filterFromDate);
  let filterToDate = document.querySelector('.filterToDate').value;
  filterToDate = formatISODateToNumber(filterToDate);

  let sumIncomes = 0;
  let sumPayments = 0;

  // Start table
  let html = startTable("Innbetalinger", "");
  html += tableHeader('', 'Leilighet', 'Betalingsdato', 'Konto', 'Betaling', 'Tekst');

  objTransactions.arrayTransactions.forEach((bankTransaction) => {
    if ((bankTransaction.deleted === "N")
      && (bankTransaction.appartmentId === filterAppartmentId || filterAppartmentId === objTransactions.nineNine)
      && (bankTransaction.date >= filterFromDate && bankTransaction.date <= filterToDate)
      && (bankTransaction.appartmentId > 0)) {

      html += objDues.insertTableRow('', '');

      // appartments
      className = `appartmentId${bankTransaction.transactionId}`;
      //html += objAppartments.showSelectedAppartments(className, '', Number(bankTransaction.appartmentId), 'Velg leilighet', '', false);
      const appartmentName = objAppartments.getAppartmentNameById(bankTransaction.appartmentId);
      html += showTableText(className, appartmentName);

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

  const filterAppartmentId = Number(document.querySelector('.filterAppartmentId').value);
  let filterFromDate = document.querySelector('.filterFromDate').value;
  filterFromDate = formatISODateToNumber(filterFromDate);
  let filterToDate = document.querySelector('.filterToDate').value;
  filterToDate = formatISODateToNumber(filterToDate);

  // How much to pay
  let sumToPay = 0;
  objDues.arrayDues.forEach((due) => {
    if ((due.deleted = "N")
      && (due.appartmentId === filterAppartmentId || filterAppartmentId === objDues.nineNine)
      && (due.date >= filterFromDate && due.date <= filterToDate)) {

      sumToPay += due.amount;
    }
  });

  // How much is payd
  objTransactions.arrayTransactions.forEach((transaction) => {
    if ((transaction.deleted === "N")
      && (transaction.appartmentId === filterAppartmentId || filterAppartmentId === objTransactions.nineNine)
      && (transaction.date >= filterFromDate && transaction.date <= filterToDate)
      && (transaction.appartmentId > 0)) {

      // Accomulate
      sumIncome += Number(transaction.income);
      sumPayment += Number(transaction.payment);
    }
  });

  // Start table
  let html = startTable("Betalinger", "");

  // show main header
  sumIncome += sumPayment;
  let overPay = sumIncome - sumToPay;

  html += (overPay >= 0)
    ? tableHeader('', '', '', 'Forfall', 'Betalt', 'Til gode')
    : tableHeader('', '', '', 'Forfall', 'Betalt', 'Skyldig')

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatNumberToNorAmount(overPay);
  sumIncome = formatNumberToNorAmount(sumIncome);
  sumToPay = formatNumberToNorAmount(sumToPay);

  html += objDues.insertTableRow('font-weight: 750;', '', '', 'Sum', sumToPay, sumIncome, overPay);

  // The end of the table
  html += endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;
}

// Check if due is payd this period
function checkIfPaid(amount, date) {

  let isPaid = false;

  // checking if a due is paid
  objTransactions.arrayTransactions.forEach((bankTransaction) => {
    if ((bankTransaction.deleted === "N")
      && (bankTransaction.income === amount) || (bankTransaction.payment === amount)) {

      // check if the due is already marked as paid
      const index = arrayPaid.findIndex(paid => ((arrayPaid.amount === bankTransaction.income) || (arrayPaid.amount === bankTransaction.payment)) && arrayPaid.date === bankTransaction.date);
      if (index === -1) {
        arrayPaid.push({ amount, date: bankTransaction.date });
        isPaid = true;
      }
    }
  });
  return isPaid;
}