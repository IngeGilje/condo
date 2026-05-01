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

const params = new URLSearchParams(window.location.search);
const paramCondoId = Number(params.get("condoId"));
const paramAccountId = Number(params.get("accountId"));
const paramBankAccountTransactionId = Number(params.get("bankAccountTransactionId"));

const tableWidth = 'width:1650px;';

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
      let accountId = (paramAccountId === 0) ? objBankAccountTransaction.nineNine : paramAccountId;
      menuNumber = showFilter(menuNumber, condoId, accountId);

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

    objBankAccountTransaction.showMessage(objBankAccountTransaction, '', 'Server er ikke startet.');
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

  // update a bankAccountTransactions row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['condoId', 'accountId', 'kilowattHour', 'text', 'date',
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

  // Delete a bankaccounttransactions row
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

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

      bankAccountTransactionId = Number(className.substring(6));
      deleteBankAccountTransactionRow(bankAccountTransactionId, className);

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

// Show filter
function showFilter(menuNumber, condoId, accountId) {

  // Start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu('width:175px;', menuNumber, objBankAccountTransaction.accountMenu, '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato', 'Beløp', '', '');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert a table row
  menuNumber++;
  html += objBankAccountTransaction.insertTableRow('', menuNumber,objBankAccountTransaction.accountMenu, '', '');

  // Show all selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', 'Vis alle', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', '', accountId, '', 'Vis alle', true);

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objBankAccountTransaction.inputTableColumn('filterFromDate', '', fromDate, 10, true);

  // Current date
  let toDate = getCurrentDate();
  html += objBankAccountTransaction.inputTableColumn('filterToDate', '', toDate, 10, true);

  // Amount
  html += objBankAccountTransaction.inputTableColumn('filterAmount', '', '', 10, true);

  html += "<td></td><td></td></tr>";

  // insert a table row
  menuNumber++;
  html += objBankAccountTransaction.insertTableRow('', menuNumber,objBankAccountTransaction.accountMenu, '', '', '', '', '', '', '', '', '');

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// update bankaccounttransactions row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  bankAccountTransactionId = Number(bankAccountTransactionId);

  // accountId
  className = `.accountId${bankAccountTransactionId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${bankAccountTransactionId}`;
  const validAccountId = objBankAccountTransaction.validateNumber(className, accountId, 1, objBankAccountTransaction.nineNine, objBankAccountTransaction, '', 'Ugyldig konto')

  // condoId
  className = `.condoId${bankAccountTransactionId}`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId${bankAccountTransactionId}`;
  const validCondoId = objBankAccountTransaction.validateNumber(className, condoId, 0, objBankAccountTransaction.nineNine, objBankAccountTransaction, '', 'Ugyldig leilighet')

  // kilowattHour
  className = `.kilowattHour${bankAccountTransactionId}`;
  const kilowattHour = Number(formatKronerToOre(document.querySelector(className).value));
  className = `kilowattHour${bankAccountTransactionId}`;
  const validNumberKWHour = objBankAccountTransaction.validateNumber(className, kilowattHour, 0, objBankAccountTransaction.nineNine, objBankAccountTransaction, '', 'Ugyldig kilowattime')

  // text
  className = `.text${bankAccountTransactionId}`;
  const text = document.querySelector(className).value;
  className = `text${bankAccountTransactionId}`;
  const validText = objBankAccountTransaction.validateText(className, text, 3, 255, objBankAccountTransaction, '', 'Ugyldig tekst');

  // Check if the bankaccounttransactions row exist
  let income = 0;
  let payment = 0;
  let date = 0;

  const bankAccountTransactionRowNumber = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransactions => bankAccountTransactions.bankAccountTransactionId === bankAccountTransactionId);
  if (bankAccountTransactionRowNumber !== -1) {

    // bankaccounttransactions row exist
    income = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].income);
    payment = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].payment);
    date = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].date);
  } else {

    // Insert row into ankccountransactions table
    income = document.querySelector('.income0').value;
    income = formatKronerToOre(income);
    payment = document.querySelector('.payment0').value;
    payment = formatKronerToOre(payment);
    date = document.querySelector('.date0').value;
    date = Number(convertDateToISOFormat(date));
  }

  const validIncome = objBankAccountTransaction.validateNumber('income0', income, objBankAccountTransaction.minusNineNine, objBankAccountTransaction.nineNine, objBankAccountTransaction, '', 'Ugyldig beløp', true);
  const validPayment = objBankAccountTransaction.validateNumber('payment0', payment, objBankAccountTransaction.minusNineNine, objBankAccountTransaction.nineNine, objBankAccountTransaction, '', 'Ugyldig beløp', true);
  const validDate = objBankAccountTransaction.validateNumber('date0', date, 20150101, 20991231, objBankAccountTransaction, '', 'Ugyldig dato', true);

  // Validate bankAccountTransactions columns
  if (validCondoId && validAccountId && validNumberKWHour && validText
    && validIncome && validPayment && validDate) {

    document.querySelector('.message').style.display = "none";

    // Check if the bankaccounttransactions row exist
    if (bankAccountTransactionRowNumber !== -1) {

      // update the bankaccounttransactions row
      await objBankAccountTransaction.updateBankAccountTransactionsTable(bankAccountTransactionId, objBankAccountTransaction.condominiumId, objBankAccountTransaction.user, condoId, accountId, income, payment, kilowattHour, date, text);
    } else {

      // insert bank account transactions row
      await objBankAccountTransaction.insertBankAccountTransactionsTable(bankAccountTransactionId, objBankAccountTransaction.condominiumId, objBankAccountTransaction.user, condoId, accountId, income, payment, kilowattHour, date, text, 'N')
    }
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
  }
}

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

// Show bankaccountransactions
async function showBankAccountTransactions(menuNumber) {

  // start table
  let html = objCondo.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objCondo.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, objCondo.accountMenu, 'Slett', 'Leilighet', 'Dato', 'Konto', 'Inntekt', 'Utgift', 'Kilowattimer', 'Tekst', 'Bilag');

  let sumIncome = 0;
  let sumPayment = 0;

  //objBankAccountTransaction.arrayBankAccountTransactions.forEach(async (bankAccountTransaction) => {
  for (const bankAccountTransaction of objBankAccountTransaction.arrayBankAccountTransactions) {

    html += '<tr>';

    // Show menu
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber,objBankAccountTransaction.accountMenu);

    // Delete
    let selected = "Ugyldig verdi";
    if (bankAccountTransaction.deleted === 'Y') selected = "Ja";
    if (bankAccountTransaction.deleted === 'N') selected = "Nei";
    let className = `delete${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.showSelectedValues(className, 'width:75px;', enableChanges, selected, 'Nei', 'Ja')

    // condos
    className = `condoId${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondos(className, 'width:150px;', bankAccountTransaction.condoId, 'Ingen leilighet', '', enableChanges);

    // Date
    const date = formatNumberToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', date, 10, false);

    // accounts
    className = `accountId${bankAccountTransaction.bankAccountTransactionId}`;

    // Mark invalid account red
    html += (bankAccountTransaction.accountId === 0)
      ? objAccount.showSelectedAccounts(className, 'width:175px;background-color: #f89595;', bankAccountTransaction.accountId, 'Velg konto', '', enableChanges)
      : objAccount.showSelectedAccounts(className, 'width:175px;', bankAccountTransaction.accountId, 'Velg konto', '', enableChanges);

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', income, 10, false);

    // payment
    const payment = formatOreToKroner(bankAccountTransaction.payment);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', payment, 10, false);

    // kilowattHour
    const kilowattHour = formatOreToKroner(bankAccountTransaction.kilowattHour);
    className = `kilowattHour${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', kilowattHour, 10, enableChanges);

    // text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:175px;', text, 45, enableChanges);

    // Show voucher
    //className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
    //html += objBankAccountTransaction.showButton('width:100px;', className, 'Vis bilag');

    // validate voucher filename
    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objBankAccountTransaction.condominiumId);
    if (rowNumberCondominium !== -1) {
      const path = objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
      const voucherFileName = `${path}${bankAccountTransaction.bankAccountTransactionId}.pdf`;

      // Check if the file exist
      if (await objBankAccountTransaction.checkIfFileExist(voucherFileName)) {

        // Show button if the file exist
        className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
        html += objBankAccountTransaction.showButton('width:100px;', className, 'Vis bilag');
      } else {

        // Show empty column if the file does not exist
        //html += "<td style='width:100px;'></td>";
        className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
        html += objBankAccountTransaction.showButton('width:100px; background-color: #f89595;', className, 'Vis bilag');
      }
    } else {

      html += "<td style='width:100px;'></td>";
    }

    html += "</tr>";

    // accumulate
    sumIncome += Number(bankAccountTransaction.income);
    sumPayment += Number(bankAccountTransaction.payment);
  };

  // Insert empty table row for insertion
  if (enableChanges) {

    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  }

  // Show table sum row
  sumIncome = formatOreToKroner(sumIncome);
  sumPayment = formatOreToKroner(sumPayment);

  menuNumber++;
  html += objBankAccountTransaction.insertTableRow('font-weight: 600;', menuNumber,objBankAccountTransaction.accountMenu, '', '', '', 'Sum', sumIncome, sumPayment, '', '', '');

  // Show the rest of the menu
  menuNumber++;
  html += objBankAccountTransaction.showRestMenu(menuNumber, objBankAccountTransaction.accountMenu);

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.result').innerHTML = html;
}

// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // show main header
  html += objBankAccountTransaction.showTableHeaderLogOut('width:175px;', '', '', '', '', 'Bankkontotransaksjoner', '', '', '', '');
  html += "</tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // insert a table row
  html += objBankAccountTransaction.insertTableRow('', menuNumber,objBankAccountTransaction.accountMenu);

  html += "<td class='center'>Ny transaksjon</td>";

  // condo
  const condoId = Number(document.querySelector('.filterCondoId').value);
  className = `condoId0`;
  html += objCondo.showSelectedCondos(className, 'width:150px;', condoId, 'Velg leilighet', '', enableChanges);

  // Date
  const date = '';
  className = `date0`;
  html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', date, 10, enableChanges);

  // account
  let accountId = Number(document.querySelector('.filterAccountId').value);
  if (accountId === objBankAccountTransaction.nineNine) accountId = 0;
  className = `accountId0`;
  html += objAccount.showSelectedAccounts(className, 'width:175px;', accountId, 'Velg konto', '', enableChanges);

  // income
  const income = '0,00';
  className = 'income0';
  html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', income, 10, enableChanges);

  // payment
  const payment = '0,00'
  className = 'payment0';
  html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', payment, 10, enableChanges);

  // kilowattHour
  const kilowattHour = '0,00';
  className = `kilowattHour0`;
  html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', kilowattHour, 10, enableChanges);

  // text
  const text = '';
  className = `text0`;
  html += objBankAccountTransaction.inputTableColumn(className, 'width:175px;', text, 45, enableChanges);

  html += "</tr>";
  return html;
}