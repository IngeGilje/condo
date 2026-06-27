// Search for dues

// Activate objects
const today = new Date();
const objUser = new User('user');
const objDue = new Due('due');
const objAccount = new Account('account');
const objCondo = new Condo('condo');
const objTransaction = new Transaction('transaction');
const objOverview = new Overview('overview');

const enableChanges = (objOverview.securityLevel > 5);

const columnWidths = [150, 100, 150, 175, 150, 175];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    securityLevel = sessionStorage.getItem("securityLevel");
    if ((objOverview.condominiumId === 0) || (objOverview.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objOverview.showHorizontalMenu(objOverview.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show due menu
      html = objOverview.showHorizontalMenu(objOverview.arrayMenuDue);
      document.querySelector('.menuDue').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objOverview.condominiumId, resident, objOverview.nineNine);
      await objCondo.loadCondoTable(objOverview.condominiumId, objOverview.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objOverview.condominiumId, fixedCost);

      // Show header
      showHeader();

      // Show filter
      // get current condo id
      let condoId = 0;
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objOverview.userId);
      if (rowNumberUser !== -1) {
        condoId = objUser.arrayUsers[rowNumberUser].condoId;
      }
      showFilter(condoId);

      condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = objOverview.nineNine;
      const deleted = 'N';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = objOverview.formatDateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = objOverview.formatDateToNumber(toDate);
      await objDue.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, objOverview.nineNine, objOverview.nineNine, 0, fromDate, toDate);

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

      // valitadate filter
      // condo
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const validCondoId = objOverview.validateInterval('filterCondoId', columnWidths, '', 'Ugyldig leilighet', true, condoId, 1, objOverview.nineNine);

      const accountId = objOverview.nineNine;
      const deleted = 'N';

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);

      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);

      await objDue.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objTransaction.loadTransactionsTable(orderBy, objOverview.condominiumId, deleted, condoId, objOverview.nineNine, objOverview.nineNine, 0, fromDate, toDate);

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

      let url = (objOverview.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objOverview.initializeTable(columnWidths);

  // start table body
  html += objOverview.startTableBody();

  // show main header
  html += objOverview.showTableHeaderLogOut('', '', '', 'Betalingsoversikt', '');
  html += "</tr>";

  // end table body
  html += objOverview.endTableBody();

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(condoId) {

   // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show condos
  html += objCondo.showSelectedCondosNew('Leilighet', 'filterCondoId', '', condoId, '', 'Vis alle', true);

  // From date
  let fromDate = `${String(today.getFullYear())}-01-01`;
  html += editDate('Fra Dato', 'filterFromDate', fromDate, true)

  // To date
  // Current date
  let toDate = getCurrentISODate();
  html += editDate('Til Dato', 'filterToDate', toDate, true)

  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show dues
function showDues() {

  // Start HTML table
  let html = objOverview.initializeTable(columnWidths);

  let sumDue = 0;
  let sumKilowattHour = 0;

  // Header

  html += objOverview.showTableHeaderMenu('#e0f0e0', 'center', '', '', '', 'Forfall', '', '');
  html += objOverview.showTableHeaderMenu('#e0f0e0', 'center', 'Forfallsdato', 'Leilighet', 'Konto', 'Beløp', 'Kilowattimer', 'Tekst');

  objDue.arrayDues.forEach((due) => {

    // insert a table row (<tr></td>)
    html += objDue.insertTableRow('');

    // date
    const date = formatNumberToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objOverview.editTableCell(className, date, 10, false);

    // condo
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondos(className, '', due.condoId, 'Velg leilighet', '', false);

    // account
    className = `account${due.dueId}`;
    html += objAccount.showSelectedAccounts(className, '', due.accountId, 'Velg konto', '', false);

    // amount
    const amount = formatOreToKroner(due.amount);
    className = `income${due.dueId}`;
    html += objOverview.editTableCell(className, amount, 11, false);

    // kilowattHour
    const kilowattHour = formatOreToKroner(due.kilowattHour);
    className = `income${due.dueId}`;
    html += objOverview.editTableCell(className, kilowattHour, 10, false);

    // Text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objOverview.editTableCell(className, text, 45, false);
    html += "</tr>";

    // accumulate
    sumDue += Number(due.amount);
    sumKilowattHour += Number(due.kilowattHour);
  });

  // Sum row
  sumDue = formatOreToKroner(sumDue);
  sumKilowattHour = formatOreToKroner(sumKilowattHour);

  html += objOverview.insertTableRow('font-weight: 600;', '', '', 'Sum', sumDue, '', '');
  html += "</tr>"

  html += objOverview.insertTableRow('', '', '', '', '', '', '');
  html += "</tr>"

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.dues').innerHTML = html;
}

// Transactions
function showTransactions() {

  // Start table
  let html = objOverview.initializeTable(columnWidths);

  // Header

  html += objOverview.showTableHeaderMenu('#e0f0e0', 'center', '', '', '', 'Innbetalinger', '', '');
  html += objOverview.showTableHeaderMenu('#e0f0e0', 'center', '', 'Leilighet', 'Betalingsdato', 'Konto', 'Betaling', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  objTransaction.arrayTransactions.forEach((bankTransaction) => {

    // insert a table row (<tr></td>)
    html += objOverview.insertTableRow('', '');

    // condos
    className = `condo${bankTransaction.transactionId}`;
    html += objCondo.showSelectedCondos(className, '', Number(bankTransaction.condoId), 'Velg leilighet', '', false);

    // date
    const date = formatNumberToNorDate(bankTransaction.date);
    className = `date${bankTransaction.transactionId}`;
    html += objTransaction.editTableCell(className, date, 10, false);

    // account
    className = `account${bankTransaction.transactionId}`;
    html += objAccount.showSelectedAccounts(className, '', Number(bankTransaction.accountId), 'Velg konto', '', false);

    // income - payment
    let income = bankTransaction.income;
    const payment = bankTransaction.payment;
    income += payment;
    income = formatOreToKroner(income);
    className = `income${bankTransaction.transactionId}`;
    html += objTransaction.editTableCell(className, income, 10, false);

    // Text
    const text = bankTransaction.text;
    className = `text${bankTransaction.transactionId}`;
    html += objTransaction.editTableCell(className, text, 45, false);
    html += "</tr>";

    // accumulate
    sumIncomes += Number(bankTransaction.income);
    sumPayments += Number(bankTransaction.payment);
  });

  // Sum row
  sumIncomes += sumPayments;
  sumIncomes = formatOreToKroner(sumIncomes);
  sumPayments = formatOreToKroner(sumPayments);


  html += objOverview.insertTableRow('font-weight: 600;', '', '', '', 'Sum', sumIncomes, '');
  html += "</tr>"

  html += objOverview.insertTableRow('', '', '', '', '', '', '');

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.transactions').innerHTML = html;
}

// show how much to pay
function showHowMuchToPay() {

  // Start table
  let html = objOverview.initializeTable(columnWidths);

  let sumIncome = 0;
  let sumPayment = 0;

  // How much to pay
  let sumToPay = 0;
  objDue.arrayDues.forEach((due) => {

    sumToPay += due.amount;
  });

  // How much is payd
  objTransaction.arrayTransactions.forEach((bankTransaction) => {

    // Accomulate
    sumIncome += Number(bankTransaction.income);
    sumPayment += Number(bankTransaction.payment);
  });

  // show main header
  sumIncome += sumPayment;
  let overPay = sumIncome - sumToPay;

  html += (overPay >= 0)
    ? objOverview.showTableHeaderMenu('#e0f0e0', 'center', '', '', '', 'Til gode', '', '')
    : objOverview.showTableHeaderMenu('#e0f0e0', 'center', '', '', '', 'Skyldig', '', '');

  html += (overPay >= 0)
    ? objOverview.showTableHeaderMenu('#e0f0e0', 'center', '', '', '', 'Forfall', 'Betalt', 'Til gode')
    : objOverview.showTableHeaderMenu('#e0f0e0', 'center', '', '', '', 'Forfall', 'Betalt', 'Skyldig')

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatOreToKroner(overPay);
  sumIncome = formatOreToKroner(sumIncome);
  sumToPay = formatOreToKroner(sumToPay);

  // Show sum
  let toDate = document.querySelector('.filterToDate').value;
  toDate = objOverview.formatDateToNumber(toDate);

  // get current condo id
  let condoId = 0;
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objOverview.userId);
  if (rowNumberUser !== -1) {
    condoId = objUser.arrayUsers[rowNumberUser].condoId;
  }
  let openingBalance = objTransaction.getTransactions(objOverview.condominiumId, condoId, toDate);
  openingBalance += objDue.getDues(objOverview.condominiumId, condoId, toDate);


  openingBalance = formatOreToKroner(openingBalance);
  html += objOverview.insertTableRow('font-weight: 600;', '', '', 'Sum', sumToPay, sumIncome, overPay);

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;


}