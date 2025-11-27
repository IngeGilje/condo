// Bank account transaction search

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Account('account');
const objBankAccounts = new BankAccount('bankaccount');
const objSuppliers = new Suppliers('suppliers');
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
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
    await objBankAccounts.loadBankAccountsTable(objUserPassword.condominiumId, 999999999);
    await objUserBankAccounts.loadUserBankAccountsTable(objUserPassword.condominiumId, 999999999, 999999999);
    await objCondo.loadCondoTable(objUserPassword.condominiumId);
    await objSuppliers.loadSuppliersTable(objUserPassword.condominiumId);

    const amount = 0;
    const condominiumId = objUserPassword.condominiumId;
    const deleted = 'N';
    const condoId = 999999999;
    const accountId = 999999999;
    let fromDate = "01.01." + String(today.getFullYear());
    fromDate = Number(convertDateToISOFormat(fromDate));
    let toDate = getCurrentDate();
    toDate = Number(convertDateToISOFormat(toDate));
    const orderBy = 'date DESC, income DESC';
    await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, deleted, condoId, accountId, amount, fromDate, toDate);

    // Show header
    showHeader();

    // Show filter
    showFilter();

    // Show result of filter
    showResult();

    // Make events
    createEvents();
  }
}

// Make Bank account transactions events
function createEvents() {

  // Show bankaccounttransactions after change of filter
  document.addEventListener('change', (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('filterCondo'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAccount'))
      || [...event.target.classList].some(cls => cls.startsWith('filterFromDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterToDate'))
      || [...event.target.classList].some(cls => cls.startsWith('filterAmount'))) {

      showBankAccountTransactionSync();

      // Show bankaccounttransactions after change of filter
      async function showBankAccountTransactionSync() {

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

        showResult();
      };
    };
  });

  // Delete a bankaccounttransactions row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const className = objBankAccountTransations.getDeleteClass(event.target);
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

        showResult();
      }
    };
  });
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable();

  // Header filter for search
  html += showHTMLFilterHeader('', '', 'Velg leilighet', 'Velg konto', 'Fra dato', 'Til dato', 'Beløp', '', '');

  // Filter for search
  html += showHTMLFilterSearch();

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.table-filter').innerHTML = html;
}

// Show filter
function showLeadingTextFilter() {

  // Show condo
  if (!isClassDefined('select-bankaccounttransactions-condoId')) {

    // Show selected condos
    const condoId = (isClassDefined('select-bankaccounttransactions-filterCondoId')) ? Number(document.querySelector('.select-bankaccounttransactions-filterCondoId').value) : 0;
    objCondo.showSelectedCondos('bankaccounttransactions-filterCondoId', condoId, 'Alle');
  }

  // Show account
  if (!isClassDefined('select-bankaccounttransactions-accountId')) {

    // Show selected accounts
    const accountId = (isClassDefined('select-bankaccounttransactions-filterAccountId')) ? Number(document.querySelector('.select-bankaccounttransactions-filterAccountId').value) : 0;
    objAccounts.showSelectedAccounts('bankaccounttransactions-filterAccountId', accountId, 'Alle');
  }

  // Show from date
  if (!isClassDefined('input-bankaccounttransactions-filterFromDate')) {
    objBankAccountTransactions.showInput('bankaccounttransactions-filterFromDate', 'Fra dato', 10, 'dd.mm.åååå');
  }

  // Show to date
  if (!isClassDefined('input-bankaccounttransactions-filterToDate')) {
    objBankAccountTransactions.showInput('bankaccounttransactions-filterToDate', 'Til dato', 10, 'dd.mm.åååå');
  }

  // Show amount
  if (!isClassDefined('input-bankaccounttransactions-filterAmount')) {
    objBankAccountTransactions.showInput('bankaccounttransactions-filterAmount', 'Beløp', 10, 'Alle');
  }

  // Check for filter from date
  let date = document.querySelector('.input-bankaccounttransactions-filterFromDate').value;
  if (!validateEuroDateFormat(date)) {

    // From date is not ok
    const year = String(today.getFullYear());
    document.querySelector('.input-bankaccounttransactions-filterFromDate').value = "01.01." + year;
  }

  // Check for filter to date
  date = document.querySelector('.input-bankaccounttransactions-filterToDate').value;
  if (!validateEuroDateFormat(date)) {

    // To date is not ok
    document.querySelector('.input-bankaccounttransactions-filterToDate').value =
      getCurrentDate();
  }

  // Check for filter amount
  amount = document.querySelector('.input-bankaccounttransactions-filterAmount').value;
  if (!objBankAccountTransactions.validateNorAmount(amount)) {

    // Amount is not ok
    document.querySelector('.input-bankaccounttransactions-filterAmount').value = '';
  }
}

