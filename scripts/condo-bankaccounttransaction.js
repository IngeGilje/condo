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

      const resident = 'Y';
      await objUser.loadUsersTable(objBankAccountTransaction.condominiumId, resident, objBankAccountTransaction.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objBankAccountTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objBankAccountTransaction.condominiumId, objBankAccountTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objBankAccountTransaction.condominiumId, objBankAccountTransaction.nineNine, objBankAccountTransaction.nineNine);
      await objCondo.loadCondoTable(objBankAccountTransaction.condominiumId);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(objBankAccountTransaction.condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const amount = Number(document.querySelector('.filterAmount').value);
      const deleted = 'N';
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      // Show result of filter
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
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
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      showResult(3);
    };
  });

  // update a bankAccountTransactions row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['condoId', 'accountId', 'kilowattHour', 'text'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))) {

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
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      showResult(3);
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
      let bankAccountTransationId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransationId = Number(className.slice(prefix.length));
      }

      bankAccountTransationId = Number(className.substring(6));
      deleteBankAccountTransactionRow(bankAccountTransationId, className);

      const amount = 0;
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      showResult(3);
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
      let bankAccountTransationId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransationId = Number(className.slice(prefix.length));
      }

      let url = (objBankAccountTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-voucher.html?bankAccountTransactionId=${bankAccountTransationId}`;
      window.location.href = url;
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objBankAccountTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show filter
function showFilter(menuNumber) {

  // Start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu('width:175px;', menuNumber, '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato', 'Beløp', '', '');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('', menuNumber, '', '');

  // Show all selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', objBankAccountTransaction.nineNine, '', 'Vis alle',true);

  // Get condominiums row number
  const condominiumsRowNumber = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objBankAccountTransaction.condominiumId);
  if (condominiumsRowNumber !== -1) {

    const commonCostAccountId = objCondominium.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccount.showSelectedAccounts('filterAccountId', '', commonCostAccountId, '', 'Alle',true);
  }

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objBankAccountTransaction.inputTableColumn('filterFromDate', '', fromDate, 10, true);

  // Current date
  let toDate = getCurrentDate();
  html += objBankAccountTransaction.inputTableColumn('filterToDate', '', toDate, 10, true);

  // Amount
  html += objBankAccountTransaction.inputTableColumn('filterAmount', '', '', 10, true);

  html += "<td></td><td></td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('', menuNumber, '', '', '', '', '', '', '', '', '');

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

  // Get all column values from current bankaccounttransactions row
  // Check if the bankaccounttransactions row exist
  const bankAccountTransactionRowNumber = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransactions => bankAccountTransactions.bankAccountTransactionId === bankAccountTransactionId);
  if (bankAccountTransactionRowNumber !== -1) {

    // bankaccounttransactions row exist
    const income = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].income);
    const payment = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].payment);
    const date = Number(objBankAccountTransaction.arrayBankAccountTransactions[bankAccountTransactionRowNumber].date);

    // accountId
    className = `.accountId${bankAccountTransactionId}`;
    const accountId = Number(document.querySelector(className).value);
    className = `accountId${bankAccountTransactionId}`;
    const validAccountId = objBankAccountTransaction.validateNumber(className, accountId, 0, objBankAccountTransaction.nineNine, objBankAccountTransaction, '', 'Ugyldig konto')

    // condoId
    className = `.condoId${bankAccountTransactionId}`;
    const condoId = Number(document.querySelector(className).value);
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
    const validText = objBankAccountTransaction.validateText(className,text, 3, 255,objBankAccountTransaction, '', 'Ugyldig tekst');

    // Validate bankAccountTransactions columns
    if (validCondoId && validAccountId && validNumberKWHour && validText) {

      document.querySelector('.message').style.display = "none";

      // Check if the bankaccounttransactions row exist
      if (bankAccountTransactionRowNumber !== -1) {

        // update the bankaccounttransactions row
        await objBankAccountTransaction.updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, objBankAccountTransaction.user, condoId, accountId, income, payment, kilowattHour, date, text);
      }
    }
  }
}

// Delete bankaccounttransactions row
async function deleteBankAccountTransactionRow(bankAccountTransationId, className) {

  // Check if bankaccounttransaction row exist
  bankAccountTransactionsRowNumber = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankaccounttransaction => bankaccounttransaction.bankAccountTransationId === bankAccountTransationId);
  if (bankAccountTransactionsRowNumber !== -1) {

    // delete bankaccounttransaction row
    objBankAccountTransaction.deleteBankAccountTransationsTable(bankAccountTransationId, objBankAccountTransaction.user);
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
  await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);
}

// Show bankaccountransactions
function showResult(menuNumber) {

  // start table
  let html = objCondo.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objCondo.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Slett', 'Leilighet', 'Dato', 'Konto', 'Inntekt', 'Utgift', 'Kilowattimer', 'Tekst', '');

  let sumIncome = 0;
  let sumPayment = 0;

  objBankAccountTransaction.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    html += '<tr>';

    // Show menu
    menuNumber++;
    html += objAccount.insertTableColumns('', menuNumber);

    // Delete
    let selected = "Ugyldig verdi";
    if (bankAccountTransaction.deleted === 'Y') selected = "Ja";
    if (bankAccountTransaction.deleted === 'N') selected = "Nei";
    let className = `delete${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.showSelectedValues(className, 'width:75px;', enableChanges, selected, 'Nei', 'Ja')

    // condos
    className = `condoId${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondos(className, 'width:150px;', bankAccountTransaction.condoId, 'Ingen er valgt', '', enableChanges);

    // Date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.inputTableColumn(className, 'width:150px;', date, 10, false);

    // accounts
    className = `accountId${bankAccountTransaction.bankAccountTransactionId}`;

    // Mark invalid account red
    html += (bankAccountTransaction.accountId === 0)
      ? objAccount.showSelectedAccounts(className, 'width:175px;background-color: #f89595;', bankAccountTransaction.accountId, 'Ingen er valgt', '', enableChanges)
      : objAccount.showSelectedAccounts(className, 'width:175px;', bankAccountTransaction.accountId, 'Ingen er valgt', '', enableChanges);

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
    html += objBankAccountTransaction.inputTableColumn(className, 'width:175px;', text, 45, false);

    // Show voucher
    className = `voucher${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransaction.showButton('width:100px;', className, 'Vis bilag')
    html += "</tr>";

    // accumulate
    sumIncome += Number(bankAccountTransaction.income);
    sumPayment += Number(bankAccountTransaction.payment);
  });

  // Make one last table row for insertion in table 

  // Show table sum row
  sumIncome = formatOreToKroner(sumIncome);
  sumPayment = formatOreToKroner(sumPayment);

  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('font-weight: 600;', menuNumber, '', '', '', 'Sum', sumIncome, sumPayment, '', '', '');

  // Show the rest of the menu
  menuNumber++;
  html += objBankAccountTransaction.showRestMenu(menuNumber);

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
