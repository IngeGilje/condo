// Bank account transaction search

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objSuppliers = new Supplier('supplier');
const objCondominiums = new Condominium('scondominium');
const objUserBankAccounts = new UserBankAccount('userbankaccount');
const objBankAccountTransactions = new BankAccountTransaction('bankaccounttransaction');

let condominium = 0;

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    const email = sessionStorage.getItem("email");
    if ((condominiumId === 0 || email === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

      const resident = 'Y';
      await objUsers.loadUsersTable(2, resident);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(2, fixedCost);
      await objBankAccounts.loadBankAccountsTable(2, objBankAccountTransactions.nineNine);
      await objUserBankAccounts.loadUserBankAccountsTable(2, objBankAccountTransactions.nineNine, objBankAccountTransactions.nineNine);
      await objCondos.loadCondoTable(2);
      await objCondominiums.loadCondominiumsTable();
      await objSuppliers.loadSuppliersTable(2);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const amount = Number(document.querySelector('.filterAmount').value);
      //const condominiumId = 2;
      const deleted = 'N';
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(convertDateToISOFormat(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(convertDateToISOFormat(toDate));
      const orderBy = 'date DESC, income DESC';
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

      // Show result of filter
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js har ikke startet.');
  }
}

// Make Bank account transactions events
function events() {

  // Show bankaccounttransactions after change of filter
  document.addEventListener('change', (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterCondoId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAccountId'))
      || [...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAmount'))) {

      showBankAccountTransactionSync();

      // Show bankaccounttransactions after change of filter
      async function showBankAccountTransactionSync() {

        const deleted = 'N';
        //const condominiumId = 2;
        condoId = Number(document.querySelector('.filterCondoId').value);
        accountId = Number(document.querySelector('.filterAccountId').value);

        let fromDate = document.querySelector('.filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));

        let toDate = document.querySelector('.filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));

        let amount = document.querySelector('.filterAmount').value;
        amount = formatKronerToOre(amount);

        const orderBy = 'date DESC, income DESC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });

  // update a bankAccountTransactions row
  document.addEventListener('change', (event) => {

    //const arrayPrefixes = ['condoId', 'accountId', 'income', 'payment', 'kilowattHour', 'date', 'text'];
    const arrayPrefixes = ['condoId', 'accountId', 'kilowattHour', 'text'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBankAccountTransactions.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let bankAccountTransactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        bankAccountTransactionId = Number(className.slice(prefix.length));
      }

      updateBankAccountTransactionSync();

      // Update a bankAccountTransactions row
      async function updateBankAccountTransactionSync() {

        updateBankAccountTransactionRow(bankAccountTransactionId);

        const deleted = 'N';
        //const condominiumId = 2;
        condoId = Number(document.querySelector('.filterCondoId').value);
        accountId = Number(document.querySelector('.filterAccountId').value);

        let fromDate = document.querySelector('.filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));

        let toDate = document.querySelector('.filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));

        let amount = document.querySelector('.filterAmount').value;
        amount = formatKronerToOre(amount);

        const orderBy = 'date DESC, income DESC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });

  // Delete a bankaccounttransactions row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objBankAccountTransactions.getDeleteClass(event.target);
      const bankAccountTransationId = Number(className.substring(6));
      deleteBankAccountTransationSync(bankAccountTransationId);

      async function deleteBankAccountTransationSync(bankAccountTransationId) {

        deleteBankAccountTransactionRow(bankAccountTransationId, className);

        const amount = 0;
        const deleted = 'N';
        //const condominiumId = 2;
        condoId = Number(document.querySelector('.filterCondoId').value);
        accountId = Number(document.querySelector('.filterAccountId').value);
        let fromDate = document.querySelector('.filterFromDate').value;
        fromDate = Number(convertDateToISOFormat(fromDate));
        let toDate = document.querySelector('.filterToDate').value;
        toDate = Number(convertDateToISOFormat(toDate));
        const orderBy = 'date DESC, income DESC';
        await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objBankAccountTransactions.startTable('width:1750px;');

  // Header filter
  rowNumber++;
  html += objBankAccountTransactions.showTableHeaderMenu('width:175px;', rowNumber, '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato', 'Beløp', '');

  // start table body
  html += objBankAccountTransactions.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', rowNumber, '', '');

  // Show all selected condos
  html += objCondos.showSelectedCondos('filterCondoId', 'width:175px;', objBankAccountTransactions.nineNine, '', 'Vis alle');

  // Get condominiumId
  const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === Number(2));
  if (condominiumsRowNumber !== -1) {

    const commonCostAccountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccounts.showSelectedAccounts('filterAccountId', '', commonCostAccountId, '', 'Alle');
  }

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objBankAccountTransactions.inputTableColumn('filterFromDate', '', fromDate, 10);

  // Current date
  let toDate = getCurrentDate();
  html += objBankAccountTransactions.inputTableColumn('filterToDate', '', toDate, 10);

  // Amount
  html += objBankAccountTransactions.inputTableColumn('filterAmount', '', '', 10);

  html += "<td></td></tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('', rowNumber, '', '', '', '', '', '', '', '');

  // end table body
  html += objBankAccountTransactions.endTableBody();

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// update bankaccounttransactions row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  bankAccountTransactionId = Number(bankAccountTransactionId);

  // Get all column values from current bankaccounttransactions row
  // Check if the bankaccounttransactions row exist
  const bankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(bankAccountTransactions => bankAccountTransactions.bankAccountTransactionId === bankAccountTransactionId);
  if (bankAccountTransactionRowNumber !== -1) {

    // bankaccounttransactions row exist
    const income = Number(objBankAccountTransactions.arrayBankAccountTransactions[bankAccountTransactionRowNumber].income);
    const payment = Number(objBankAccountTransactions.arrayBankAccountTransactions[bankAccountTransactionRowNumber].payment);
    const date = Number(objBankAccountTransactions.arrayBankAccountTransactions[bankAccountTransactionRowNumber].date);

    // accountId
    className = `.accountId${bankAccountTransactionId}`;
    const accountId = Number(document.querySelector(className).value);
    className = `accountId${bankAccountTransactionId}`;
    const validAccountId = objBankAccountTransactions.validateNumber(className, accountId, 0, objBankAccountTransactions.nineNine)

    // condoId
    className = `.condoId${bankAccountTransactionId}`;
    const condoId = Number(document.querySelector(className).value);
    className = `condoId${bankAccountTransactionId}`;
    const validCondoId = objBankAccountTransactions.validateNumber(className, condoId, 0, objBankAccountTransactions.nineNine)

    // kilowattHour
    className = `.kilowattHour${bankAccountTransactionId}`;
    const kilowattHour = Number(formatKronerToOre(document.querySelector(className).value));
    className = `kilowattHour${bankAccountTransactionId}`;
    const validNumberKWHour = objBankAccountTransactions.validateNumber(className, kilowattHour, 0, objBankAccountTransactions.nineNine)

    // text
    className = `.text${bankAccountTransactionId}`;
    const text = document.querySelector(className).value;
    const validText = objBankAccountTransactions.validateText(text, 3, 255);

    // Validate bankAccountTransactions columns
    if (validCondoId && validAccountId && validNumberKWHour && validText) {

      //const condominiumId = 2;
      //const user = objUserInfo.email;
      const user = email;

      // Check if the bankaccounttransactions row exist
      if (bankAccountTransactionRowNumber !== -1) {

        // update the bankaccounttransactions row
        await objBankAccountTransactions.updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, kilowattHour, date, text);
      }
    }
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransactions.startTable('width:1750px;');

  // show main header
  html += objBankAccountTransactions.showTableHeader('width:175px;', 'Bankkontotransaksjoner');

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Delete bankaccounttransactions row
async function deleteBankAccountTransactionRow(bankAccountTransationId, className) {

  //const user = objUserInfo.email;
  const user = email;

  // Check if bankaccounttransaction row exist
  bankAccountTransactionsRowNumber = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(bankaccounttransaction => bankaccounttransaction.bankAccountTransationId === bankAccountTransationId);
  if (bankAccountTransactionsRowNumber !== -1) {

    // delete bankaccounttransaction row
    objBankAccountTransactions.deleteBankAccountTransationsTable(bankAccountTransationId, user);
  }
  const amount = 0;
  const deleted = 'N';
  //const condominiumId = 2;

  condoId = Number(document.querySelector('.filterCondoId').value);
  accountId = Number(document.querySelector('.filterAccountId').value);

  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(convertDateToISOFormat(fromDate));

  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(convertDateToISOFormat(toDate));

  const orderBy = 'date DESC, income DESC';
  await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);
}

// Show bankaccountransactions
function showResult(rowNumber) {

  // start table
  let html = objCondos.startTable('width:1750px;');

  // table header
  rowNumber++;
  html += objCondos.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Slett', 'Leilighet', 'Dato', 'Konto', 'Inntekt', 'Utgift', 'Kilowattimer', 'Tekst');

  let sumIncome = 0;
  let sumPayment = 0;

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    html += '<tr>';

    // Show menu
    rowNumber++;
    //html += objBankAccountTransactions.verticalMenu(rowNumber);
    html += objAccounts.insertTableColumns('', rowNumber);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (bankAccountTransaction.deleted === 'Y') selectedChoice = "Ja";
    if (bankAccountTransaction.deleted === 'N') selectedChoice = "Nei";

    // delete
    let className = `delete${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showSelectedValues(className, 'width:175px;', selectedChoice, 'Nei', 'Ja')

    // condos
    className = `condoId${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondos.showSelectedCondos(className, 'width:175px;', bankAccountTransaction.condoId, 'Ingen er valgt', '');

    // Date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', date, 10, true);

    // accounts
    className = `accountId${bankAccountTransaction.bankAccountTransactionId}`;
    html += (bankAccountTransaction.accountId === 0)
      ? objAccounts.showSelectedAccounts(className, 'background-color: #f89595;', bankAccountTransaction.accountId, 'Ingen er valgt', '')
      : objAccounts.showSelectedAccounts(className, '', bankAccountTransaction.accountId, 'Ingen er valgt', '');

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', income, 10, true);

    // payment
    const payment = formatOreToKroner(bankAccountTransaction.payment);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', payment, 10, true);

    // kilowattHour
    const kilowattHour = formatOreToKroner(bankAccountTransaction.kilowattHour);
    className = `kilowattHour${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', kilowattHour, 10);

    // text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.inputTableColumn(className, '', text, 45);

    html += "</tr>";

    // accumulate
    sumIncome += Number(bankAccountTransaction.income);
    sumPayment += Number(bankAccountTransaction.payment);
  });

  // Make one last table row for insertion in table 

  // Show table sum row
  sumIncome = formatOreToKroner(sumIncome);
  sumPayment = formatOreToKroner(sumPayment);

  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('font-weight: 600;', rowNumber, '', '', '', '', 'Sum', sumIncome, sumPayment);

  // Show the rest of the menu
  rowNumber++;
  html += objBankAccountTransactions.showRestMenu(rowNumber);

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.result').innerHTML = html;
}