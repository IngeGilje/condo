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

const columnWidths = [175, 175, 100, 175, 175, 175, 175];

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
      let html = objOverview.ShowHorizontalMenu(objOverview.arrayMainMenu);
      document.querySelector('.mainMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objOverview.condominiumId, resident, objOverview.nineNine);
      await objCondo.loadCondoTable(objOverview.condominiumId, objOverview.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objOverview.condominiumId, fixedCost);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      // get current condo id
      let condoId = 0;
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objOverview.userId);
      if (rowNumberUser !== -1) {
        condoId = objUser.arrayUsers[rowNumberUser].condoId;
      }
      menuNumber = editFilter(menuNumber, condoId);

      condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = objOverview.nineNine;
      const deleted = 'N';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatNorDateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatNorDateToNumber(toDate);
      await objDue.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, objOverview.nineNine, objOverview.nineNine, 0, fromDate, toDate);

      // Show dues
      menuNumber = showDues(menuNumber);

      // Transactions
      menuNumber = showTransactions(menuNumber);

      // show how much to pay
      menuNumber = showHowMuchToPay(menuNumber);

      // Events
      events();
    }
  } else {

    objOverview.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Create overview events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterCondoId')
      || event.target.classList.contains('filterFromDate')
      || event.target.classList.contains('filterToDate')) {

      // valitadate filter
      // condo
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const validCondoId = objOverview.validateInterval('filterCondoId', columnWidths, '', 'Ugyldig leilighet', true, condoId, 1, objOverview.nineNine);

      // from date
      let fromDate = document.querySelector('.filterFromDate').value;
      const validFromDate = objOverview.validateNorDate('filterFromDate', fromDate, objOverview, '', 'Ugyldig fra dato');

      // to date
      let toDate = document.querySelector('.filterToDate').value;
      const validToDate = objOverview.validateNorDate('filterToDate', toDate, objOverview, '', 'Ugyldig til dato');

      if (validFromDate && validToDate && validCondoId) {

        const condoId = Number(document.querySelector('.filterCondoId').value);
        const accountId = objOverview.nineNine;
        const deleted = 'N';
        let fromDate = document.querySelector('.filterFromDate').value;
        fromDate = formatNorDateToNumber(fromDate);
        let toDate = document.querySelector('.filterToDate').value;
        toDate = formatNorDateToNumber(toDate);
        await objDue.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objTransaction.loadTransactionsTable(orderBy, objOverview.condominiumId, deleted, condoId, objOverview.nineNine, objOverview.nineNine, 0, fromDate, toDate);

        // Show result

        // Show dues
        let menuNumber = 3;
        menuNumber = showDues(menuNumber);

        // Transactions
        menuNumber = showTransactions(menuNumber);

        // show how much to pay
        menuNumber = showHowMuchToPay(menuNumber);
      }
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
  html += objOverview.showTableHeaderLogOut('', '', '', 'Betalingsoversikt', '', '');
  html += "</tr>";

  // end table body
  html += objOverview.endTableBody();

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function editFilter(menuNumber, condoId) {

  // Start table
  let html = objOverview.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '', 'center', '', 'Leilighet', 'Fra dato', 'Til dato', '', '');

  // start table body
  html += objOverview.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objOverview.insertTableRow('', menuNumber, objOverview.accountMenu, '');

  // Show selected condos
  html += objCondo.showSelectedCondos('filterCondoId', '', condoId, 'Velg leilighet', '', true);

  // from date
  const year = String(today.getFullYear());
  let fromDate = "01.01." + year;
  html += objOverview.editTableCell('filterFromDate', fromDate, 10, true);

  // to date
  let toDate = getCurrentDate();
  html += objOverview.editTableCell('filterToDate', toDate, 10, true);

  html += "<td></td><td></td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objOverview.insertTableRow('', menuNumber, objOverview.accountMenu, '', '', '', '', '', '');
  html += "</tr>";

  // end table body
  html += objOverview.endTableBody();

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.editFilter').innerHTML = html;

  return menuNumber;
}

