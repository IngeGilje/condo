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
    showHeader();

    // Show filter
    showFilter();

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
    showResult();

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

  // update a dues row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('condoId'))
      || [...event.target.classList].some(cls => cls.startsWith('accountId'))
      || [...event.target.classList].some(cls => cls.startsWith('income'))
      || [...event.target.classList].some(cls => cls.startsWith('payment'))
      || [...event.target.classList].some(cls => cls.startsWith('date'))
      || [...event.target.classList].some(cls => cls.startsWith('text'))) {

      const arrayPrefixes = ['condo', 'account', 'income', 'payment', 'date', 'text'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
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
      }
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

  // Get condominiumId
  const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === Number(objUserPassword.condominiumId));
  if (condominiumsRowNumber !== -1) {

    // Start table
    html = startHTMLTable('width:1450px;');

    // Header filter for search
    html += showHTMLFilterHeader("width:200px;", '', '', '', '', '', '', '');
    html += showHTMLFilterHeader('', '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato');

    // Filter for search
    html += "<tr>";

    html += "<td></td><td></td>";

    // Show all selected condos
    html += objCondos.showSelectedCondosNew('filterCondoId', 'width:100px;', 999999999, '', 'Vis alle');

    const commonCostAccountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccounts.showSelectedAccountsNew('filterAccountId', '', commonCostAccountId, '', 'Alle');

    // show from date
    const fromDate = '01.01.' + String(today.getFullYear());
    html += objBankAccountTransactions.showInputHTMLNew('filterFromDate', fromDate, 10);

    // show to date
    // Current date
    let toDate = getCurrentDate();
    html += objBankAccountTransactions.showInputHTMLNew('filterToDate', toDate, 10);

    // Amount
    html += objBankAccountTransactions.showInputHTMLNew('filterAmount', '', 10);

    html += "</tr>";

    // Header filter
    html += showHTMLFilterHeader("width:750px;", '', '', '', '', '', '', '');

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.filter').innerHTML = html;

    // show icons
    objBankAccountTransactions.showIconNew('filterCondoId');
    objBankAccountTransactions.showIconNew('filterAccountId');
    objBankAccountTransactions.showIconNew('filterFromDate');
    objBankAccountTransactions.showIconNew('filterToDate');
    objBankAccountTransactions.showIconNew('filterAmount');
  }
}

/*
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
*/

/*
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
*/

/*
// Show values for bank account transcation Id
function showValues(bankAccountTransactionId) {

  // Check for valid bank Account Transactions Id
  if (bankAccountTransactionId >= 0) {

    // Find object number in bank account transcation Id array
    const objBankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
    if (objBankAccountTransactionRowNumber !== -1) {

      // Show Bank account transactions id
      document.querySelector('.select-bankaccounttransactions-bankAccountTransactionId').value = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].bankAccountTransactionId;

      // Show condo id
      document.querySelector('.select-bankaccounttransactions-condoId').value = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].condoId;

      // Show account
      document.querySelector('.select-bankaccounttransactions-accountId').value = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].accountId;

      // Show date
      const date = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].date;
      document.querySelector('.input-bankaccounttransactions-date').value =
        formatToNorDate(date);

      // Show income
      const income = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].income;
      document.querySelector('.input-bankaccounttransactions-income').value = formatOreToKroner(income);

      // Show payment
      const payment = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].payment;
      document.querySelector('.input-bankaccounttransactions-payment').value = formatOreToKroner(payment);

      // Show kilo watt per hour
      const numberKWHour = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].numberKWHour;
      document.querySelector('.input-bankaccounttransactions-numberKWHour').value = formatOreToKroner(numberKWHour);

      // Show text
      const text = objBankAccountTransactions.arrayBankAccountTransactions[objBankAccountTransactionRowNumber].text;
      document.querySelector('.input-bankaccounttransactions-text').value = text;

      objBankAccountTransactions.showButton('bankaccounttransactions-cancel', 'Avbryt');
    }
  }
}
*/

