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
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');
const objTransaction = new Transaction('transaction');

const enableChanges = (objAccount.securityLevel > 5);

const columnWidths = [175, 175, 175, 175, 175, 175];

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
      await objUser.loadUsersTable(objBankAccountTransaction.condominiumId, resident, objTransaction.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objBankAccountTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objBankAccountTransaction.condominiumId, objTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objBankAccountTransaction.condominiumId, objTransaction.nineNine, objTransaction.nineNine);
      await objCondo.loadCondoTable(objBankAccountTransaction.condominiumId, objTransaction.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(objBankAccountTransaction.condominiumId);
      await objProject.loadProjectsTable(objBankAccountTransaction.condominiumId);

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

      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, 'N', objTransaction.nineNine, objTransaction.nineNine, 0, 20200101, 20291231);
      const bankAccountTransactionId = objBankAccountTransaction.arrayBankAccountTransactions.at(-1)?.bankAccountTransactionId ?? 0;

      // Show filter
      menuNumber = showFilter(menuNumber);

      // Show account movements
      menuNumber = showTransactions(menuNumber, bankAccountTransactionId);

      // Show account movement
      menuNumber = showTransaction(menuNumber, bankAccountTransactionId);

      // Events
      events();
    }
  } else {

    objTransaction.showMessageNew(columnWidths, '', 'Server er ikke startet.');
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
      if (accountId === 0) accountId = objTransaction.nineNine;

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));

      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));

      let amount = document.querySelector('.filterAmount').value;
      amount = formatKronerToOre(amount);

      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      menuNumber = 3;
      menuNumber = showTransactions(menuNumber, bankAccountTransactionId);
      menuNumber = showTransaction(menuNumber, bankAccountTransactionId);
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

      showTransaction(3, bankAccountTransactionId);
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

// Show header
function showHeader() {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // start table body
  html += objTransaction.startTableBody();

  // show main header
  html += objBankAccountTransaction.showTableHeaderLogOut('', '2', '3Kontobevegelser', '4', '5');
  html += "</tr>";

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber) {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objTransaction.showTableHeaderMenu(menuNumber, objBankAccountTransaction.accountMenu, '', '2Leilighet', '3Konto', '4Fra dato', '5Til dato', '6Beløp');

  // start table body
  html += objTransaction.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

  // Show all selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', 0, 'Velg leilighet', '', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', 'width:175px;', 0, 'Velg konto', '', true);

  // show date
  const date = '01.01.' + String(today.getFullYear());
  html += objBankAccountTransaction.inputTableColumn('filterFromDate', 'left', date, 10, true);

  // Current date
  let toDate = getCurrentDate();
  html += objBankAccountTransaction.inputTableColumn('filterToDate', 'left', toDate, 10, true);

  // Amount
  html += objBankAccountTransaction.inputTableColumn('filterAmount', 'left', '', 10, true);

  html += "</tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2', '3', '4', '5', '6');

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show account movements
function showTransactions(menuNumber, bankAccountTransactionId) {

  const rowNumberBankAccountTransaction = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // Start table
    let html = objTransaction.initializeTable(columnWidths);

    // Header filter (<tr></tr>)
    menuNumber++;
    html += objTransaction.showTableHeaderMenu(menuNumber, objBankAccountTransaction.accountMenu, '', '2', '3Transaksjon', '4', '5', '6');

    // start table body
    html += objTransaction.startTableBody();

    // Show all selected bank account transactions
    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2');

    // show selected bank account transactions
    html += objBankAccountTransaction.showSelectedBankAccountTransactions('filterBankAccountTransactionId', 'width:175px;', bankAccountTransactionId, 'Velg transaksjon', '', enableChanges);
    html += "<td>4</td><td>5</td><td>6</td></tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2', '3', '4', '5', '6');

    // end table body
    html += objTransaction.endTableBody();

    // The end of the table
    html += objTransaction.endTable();
    document.querySelector('.transactions').innerHTML = html;
  }
  return menuNumber;
}

