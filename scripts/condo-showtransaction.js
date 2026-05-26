// Show bank account transactions

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objCondominium = new Condominium('scondominium');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objTransaction = new Transaction('transaction');
const objShowTransaction = new ShowTransaction('showtransaction');

const enableChanges = (objAccount.securityLevel > 5);

const columnWidths = [175, 175, 175, 175, 175, 100, 100];

const params = new URLSearchParams(window.location.search);
const paramCondoId = Number(params.get("condoId"));
const paramAccountId = Number(params.get("accountId"));
const paramTransactionId = Number(params.get("transactionId"));

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

      // Show horizonal menu
      let html = objTransaction.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objTransaction.condominiumId, resident, objTransaction.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine, objTransaction.nineNine);
      await objCondo.loadCondoTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(objTransaction.condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      let condoId = 0;
      if (paramCondoId === 0) {

        const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objTransaction.userId);
        if (rowNumberUser !== -1) condoId = objUser.arrayUsers[rowNumberUser].condoId;
      } else {

        condoId = paramCondoId;
      }

      let accountId = (paramAccountId === 0)
        ? objTransaction.nineNine
        : paramAccountId;
      menuNumber = showFilter(menuNumber, objTransaction.nineNine, accountId);

      const amount = Number(document.querySelector('.filterAmount').value);
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      // Show result of filter
      menuNumber = showTransactions(menuNumber);

      // Events
      events();
    }
  } else {

    objTransaction.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Make Transactions events
async function events() {

  // Show transactions after change of filter
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterCondoId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAccountId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAmount'))) {

      // Show transactions after change of filter
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));

      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));

      let amount = document.querySelector('.filterAmount').value;
      amount = formatKronerToOre(amount);

      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      showTransactions(3);
    };
  });

  /*
  // update a transactions row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['condoId', 'accountId',  'text', 'date',
      'income', 'payment'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[4]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[5]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[6]))) {

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

      // Update a transactions row
      updateTransactionRow(transactionId);
    };
  });
  */

  /*
  // Delete a transactions row
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

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

      await deleteTransactionRow(transactionId, className);

      const amount = 0;
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      showTransactions(3);
    };
  });
  */

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

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value)
      URL = `${URL}condo-voucher.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}`;
      window.location.href = URL;
    };
  });

  // Edit transaction
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('edit'))) {

      const arrayPrefixes = ['edit'];

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';

      className = `.condoId${transactionId}`;
      const condoId = Number(document.querySelector(className).value);
      className = `.accountId${transactionId}`;
      const accountId = Number(document.querySelector(className).value);
      className = `.date${transactionId}`;
      let date = document.querySelector(className).value;
      date = convertDateToISOFormat(date);
      className = `.amount${transactionId}`;
      let amount = document.querySelector(className).value;
      amount = formatKronerToOre(amount);

      URL = `${URL}condo-transaction.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}&date=${date}&amount=${amount}`;
      window.location.href = URL;
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-login.html`;
      window.location.href = URL;
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // start table body
  html += objTransaction.startTableBody();

  // show main header
  html += objTransaction.showTableHeaderLogOut('1', '2', '3', '4Bankkontotransaksjoner', '5', '6');
  html += "</tr>";

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, condoId, accountId) {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objTransaction.showTableHeaderMenu(menuNumber, objTransaction.accountMenu, '', '2Leilighet', '3Konto', '4Fra dato', '5Til dato', '6Beløp', '7');

  // start table body
  html += objTransaction.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

  // Show selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', 'Vis alle', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', 'width:175px;', accountId, '', 'Vis alle', true);

  // show from date
  let month = today.getMonth() + 1;
  month = (month < 10) ? `0${month}` : `${month}`;
  const fromDate = '01.' + month + '.' + String(today.getFullYear());
  html += objTransaction.inputTableCell('filterFromDate', 'left', fromDate, 10, true);

  // Current date
  let toDate = getCurrentDate();
  html += objTransaction.inputTableCell('filterToDate', 'left', toDate, 10, true);

  // Amount
  html += objTransaction.inputTableCell('filterAmount', 'left', '', 10, true);

  html += "<td>7</td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2', '3', '4', '5', '6', '7');

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show transactions
async function showTransactions(menuNumber) {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '#e0f0e0', '2Leilighet', '3Konto', '4Dato', '5Beløp', '6', '7');
  let sumAmount = 0;

  //objTransaction.arrayTransactions.forEach(async (bankTransaction) => {
  for (const bankTransaction of objTransaction.arrayTransactions) {

    //html += '<tr>';

    // Show menu
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber, objTransaction.accountMenu);

    // condos
    let className = `condoId${bankTransaction.transactionId}`;
    html += objCondo.showSelectedCondos(className, 'width:175px;', bankTransaction.condoId, 'Ingen leilighet', '', false);

    // account
    className = `accountId${bankTransaction.transactionId}`;
    html += objAccount.showSelectedAccounts(className, 'width:175px;', bankTransaction.accountId, 'Velg konto', '', false);

    // Date
    const date = formatNumberToNorDate(bankTransaction.date);
    className = `date${bankTransaction.transactionId}`;
    html += objTransaction.inputTableCell(className, 'left', date, 10, false);

    // accounts
    className = `accountId${bankTransaction.transactionId}`;

    objAccount.showSelectedAccounts(className, 'width:175px;', bankTransaction.accountId, 'Velg konto', '', false);

    /*
    // income
    const income = formatOreToKroner(bankTransaction.income);
    className = `income${bankTransaction.transactionId}`;
    html += objTransaction.inputTableCell(className, 'left', income, 10, false);
  
    // payment
    const payment = formatOreToKroner(bankTransaction.payment);
    className = `payment${bankTransaction.transactionId}`;
    html += objTransaction.inputTableCell(className, 'left', payment, 10, false);
    */

    // amount
    let amount = bankTransaction.income + bankTransaction.payment;
    amount = formatOreToKroner(amount);
    className = `amount${bankTransaction.transactionId}`;
    html += objTransaction.inputTableCell(className, 'left', amount, 10, false);

    // validate voucher filename
    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objTransaction.condominiumId);
    if (rowNumberCondominium !== -1) {
      const path = objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
      const voucherFileName = `${path}${bankTransaction.transactionId}.pdf`;

      /*
      // Check if the file exist
      if (await objTransaction.checkIfFileExist(voucherFileName)) {

        // Show button if the file exist
        className = `voucher${bankTransaction.transactionId}`;
        html += objTransaction.showButton(className, 'Vis bilag');
      } else {

        // Show empty column if the file does not exist
        className = `voucher${bankTransaction.transactionId}`;
        html += objTransaction.showButton(className, 'Vis bilag');
      }
      */
      // Show button for voucher
      className = `voucher${bankTransaction.transactionId}`;
      html += objTransaction.showButton(className, 'Vis bilag');

      // Show button for editing transaction
      className = `edit${bankTransaction.transactionId}`;
      html += objTransaction.showButton(className, 'Endre');

    } else {

      html += "<td></td>";
    }

    html += "</tr>";

    // accumulate
    sumAmount += Number(bankTransaction.income) + Number(bankTransaction.payment);
  };

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2', '3', '4Sum', sumAmount, '6', '7');

  // Show the rest of the menu
  menuNumber++;
  html += objTransaction.showRestMenu(menuNumber, objTransaction.accountMenu, '2', '3', '4', '5', '6', '7');

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.result').innerHTML = html;
}

/*
// Delete transactions row
async function deleteTransactionRow(transactionId, className) {

  // Check if transactions row exist
  const transactionsRowNumber = objTransaction.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
  if (transactionsRowNumber !== -1) {

    // delete transaction row
    await objTransaction.deleteTransactionsTable(transactionId, objTransaction.user);
  }
  const amount = 0;
  const deleted = 'N';
  condoId = Number(document.querySelector('.filterCondoId').value);
  accountId = Number(document.querySelector('.filterAccountId').value);

  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(convertDateToISOFormat(fromDate));

  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(convertDateToISOFormat(toDate));

  const orderBy = 'date DESC, income DESC';
  await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);
}
*/