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

const columnWidths = [175, 175, 175, 175, 175, 100];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objTransaction.checkServer()) {

    // Validate LogIn
    if ((objTransaction.condominiumId === 0) || (objTransaction.user === null)) {

      // LogIn is not valid
      const URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objTransaction.showHorizontalMenu(objTransaction.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show account menu
      html = objTransaction.showHorizontalMenu(objTransaction.arrayMenuAccount);
      document.querySelector('.menuTransaction').innerHTML = html;

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

      showHeader();

      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', objTransaction.nineNine, objTransaction.nineNine, objTransaction.nineNine, 0, 20190101, 20991231);

      // Show filter
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objTransaction.userId);
      let condoId = Number(objUser.arrayUsers[rowNumberUser].condoId);

      const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(transaction => transaction.condoId === condoId);
      if (rowNumberTransaction !== -1) {

        transactionId = Number(objTransaction.arrayTransactions[rowNumberTransaction].transactionId);
        accountId = Number(objTransaction.arrayTransactions[rowNumberTransaction].accountId);
        fromDate = Number(objTransaction.arrayTransactions[rowNumberTransaction].date);
        toDate = Number(objTransaction.arrayTransactions[rowNumberTransaction].date);
        income = Number(objTransaction.arrayTransactions[rowNumberTransaction].income);
        amount = (income === 0)
          ? Number(objTransaction.arrayTransactions[rowNumberTransaction].payment)
          : Number(objTransaction.arrayTransactions[rowNumberTransaction].income);
      }

      // Show filter

      showFilter(condoId, accountId, fromDate, toDate, amount);

      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);

      // Show account movements
      showTransactions(transactionId);

      // Show account movement
      showTransaction(transactionId);

      // Events
      events();
    }
  } else {

    objTransaction.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterCondoId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAccountId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAmount'))) {

      // Show transactions after change of filter
      const deleted = 'N';

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objTransaction.formatDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objTransaction.formatDateToNumber(toDate));

      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);

      // Select the 1. transaction
      let transactionId = 0;
      if (objTransaction.arrayTransactions.length > 0) transactionId = objTransaction.arrayTransactions[0].transactionId;
      if (objTransaction.arrayTransactions.length === 0) document.querySelector('.filter').innerHTML = "";

      showFilter(condoId, accountId, fromDate, toDate, amount);
      showTransactions(transactionId);
      showTransaction(transactionId);
    };
  });

  // Insert a condominiums row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      resetValues();
    };
  });

  // update a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const transactionId = Number(document.querySelector('.transactionId').value);
      updateTransactionRow(transactionId);
    };
  });

  // Delete a transactions row
  document.addEventListener('click', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      await deleteTransactionRow();

      const amount = 0;
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objTransaction.formatDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objTransaction.formatDateToNumber(toDate));
      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);

      showTransactions(transactionId);
      showTransaction(transactionId);
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

      //showFilter( condoId, accountId, fromDate, toDate, amount);
      showTransactions(transactionId);
      showTransaction(transactionId);
    }
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
  html += objTransaction.showTableHeaderLogOut('', '', 'Transaksjoner', '', '');
  html += "</tr>";

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(condoId, accountId, fromDate, toDate, amount) {

  // show filter
  html = objTransaction.startRow();

  // Show condos
  html += objCondo.showSelectedCondosNew('Leilighet', 'filterCondoId', '', condoId, '', 'Vis alle', true);

  // Show accounts
  html += objAccount.showSelectedAccountsNew('Konto', 'filterAccountId', '', objTransaction.nineNine, '', 'Vis alle', true);

  // From date
  //let fromDate = `${String(today.getFullYear())}-01-01`;
  fromDate = formatNumberToIsoDate(fromDate);
  html += objTransaction.editDate('Fra Dato', 'filterFromDate', fromDate, true)

  // To date
  // Current date
  toDate = formatNumberToIsoDate(toDate);
  html += objTransaction.editDate('Til Dato', 'filterToDate', toDate, true)

  html += objTransaction.endRow();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show transaction
function showTransaction(transactionId) {

  const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(bankTransaction => bankTransaction.transactionId === transactionId);

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)

  html += objTransaction.showTableHeaderMenu('#e0f0e0', 'center', '', '', '', '', '', '');

  // insert a table row (<tr></td>)
  html += objTransaction.insertTableRow('', 'Bilagsnummer', 'Dato', 'Leilighet', '', '', '');
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objTransaction.insertTableRow('');

  // Transaction Id
  let className = `transactionId`;
  html += objTransaction.editTableCell(className, transactionId, 10, false);

  // Date
  let date = objTransaction.arrayTransactions[rowNumberTransaction]?.date ?? 0;
  date = (date)
    ? formatNumberToNorDate(date)
    : '';
  className = `date`;
  html += objTransaction.editTableCell(className, date, 10, enableChanges);

  // condos
  const condoId = objTransaction.arrayTransactions[rowNumberTransaction]?.condoId ?? 0;
  className = `condoId`;
  html += objCondo.showSelectedCondos(className, '', condoId, 'Velg leilighet', '', enableChanges);
  html += "</tr>";

  // insert a table row (<tr></td>)

  html += objTransaction.insertTableRow('', 'Konto', 'Prosjekt', '', '', '', '');
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objTransaction.insertTableRow('');

  // account Id
  const accountId = objTransaction.arrayTransactions[rowNumberTransaction]?.accountId ?? 0;
  className = `accountId`;
  html += objAccount.showSelectedAccounts(className, '', accountId, 'Velg konto', '', enableChanges);

  // project Id
  const projectId = objTransaction.arrayTransactions[rowNumberTransaction]?.projectId ?? 0;
  className = `projectId`;
  html += objProject.showSelectedProjects(className, '', projectId, 'Velg prosjekt', '', enableChanges);
  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objTransaction.insertTableRow('', 'Inntekt', 'Utgift', 'Kilowattimer', '', '', '');
  html += "</tr>";

  // income
  html += objAccount.insertTableRow('');

  let income = objTransaction.arrayTransactions[rowNumberTransaction]?.income ?? '';
  income = formatOreToKroner(income);
  className = `income`;
  html += objTransaction.editTableCell(className, income, 10, enableChanges);

  // payment
  let payment = objTransaction.arrayTransactions[rowNumberTransaction]?.payment ?? '';
  payment = formatOreToKroner(payment);
  className = `payment`;
  html += objTransaction.editTableCell(className, payment, 10, enableChanges);

  let kilowattHour = objTransaction.arrayTransactions[rowNumberTransaction]?.kilowattHour ?? 0;
  // let kilowattHour = objTransaction.arrayTransactions[rowNumberTransaction].kilowattHour;
  kilowattHour = formatOreToKroner(kilowattHour);
  className = `kilowattHour`;
  html += objTransaction.editTableCell(className, kilowattHour, 10, enableChanges);
  html += "</tr>";

  // insert a table row (<tr></td>)

  html += objTransaction.insertTableRow('', 'Tekst', '', '', '', '', '');
  html += "</tr>";

  // text

  html += objAccount.insertTableRow('');

  const text = objTransaction.arrayTransactions[rowNumberTransaction]?.text ?? '';
  className = `text`;
  html += objTransaction.editTableCell(className, text, 45, enableChanges, 2);
  html += "</tr>";

  html += objTransaction.insertTableRow('', '', '', '', '', '', '');
  html += "</tr>";

  // Show buttons (<tr></td>)
  if (enableChanges) {

    // insert a table row (<tr></td>)
    html += objTransaction.insertTableRow('');

    html += objTransaction.showButton('update', 'Oppdater');
    html += objTransaction.showButton('cancel', 'Angre');
    html += "</tr>";

    // insert a table row (<tr></td>)
    html += objTransaction.insertTableRow('');

    html += objTransaction.showButton('delete', 'Slett');
    html += objTransaction.showButton('insert', 'Ny');
    html += "</tr>";

    // insert a table row (<tr></td>)
    html += objTransaction.insertTableRow('');

    const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objTransaction.condominiumId);
    if (rowNumberCondominium !== -1) {

      const path = objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
      const voucherFileName = `${path}.pdf`;
    } else {

      html += "<td></td>";
    }

    html += "</tr>";
  }

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.transaction').innerHTML = html;

  if (enableChanges) document.querySelector('.cancel').disabled = true;
}

