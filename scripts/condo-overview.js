// Search for dues

// Activate objects
const today = new Date();
const objUser = new User('user');
const objDue = new Due('due');
const objAccount = new Account('account');
const objCondo = new Condo('condo');
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');
const objOverview = new Overview('overview');

const enableChanges = (objOverview.securityLevel > 5);

const tableWidth = 'width:1250px;';

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
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objOverview.condominiumId, resident, objOverview.nineNine);
      await objCondo.loadCondoTable(objOverview.condominiumId);
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
      menuNumber = showFilter(menuNumber, condoId);

      condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = objOverview.nineNine;
      const deleted = 'N';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = convertDateToISOFormat(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = convertDateToISOFormat(toDate);
      await objDue.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
      const orderBy = 'condoId ASC, date DESC, income ASC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, deleted, condoId, objOverview.nineNine, 0, fromDate, toDate);

      // Show dues
      menuNumber = showDues(menuNumber);

      // Bank account transactions
      menuNumber = showBankAccountTransactions(menuNumber);

      // show how much to pay
      menuNumber = showHowMuchToPay(menuNumber);

      // Events
      events();
    }
  } else {

    objOverview.showMessage(objOverview, '', 'Server er ikke startet.');
  }
}

// Create overview events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('filter'))) {

      // valitadate filter
      // condo
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const validCondoId = objOverview.validateNumber('filterCondoId', condoId, 1, objOverview.nineNine, objOverview, '', 'Ugyldig leilighet');

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
        fromDate = convertDateToISOFormat(fromDate);
        let toDate = document.querySelector('.filterToDate').value;
        toDate = convertDateToISOFormat(toDate);
        await objDue.loadDuesTable(objOverview.condominiumId, accountId, condoId, fromDate, toDate);
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objOverview.condominiumId, deleted, condoId, objOverview.nineNine, 0, fromDate, toDate);

        // Show result

        // Show dues
        let menuNumber = 3;
        menuNumber = showDues(menuNumber);

        // Bank account transactions
        menuNumber = showBankAccountTransactions(menuNumber);

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
  let html = objOverview.startTable(tableWidth);

  // start table body
  html += objOverview.startTableBody();

  // show main header
  html += objOverview.showTableHeaderLogOut('width:175px;', '', '', '', '', 'Betalingsoversikt', '', '', '');
  html += "</tr>";

  // end table body
  html += objOverview.endTableBody();

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, condoId) {

  // Start table
  let html = objOverview.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;', menuNumber, '', 'Velg leilighet', 'Fra dato', 'Til dato', '', '');

  // start table body
  html += objOverview.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objOverview.insertTableColumns('', menuNumber, '');

  // Show all selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', '', true);

  // from date
  const year = String(today.getFullYear());
  let fromDate = "01.01." + year;
  html += objOverview.inputTableColumn('filterFromDate', '', fromDate, 10, CSSViewTransitionRule);

  // to date
  let toDate = getCurrentDate();
  html += objOverview.inputTableColumn('filterToDate', '', toDate, 10, true);

  html += "<td></td><td></td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objOverview.insertTableColumns('', menuNumber, '');

  // end table body
  html += objOverview.endTableBody();

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show dues
function showDues(menuNumber) {

  // Start HTML table
  let html = objOverview.startTable(tableWidth);

  let sumDue = 0;
  let sumKilowattHour = 0;

  // Header
  menuNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', 'Forfall', '', '', '');
  menuNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Leilighet', 'Forfallsdato', 'Konto', 'Beløp', 'Kilowattimer', 'Tekst');

  objDue.arrayDues.forEach((due) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objDue.insertTableColumns('', menuNumber);

    // condo
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondos(className, '', due.condoId, 'Velg leilighet', '', false);

    // date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', date, 10, false);

    // account
    className = `account${due.dueId}`;
    html += objAccount.showSelectedAccounts(className, '', due.accountId, 'Velg konto', '', false);

    // amount
    const amount = formatOreToKroner(due.amount);
    className = `income${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', amount, 10, false);

    // kilowattHour
    const kilowattHour = formatOreToKroner(due.kilowattHour);
    className = `income${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', kilowattHour, 10, false);

    // Text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objOverview.inputTableColumn(className, '', text, 45, false);

    html += "</tr>";

    // accumulate
    sumDue += Number(due.amount);
    sumKilowattHour += Number(due.kilowattHour);
  });

  // Sum row
  sumDue = formatOreToKroner(sumDue);
  sumKilowattHour = formatOreToKroner(sumKilowattHour);

  menuNumber++;
  html += objOverview.insertTableColumns('font-weight: 600;', menuNumber, '', '', 'Sum', sumDue, '', '');
  html += "</tr>"

  menuNumber++;
  html += objOverview.insertTableColumns('', menuNumber, '', '', '', '', '', '');
  html += "</tr>"

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.dues').innerHTML = html;
  return menuNumber;
}

// Bank account transactions
function showBankAccountTransactions(menuNumber) {

  // Start table
  let html = objOverview.startTable(tableWidth);

  // Header
  menuNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', '', 'Innbetalinger', '', '');
  menuNumber++;
  html += objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', 'Leilighet', 'Betalingsdato', 'Konto', 'Betaling', 'Tekst');

  let sumIncomes = 0;
  let sumPayments = 0;

  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objDue.insertTableColumns('', menuNumber, '');

    // condos
    className = `condo${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondos(className, '', Number(bankAccountTransaction.condoId), 'Velg leilighet', '', false);

    // date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, '', date, 10, false);

    // account
    className = `account${bankAccountTransaction.bankAccountTransactionId}`;
    html += objAccount.showSelectedAccounts(className, '', Number(bankAccountTransaction.accountId), 'Velg konto', '', false);

    // income - payment
    let income = bankAccountTransaction.income;
    const payment = bankAccountTransaction.payment;
    income += payment;
    income = formatOreToKroner(income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, '', income, 10, false);

    // Text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, '', text, 45, false);

    html += "</tr>";

    // accumulate
    sumIncomes += Number(bankAccountTransaction.income);
    sumPayments += Number(bankAccountTransaction.payment);
  });

  // Sum row
  sumIncomes += sumPayments;
  sumIncomes = formatOreToKroner(sumIncomes);
  sumPayments = formatOreToKroner(sumPayments);

  menuNumber++;
  html += objOverview.insertTableColumns('font-weight: 600;', menuNumber, '', '', '', 'Sum', sumIncomes, '');
  html += "</tr>"

  menuNumber++;
  html += objOverview.insertTableColumns('', menuNumber, '', '', '', '', '', '');

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.bankAccountTransactions').innerHTML = html;

  return menuNumber;
}

// show how much to pay
async function showHowMuchToPay(menuNumber) {

  // Start table
  let html = objOverview.startTable(tableWidth);

  let sumIncome = 0;
  let sumPayment = 0;

  // How much to pay
  let sumToPay = 0;
  objDue.arrayDues.forEach((due) => {

    sumToPay += due.amount;
  });

  // How much is payd
  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    // Accomulate
    sumIncome += Number(bankAccountTransaction.income);
    sumPayment += Number(bankAccountTransaction.payment);
  });

  // show main header
  sumIncome += sumPayment;
  let overPay = sumIncome - sumToPay;
  menuNumber++;
  html += (overPay >= 0)
    ? objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', '', 'Til gode', '', '')
    : objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', '', 'Skyldig', '', '');
  menuNumber++;
  html += (overPay >= 0)
    ? objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', 'IB', 'Forfall', 'Betalt', 'Til gode')
    : objOverview.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', '', 'IB', 'Forfall', 'Betalt', 'Skyldig');

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
  let openingBalance = await objBankAccountTransaction.getBankAccountTransactions(objOverview.condominiumId, condoId, toDate);
  openingBalance += await objDue.getDues(objOverview.condominiumId, condoId, toDate);

  menuNumber++;
  openingBalance = formatOreToKroner(openingBalance);
  html += objOverview.insertTableColumns('font-weight: 600;', menuNumber, '', '', 'Sum', sumToPay, sumIncome, overPay);

  // Show the rest of the menu
  menuNumber++;
  html += objOverview.showRestMenu(menuNumber);

  // The end of the table
  html += objOverview.endTable();
  document.querySelector('.howMuchToPay').innerHTML = html;

  return menuNumber;
}