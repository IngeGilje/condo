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

const columnWidths = [175, 175, 175, 175, 175, 175];

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

      let accountId = (paramAccountId === 0)
        ? objTransaction.nineNine
        : paramAccountId;
      menuNumber = showFilter(menuNumber, objTransaction.nineNine, accountId);

      const amount = Number(document.querySelector('.filterAmount').value);
      const deleted = 'N';
      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(formatNorDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(formatNorDateToNumber(toDate));
      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);

      // Show result of filter
      menuNumber = showTransactions(menuNumber);

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
      fromDate = Number(formatNorDateToNumber(fromDate));

      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(formatNorDateToNumber(toDate));

      let amount = document.querySelector('.filterAmount').value;
      amount = formatKronerToOre(amount);

      const orderBy = 'date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, deleted, condoId, accountId, objTransaction.nineNine, amount, fromDate, toDate);
  
      showTransactions(3);
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
  html += objShowTransaction.showTableHeaderLogOut('', '', '', 'Transaksjoner', '');
  html += "</tr>";

  // end table body
  html += objShowTransaction.endTableBody();

  // The end of the table
  html += objShowTransaction.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, condoId, accountId) {

  // Start table
  let html = objShowTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objTransaction.showTableHeaderMenu(menuNumber, objTransaction.accountMenu, '', 'center','Leilighet', 'Konto', 'Fra dato', 'Til dato', 'Beløp');

  // start table body
  html += objShowTransaction.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

  // Show selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', condoId, '', 'Vis alle', true);

  // Show all selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', 'width:175px;', accountId, '', 'Vis alle', true);

  // show from date
  let month = today.getMonth() + 1;
  month = (month < 10) ? `0${month}` : `${month}`;
  const fromDate = '01.' + month + '.' + String(today.getFullYear());
  html += objTransaction.editTableCell('filterFromDate', fromDate, 10, true);

  // Current date
  let toDate = getCurrentDate();
  html += objTransaction.editTableCell('filterToDate', toDate, 10, true);

  // Amount
  html += objTransaction.editTableCell('filterAmount', '', 10, true);

  html += "</tr>";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '', '', '', '', '');

  // end table body
  html += objShowTransaction.endTableBody();

  // The end of the table
  html += objShowTransaction.endTable();
  document.querySelector('.editFilter').innerHTML = html;

  return menuNumber;
}

// Show transactions
function showTransactions(menuNumber) {

  // Start table
  let html = objShowTransaction.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '#e0f0e0', 'center', 'Dato', 'Konto', 'Leilighet', 'Beløp', '');
  let sumAmount = 0;

  for (const bankTransaction of objTransaction.arrayTransactions) {

    // Show menu
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber, objTransaction.accountMenu);

    // Date
    const date = formatNumberToNorDate(bankTransaction.date);
    let className = `date${bankTransaction.transactionId}`;
    html += objTransaction.editTableCell(className, date, 10, false);

    // account
    className = `accountId${bankTransaction.transactionId}`;
    html += objAccount.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

    // condos
    className = `condoId${bankTransaction.transactionId}`;
    html += objCondo.showSelectedCondos(className, 'width:175px;', bankTransaction.condoId, '-', '', false);

    // accounts
    className = `accountId${bankTransaction.transactionId}`;

    objAccount.showSelectedAccounts(className, 'width:175px;', bankTransaction.accountId, 'Velg konto', '', false);

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

  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '', '', 'Sum', sumAmount, '');

  // Show the rest of the menu
  menuNumber++;
  html += objTransaction.showRestMenu(menuNumber, objTransaction.accountMenu, '', '', '', '', '');

  // The end of the table
  html += objShowTransaction.endTable();
  document.querySelector('.result').innerHTML = html;
}