// Show bankaccountransaction
async function showTransaction(menuNumber, bankAccountTransactionId) {

  const rowNumberBankAccountTransaction = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // Start table
    let html = objTransaction.initializeTable(columnWidths);

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2Dato', '3Leilighet', '4', '5', '6');
    html += "</tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

    // Date
    let date = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].date;
    date = (date)
      ? formatNumberToNorDate(date)
      : '';
    let className = `date`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', date, 10, false);

    // condos
    const condoId = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].condoId;
    className = `condoId`;
    html += objCondo.showSelectedCondos(className, 'width:175px;', condoId, 'Ingen leilighet', '', enableChanges);
    html += "<td>4</td><td>5</td><td>6</td></tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2Konto', '3Prosjekt', '4', '5', '6');
    html += "</tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

    // account
    const accountId = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].accountId;
    className = `accountId`;
    html += objAccount.showSelectedAccounts(className, 'width:175px;', accountId, 'Velg konto', '', enableChanges)

    // project
    const projectId = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].projectId;
    className = `projectId`;
    html += objProject.showSelectedProjects(className, 'width:175px;', projectId, 'Velg prosjekt', '', enableChanges);
    html += "<td>4</td><td>5</td><td>6</td></tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2Inntekt', '3Utgift', '4', '5', '6');
    html += "</tr>";

    // income
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

    let income = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].income;
    income = formatOreToKroner(income);
    className = `income`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', income, 10, false);

    // payment
    let payment = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].payment;
    payment = formatOreToKroner(payment);
    className = `payment`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', payment, 10, false);
    html += "<td>4</td><td>5</td><td>6</td></tr>";

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2Kilowattimer', '3', '4', '5', '6');
    html += "</tr>";

    // kilowattHour
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

    let kilowattHour = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].kilowattHour;
    kilowattHour = formatOreToKroner(kilowattHour);
    className = `kilowattHour`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', kilowattHour, 10, enableChanges);
    html += "<td>3</td><td>4</td><td>5</td><td>6</td></tr>";

    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2Tekst', '3', '4', '5', '6');
    html += "</tr>";

    // text
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu);

    let text = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].text;
    className = `text`;
    html += objBankAccountTransaction.inputTableColumn(className, 'left', text, 45, enableChanges);
    html += "<td>3</td><td>4</td><td>5</td><td>6</td></tr>";

    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objBankAccountTransaction.accountMenu, '2', '3', '4', '5', '6');
    html += "</tr>";

    // Show buttons (<tr></td>)
    if (enableChanges) {

      // insert a table row (<tr></td>)
      menuNumber++;
      html += objUser.insertTableRow('', menuNumber, objUser.accountMenu);

      html += objUser.showButton('update', 'Oppdater');
      html += objUser.showButton('cancel', 'Angre');
      html += "<td>4</td><td>5</td><td>6</td></tr>";

      // insert a table row (<tr></td>)
      menuNumber++;
      html += objUser.insertTableRow('', menuNumber, objUser.accountMenu);

      html += objUser.showButton('delete', 'Slett');
      html += objUser.showButton('insert', 'Ny');
      html += "<td>4</td><td>5</td><td>6</td></tr>";

      // validate voucher filename
      // insert a table row (<tr></td>)
      menuNumber++;
      html += objUser.insertTableRow('', menuNumber, objUser.accountMenu);

      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objBankAccountTransaction.condominiumId);
      if (rowNumberCondominium !== -1) {
        const path = objCondominium.arrayCondominiums[rowNumberCondominium].importPath;
        const voucherFileName = `${path}.pdf`;

        // Check if the file exist
        if (await objBankAccountTransaction.checkIfFileExist(voucherFileName)) {

          // Show button if the file exist
          className = `voucher`;
          html += objBankAccountTransaction.showButton(className, 'Vis bilag');
        } else {

          // Show empty column if the file does not exist
          className = `voucher`;
          html += objBankAccountTransaction.showButton(className, 'Vis bilag');
        }
      } else {

        html += "<td></td>";
      }
      html += "<td>3</td><td>4</td><td>5</td><td>6</td></tr>";}

    // Show the rest of the menu
    menuNumber++;
    html += objUser.showRestMenu(menuNumber, objUser.accountMenu, '2', '3', '4', '5', '6');

    // The end of the table
    html += objUser.endTable();
    document.querySelector('.transaction').innerHTML = html;
    if (enableChanges) document.querySelector('.cancel').disabled = true;
  }
  return menuNumber;
}

