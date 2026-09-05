// Search for dues

// Activate objects
const today = new Date();
const objUser = new User('user');
const objDues = new Dues('dues');
const objAccounts = new Accounts('accounts');
const objCondo = new Condo('condo');
const objTransactions = new Transactions('transactions');
const objOverview = new Overview('overview');

const enableChanges = (objOverview.securityLevel > 5);
const applicationName = "condo-overview";

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

            // Show vertical menu
      let html = objOverview.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objOverview.showHorizontalMenu("filter-frame", objOverview.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show due menu
      html = objOverview.showHorizontalMenu("filter-frame", objOverview.arrayMenuDue);
      document.querySelector('.menuDue').innerHTML = html;
      objOverview.markActivatedApplication(objOverview.arrayMenuNews, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objOverview.condominiumId, resident, objOverview.nineNine);
      await objCondo.loadCondoTable(objOverview.condominiumId, objOverview.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objOverview.condominiumId, fixedCost);

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
      await objDues.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC';
      await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, deleted, condoId, objOverview.nineNine, objOverview.nineNine, 0, fromDate, toDate);

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
      //const validCondoId = validateIntervalNew('filterCondoId', columnWidths, '', 'Ugyldig Leilighet', true, condoId, 1, objOverview.nineNine);

      const accountId = objOverview.nineNine;
      const deleted = 'N';

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatISODateToNumber(fromDate);

      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);

      await objDues.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC';
      await objTransactions.loadTransactionsTable(orderBy, objOverview.condominiumId, deleted, condoId, objOverview.nineNine, objOverview.nineNine, 0, fromDate, toDate);

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

