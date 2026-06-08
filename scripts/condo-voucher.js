// Voucher maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objTransaction = new Transaction('transaction');
const objVoucher = new Voucher('voucher');

const enableChanges = (objVoucher.securityLevel > 5);

const columnWidths = [175, 175, 175, 200, 100];

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
      const orderBy = 'transactionId DESC, date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransaction.nineNine, 0, fromDate, toDate);

      menuNumber = showFilter(menuNumber);

      // Show result
      //if (transactionId === 0) transactionId = objTransaction.arrayTransactions[0].transactionId;
      menuNumber = showVoucher(paramTransactionId, menuNumber);

      // Events
      events();
    }
  } else {

    objVoucher.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for voucher
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterTransactionId')) {

      const orderBy = 'transactionId DESC, date DESC, income DESC';
      await objTransaction.loadTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransaction.nineNine, 0, objVoucher.nineNine);

      const transactionId = Number(document.querySelector('.filterTransactionId').value);

      showVoucher(transactionId, 2);
    };
  });

  // file name pdf document
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('voucherFileName')) {

      // Update a transaction row
      const transactionId = Number(document.querySelector('.filterTransactionId').value);
      updateTransactionRow(transactionId);
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
    if (event.target.classList.contains('back')) {

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const transactionId = document.querySelector('.filterTransactionId').value;
      URL = `${URL}condo-showtransaction.html?transactionId=${transactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}`;
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
  html += objTransaction.showTableHeaderLogOut('', '', 'Vis bilag', '');
  html += "</tr>";

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(menuNumber) {

  // Start table
  let html = objTransaction.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objTransaction.showTableHeaderMenu(menuNumber, objTransaction.accountMenu, '', 'center', '', 'Bilagsnummer', '', '');

  // start table body
  html += objTransaction.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '');

  // show selected transactions
  html += objTransaction.showSelectedTransactions('filterTransactionId', '', paramTransactionId, '', '', false);

  html += "<td></td><td></td></tr>";

  // end table body
  html += objTransaction.endTableBody();

  // The end of the table
  html += objTransaction.endTable();
  document.querySelector('.editFilter2').innerHTML = html;

  return menuNumber;
}

// Show result
function showVoucher(transactionId, menuNumber) {

  // start table
  let html = objTransaction.initializeTable(columnWidths);

  // Check if transaction row exist
  const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
  if (rowNumberTransaction !== -1) {

    // date and amount
    menuNumber++;
    html += objVoucher.showTableHeaderMenu(menuNumber, objVoucher.accountMenu, '', 'center', 'Dato', 'Beløp', 'Konto', '');

    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

    // date
    let date = objTransaction.arrayTransactions[rowNumberTransaction].date;
    date = (date) ? formatNumberToNorDate(date) : '';
    html += objTransaction.editTableCell('date', date, 10, false);

    // amount
    const income = objTransaction.arrayTransactions[rowNumberTransaction].income;
    const payment = objTransaction.arrayTransactions[rowNumberTransaction].payment;
    const amount = formatOreToKroner((income) ? income : payment);
    html += objTransaction.editTableCell('amount', amount, 11, false);

    // account
    const accountId = objTransaction.arrayTransactions[rowNumberTransaction].accountId;
    html += objAccount.showSelectedAccounts('accountId', 'width:175px;', accountId, '', '', false);

    html += "</tr>";

    // file name of the voucher
    menuNumber++;
    html += objVoucher.showTableHeaderMenu(menuNumber, objVoucher.accountMenu, '', 'center', 'Filnavn', '', '', '');

    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

    let voucherFileName = objTransaction.arrayTransactions[rowNumberTransaction].voucherFileName;
    voucherFileName = (voucherFileName)
      ? voucherFileName
      : `${transactionId}.pdf`;
    html += objTransaction.editTableCell('voucherFileName', voucherFileName, 45, enableChanges);

    html += "<td></td><td></td><td></td></tr>";

    // Show button
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '', '', '', '');
    html += "</tr>";

    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

    html += objTransaction.showButton('back', 'Tilbake');
    html += "<td></td><td></td><td></td></tr>";

    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '', '', '', '');
    html += "</tr>";

    // Show pdf file
    menuNumber++;
    html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu);

    html += `
      <td colspan="4" rowspan="13" class="left">
        <iframe
         src="/data/${voucherFileName}">
        </iframe>
      </td>
    </tr>`;

    // Show the rest of the menu
    menuNumber++;
    html += objTransaction.showRestMenu(menuNumber, objTransaction.accountMenu);

    // The end of the table
    html += objTransaction.endTable();
    document.querySelector('.result').innerHTML = html;

    return menuNumber;
  }
}

// Update a transaction row
async function updateTransactionRow(transactionId) {

  if (transactionId === '') transactionId = -1
  const validTransactionId = objTransaction.validateInterval('transactionId', columnWidths, '', 'Ugyldig bankkonto', true, Number(transactionId), -1, objTransaction.nineNine);

  // validate voucher filename
  const voucherFileName = document.querySelector('.voucherFileName').value;

  // Check if the file exist
  let validVoucherFileName = false;
  if (await objVoucher.checkIfFileExist(voucherFileName)) {
    validVoucherFileName = true;
  } else {
    objVoucher.showMessageNew(columnWidths, '', 'Ugyldig filnavn på bilag.');
  }

  if (validVoucherFileName && validTransactionId) {

    document.querySelector('.message').style.display = "none";

    // Check if the transactionId exist
    const rowNumberTransaction = objTransaction.arrayTransactions.findIndex(condo => condo.transactionId === transactionId);
    if (rowNumberTransaction !== -1) {

      // update the transactions row
      if (await objTransaction.updateVoucherFileName(user, transactionId, voucherFileName)) {

        const orderBy = 'transactionId DESC, date DESC, income DESC';
        await objTransaction.loadTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransaction.nineNine, 0, objVoucher.nineNine);
      } else {

        objVoucher.showMessageNew(columnWidths, '', 'Bilag er ikke oppdatert.');
      }

      showVoucher(transactionId, 2);
    }
  }
}