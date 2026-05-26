// Maintain Bank account movements script

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objCondominium = new Condominium('scondominium');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objProject = new Project('project');
const objTransaction = new Transaction('transaction');

const enableChanges = (objAccount.securityLevel > 5);

const columnWidths = [175, 175, 175, 175];

const params = new URLSearchParams(window.location.search);
const paramCondoId = Number(params.get("condoId"));
const paramAccountId = Number(params.get("accountId"));
const paramDate = Number(params.get("date"));
const paramAmount = Number(params.get("amount"));
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
      await objProject.loadProjectsTable(objTransaction.condominiumId);

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

      // Show filter
      menuNumber = showFilter(menuNumber, paramCondoId, paramAccountId, paramDate, paramAmount);

      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', paramCondoId, paramAccountId, paramAmount, paramDate, paramDate);

      // Show account movements
      menuNumber = showTransactions(menuNumber, paramTransactionId);

      // Show account movement
      menuNumber = showTransaction(menuNumber, paramTransactionId);

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
      if (accountId === 0) accountId = objTransaction.nineNine;

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));

      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));

      let amount = document.querySelector('.filterAmount').value;
      amount = formatKronerToOre(amount);

      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      menuNumber = 3;
      menuNumber = showTransactions(menuNumber, transactionId);
      menuNumber = showTransaction(menuNumber, transactionId);
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const transactionId = Number(document.querySelector('.filterTransactionId').value);
      updateTransactionRow(transactionId);
    };
  });

  // Delete a transactions row
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      await deleteTransactionRow();

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

      showTransaction(3, transactionId);
    };
  });

  // Back
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('back')) {

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const transactionId = document.querySelector('.filterTransactionId').value;
      URL = `${URL}condo-showtransaction.html?transactionId=${transactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}`;
      window.location.href = URL;
    };
  });

  // Show bank voucher
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {

      const arrayPrefixes = ['voucher'];

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value)
      URL = `${URL}condo-voucher.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}`;
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
  html += objTransaction.showTableHeaderLogOut('', '2', '3Kontobevegelser');
  html += "</tr>";

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, condoId, accountId, date, amount) {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objTransaction.showTableHeaderMenu(menuNumber, objTransaction.accountMenu, '', '2Leilighet', '3Konto', '4');

  // start table body
  html += objTransaction.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

  // Show selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, 'Velg leilighet', '', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', 'width:175px;', accountId, 'Velg konto', '', true);
  html += "<td>4</td></tr>";

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objTransaction.showTableHeaderMenu(menuNumber, objTransaction.accountMenu, '', '2Fra dato', '3Til dato', '4Beløp');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

  // show from date
  date = (date)
    ? formatNumberToNorDate(date)
    : '';
  html += objTransaction.inputTableCell('filterFromDate', 'left', date, 10, true);

  // Show to date
  //let toDate = getCurrentDate();
  html += objTransaction.inputTableCell('filterToDate', 'left', date, 10, true);

  // Amount
  amount = (amount)
    ? formatOreToKroner(amount)
    : '';
  html += objTransaction.inputTableCell('filterAmount', 'left', amount, 10, true);

  html += "</tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2', '3', '4');

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show account movements
function showTransactions(menuNumber, transactionId) {

  const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(bankTransaction => bankTransaction.transactionId === transactionId);
  if (rowNumberTransaction !== -1) {

    // Start table
    let html = objTransaction.initializeTable(columnWidths);

    // Header filter (<tr></tr>)
    menuNumber++;
    html += objTransaction.showTableHeaderMenu(menuNumber, objTransaction.accountMenu, '', '2', '3Transaksjon', '4');

    // start table body
    html += objTransaction.startTableBody();

    // Show all selected transactions
    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2');

    // show selected transactions
    html += objTransaction.showSelectedTransactions('filterTransactionId', 'width:175px;', transactionId, 'Velg transaksjon', '', enableChanges);
    html += "<td>4</td></tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2', '3', '4');
    html += "</tr>";

    // end table body
    html += objTransaction.endTableBody();

    // The end of the table
    html += objTransaction.endTable();
    document.querySelector('.transactions').innerHTML = html;
  }
  return menuNumber;
}

// Show transaction
async function showTransaction(menuNumber, transactionId) {

  const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(bankTransaction => bankTransaction.transactionId === transactionId);

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objTransaction.showTableHeaderMenu(menuNumber, objTransaction.accountMenu, '#e0f0e0', '2', '3', '4');

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2Dato', '3Leilighet', '4');
  html += "</tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

  // Date
  let date = objTransaction.arrayTransactions[rowNumberTransaction]?.date ?? 0;
  date = (date)
    ? formatNumberToNorDate(date)
    : '';
  let className = `date`;
  html += objTransaction.inputTableCell(className, 'left', date, 10, enableChanges);

  // condos
  const condoId = objTransaction.arrayTransactions[rowNumberTransaction]?.condoId ?? 0;
  // const condoId = objTransaction.arrayTransactions[rowNumberTransaction].condoId;
  className = `condoId`;
  html += objCondo.showSelectedCondos(className, 'width:175px;', condoId, 'Ingen leilighet', '', enableChanges);
  html += "<td>4</td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2Konto', '3Prosjekt', '4');
  html += "</tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

  // account Id
  const accountId = objTransaction.arrayTransactions[rowNumberTransaction]?.accountId ?? 0;
  className = `accountId`;
  html += objAccount.showSelectedAccounts(className, 'width:175px;', accountId, 'Velg konto', '', enableChanges);

  // project Id
  const projectId = objTransaction.arrayTransactions[rowNumberTransaction]?.projectId ?? 0;
  className = `projectId`;
  html += objProject.showSelectedProjects(className, 'width:175px;', projectId, 'Velg prosjekt', '', enableChanges);
  html += "<td>4</td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2Inntekt', '3Utgift', '4');
  html += "</tr>";

  // income
  menuNumber++;
  html += objAccount.insertTableRow('', menuNumber, objTransaction.accountMenu);

  let income = objTransaction.arrayTransactions[rowNumberTransaction]?.income ?? '';
  income = formatOreToKroner(income);
  className = `income`;
  html += objTransaction.inputTableCell(className, 'left', income, 10, enableChanges);

  // payment
  let payment = objTransaction.arrayTransactions[rowNumberTransaction]?.payment ?? '';
  payment = formatOreToKroner(payment);
  className = `payment`;
  html += objTransaction.inputTableCell(className, 'left', payment, 10, enableChanges);
  html += "<td>4</td></tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2Kilowattimer', '3', '4');
  html += "</tr>";

  // kilowattHour
  menuNumber++;
  html += objAccount.insertTableRow('', menuNumber, objTransaction.accountMenu);

  let kilowattHour = objTransaction.arrayTransactions[rowNumberTransaction]?.kilowattHour ?? 0;
  // let kilowattHour = objTransaction.arrayTransactions[rowNumberTransaction].kilowattHour;
  kilowattHour = formatOreToKroner(kilowattHour);
  className = `kilowattHour`;
  html += objTransaction.inputTableCell(className, 'left', kilowattHour, 10, enableChanges);
  html += "<td>3</td><td>4</td></tr>";

  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2Tekst', '3', '4');
  html += "</tr>";

  // text
  menuNumber++;
  html += objAccount.insertTableRow('', menuNumber, objTransaction.accountMenu);

  const text = objTransaction.arrayTransactions[rowNumberTransaction]?.text ?? '';
  className = `text`;
  html += objTransaction.inputTableCell(className, 'left', text, 45, enableChanges);
  html += "<td>3</td><td>4</td></tr>";

  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2', '3', '4');
  html += "</tr>";

  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objUser.insertTableRow('', menuNumber, objUser.accountMenu);

    html += objUser.showButton('update', 'Oppdater');
    html += objUser.showButton('cancel', 'Angre');
    html += "<td>4</td></tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objUser.insertTableRow('', menuNumber, objUser.accountMenu);

    html += objUser.showButton('delete', 'Slett');
    html += objUser.showButton('insert', 'Ny');
    html += "<td>4</td>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objUser.insertTableRow('', menuNumber, objUser.accountMenu);

    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objTransaction.condominiumId);
    if (rowNumberCondominium !== -1) {

      const path = objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
      const voucherFileName = `${path}.pdf`;

      // Show voicher button 
      className = `voucher`;
      html += objTransaction.showButton(className, 'Vis bilag');
    } else {

      html += "<td>2</td>";
    }

    // Show back button
    className = `back`;
    html += objTransaction.showButton(className, 'Tilbake');
    html += "<td>4</td></tr>";
  }

  // Show the rest of the menu
  menuNumber++;
  html += objUser.showRestMenu(menuNumber, objUser.accountMenu, '2', '3', '4');

  // The end of the table
  html += objUser.endTable();
  document.querySelector('.transaction').innerHTML = html;
  if (enableChanges) document.querySelector('.cancel').disabled = true;
  return menuNumber;
}