// update bankaccounttransactions row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  bankAccountTransactionId = Number(bankAccountTransactionId);

  // Get all column values from current bankaccounttransactions row
  // Check if the bankaccounttransactions row exist
  const bankAccountTransactionRowNumber = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(bankAccountTransactions => bankAccountTransactions.bankAccountTransactionId === bankAccountTransactionId);
  if (bankAccountTransactionRowNumber !== -1) {

    // bankaccounttransactions row exist
    const income = Number(objBankAccountTransactions.arrayBankAccountTransations[bankAccountTransactionRowNumber].income);
    const payment = Number(objBankAccountTransactions.arrayBankAccountTransations[bankAccountTransactionRowNumber].payment);
    const date = Number(objBankAccountTransactions.arrayBankAccountTransations[bankAccountTransactionRowNumber].date);

    // accountId
    className = `.account${bankAccountTransactionId}`;
    const accountId = Number(document.querySelector(className).value);
    const validAccountId = validateNumberNew(accountId, 1, 999999999)

    // condoId
    className = `.condo${bankAccountTransactionId}`;
    const condoId = Number(document.querySelector(className).value);
    const validCondoId = validateNumberNew(condoId, 1, 999999999)

    className = `.numberKWHour${bankAccountTransactionId}`;
    const numberKWHour = Number(document.querySelector(className).value);
    const validNumberKWHour = validateNumberNew(numberKWHour, 0, 999999999)

    // text
    className = `.text${bankAccountTransactionId}`;
    const text = document.querySelector(className).value;
    const validText = objBankAccountTransactions.validateTextNew(text, 3, 255);

    // Validate bankAccountTransactions columns
    if (validAccountId && validAccountId && validNumberKWHour && validText) {

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

// Filter for search
function showHTMLFilterSearch() {

  let html = "<tr><td></td><td></td>";

  // show all selected accounts
  html += objCondo.showSelectedCondosNew('filterCondoId', 'width:100px;', 0, '', 'Alle');

  // show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, '', 'Alle');

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

/*
// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable();

  // Main header
  html += objBankAccountTransactions.showHTMLMainTableHeaderNew('widht:250px;', '', '', '', 'Bankkontotransaksjoner', '', '', '', '',);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.table-header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:1450px;');

  // Main header
  html += objBankAccountTransactions.showHTMLMainTableHeaderNew('widht:250px;', '', '', '', 'Bankkontotransaksjoner', '', '', '', '',);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
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
  html += "<td class='center bold'>Sum</td>";
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


  // Check if bankaccounttransaction row exist
  bankAccountTransactionsRowNumber = objBankAccountTransations.arrayBankAccountTransations.findIndex(bankaccounttransaction => bankaccounttransaction.bankAccountTransationId === bankAccountTransationId);
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
function showResult() {

  // Start HTML table
  let html = startHTMLTable('width:1450px;');

  // Header
  html += objBankAccountTransactions.showHTMLMainTableHeaderNew("width:750px;", '', 'Slett', 'Leilighet', 'Dato', 'Konto', 'Inntekt', 'Kostnad', 'Kilowattimer', 'Tekst');

  let sumIncome = 0;
  let sumPayment = 0;
  let rowNumber = 0;

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
    html += objAccounts.showSelectedAccountsNew(className, '', bankAccountTransaction.accountId, 'Ingen er valgt', '');

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

  /*
  // Insert empty table row for insertion
  html += "<tr>";

  // Show menu
  rowNumber++;
  html += objBankAccountTransactions.menuNew(rowNumber);

  html += "<td></td>";

  // condoId
  const condoId = Number(document.querySelector('.filterCondoId').value);
  className = `condoId0`;
  html += objCondos.showSelectedCondosNew(className, 'width:100px;', condoId, '', '');

  // date
  className = `date0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // accountId
  const accountId = Number(document.querySelector('.filterAccountId').value);
  className = `accountId0`;
  html += objAccounts.showSelectedAccountsNew(className, '', accountId, '', '');

  // income
  className = `income0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // payment
  className = `payment0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // numberKWHour
  className = `numberKWHour0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 10);

  // Text
  className = `numberKWHour0`;
  html += objBankAccountTransactions.showInputHTMLNew(className, '', 45);

  html += "</tr>";
  */

  // Show table sum row
  sumIncome = formatOreToKroner(sumIncome);
  sumPayment = formatOreToKroner(sumPayment);

  rowNumber++;
  html += showTableSumRow(rowNumber, sumIncome, sumPayment);

  // Show the rest of the menu
  rowNumber++;
  html += showRestMenu(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.result').innerHTML = html;
}