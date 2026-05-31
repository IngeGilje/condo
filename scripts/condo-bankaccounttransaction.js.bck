// Bank account transaction search

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objCondominium = new Condominium('scondominium');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');

const enableChanges = (objAccount.securityLevel > 5);

const columnWidths = [175, 175, 175, 175, 175, 100, 100];

const params = new URLSearchParams(window.location.search);
const paramCondoId = Number(params.get("condoId"));
const paramAccountId = Number(params.get("accountId"));
const paramBankAccountTransactionId = Number(params.get("bankAccountTransactionId"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objBankAccountTransaction.condominiumId === 0) || (objBankAccountTransaction.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show horizonal menu
      let html = objBankAccountTransaction.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objBankAccountTransaction.condominiumId, resident, objBankAccountTransaction.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objBankAccountTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objBankAccountTransaction.condominiumId, objBankAccountTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objBankAccountTransaction.condominiumId, objBankAccountTransaction.nineNine, objBankAccountTransaction.nineNine);
      await objCondo.loadCondoTable(objBankAccountTransaction.condominiumId, objBankAccountTransaction.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(objBankAccountTransaction.condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      let condoId = 0;
      if (paramCondoId === 0) {

        const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objBankAccountTransaction.userId);
        if (rowNumberUser !== -1) condoId = objUser.arrayUsers[rowNumberUser].condoId;
      } else {

        condoId = paramCondoId;
      }

      let accountId = (paramAccountId === 0)
        ? objBankAccountTransaction.nineNine
        : paramAccountId;
      menuNumber = showFilter(menuNumber, objBankAccountTransaction.nineNine, accountId);

      const amount = Number(document.querySelector('.filterAmount').value);
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      // Show result of filter
      menuNumber = showBankAccountTransactions(menuNumber);

      // Events
      events();
    }
  } else {

    objBankAccountTransaction.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Make Bank account transactions events
async function events() {

  // Show bankaccounttransactions after change of filter
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterCondoId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAccountId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAmount'))) {

      // Show bankaccounttransactions after change of filter
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
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      showBankAccountTransactions(3);
    };
  });

  /*
  // update a bankAccountTransactions row
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
        .map(prefix => objBankAccountTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let bankAccountTransactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransactionId = Number(className.slice(prefix.length));
      }

      // Update a bankAccountTransactions row
      updateBankAccountTransactionRow(bankAccountTransactionId);
    };
  });
  */

  /*
  // Delete a bankaccounttransactions row
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBankAccountTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let bankAccountTransactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransactionId = Number(className.slice(prefix.length));
      }

      await deleteBankAccountTransactionRow(bankAccountTransactionId, className);

      const amount = 0;
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      showBankAccountTransactions(3);
    };
  });
  */

  // Show bank voucher
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {

      const arrayPrefixes = ['voucher'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBankAccountTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let bankAccountTransactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransactionId = Number(className.slice(prefix.length));
      }

      let URL = (objBankAccountTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value)
      URL = `${URL}condo-voucher.html?bankAccountTransactionId=${bankAccountTransactionId}&condoId=${condoId}&accountId=${accountId}`;
      window.location.href = URL;
    };
  });

  // Edit bank account transaction
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('edit'))) {

      const arrayPrefixes = ['edit'];

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objBankAccountTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let bankAccountTransactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransactionId = Number(className.slice(prefix.length));
      }

      let URL = (objBankAccountTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';

      className = `.condoId${bankAccountTransactionId}`;
      const condoId = Number(document.querySelector(className).value);
      className = `.accountId${bankAccountTransactionId}`;
      const accountId = Number(document.querySelector(className).value);
      className = `.date${bankAccountTransactionId}`;
      let date = document.querySelector(className).value;
      date = convertDateToISOFormat(date);
      className = `.amount${bankAccountTransactionId}`;
      let amount = document.querySelector(className).value;
      amount = formatKronerToOre(amount);

      URL = `${URL}condo-transaction.html?bankAccountTransactionId=${bankAccountTransactionId}&condoId=${condoId}&accountId=${accountId}&date=${date}&amount=${amount}`;
      window.location.href = URL;
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let URL = (objBankAccountTransaction.serverStatus === 1)
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
  let html = objBankAccountTransaction.initializeTable(columnWidths);

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // show main header
  html += objBankAccountTransaction.showTableHeaderLogOut('1', '2', '3', '4Bankkontotransaksjoner', '5', '6');
  html += "</tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, condoId, accountId) {

  // Start table
  let html = objBankAccountTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu(menuNumber, objBankAccountTransaction.accountMenu, '', '2Leilighet', '3Konto', '4Fra dato', '5Til dato', '6Beløp', '7');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccountTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

  // Show selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', 'Vis alle', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', 'width:175px;', accountId, '', 'Vis alle', true);

  // show from date
  let month = today.getMonth() + 1;
  month = (month < 10) ? `0${month}` : `${month}`;
  const fromDate = '01.' + month + '.' + String(today.getFullYear());
  html += objBankAccountTransaction.inputTableColumn('filterFromDate', 'left', fromDate, 10, true);

  // Current date
  let toDate = getCurrentDate();
  html += objBankAccountTransaction.inputTableColumn('filterToDate', 'left', toDate, 10, true);

  // Amount
  html += objBankAccountTransaction.inputTableColumn('filterAmount', 'left', '', 10, true);

  html += "<td>7</td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objBankAccountTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2', '3', '4', '5', '6', '7');

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show bankaccountransactions
async function showBankAccountTransactions(menuNumber) {

  // Start table
  let html = objBankAccountTransaction.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '#e0f0e0', '2Leilighet', '3Dato', '4Konto', '5Beløp', '6', '7');
  let sumIncome = 0;
  let sumPayment = 0;

  //objBankAccountTransaction.arrayBankAccountTransactions.forEach(async (bankAccountTransaction) => {
  for (const bankAccountTransaction of objBankAccountTransaction.arrayBankAccountTransactions) {

    //html += '<tr>';

    // Show menu
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

    // condos
    let className = `condoId${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondos(className, 'width:175px;', bankAccountTransaction.condoId, 'Ingen leilighet', '', enableChanges);

    // Date
    const date = formatNumberToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', date, 10, false);

    // accounts
    className = `accountId${bankAccountTransaction.bankAccountTransactionId}`;

    // Mark invalid account red
    html += (bankAccountTransaction.accountId === 0)
      ? objAccount.showSelectedAccounts(className, 'width:175px;', bankAccountTransaction.accountId, 'Velg konto', '', enableChanges)
      : objAccount.showSelectedAccounts(className, 'width:175px;', bankAccountTransaction.accountId, 'Velg konto', '', enableChanges);

    /*
    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', income, 10, false);
  
    // payment
    const payment = formatOreToKroner(bankAccountTransaction.payment);
    className = `payment${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', payment, 10, false);
    */

    // amount
    let amount = bankAccountTransaction.income + bankAccountTransaction.payment;
    amount = formatOreToKroner(amount);
    className = `amount${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', amount, 10, false);

    /*
    // text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', text, 45, enableChanges);
    */

    // validate voucher filename
    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objBankAccountTransaction.condominiumId);
    if (rowNumberCondominium !== -1) {
      const path = objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
      const voucherFileName = `${path}${bankAccountTransaction.bankAccountTransactionId}.pdf`;

      /*
      // Check if the file exist
      if (await objBankAccountTransaction.checkIfFileExist(voucherFileName)) {

        // Show button if the file exist
        className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
        html += objBankAccountTransaction.showButton(className, 'Vis bilag');
      } else {

        // Show empty column if the file does not exist
        className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
        html += objBankAccountTransaction.showButton(className, 'Vis bilag');
      }
      */
      // Show button for voucher
      className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
      html += objBankAccountTransaction.showButton(className, 'Vis bilag');

      // Show button for editing bank account transaction
      className = `edit${bankAccountTransaction.bankAccountTransactionId}`;
      html += objBankAccountTransaction.showButton(className, 'Endre');

    } else {

      html += "<td></td>";
    }

    html += "</tr>";

    // accumulate
    sumIncome += Number(bankAccountTransaction.income);
    sumPayment += Number(bankAccountTransaction.payment);
  };

  // Show table sum row
  sumIncome = formatOreToKroner(sumIncome);
  sumPayment = formatOreToKroner(sumPayment);

  menuNumber++;
  html += objBankAccountTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2', '3', '4Sum', sumIncome, sumPayment, '7');

  // Show the rest of the menu
  menuNumber++;
  html += objBankAccountTransaction.showRestMenu(menuNumber, objBankAccountTransaction.accountMenu, '2', '3', '4', '5', '6', '7');

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.result').innerHTML = html;
}

/*
// Delete bankaccounttransactions row
async function deleteBankAccountTransactionRow(bankAccountTransactionId, className) {

  // Check if bankAccountTransactions row exist
  const bankAccountTransactionsRowNumber = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankaccounttransaction => bankaccounttransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (bankAccountTransactionsRowNumber !== -1) {

    // delete bankaccounttransaction row
    await objBankAccountTransaction.deleteBankAccountTransactionsTable(bankAccountTransactionId, objBankAccountTransaction.user);
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
  await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);
}
*/