// Delete transactions row
async function deleteTransactionRow() {

  // Check if transactions row exist
  const transactionId = Number(document.querySelector('.filterTransactionId').value);
  const transactionsRowNumber = objTransaction.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
  if (transactionsRowNumber !== -1) {

    // delete transaction row
    await objTransaction.deleteTransactionsTable(transactionId, objTransaction.user);
  }
  const amount = 0;
  const deleted = 'N';
  let condoId = Number(document.querySelector('.filterCondoId').value);
  let accountId = Number(document.querySelector('.filterAccountId').value);

  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(convertDateToISOFormat(fromDate));

  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(convertDateToISOFormat(toDate));

  const orderBy = 'date DESC, income DESC';
  await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);
}

// update transactions row
async function updateTransactionRow(transactionId) {

  transactionId = Number(transactionId);
  const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(bankTransaction => bankTransaction.transactionId === transactionId);

  // date
  className = `.date`;
  const date = Number(convertDateToISOFormat(document.querySelector(`${className}`).value));
  className = `date`;
  const validDate = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig dato', true, date, 20150101, 20991231);

  // accountId
  className = `.accountId`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId`;
  const validAccountId = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig konto', true, accountId, 1, objTransaction.nineNine);

  // condoId
  className = `.condoId`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId`;
  const validCondoId = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig leilighet', true, condoId, 0, objTransaction.nineNine);

  // projectId 
  className = `.projectId`;
  let projectId = Number(document.querySelector(className).value);
  className = `projectId`;
  const validProjectId = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig prosjekt', true, projectId, 0, objTransaction.nineNine);

  // income
  className = `.income`;
  const income = Number(formatKronerToOre(document.querySelector(className).value));
  className = `income`;
  const validIncome = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig inntekt', true, income, objTransaction.minusNineNine, objTransaction.nineNine);

  // payment
  className = `.payment`;
  const payment = Number(formatKronerToOre(document.querySelector(className).value));
  className = `payment`;
  const validPayment = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig utgift', true, payment, objTransaction.minusNineNine, objTransaction.nineNine);

  // kilowattHour
  className = `.kilowattHour`;
  const kilowattHour = Number(formatKronerToOre(document.querySelector(className).value));
  className = `kilowattHour`;
  const validNumberKWHour = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig kilowattime', true, kilowattHour, 0, objTransaction.nineNine);

  // text
  className = `.text`;
  const text = document.querySelector(className).value;
  className = `text`;
  const validText = objTransaction.validateText(className, columnWidths, '', 'Ugyldig tekst', true, text, 3, 255);

  /*
// Check if the transactions row exist
let income = 0;
let payment = 0;

let date = 0;

const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(transactions => transactions.transactionId === transactionId);
if (rowNumberTransaction !== -1) {

  // transactions row exist
  income = Number(objTransaction.arrayTransactions[rowNumberTransaction].income);
  payment = Number(objTransaction.arrayTransactions[rowNumberTransaction].payment);
  date = Number(objTransaction.arrayTransactions[rowNumberTransaction].date);
} else {

  // Insert row into ankccountransactions table
  income = document.querySelector('.income0').value;
  income = formatKronerToOre(income);
  payment = document.querySelector('.payment0').value;
  payment = formatKronerToOre(payment);
  date = document.querySelector('.date0').value;
  date = Number(convertDateToISOFormat(date));
}

const validIncome = objTransaction.validateInterval('income0', columnWidths, '', 'Ugyldig beløp', true, income, objTransaction.minusNineNine, objTransaction.nineNine, '', true);
const validPayment = objTransaction.validateInterval('payment0', columnWidths, '', 'Ugyldig beløp', true, payment, objTransaction.minusNineNine, objTransaction.nineNine);
const validDate = objTransaction.validateInterval('date0', columnWidths, '', 'Ugyldig dato', true, date, 20150101, 20991231);
*/

  // Validate transactions columns
  if (validDate && validCondoId && validAccountId && validProjectId && validIncome && validPayment
    && validNumberKWHour && validText) {

    document.querySelector('.message').style.display = "none";

    // Check if the transactions row exist
    if (rowNumberTransaction !== -1) {

      // update the transactions row
      await objTransaction.updateTransactionsTable(transactionId, objTransaction.condominiumId, objTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text);
    } else {

      // insert transactions row
      await objTransaction.insertTransactionsTable(transactionId, objTransaction.condominiumId, objTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text, 'N')
    }
    const deleted = 'N';

    /*
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
    */

    let fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(convertDateToISOFormat(fromDate));

    let toDate = document.querySelector('.filterToDate').value;
    toDate = Number(convertDateToISOFormat(toDate));

    let amount = document.querySelector('.filterAmount').value;
    amount = formatKronerToOre(amount);

    const orderBy = 'date DESC, income DESC';
    await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

    showTransactions(3);
  }
}

function resetValues() {

  // date
  document.querySelector('.date').value = '';

  // condo Id
  document.querySelector('.condoId').value = 0;

  // account Id
  document.querySelector('.accountId').value = 0;

  // project Id
  document.querySelector('.projectId').value = 0;

  // income
  document.querySelector('.income').value = '';

  // payment
  document.querySelector('.payment').value = '';

  // kilowattHour
  document.querySelector('.kilowattHour').value = '';

  // text
  document.querySelector('.text').value = '';
}
