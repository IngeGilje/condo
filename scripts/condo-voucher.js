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
let bankAccountTransactionId = Number(params.get("bankAccountTransactionId"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      let fromDate = 20000101;
      let toDate = 20991231;
      const orderBy = 'bankAccountTransactionId DESC, date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, 0, fromDate, toDate);

      menuNumber = showFilter(menuNumber);

      // Show result
      if (bankAccountTransactionId === 0) bankAccountTransactionId = objBankAccountTransaction.arrayBankAccountTransactions[0].bankAccountTransactionId;
      menuNumber = showResult(bankAccountTransactionId, menuNumber);

      // Events
      events();
    }
  } else {

    objVoucher.showMessage(objVoucher, '', 'condo-server.js er ikke startet.');
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

      showResult(bankAccountTransactionId, 2);
    };
  });

  // file name pdf document
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('voucerFileName')) {

      // Update a bank account transaction row
      const bankAccountTransactionId = Number(document.querySelector('.filterBankAccountTransactionId').value);
      updateBankAccountTransactionRow(bankAccountTransactionId);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objVoucher.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });

  // Back
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('bankAccountTransaction')) {

      let url = (objBankAccountTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const bankAccountTransationId = document.querySelector('.filterBankAccountTransactionId').value;
      url = `${url}condo-bankAccountTransaction.html?bankAccountTransactionId=${bankAccountTransationId}`;
      window.location.href = url;
    };
  });
}

// Show header
function showHeader() {

  // Start table
  html = objBankAccountTransaction.startTable(tableWidth);

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
  html = objBankAccountTransaction.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu('width:175px;', menuNumber, '', 'Velg bankkontotransaksjon', '');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objBankAccountTransaction.insertTableColumns('width:175px;', menuNumber, '');

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
function showResult(bankAccountTransactionId, menuNumber) {

  // start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // Check if bank account transactin row exist
  const rowNumberBankAccountTransaction = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // date and amount
    menuNumber++;
    html += objVoucher.showTableHeaderMenu("width:175px;", menuNumber, 'Dato', 'Beløp', 'Konto');
    html += "</tr>";

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber);

    // date
    let date = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].date;
    date = (date) ? formatToNorDate(date) : '';
    html += objBankAccountTransaction.inputTableColumn('date', '', date, 10, false);

    // amount
    const income = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].income;
    const payment = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].payment;
    const amount = formatOreToKroner((income) ? income : payment);
    html += objBankAccountTransaction.inputTableColumn('amount', '', amount, 10, false);

    // account
    const accountId = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].accountId;
    html += objAccount.showSelectedAccounts('accountId', 'width:175px;', accountId, '', '', false);

    html += "</tr>";


    // file name of the voucher
    menuNumber++;
    html += objVoucher.showTableHeaderMenu("width:175px;", menuNumber, 'Filnavn', '', '');
    html += "</tr>";

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber);

    let voucerFileName = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].voucerFileName;
    voucerFileName = (voucerFileName) ? voucerFileName : `${bankAccountTransactionId}.pdf`;
    html += objBankAccountTransaction.inputTableColumn('voucerFileName', '', voucerFileName, 45, enableChanges);

    html += "<td></td><td></td></tr>";

    // Show button
    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber, '', '', '');
    html += "</tr>";

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber);

    html += objBankAccountTransaction.showButton('width:175px;', 'bankAccountTransaction', 'Tilbake');
    html += "</tr>";

    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber, '', '', '');
    html += "</tr>";

    // Show pdf file
    menuNumber++;
    html += objBankAccountTransaction.insertTableColumns('', menuNumber);

    html += `
      <td colspan="3" rowspan="13">
        <iframe
         src="/data/${voucerFileName}">
        </iframe>
      </td>
    </tr>`;

    // Show the rest of the menu
    menuNumber++;
    html += objBankAccountTransaction.showRestMenu(menuNumber);

    // The end of the table
    html += objBankAccountTransaction.endTable();
    document.querySelector('.result').innerHTML = html;

    return menuNumber;
  }
}

// Update a bank account transaction row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  if (bankAccountTransactionId === '') bankAccountTransactionId = -1
  const validbankAccountTransactionId = objBankAccountTransaction.validateNumber('bankAccountTransactionId', Number(bankAccountTransactionId), -1, objBankAccountTransaction.nineNine, object, style, message);

  // validate voucer filename
  const voucerFileName = document.querySelector('.voucerFileName').value;

  // Check if the file exist
  let validVoucerFileName = false;
  if (await objVoucher.checkIfFileExists(voucerFileName)) {
    validVoucerFileName = true;
  } else {
    objVoucher.showMessage(objVoucher, '', 'Ugyldig filnavn på bilag.');
  }

  if (validVoucerFileName && validbankAccountTransactionId) {

    // Check if the bankAccountTransactionId exist
    const rowNumberBankAccountTransaction = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(condo => condo.bankAccountTransactionId === bankAccountTransactionId);
    if (rowNumberBankAccountTransaction !== -1) {

      // update the bankaccounttransactions row
      if (await objBankAccountTransaction.updateVoucerFileName(user, bankAccountTransactionId, voucerFileName)) {

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

      showResult(bankAccountTransactionId, 2);
    }
  }
}