// Delete transactions row
async function deleteTransactionRow() {

  // Check if transactions row exist
  let transactionId = Number(document.querySelector('.transactionId').value);
  const transactionsRowNumber = objTransaction.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
  if (transactionsRowNumber !== -1) {

    // delete transaction row
    await objTransaction.deleteTransactionsTable(transactionId, objTransaction.user);

    // get last row in transactions table
    await objTransaction.loadLastRowTransactionsTable(objTransaction.condominiumId);
  }

  const rowNumberTransaction = objTransaction.arrayTransactions.at(-1).transactionId;

  transactionId = objTransaction.arrayTransactions[rowNumberTransaction]?.transactionId ?? 0;
  condoId = objTransaction.arrayTransactions[rowNumberTransaction]?.condoId ?? 0;
  accountId = objTransaction.arrayTransactions[rowNumberTransaction]?.accountId ?? 0;
  income = objTransaction.arrayTransactions[rowNumberTransaction]?.income ?? 0;
  payment = objTransaction.arrayTransactions[rowNumberTransaction]?.payment ?? 0;
  let fromdate = objTransaction.arrayTransactions[rowNumberTransaction]?.date ?? 0;
  let todate = objTransaction.arrayTransactions[rowNumberTransaction]?.date ?? 0;

  // amount
  let amount = objTransaction.arrayTransactions[rowNumberTransaction]?.income ?? 0;
  if (amount === 0) {
    amount = objTransaction.arrayTransactions[rowNumberTransaction]?.payment ?? 0;
  }

  showFilter(condoId, accountId, fromDate, toDate, amount);

  showTransactions(transactionId);
  showTransaction(transactionId);
}

