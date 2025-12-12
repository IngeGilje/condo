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

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, 999999999);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, 999999999, 999999999);
    await objCondos.loadCondoTable(objUserPassword.condominiumId);
    await objCondominiums.loadCondominiumsTable();
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter()

    const amount = Number(document.querySelector('.filterAmount').value);
    const condominiumId = objUserPassword.condominiumId;
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
        const condominiumId = objUserPassword.condominiumId;
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

  // update a dues row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('condoId'))
      || [...event.target.classList].some(cls => cls.startsWith('accountId'))
      || [...event.target.classList].some(cls => cls.startsWith('numberKWHour'))
      || [...event.target.classList].some(cls => cls.startsWith('date'))
      || [...event.target.classList].some(cls => cls.startsWith('text'))) {

      const arrayPrefixes = ['condoId', 'accountId', 'income', 'payment', 'numberKWHour', 'date', 'text'];

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

      // Update a dues row
      async function updateBankAccountTransactionSync() {

        updateBankAccountTransactionRow(bankAccountTransactionId);

        const deleted = 'N';
        const condominiumId = objUserPassword.condominiumId;
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

      const className = objBankAccountTransactions.getDeleteClass(event.target);
      const bankAccountTransationId = Number(className.substring(6));
      deleteBankAccountTransationSync(bankAccountTransationId);

      async function deleteBankAccountTransationSync(bankAccountTransationId) {

        deleteBankAccountTransactionRow(bankAccountTransationId, className);

        const amount = 0;
        const deleted = 'N';
        const condominiumId = objUserPassword.condominiumId;
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
function showFilter() {

  // Get condominiumId
  const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === Number(objUserPassword.condominiumId));
  if (condominiumsRowNumber !== -1) {

    // Start table
    html = startHTMLTable('width:1450px;');

    // Header filter for search
    //html += objBankAccountTransactions.showHTMLFilterHeader("width:200px;", 0, '', '', '', '', '', '', '');
    //html += objBankAccountTransactions.showTableHeaderNew("width:200px;", '', '', '', '', '', '', '');
    html += "<tr><td></td></tr>";

    //html += objBankAccountTransactions.showHTMLFilterHeader('', 0, '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato');
    html += objBankAccountTransactions.showTableHeaderNew('', '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato', 'Beløp');

    // Filter for search
    html += "<tr><td></td><td></td>";

    // Show all selected condos
    html += objCondos.showSelectedCondosNew('filterCondoId', 'width:100px;', 999999999, '', 'Vis alle');

    const commonCostAccountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccounts.showSelectedAccountsNew('filterAccountId', '', commonCostAccountId, '', 'Alle');

    // show from date
    const fromDate = '01.01.' + String(today.getFullYear());
    html += objBankAccountTransactions.showInputHTMLNew('filterFromDate', fromDate, 10);

    // Current date
    let toDate = getCurrentDate();
    html += objBankAccountTransactions.showInputHTMLNew('filterToDate', toDate, 10);

    // Amount
    html += objBankAccountTransactions.showInputHTMLNew('filterAmount', '', 10);

    html += "</tr>";

    // Header filter
    html += "<tr><td></td></tr>";

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.filter').innerHTML = html;

    /*
    // show icons
    objBankAccountTransactions.showIconNew('filterCondoId');
    objBankAccountTransactions.showIconNew('filterAccountId');
    objBankAccountTransactions.showIconNew('filterFromDate');
    objBankAccountTransactions.showIconNew('filterToDate');
    objBankAccountTransactions.showIconNew('filterAmount');
    */
  }
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
    const validAccountId = validateNumberNew(accountId, 0, 999999999)

    // condoId
    className = `.condoId${bankAccountTransactionId}`;
    const condoId = Number(document.querySelector(className).value);
    const validCondoId = validateNumberNew(condoId, 0, 999999999)

    // numberKWHour
    className = `.numberKWHour${bankAccountTransactionId}`;
    const numberKWHour = Number(formatKronerToOre(document.querySelector(className).value));
    const validNumberKWHour = validateNumberNew(numberKWHour, 0, 999999999)

    // text
    className = `.text${bankAccountTransactionId}`;
    const text = document.querySelector(className).value;
    const validText = objBankAccountTransactions.validateTextNew(text, 3, 255);

    // Validate bankAccountTransactions columns
    if (validCondoId && validAccountId && validNumberKWHour && validText) {

      const condominiumId = objUserPassword.condominiumId;
      const user = objUserPassword.email;

      // Check if the bankaccounttransactions row exist
      if (bankAccountTransactionRowNumber !== -1) {

        // update the bankaccounttransactions row
        await objBankAccountTransactions.updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, condoId, accountId, income, payment, numberKWHour, date, text);
      }
    }
  }
}

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:1450px;');

  // Main header
  html += objBankAccountTransactions.showTableHeaderNew('widht:250px;', 'Bankkontotransaksjoner');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show table sum row