// Show values for bank Account Transactions
function showLeadingText(bankAccountTransactionId) {

  // Show bank Account Transaction Id
  objBankAccountTransactions.showSelectedBankAccountTransactions('bankaccounttransactions-bankAccountTransactionId', bankAccountTransactionId, '', 'Ingen er valgt');

  // Show all condos
  let condoId = objCondo.arrayCondo.at(-1).condoId;
  objCondo.showSelectedCondos('bankaccounttransactions-condoId', condoId, '', 'Ingen er valgt');

  // Show all accounts
  let accountId = objAccounts.arrayAccounts.at(-1).accountId;
  objAccounts.showSelectedAccounts('bankaccounttransactions-accountId', accountId, '', 'Ingen er valgt');

  // Show date
  objBankAccountTransactions.showInput('bankaccounttransactions-date', '* Dato', 10, 'dd.mm.åååå');

  // Show income
  objBankAccountTransactions.showInput('bankaccounttransactions-income', 'Inntekt', 10, '');

  // Show kilo watt per hour
  objBankAccountTransactions.showInput('bankaccounttransactions-numberKWHour', 'Kilowatt/time', 10, '');

  // Show text
  objBankAccountTransactions.showInput('bankaccounttransactions-text', 'Tekst', 50, '');

  // Show payment
  objBankAccountTransactions.showInput('bankaccounttransactions-payment', 'Utgift', 10, '');

  // show update button 
  objBankAccountTransactions.showButton('bankaccounttransactions-update', 'Oppdater');

  // show insert button
  objBankAccountTransactions.showButton('bankaccounttransactions-insert', 'Ny');

  // show delete button
  objBankAccountTransactions.showButton('bankaccounttransactions-delete', 'Slett');

  // show cancel button
  objBankAccountTransactions.showButton('bankaccounttransactions-cancel', 'Avbryt');
}

// Show values for bank account transcation Id
function showValues(bankAccountTransactionId) {

  // Check for valid bank Account Transactions Id
  if (bankAccountTransactionId >= 0) {

    // Find object number in bank account transcation Id array
    const objBankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTranactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
    if (objBankAccountTransactionRowNumber !== -1) {

      // Show Bank account transactions id
      document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].bankAccountTransactionId;

      // Show condo id
      document.querySelector('.select-bankaccounttransactions-condoId').value = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].condoId;

      // Show account
      document.querySelector('.select-bankaccounttransactions-accountId').value = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].accountId;

      // Show date
      const date = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].date;
      document.querySelector('.input-bankaccounttransactions-date').value =
        formatToNorDate(date);

      // Show income
      const income = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].income;
      document.querySelector('.input-bankaccounttransactions-income').value = formatOreToKroner(income);

      // Show payment
      const payment = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].payment;
      document.querySelector('.input-bankaccounttransactions-payment').value = formatOreToKroner(payment);

      // Show kilo watt per hour
      const numberKWHour = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].numberKWHour;
      document.querySelector('.input-bankaccounttransactions-numberKWHour').value = formatOreToKroner(numberKWHour);

      // Show text
      const text = objBankAccountTransactions.arrayBankAccountTranactions[objBankAccountTransactionRowNumber].text;
      document.querySelector('.input-bankaccounttransactions-text').value = text;

      objBankAccountTransactions.showButton('bankaccounttransactions-cancel', 'Avbryt');
    }
  }
}

