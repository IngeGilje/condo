// Voucher maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBankAccountTransaction = new BankAccountTransaction('bankaccounttransaction');
const objVoucher = new Voucher('voucher');

const disableChanges = (objVoucher.securityLevel < 5);
const condominiumId = objVoucher.condominiumId;
const user = objVoucher.user;

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

      // Show filter #1
      menuNumber = showFilter1(menuNumber);

      // Show filter #2
        let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = convertDateToISOFormat(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = convertDateToISOFormat(toDate);
      const orderBy = 'bankAccountTransactionId DESC, date DESC, income DESC';
      await objBankAccountTransaction.loadBankAccountTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, 0, fromDate, toDate);
      bankAccountTransactionId = (bankAccountTransactionId === 0) ? objBankAccountTransaction.arrayBankAccountTransactions.at(-1).bankAccountTransactionId : bankAccountTransactionId;
    menuNumber = showFilter2(menuNumber, bankAccountTransactionId);

      // Show result
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
      let menuNumber = 0;
      menuNumber = showResult(bankAccountTransactionId, menuNumber);
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
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // show main header
  html += objBankAccountTransaction.showTableHeader('width:175px;', 'Vis bilag');

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objBankAccountTransaction.startTable(tableWidth);

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // show main header
  html += objBankAccountTransaction.showTableHeaderLogOut('width:175px;', '','','Vis bilag','');
  html += "</tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter1(rowNumber) {

  // Start table
  html = objBankAccountTransaction.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu('width:175px;', rowNumber, 'Fra dato', 'Til dato', '');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransaction.insertTableColumns('width:175px;', rowNumber);

  // from date
  const year = String(today.getFullYear());
  let fromDate = "01.01." + year;
  html += objBankAccountTransaction.inputTableColumn('filterFromDate', '', fromDate, 10);

  // to date
  let toDate = getCurrentDate();
  html += objBankAccountTransaction.inputTableColumn('filterToDate', '', toDate, 10);

  html += "<td></td></tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.filter1').innerHTML = html;

  return rowNumber;
}

// Show filter
function showFilter2(rowNumber, bankAccountTransactionId) {

  // Start table
  html = objBankAccountTransaction.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objBankAccountTransaction.showTableHeaderMenu('width:175px;', rowNumber, '', 'Velg bankkontotransaksjon', '');

  // start table body
  html += objBankAccountTransaction.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransaction.insertTableColumns('width:175px;', rowNumber, '');

  // show selected bank account transactions
  html += objBankAccountTransaction.showSelectedBankAccountTransactions('filterBankAccountTransactionId', 'width:175px;', bankAccountTransactionId, '')

  html += "<td></td></tr>";

  // end table body
  html += objBankAccountTransaction.endTableBody();

  // The end of the table
  html += objBankAccountTransaction.endTable();
  document.querySelector('.filter2').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(bankAccountTransactionId, rowNumber) {

  // start table
  let html = objBankAccountTransaction.startTable(tableWidth);

  // Check if bank account transactin row exist
  const rowNumberBankAccountTransaction = objBankAccountTransaction.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // date and amount
    rowNumber++;
    html += objVoucher.showTableHeaderMenu("width:175px;", rowNumber, 'Dato', 'Beløp', 'Konto');
    html += "</tr>";

    rowNumber++;
    html += objBankAccountTransaction.insertTableColumns('', rowNumber);

    // date
    let date = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].date;
    date = (date) ? formatToNorDate(date) : '';
    html += objBankAccountTransaction.inputTableColumn('date', '', date, 10, true);

    // amount
    const income = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].income;
    const payment = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].payment;
    const amount = formatOreToKroner((income) ? income : payment);
    html += objBankAccountTransaction.inputTableColumn('amount', '', amount, 10, true);

    // account
    const accountId = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].accountId;
    html += objAccount.showSelectedAccounts('accountId', 'width:175px;', accountId, '', '', true);

    html += "</tr>";


    // file name of the voucher
    rowNumber++;
    html += objVoucher.showTableHeaderMenu("width:175px;", rowNumber, 'Filnavn', '', '');
    html += "</tr>";

    rowNumber++;
    html += objBankAccountTransaction.insertTableColumns('', rowNumber);

    let voucerFileName = objBankAccountTransaction.arrayBankAccountTransactions[rowNumberBankAccountTransaction].voucerFileName;
    voucerFileName = (voucerFileName) ? voucerFileName : `${bankAccountTransactionId}.pdf`;
    html += objBankAccountTransaction.inputTableColumn('voucerFileName', '', voucerFileName, 45);

    html += "<td></td><td></td></tr>";

    // Show pdf file
    rowNumber++;
    html += objBankAccountTransaction.insertTableColumns('', rowNumber);

    html += `
      <td colspan="3" rowspan="13">
        <iframe
         src="/data/${voucerFileName}">
        </iframe>
      </td>
    </tr>`;

    // Show the rest of the menu
    rowNumber++;
    html += objBankAccountTransaction.showRestMenu(rowNumber);

    // The end of the table
    html += objBankAccountTransaction.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a bank account transaction row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  if (bankAccountTransactionId === '') bankAccountTransactionId = -1
  const validbankAccountTransactionId = objBankAccountTransaction.validateNumber('bankAccountTransactionId', Number(bankAccountTransactionId), -1, objBankAccountTransaction.nineNine);

  // validate voucer filename
  const voucerFileName = document.querySelector('.voucerFileName').value;
  //const validVoucerFileName = objBankAccountTransaction.validateText(voucerFileName, 3, 45);

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

      let menuNumber = 0;

      // Show filter
      menuNumber = showFilter1(menuNumber);

      // Show filter
      orderBy = 'bankAccountTransactionId DESC, date DESC, income DESC';
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = convertDateToISOFormat(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = convertDateToISOFormat(toDate);
      menuNumber = showFilter2(menuNumber, bankAccountTransactionId);

      menuNumber = showResult(bankAccountTransactionId, menuNumber);
    }
  }
}