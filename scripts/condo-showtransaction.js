// Show bank account transactions

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objBankAccount = new BankAccount('bankaccount');
const objSupplier = new Supplier('supplier');
const objCondominium = new Condominium('scondominium');
const objUserBankAccount = new UserBankAccount('userbankaccount');
const objTransaction = new Transaction('transaction');
const objShowTransaction = new ShowTransaction('showtransaction');

const enableChanges = (objAccount.securityLevel > 5);

const columnWidths = [175, 175, 175, 175, 175];

const params = new URLSearchParams(window.location.search);
const paramCondoId = Number(params.get("condoId"));
const paramAccountId = Number(params.get("accountId"));
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

      // Show main menu
      html = objShowTransaction.showHorizontalMenu(objShowTransaction.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show account menu
      html = objShowTransaction.showHorizontalMenu(objShowTransaction.arrayMenuAccount);
      document.querySelector('.menuAccount').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objTransaction.condominiumId, resident, objTransaction.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objTransaction.condominiumId, fixedCost);
      await objBankAccount.loadBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objUserBankAccount.loadUserBankAccountsTable(objTransaction.condominiumId, objTransaction.nineNine, objTransaction.nineNine);
      await objCondo.loadCondoTable(objTransaction.condominiumId, objTransaction.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objSupplier.loadSuppliersTable(objTransaction.condominiumId);

      // Show header
      showHeader();

      // Show filter
      let condoId = 0;
      if (paramCondoId === 0) {

        const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objTransaction.userId);
        if (rowNumberUser !== -1) condoId = objUser.arrayUsers[rowNumberUser].condoId;
      } else {

        condoId = paramCondoId;
      }

      let accountId = (paramAccountId === 0)
        ? objTransaction.nineNine
        : paramAccountId;
      showFilter(objTransaction.nineNine, accountId);

      const amount = Number(document.querySelector('.filterAmount').value);
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objShowTransaction.formatDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objShowTransaction.formatDateToNumber(toDate));
      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);

      // Show transactions
      showTransactions();

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

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objShowTransaction.formatDateToNumber(fromDate));

      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objShowTransaction.formatDateToNumber(toDate));

      let amount = document.querySelector('.filterAmount').value;
      amount = formatKronerToOre(amount);
      document.querySelector('.filterAmount').value = formatOreToKroner(amount);

      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);

      showTransactions();
    };
  });

  // Show bank voucher
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {

      const arrayPrefixes = ['voucher'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

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
  let html = objShowTransaction.initializeTable(columnWidths);

  // start table body
  html += objShowTransaction.startTableBody();

  // show main header
  html += objShowTransaction.showTableHeaderLogOut('', '', 'Transaksjoner', '');
  html += "</tr>";

  // end table body
  html += objShowTransaction.endTableBody();

  // The end of the table
  html += objShowTransaction.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(condoId, accountId) {

  /*
  // Start table
  let html = objShowTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  html += objTransaction.showTableHeaderMenu('', 'center', 'Leilighet', 'Konto', 'Fra dato', 'Til dato', 'Beløp');

  // start table body
  html += objShowTransaction.startTableBody();

  // insert a table row (<tr></td>)
  html += objTransaction.insertTableRow('');

  // Show selected condos
  html += objCondo.showSelectedCondos('filterCondoId', '', condoId, '', 'Vis alle', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', '', accountId, '', 'Vis alle', true);

  // show from date
  let month = today.getMonth();
  month = (month < 10) ? `0${month}` : `${month}`;
  const fromDate = '01.' + month + '.' + String(today.getFullYear());
  html += objTransaction.editTableCellCenter('filterFromDate', fromDate, 10, true);

  let toDate = getCurrentDate();
  html += objTransaction.editTableCellCenter('filterToDate', toDate, 10, true);

  // Amount
  html += objTransaction.editTableCellCenter('filterAmount', '', 10, true);

  html += "</tr>";

  // insert a table row (<tr></td>)
  html += objTransaction.insertTableRow('', '', '', '', '', '');

  // end table body
  html += objShowTransaction.endTableBody();

  // The end of the table
  html += objShowTransaction.endTable();
  document.querySelector('.showFilter').innerHTML = html;
  */

  // show filter
  html = objShowTransaction.startRow();

  // Show condos
  html += objCondo.showSelectedCondosNew('Leilighet', 'filterCondoId', '', condoId, '', 'Vis alle', true);

  // Show accounts
  html += objAccount.showSelectedAccountsNew('Konto', 'filterAccountId', '', objShowTransaction.nineNine, '', 'Vis alle', true);

  // From date
  let month = today.getMonth();
  month = (month < 10) ? `0${month}` : `${month}`;
  const fromDate = `${String(today.getFullYear())}-${month}-01`;
  html += objShowTransaction.editDate('Fra Dato', 'filterFromDate', fromDate, true)

  // To date
  // Current date
  let toDate = getCurrentIsoDate();
  html += objShowTransaction.editDate('Til Dato', 'filterToDate', toDate, true)

  // Amount
  const amount = objShowTransaction.formatAmount('');
  html += objShowTransaction.editAmount('Beløp', 'filterAmount', amount, true);

  html += objShowTransaction.endRow();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show transactions
function showTransactions() {

  // Start table
  let html = objShowTransaction.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objCondo.showTableHeaderMenu('#e0f0e0', 'center', 'Dato', 'Konto', 'Leilighet', 'Beløp', '');
  let sumAmount = 0;

  for (const bankTransaction of objTransaction.arrayTransactions) {

    html += objAccount.insertTableRow('');

    // Date
    const date = formatNumberToNorDate(bankTransaction.date);
    let className = `date${bankTransaction.transactionId}`;
    html += objTransaction.editTableCell(className, date, 10, false);

    // account
    className = `accountId${bankTransaction.transactionId}`;
    html += objAccount.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

    // condos
    className = `condoId${bankTransaction.transactionId}`;
    html += objCondo.showSelectedCondos(className, '', bankTransaction.condoId, '-', '', false);

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
    html += objShowTransaction.showButton(className, 'Vis bilag');

    html += "</tr>";

    // accumulate
    sumAmount += Number(bankTransaction.income) + Number(bankTransaction.payment);
  };

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  html += objTransaction.insertTableRow('', '', '', 'Sum', sumAmount, '');

  // The end of the table
  html += objShowTransaction.endTable();
  document.querySelector('.result').innerHTML = html;
}