// update bankaccounttransactions row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  bankAccountTransactionId = Number(bankAccountTransactionId);

  let income;
  let payment;
  let date;

  // Get all column values from current bankaccounttransactions row
  // Check if the bankaccounttransactions row exist
  const bankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTranactions.findIndex(bankAccountTransactions => bankAccountTransactions.bankAccountTransactionId === bankAccountTransactionId);
  if (bankAccountTransactionRowNumber !== -1) {

    // bankaccounttransactions row exist
    income = objBankAccountTransactions.arrayBankAccountTranactions[bankAccountTransactionRowNumber].income;
    payment = objBankAccountTransactions.arrayBankAccountTranactions[bankAccountTransactionRowNumber].payment;
    date = objBankAccountTransactions.arrayBankAccountTranactions[bankAccountTransactionRowNumber].date;
  } else {

    // bankaccounttransactions row does not exist
    className = `.income${bankAccountTransactionId}`;
    income = Number(document.querySelector(className).value);

    className = `.payment${bankAccountTransactionId}`;
    payment = Number(document.querySelector(className).value);

    className = `.date${bankAccountTransactionId}`;
    date = Number(document.querySelector(className).value);
  }

  // Changeable columns

  // accountId
  className = `.account${bankAccountTransactionId}`;
  let accountId = Number(document.querySelector(className).value);

  // condoId
  className = `.condo${bankAccountTransactionId}`;
  let condoId = Number(document.querySelector(className).value);

  // numberKWHour
  className = `.numberKWHour${bankAccountTransactionId}`;
  const numberKWHour = Number(formatKronerToOre(document.querySelector(className).value));

  // text
  className = `.text${bankAccountTransactionId}`;
  const text = document.querySelector(className).value;
  const validText = objBankAccountTransactions.validateTextNew(text, 3, 255);

  // Validate bankAccountTransactions columns
  if ((condoId >= 1 && condoId <= 999999999)
    && (accountId >= 1 && accountId <= 999999999)
    && (date >= 20000101 && date <= 20991231)
    && (income >= 0 && income <= 999999999)
    && (payment >= -999999999 && payment <= 0)
    && (numberKWHour >= 0 && numberKWHour <= 999999999)
    && validText) {

    const condominiumId = objUserPassword.condominiumId;
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();

    // Check if the bankaccounttransactions row exist
    if (bankAccountTransactionRowNumber !== -1) {

      // update the bankaccounttransactions row
      await objBankAccountTransactions.updateBankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text);

    } else {

      // Insert the bankAccountTransactions row in bankAccountTransactions table
      await objBankAccountTransactions.insertbankAccountTransactionsTable(bankAccountTransactionId, condominiumId, user, lastUpdate, condoId, accountId, income, payment, numberKWHour, date, text);
    }
  }
}

// Filter for search
function showHTMLFilterSearch() {

  let html = "<tr><td></td><td></td>";

  // show all selected accounts
  html += objCondo.showSelectedCondosNew('filterCondoId', '', 0, 'Alle', '');

  // show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, 'Alle', '');

  // from date
  const fromDate = "01.01." + today.getFullYear();
  html += objBankAccountTransactions.showInputHTMLNew('filterFromDate', fromDate, 10);

  // to date
  const toDate = getCurrentDate();
  html += objBankAccountTransactions.showInputHTMLNew('filterToDate', toDate, 10);

  // amount
  html += objBankAccountTransactions.showInputHTMLNew('filterAmount', '', 45);
  html += "<td></td>";
  html += "<td></td>";
  html += "</tr>"

  return html;
}

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable();

  // Main header
  html += showHTMLMainTableHeader('', '', '', '', 'Bankkontotransaksjoner', '', '', '', '',);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.table-header').innerHTML = html;
}