// Show filter
function showFilter(condoId) {

   // Start frame
  let html = startFrame('filter-frame');

  // show filter
  //html += startLine();

  // Show condos
  html += objCondo.showSelectedCondosNew('filterCondoId','Leilighet',  condoId, '', 'Vis alle', true);

  // From date
  let fromDate = `${String(today.getFullYear())}-01-01`;
  html += showDate('Fra Dato', 'filterFromDate', fromDate, true)

  // To date
  // Current date
  let toDate = getCurrentISODate();
  html += showDate('Til Dato', 'filterToDate', toDate, true)

  //html += "</div>";

  // End filter
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Show dues
function showDues() {

  // Start HTML table
  let html = objOverview.initializeTable(columnWidths);

  let sumDue = 0;
  let sumKilowattHour = 0;

  // Header

  html += objOverview.showTableHeader( 'center', '', '', '', 'Forfall', '', '');
  html += objOverview.showTableHeader( 'center', 'Forfallsdato', 'Leilighet', 'Konto', 'Beløp', 'Kilowattimer', 'Tekst');

  objDues.arrayDues.forEach((due) => {

    // insert a table row (<tr></td>)
    html += objDues.insertTableRow('');

    // date
    const date = formatNumberToNorDate(due.date);
    className = `date${due.dueId}`;
    html += editTableCell(className, date, 10, false);

    // condo
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondos(className, '', due.condoId, 'Velg leilighet', '', false);

    // account
    className = `account${due.dueId}`;
    html += objAccounts.showSelectedAccounts(className, '', due.accountId, 'Velg konto', '', false);

    // amount
    const amount = formatNumberToNorAmount(due.amount);
    className = `income${due.dueId}`;
    html += editTableCell(className, amount, 11, false);

    // kilowattHour
    const kilowattHour = formatNumberToNorAmount(due.kilowattHour);
    className = `income${due.dueId}`;
    html += editTableCell(className, kilowattHour, 10, false);

    // Text
    const text = due.text;
    className = `text${due.dueId}`;
    html += editTableCell(className, text, 45, false);
    html += "</tr>";

    // accumulate
    sumDue += Number(due.amount);
    sumKilowattHour += Number(due.kilowattHour);
  });

  // Sum row
  sumDue = formatNumberToNorAmount(sumDue);
  sumKilowattHour = formatNumberToNorAmount(sumKilowattHour);

  html += objOverview.insertTableRow('font-weight: 600;', '', '', 'Sum', sumDue, '', '');
  html += "</tr>"

  html += objOverview.insertTableRow('', '', '', '', '', '', '');
  html += "</tr>"

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.showDues').innerHTML = html;
}

// Transactions
function showTransactions() {

  // Start table
  let html = objOverview.initializeTable(columnWidths);

  // Header

  html += objOverview.showTableHeader( 'center', '', '', '', 'Innbetalinger', '', '');
  html += objOverview.showTableHeader('center', '', 'Leilighet', 'Betalingsdato', 'Konto', 'Betaling', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  objTransactions.arrayTransactions.forEach((bankTransaction) => {

    // insert a table row (<tr></td>)
    html += objOverview.insertTableRow('', '');

    // condos
    className = `condo${bankTransaction.transactionId}`;
    html += objCondo.showSelectedCondos(className, '', Number(bankTransaction.condoId), 'Velg leilighet', '', false);

    // date
    const date = formatNumberToNorDate(bankTransaction.date);
    className = `date${bankTransaction.transactionId}`;
    html += editTableCell(className, date, 10, false);

    // account
    className = `account${bankTransaction.transactionId}`;
    html += objAccounts.showSelectedAccounts(className, '', Number(bankTransaction.accountId), 'Velg konto', '', false);

    // income - payment
    let income = bankTransaction.income;
    const payment = bankTransaction.payment;
    income += payment;
    income = formatNumberToNorAmount(income);
    className = `income${bankTransaction.transactionId}`;
    html += editTableCell(className, income, 10, false);

    // Text
    const text = bankTransaction.text;
    className = `text${bankTransaction.transactionId}`;
    html += editTableCell(className, text, 45, false);
    html += "</tr>";

    // accumulate
    sumIncomes += Number(bankTransaction.income);
    sumPayments += Number(bankTransaction.payment);
  });

  // Sum row
  sumIncomes += sumPayments;
  sumIncomes = formatNumberToNorAmount(sumIncomes);
  sumPayments = formatNumberToNorAmount(sumPayments);


  html += objOverview.insertTableRow('font-weight: 600;', '', '', '', 'Sum', sumIncomes, '');
  html += "</tr>"

  html += objOverview.insertTableRow('', '', '', '', '', '', '');

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.showTransactions').innerHTML = html;
}

// show how much to pay
function showHowMuchToPay() {

  // Start table
  let html = objOverview.initializeTable(columnWidths);

  let sumIncome = 0;
  let sumPayment = 0;

  // How much to pay
  let sumToPay = 0;
  objDues.arrayDues.forEach((due) => {

    sumToPay += due.amount;
  });

  // How much is payd
  objTransactions.arrayTransactions.forEach((bankTransaction) => {

    // Accomulate
    sumIncome += Number(bankTransaction.income);
    sumPayment += Number(bankTransaction.payment);
  });

  // show main header
  sumIncome += sumPayment;
  let overPay = sumIncome - sumToPay;

  html += (overPay >= 0)
    ? objOverview.showTableHeader('center', '', '', '', 'Til gode', '', '')
    : objOverview.showTableHeader( 'center', '', '', '', 'Skyldig', '', '');

  html += (overPay >= 0)
    ? objOverview.showTableHeader( 'center', '', '', '', 'Forfall', 'Betalt', 'Til gode')
    : objOverview.showTableHeader( 'center', '', '', '', 'Forfall', 'Betalt', 'Skyldig')

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatNumberToNorAmount(overPay);
  sumIncome = formatNumberToNorAmount(sumIncome);
  sumToPay = formatNumberToNorAmount(sumToPay);

  // Show sum
  let toDate = document.querySelector('.filterToDate').value;
  toDate = objOverview.formatDateToNumber(toDate);

  // get current condo id
  let condoId = 0;
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objOverview.userId);
  if (rowNumberUser !== -1) {
    condoId = objUser.arrayUsers[rowNumberUser].condoId;
  }
  let openingBalance = objTransactions.getTransactions(objOverview.condominiumId, condoId, toDate);
  openingBalance += objDues.getDues(objOverview.condominiumId, condoId, toDate);


  openingBalance = formatNumberToNorAmount(openingBalance);
  html += objOverview.insertTableRow('font-weight: 600;', '', '', 'Sum', sumToPay, sumIncome, overPay);

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;
}