function showTableSumRow(rowNumber, sumIncome, sumPayment) {

  let html = `<tr class="menu">`;

  // Show menu
  html += objBankAccountTransactions.menuNew(rowNumber);
  html += "<td></td>";
  html += "<td></td>";
  html += "<td></td>";
  html += "<td class='center bold'>Sum</td>";
  html += `<td class="center bold">${sumIncome}</td>`;
  html += `<td class="center bold">${sumPayment}</td>`
  html += "</tr>";

  return html;
}

// Delete bankaccounttransactions row
async function deleteBankAccountTransactionRow(bankAccountTransationId, className) {

  const user = objUserPassword.email;

  // Check if bankaccounttransaction row exist
  bankAccountTransactionsRowNumber = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(bankaccounttransaction => bankaccounttransaction.bankAccountTransationId === bankAccountTransationId);
  if (bankAccountTransactionsRowNumber !== -1) {

    // delete bankaccounttransaction row
    objBankAccountTransactions.deleteBankAccountTransationsTable(bankAccountTransationId, user);
  }
  const amount = 0;
  const deleted = 'N';
  const condominiumId = objUserPassword.condominiumId;

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

  // Start HTML table
  let html = startHTMLTable('width:1450px;');

  // Header
  html += objBankAccountTransactions.showTableHeaderNew("width:750px;", '', 'Slett', 'Leilighet', 'Dato', 'Konto', 'Inntekt', 'Kostnad', 'Kilowattimer', 'Tekst');

  let sumIncome = 0;
  let sumPayment = 0;

  objBankAccountTransactions.arrayBankAccountTransactions.forEach((bankAccountTransaction) => {

    html += '<tr class="menu">';

    // Show menu
    rowNumber++;
    html += objBankAccountTransactions.menuNew(rowNumber);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (bankAccountTransaction.deleted === 'Y') selectedChoice = "Ja";
    if (bankAccountTransaction.deleted === 'N') selectedChoice = "Nei";

    // delete
    let className = `delete${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showSelectedValuesNew(className, 'width:75px;', selectedChoice, 'Nei', 'Ja')

    // condos
    className = `condoId${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondos.showSelectedCondosNew(className, 'width:100px;', bankAccountTransaction.condoId, 'Ingen er valgt', '');

    // Date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, date, 10);

    // accounts
    className = `accountId${bankAccountTransaction.bankAccountTransactionId}`;
    //html += objAccounts.showSelectedAccountsNew(className, '', bankAccountTransaction.accountId, 'Ingen er valgt', '');
    html += (bankAccountTransaction.accountId === 0)
      ? objAccounts.showSelectedAccountsNew(className, 'background-color: #f89595;', bankAccountTransaction.accountId, 'Ingen er valgt', '')
      : objAccounts.showSelectedAccountsNew(className, '', bankAccountTransaction.accountId, 'Ingen er valgt', '');

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, income, 10);

    // payment
    const payment = formatOreToKroner(bankAccountTransaction.payment);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, payment, 10);

    // KilowattHour
    const numberKWHour = formatOreToKroner(bankAccountTransaction.numberKWHour);
    className = `numberKWHour${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, numberKWHour, 10);

    // text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, text, 45);

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
  html += showTableSumRow(rowNumber, sumIncome, sumPayment);

  // Show the rest of the menu
  rowNumber++;
  html += objBankAccountTransactions.showRestMenuNew(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.result').innerHTML = html;
}