// Show bankAccountTransactions
function showResult() {

  // Start HTML table
  html = startHTMLTable();

  let sumIncome = 0;
  let sumPayment = 0;

  let rowNumber = 0;

  // Header
  html += showHTMLMainTableHeader('Meny', 'Slett', 'Leilighet', 'Konto', 'Dato', 'Inntekt', 'Utgift', 'Kilowattimer', 'tekst');

  objBankAccountTransactions.arrayBankAccountTranactions.forEach((bankAccountTransaction) => {

    rowNumber++;

    html += "<tr>";

    // Show menu
    html += objBankAccountTransactions.menuNew(rowNumber);

    // Delete
    let className = `deleted${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showSelectedValuesNew(className, '', 'Nei', 'Nei', 'Ja')

    // condos
    className = `condo${bankAccountTransaction.bankAccountTransactionId}`;
    html += objCondo.showSelectedCondosNew(className, '', bankAccountTransaction.condoId, '', 'Ingen er valgt');

    // accounts
    className = `account${bankAccountTransaction.bankAccountTransactionId}`;
    html += objAccounts.showSelectedAccountsNew(className, '', bankAccountTransaction.accountId, '', 'Ingen er valgt');

    // date
    const date = formatToNorDate(bankAccountTransaction.date);
    className = `date${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, date, 10);

    // income
    const income = formatOreToKroner(bankAccountTransaction.income);
    className = `income${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, income, 10);

    // payment
    const payment = formatOreToKroner(bankAccountTransaction.payment);
    className = `payment${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, payment, 10);

    // numberKWHour-hour
    const kilowattHour = formatOreToKroner(bankAccountTransaction.numberKWHour);
    className = `numberKWHour${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, kilowattHour, 10);

    // Text
    const text = bankAccountTransaction.text;
    className = `text${bankAccountTransaction.bankAccountTransactionId}`;
    html += objBankAccountTransactions.showInputHTMLNew(className, text, 45);

    html += "</tr>";

    // accumulate
    sumIncome += Number(bankAccountTransaction.income);
    sumPayment += Number(bankAccountTransaction.payment);
  });

  // Make one last table row for insertion in table 
  rowNumber++;

  // Insert empty table row for insertion
  html += insertEmptyTableRow(rowNumber);

  // Sum row
  rowNumber++;

  sumIncome = formatOreToKroner(sumIncome);
  sumPayment = formatOreToKroner(sumPayment);

  // Show table sum row
  html += showTableSumRow(rowNumber, sumIncome, sumPayment);

  // Show the rest of the menu
  //rowNumber++;
  html += showRestMenu(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.table-result').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "<tr>";

  // Show menu
  html += objBankAccountTransactions.menuNew(rowNumber);

  html += "<td></td>";

  // condos
  className = `condo0`;
  html += objCondo.showSelectedCondosNew(className, '', '', '', 'Ingen er valgt');

  // accounts
  className = `account0`;
  html += objAccounts.showSelectedAccountsNew(className, '', '', '', 'Ingen er valgt');

  // date
  className = `date0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // income
  className = `income0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // payment
  className = `payment0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // numberKWHour-hour
  className = `numberKWHour0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // Text
  className = `numberKWHour0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 45);

  html += "</tr>";
  return html;
}

// Show table sum row
function showTableSumRow(rowNumber, sumIncome, sumPayment) {

  let html =
    `
      <tr 
        class="menu"
      >
    `;
  // Show menu
  html += objBankAccountTransactions.menuNew(rowNumber);
  html += "<td></td>";
  html += "<td></td>";
  html += "<td></td>";
  html += "<td class='bold'>Sum</td>";
  html += `<td class="center bold">${sumIncome}</td>`;
  html += `<td class="center bold">${sumPayment}</td>`
  html += "</tr>";

  return html;
}

// Show the rest of the menu
function showRestMenu(rowNumber) {

  let html = "";
  for (; objBankAccountTransactions.arrayMenu.length >= rowNumber; rowNumber++) {

    html +=
      `
        <tr 
          class="menu"
        >
      `;
    // Show menu
    html += objBankAccountTransactions.menuNew(rowNumber);
    html +=
      `
        </tr>
      `;
  }

  return html;
}

// Delete bankaccounttransactions row
async function deleteBankAccountTransactionRow(bankAccountTransationId, className) {

  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  // Check if bankaccounttransaction row exist
  bankAccountTransactionsRowNumber = objBankAccountTransations.arrayBankAccountTransations.findIndex(bankaccounttransaction => bankaccounttransaction.bankAccountTransationId === bankAccountTransationId);
  if (bankAccountTransactionsRowNumber !== -1) {

    // delete bankaccounttransaction row
    objBankAccountTransactions.deleteBankAccountTransationsTable(bankAccountTransationId, user, lastUpdate);
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