// update transactions row
async function updateTransactionRow(transactionId) {

  transactionId = Number(transactionId);
  const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(bankTransaction => bankTransaction.transactionId === transactionId);

  // date
  className = `.date`;
  const date = Number(objTransaction.formatDateToNumber(document.querySelector(`${className}`).value));
  className = `date`;
  const validDate = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig dato', true, date, 20150101, 20991231);

  const fromDate = date;
  const toDate = date;

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
  let income = Number(formatKronerToOre(document.querySelector(className).value));
  className = `income`;
  const validIncome = objTransaction.validateInterval(className, columnWidths, '', 'Ugyldig inntekt', true, income, objTransaction.minusNineNine, objTransaction.nineNine);

  // payment
  className = `.payment`;
  let payment = Number(formatKronerToOre(document.querySelector(className).value));
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

  // Validate transactions columns
  if (validDate && validCondoId && validAccountId && validProjectId
    && validIncome && validPayment && validNumberKWHour && validText) {

    document.querySelector('.message').style.display = "none";

    // Check if the transactions row exist
    if (rowNumberTransaction !== -1) {

      // update the transactions row
      await objTransaction.updateTransactionsTable(transactionId, objTransaction.condominiumId, objTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text);
    } else {

      // insert transactions row
      await objTransaction.insertTransactionsTable(objTransaction.condominiumId, objTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text, 'N');
    }

    let amount = (income === 0)
      ? payment
      : income;

    const orderBy = 'date DESC, income DESC';
    await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);


    showFilter(condoId, accountId, fromDate, toDate, amount);

    transactionId = 0;
    if (objTransaction.arrayTransactions.length > 0) transactionId = objTransaction.arrayTransactions[0].transactionId;
    showTransactions(transactionId);
    showTransaction(transactionId);

    document.querySelector('.filterCondoId').disabled = false;
    document.querySelector('.filterAccountId').disabled = false;
    document.querySelector('.filterFromDate').disabled = false;
    document.querySelector('.filterToDate').disabled = false;
    document.querySelector('.filterAmount').disabled = false;

    document.querySelector('.delete').disabled = false;
    document.querySelector('.insert').disabled = false;
  }
}

function resetValues() {

  // Filter values

  // transaction Id
  document.querySelector('.transactionId').value = 0;

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

  if (enableChanges) {

    document.querySelector('.filterCondoId').disabled = true;
    document.querySelector('.filterAccountId').disabled = true;
    document.querySelector('.filterFromDate').disabled = true;
    document.querySelector('.filterToDate').disabled = true;
    document.querySelector('.filterAmount').disabled = true;

    document.querySelector('.delete').disabled = true;
    document.querySelector('.insert').disabled = true;
    document.querySelector('.cancel').disabled = false;
  }
}

// Show transactions
function showTransactions(transactionId) {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Table header (<tr></tr>)

  html += objTransaction.showTableHeaderMenu('#e0f0e0', 'center', 'Leilighet', 'Konto', 'Dato', 'Beløp', '', '');

  let sumAmount = 0;

  for (const bankTransaction of objTransaction.arrayTransactions) {

    // Show menu

    html += objAccount.insertTableRow('');

    // condos
    let className = `condoId${bankTransaction.transactionId}`;
    html += objCondo.showSelectedCondos(className, '', bankTransaction.condoId, '-', '', false);

    // account
    className = `accountId${bankTransaction.transactionId}`;
    html += objAccount.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

    // Date
    const date = formatNumberToNorDate(bankTransaction.date);
    className = `date${bankTransaction.transactionId}`;
    html += objTransaction.editTableCell(className, date, 10, false);

    // accounts
    className = `accountId${bankTransaction.transactionId}`;

    objAccount.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

    // amount
    let amount = bankTransaction.income + bankTransaction.payment;
    amount = formatOreToKroner(amount);
    className = `amount${bankTransaction.transactionId}`;
    html += objTransaction.editTableCell(className, amount, 10, false);

    // Show button for voucher
    className = `voucher${bankTransaction.transactionId}`;
    html += objTransaction.showButton(className, 'Vis bilag');

    // Show button for editing transaction
    className = `edit${bankTransaction.transactionId}`;
    html += objTransaction.showButton(className, 'Endre');

    html += "</tr>";
  };

  // Table header (<tr></tr>)

  html += objTransaction.showTableHeaderMenu('', 'center', '', '', '', '', '');

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.transactions').innerHTML = html;


}