// Show dues
function showDues(menuNumber) {

  // Start HTML table
  let html = objOverview.initializeTable(columnWidths);

  let sumDue = 0;
  let sumKilowattHour = 0;

  // Header
  menuNumber++;
  html += objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', '', '', 'Forfall', '', '', '');

  menuNumber++;
  html += objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', 'Leilighet', 'Forfallsdato', 'Konto', 'Beløp', 'Kilowattimer', 'Tekst');

  objDue.arrayDues.forEach((due) => {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objDue.insertTableRow('', menuNumber, objOverview.accountMenu);

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

  menuNumber++;
  html += objOverview.insertTableRow('font-weight: 600;', menuNumber, objOverview.accountMenu, '', '', 'Sum', sumDue, '', '');
  html += "</tr>"

  menuNumber++;
  html += objOverview.insertTableRow('', menuNumber, objOverview.accountMenu, '', '', '', '', '', '');
  html += "</tr>"

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.dues').innerHTML = html;
  return menuNumber;
}

// Transactions
function showTransactions(menuNumber) {

  // Start table
  let html = objOverview.initializeTable(columnWidths);

  // Header
  menuNumber++;
  html += objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', '', '', 'Innbetalinger', '', '', '');

  menuNumber++;
  html += objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', '', 'Leilighet', 'Betalingsdato', 'Konto', 'Betaling', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  objTransaction.arrayTransactions.forEach((bankTransaction) => {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objOverview.insertTableRow('', menuNumber, objOverview.accountMenu, '');

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

  menuNumber++;
  html += objOverview.insertTableRow('font-weight: 600;', menuNumber, objOverview.accountMenu, '', '', '', 'Sum', sumIncomes, '');
  html += "</tr>"

  menuNumber++;
  html += objOverview.insertTableRow('', menuNumber, objOverview.accountMenu, '', '', '', '', '', '');

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.transactions').innerHTML = html;

  return menuNumber;
}

// show how much to pay
function showHowMuchToPay(menuNumber) {

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
  menuNumber++;
  html += (overPay >= 0)
    ? objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', '', '', 'Til gode', '', '', '')
    : objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', '', '', 'Skyldig', '', '', '');
  menuNumber++;
  html += (overPay >= 0)
    ? objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', '', '', '', 'Forfall', 'Betalt', 'Til gode')
    : objOverview.showTableHeaderMenu(menuNumber, objOverview.accountMenu, '#e0f0e0', 'center', '', '', '', 'Forfall', 'Betalt', 'Skyldig')

  // Sum line
  if (overPay < 0) overPay = (overPay * -1);
  overPay = formatOreToKroner(overPay);
  sumIncome = formatOreToKroner(sumIncome);
  sumToPay = formatOreToKroner(sumToPay);

  // Show sum
  let toDate = document.querySelector('.filterToDate').value;
  toDate = formatNorDateToNumber(toDate);

  // get current condo id
  let condoId = 0;
  const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objOverview.userId);
  if (rowNumberUser !== -1) {
    condoId = objUser.arrayUsers[rowNumberUser].condoId;
  }
  let openingBalance = objTransaction.getTransactions(objOverview.condominiumId, condoId, toDate);
  openingBalance += objDue.getDues(objOverview.condominiumId, condoId, toDate);

  menuNumber++;
  openingBalance = formatOreToKroner(openingBalance);
  html += objOverview.insertTableRow('font-weight: 600;', menuNumber, objOverview.accountMenu, '', '', 'Sum', sumToPay, sumIncome, overPay);

  // Show the rest of the menu
  menuNumber++;
  html += objOverview.showRestMenu(menuNumber, objOverview.accountMenu, '', '', '', '', '', '');

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;

  return menuNumber;
}