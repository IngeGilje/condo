// Voucher maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');
const objVoucher = new Voucher('voucher');

const enableChanges = (objVoucher.securityLevel > 5);
const tableWidth = 'width:800px;';

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
    if ((objVoucher.condominiumId === 0) || (objVoucher.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

            // Show horizonal menu
      let html = objVoucher.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objVoucher.condominiumId, fixedCost);

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      let fromDate = 20000101;
      let toDate = 20991231;
      const orderBy = 'bankAccountTransactionId DESC, date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, objBankAccountTransaction.condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, 0, fromDate, toDate);

      menuNumber = showFilter(menuNumber);

      // Show result
      //if (bankAccountTransactionId === 0) bankAccountTransactionId = objBankAccountTransaction.arrayBankAccountTransactions[0].bankAccountTransactionId;
      menuNumber = showVoucher(paramBankAccountTransactionId, menuNumber);

      // Events
      events();
    }
  } else {

    objVoucher.showMessage(objVoucher, '', 'Server er ikke startet.');
  }
}

// Events for voucher
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterBankAccountTransactionId')) {

      const orderBy = 'bankAccountTransactionId DESC, date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, 0, 0, objVoucher.nineNine);

      const bankAccountTransactionId = Number(document.querySelector('.filterBankAccountTransactionId').value);

      showVoucher(bankAccountTransactionId, 2);
    };
  });

  // file name pdf document
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('voucherFileName')) {

      // Update a bank account transaction row
      const bankAccountTransactionId = Number(document.querySelector('.filterBankAccountTransactionId').value);
      updateBankAccountTransactionRow(bankAccountTransactionId);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let URL = (objVoucher.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-login.html`;
      window.location.href = URL;
    };
  });

  // Back
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('bankAccountTransaction')) {

      let URL = (objBankAccountTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const bankAccountTransactionId = document.querySelector('.filterBankAccountTransactionId').value;
      URL = `${URL}condo-bankAccountTransaction.html?bankAccountTransactionId=${bankAccountTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}`;
      window.location.href = URL;
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // show main header
  html += objBankAccountTransaction.showTableHeaderLogOut('width:175px;', '', '', 'Vis bilag', '');
  html += "</tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, bankAccountTransactionId) {

  // Start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu('width:175px;', menuNumber, objBankAccountTransaction.accountMenu, '', 'Velg bankkontotransaksjon', '');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('width:175px;', menuNumber,objBankAccountTransaction.accountMenu, '');

  // show selected bank account transactions
  html += objBankAccountTransaction.showSelectedBankAccountTransactions('filterBankAccountTransactionId', 'width:175px;', bankAccountTransactionId, '')

  html += "<td></td></tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.filter2').innerHTML = html;

  return menuNumber;
}

// Show result
function showVoucher(bankAccountTransactionId, menuNumber) {

  // start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // Check if bank account transaction row exist
  const rowNumberBankAccountTransaction = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // date and amount
    menuNumber++;
    html += objVoucher.showTableHeaderMenu("width:175px;", menuNumber, objVoucher.accountMenu, 'Dato', 'Beløp', 'Konto');

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber,objBankAccountTransaction.accountMenu);

    // date
    let date = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].date;
    date = (date) ? formatNumberToNorDate(date) : '';
    html += objBankAccountTransaction.inputTableColumn('date', '', date, 10, false);

    // amount
    const income = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].income;
    const payment = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].payment;
    const amount = formatOreToKroner((income) ? income : payment);
    html += objBankAccountTransaction.inputTableColumn('amount', '', amount, 11, false);

    // account
    const accountId = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].accountId;
    html += objAccount.showSelectedAccounts('accountId', 'width:175px;', accountId, '', '', false);

    html += "</tr>";

    // file name of the voucher
    menuNumber++;
    html += objVoucher.showTableHeaderMenu("width:175px;", menuNumber, objVoucher.accountMenu, 'Filnavn', '', '');

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber,objBankAccountTransaction.accountMenu);

    let voucherFileName = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].voucherFileName;
    voucherFileName = (voucherFileName) 
    ? voucherFileName 
    : `${bankAccountTransactionId}.pdf`;
    html += objBankAccountTransaction.inputTableColumn('voucherFileName', '', voucherFileName, 45, enableChanges);

    html += "<td></td><td></td></tr>";

    // Show button
    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber,objBankAccountTransaction.accountMenu, '', '', '');
    html += "</tr>";

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber,objBankAccountTransaction.accountMenu);

    html += objBankAccountTransaction.showButton('width:175px;', 'bankAccountTransaction', 'Tilbake');
    html += "</tr>";

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber,objBankAccountTransaction.accountMenu, '', '', '');
    html += "</tr>";

    // Show pdf file
    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber,objBankAccountTransaction.accountMenu);

    html += `
      <td colspan="3" rowspan="13">
        <iframe
         src="/data/${voucherFileName}">
        </iframe>
      </td>
    </tr>`;

    // Show the rest of the menu
    menuNumber++;
    html += objBankAccountTransaction.showRestMenu(menuNumber, objBankAccountTransaction.accountMenu);

    // The end of the table
    html += objBankAccountTransaction.endTable();
    document.querySelector('.result').innerHTML = html;

    return menuNumber;
  }
}

// Update a bank account transaction row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  if (bankAccountTransactionId === '') bankAccountTransactionId = -1
  const validbankAccountTransactionId = objBankAccountTransaction.validateNumber('bankAccountTransactionId', Number(bankAccountTransactionId), -1, objBankAccountTransaction.nineNine, objBankAccountTransaction, '', 'Ugyldig bankkonto');

  // validate voucher filename
  const voucherFileName = document.querySelector('.voucherFileName').value;

  // Check if the file exist
  let validVoucherFileName = false;
  if (await objVoucher.checkIfFileExist(voucherFileName)) {
    validVoucherFileName = true;
  } else {
    objVoucher.showMessage(objVoucher, '', 'Ugyldig filnavn på bilag.');
  }

  if (validVoucherFileName && validbankAccountTransactionId) {

    document.querySelector('.message').style.display = "none";

    // Check if the bankAccountTransactionId exist
    const rowNumberBankAccountTransaction = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(condo => condo.bankAccountTransactionId === bankAccountTransactionId);
    if (rowNumberBankAccountTransaction !== -1) {

      // update the bankaccounttransactions row
      if (await objBankAccountTransaction.updateVoucherFileName(user, bankAccountTransactionId, voucherFileName)) {

        const orderBy = 'bankAccountTransactionId DESC, date DESC, income DESC';
        await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, 0, 0, objVoucher.nineNine);
      } else {

        objVoucher.showMessage(objVoucher, '', 'Bilag er ikke oppdatert.');
      }

      /*
      // Show filter
      orderBy = 'bankAccountTransactionId DESC, date DESC, income DESC';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = convertDateToISOFormat(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = convertDateToISOFormat(toDate);
      menuNumber = showFilter(menuNumber, bankAccountTransactionId);
      */

      showVoucher(bankAccountTransactionId, 2);
    }
  }
}