// update bankaccounttransactions row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  bankAccountTransactionId = Number(bankAccountTransactionId);

  // accountId
  className = `.accountId${bankAccountTransactionId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${bankAccountTransactionId}`;
  const validAccountId = objBankAccountTransaction.validateInterval(className, columnWidths, '', 'Ugyldig konto', true, accountId, 1, objTransaction.nineNine);

  // condoId
  className = `.condoId${bankAccountTransactionId}`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId${bankAccountTransactionId}`;
  const validCondoId = objBankAccountTransaction.validateInterval(className, columnWidths, '', 'Ugyldig leilighet', true, condoId, 0, objTransaction.nineNine);

  // projectId 
  let projectId = 0;

  // kilowattHour
  className = `.kilowattHour${bankAccountTransactionId}`;
  const kilowattHour = Number(formatKronerToOre(document.querySelector(className).value));
  className = `kilowattHour${bankAccountTransactionId}`;
  const validNumberKWHour = objBankAccountTransaction.validateInterval(className, columnWidths, '', 'Ugyldig kilowattime', true, kilowattHour, 0, objTransaction.nineNine);

  // text
  className = `.text${bankAccountTransactionId}`;
  const text = document.querySelector(className).value;
  className = `text${bankAccountTransactionId}`;
  const validText = objBankAccountTransaction.validateText(className, columnWidths, '', 'Ugyldig tekst', true, text, 3, 255);

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

  const validIncome = objBankAccountTransaction.validateInterval('income0', columnWidths, '', 'Ugyldig beløp', true, income, objBankAccountTransaction.minusNineNine, objTransaction.nineNine, '', true);
  const validPayment = objBankAccountTransaction.validateInterval('payment0', columnWidths, '', 'Ugyldig beløp', true, payment, objBankAccountTransaction.minusNineNine, objTransaction.nineNine);
  const validDate = objBankAccountTransaction.validateInterval('date0', columnWidths, '', 'Ugyldig dato', true, date, 20150101, 20991231);

  // Validate bankAccountTransactions columns
  if (validCondoId && validAccountId && validNumberKWHour && validText
    && validIncome && validPayment && validDate) {

    document.querySelector('.message').style.display = "none";

    // Check if the bankaccounttransactions row exist
    if (bankAccountTransactionRowNumber !== -1) {

      // update the bankaccounttransactions row
      await objBankAccountTransaction.updateBankAccountTransactionsTable(bankAccountTransactionId, objBankAccountTransaction.condominiumId, objBankAccountTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text);
    } else {

      // insert bank account transactions row
      await objBankAccountTransaction.insertBankAccountTransactionsTable(bankAccountTransactionId, objBankAccountTransaction.condominiumId, objBankAccountTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text, 'N')
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

    showTransaction(3, bankAccountTransactionId);
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

// update bankaccounttransactions row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  bankAccountTransactionId = Number(bankAccountTransactionId);

  // accountId
  className = `.accountId${bankAccountTransactionId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${bankAccountTransactionId}`;
  const validAccountId = objBankAccountTransaction.validateInterval(className, columnWidths, '', 'Ugyldig konto', true, accountId, 1, objBankAccountTransaction.nineNine);

  // condoId
  className = `.condoId${bankAccountTransactionId}`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId${bankAccountTransactionId}`;
  const validCondoId = objBankAccountTransaction.validateInterval(className, columnWidths, '', 'Ugyldig leilighet', true, condoId, 0, objBankAccountTransaction.nineNine);

  // projectId 
  let projectId = 0;

  // kilowattHour
  className = `.kilowattHour${bankAccountTransactionId}`;
  const kilowattHour = Number(formatKronerToOre(document.querySelector(className).value));
  className = `kilowattHour${bankAccountTransactionId}`;
  const validNumberKWHour = objBankAccountTransaction.validateInterval(className, columnWidths, '', 'Ugyldig kilowattime', true, kilowattHour, 0, objBankAccountTransaction.nineNine);

  // text
  className = `.text${bankAccountTransactionId}`;
  const text = document.querySelector(className).value;
  className = `text${bankAccountTransactionId}`;
  const validText = objBankAccountTransaction.validateText(className, columnWidths, '', 'Ugyldig tekst', true, text, 3, 255);

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

  const validIncome = objBankAccountTransaction.validateInterval('income0', columnWidths, '', 'Ugyldig beløp', true, income, objBankAccountTransaction.minusNineNine, objBankAccountTransaction.nineNine, '', true);
  const validPayment = objBankAccountTransaction.validateInterval('payment0', columnWidths, '', 'Ugyldig beløp', true, payment, objBankAccountTransaction.minusNineNine, objBankAccountTransaction.nineNine);
  const validDate = objBankAccountTransaction.validateInterval('date0', columnWidths, '', 'Ugyldig dato', true, date, 20150101, 20991231);

  // Validate bankAccountTransactions columns
  if (validCondoId && validAccountId && validNumberKWHour && validText
    && validIncome && validPayment && validDate) {

    document.querySelector('.message').style.display = "none";

    // Check if the bankaccounttransactions row exist
    if (bankAccountTransactionRowNumber !== -1) {

      // update the bankaccounttransactions row
      await objBankAccountTransaction.updateBankAccountTransactionsTable(bankAccountTransactionId, objBankAccountTransaction.condominiumId, objBankAccountTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text);
    } else {

      // insert bank account transactions row
      await objBankAccountTransaction.insertBankAccountTransactionsTable(bankAccountTransactionId, objBankAccountTransaction.condominiumId, objBankAccountTransaction.user, condoId, accountId, projectId, income, payment, kilowattHour, date, text, 'N')
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