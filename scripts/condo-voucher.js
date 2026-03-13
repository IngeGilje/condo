// Voucher maintenance

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objBankAccountTransactions = new BankAccountTransaction('bankaccounttransaction');
const objVouchers = new Voucher('voucher');

let condominiumId = 0;
let user = "";

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    user = sessionStorage.getItem("user");
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

      const orderBy = 'bankAccountTransactionId ASC, date DESC, income ASC';
      await objBankAccountTransactions.loadBankAccountTransactionsTable(orderBy, condominiumId, 'N', objVouchers.nineNine, objVouchers.nineNine, 0, 0, objVouchers.nineNine);

      const bankAccountTransactionId = objBankAccountTransactions.arrayBankAccountTransactions.at(-1).bankAccountTransactionId;

      // Show header
      let menuNumber = 0;

      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, bankAccountTransactionId);

      // Show result
      menuNumber = showResult(bankAccountTransactionId, menuNumber);

      // Events
      events();
    }
  } else {

    objVouchers.showMessage(objVouchers, 'Server condo-server.js er ikke startet.');
  }
}

// Events for voucher
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterBankAccountTransactionId')) {

      filterSync();

      async function filterSync() {

        //const condominiumId = Number(condominiumId);
        await objBankAccountTransactions.loadBankAccountTransactionsTable(condominiumId);

        const bankAccountTransactionId = Number(document.querySelector('.filterBankAccountTransactionId').value);
        let menuNumber = 0;
        menuNumber = showResult(bankAccountTransactionId, menuNumber);
      }
    };
  });

  // file name pdf document
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('voucerFileName')) {

      updateBankAccountTransactionRowSync();

      // Update a bank account transaction row
      async function updateBankAccountTransactionRowSync() {

        const bankAccountTransactionId = Number(document.querySelector('.filterBankAccountTransactionId').value);
        updateBankAccountTransactionRow(bankAccountTransactionId);
      }
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objBankAccountTransactions.startTable('width:800px;');

  // show main header
  html += objBankAccountTransactions.showTableHeader('width:175px;', 'Vis bilag');

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber, bankAccountTransactionId) {

  // Start table
  html = objBankAccountTransactions.startTable('width:800px;');

  // Header filter
  rowNumber++;
  html += objBankAccountTransactions.showTableHeaderMenu('width:175px;', rowNumber, 'Velg bankkontotransaksjon', '');

  // start table body
  html += objBankAccountTransactions.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBankAccountTransactions.insertTableColumns('width:175px;', rowNumber);

  // show selected bank account transactions
  html += objBankAccountTransactions.showSelectedBankAccountTransactions('filterBankAccountTransactionId', 'width:175px;', bankAccountTransactionId, '')

  html += "<td></td></tr>";

  // end table body
  html += objBankAccountTransactions.endTableBody();

  // The end of the table
  html += objBankAccountTransactions.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show result
function showResult(bankAccountTransactionId, rowNumber) {

  // start table
  let html = objBankAccountTransactions.startTable('width:800px;');

  // Check if bank account transactin row exist
  const rowNumberBankAccountTransaction = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(bankAccountTransaction => bankAccountTransaction.bankAccountTransactionId === bankAccountTransactionId);
  if (rowNumberBankAccountTransaction !== -1) {

    // date and amount
    rowNumber++;
    html += objVouchers.showTableHeaderMenu("width:175px;", rowNumber, 'Dato', 'Beløp');
    html += "</tr>";

    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    // date
    let date = objBankAccountTransactions.arrayBankAccountTransactions[rowNumberBankAccountTransaction].date;
    date = (date) ? formatToNorDate(date) : '';
    html += objBankAccountTransactions.inputTableColumn('date', '', date, 10, true);

    // amount
    const income = objBankAccountTransactions.arrayBankAccountTransactions[rowNumberBankAccountTransaction].income;
    const payment = objBankAccountTransactions.arrayBankAccountTransactions[rowNumberBankAccountTransaction].payment;
    const amount = formatOreToKroner((income) ? income : payment);
    html += objBankAccountTransactions.inputTableColumn('amount', '', amount, 10, true);

    html += "</tr>";

    // file name of the voucher
    rowNumber++;
    html += objVouchers.showTableHeaderMenu("width:175px;", rowNumber, 'Filnavn', '');
    html += "</tr>";

    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    let voucerFileName = objBankAccountTransactions.arrayBankAccountTransactions[rowNumberBankAccountTransaction].voucerFileName;
    voucerFileName = (voucerFileName) ? voucerFileName : '';
    html += objBankAccountTransactions.inputTableColumn('voucerFileName', '', voucerFileName, 45);

    html += "<td></td></tr>";

    // Show pdf file
    rowNumber++;
    html += objBankAccountTransactions.insertTableColumns('', rowNumber);

    html += `
      <td colspan="2" rowspan="13">
        <iframe
         src="/data/${voucerFileName}">
        </iframe>
      </td>
    </tr>`;

    // Show the rest of the menu
    rowNumber++;
    html += objBankAccountTransactions.showRestMenu(rowNumber);

    // The end of the table
    html += objBankAccountTransactions.endTable();
    document.querySelector('.result').innerHTML = html;

    return rowNumber;
  }
}

// Update a bank account transaction row
async function updateBankAccountTransactionRow(bankAccountTransactionId) {

  if (bankAccountTransactionId === '') bankAccountTransactionId = -1
  const validbankAccountTransactionId = objBankAccountTransactions.validateNumber('bankAccountTransactionId', Number(bankAccountTransactionId), -1, objBankAccountTransactions.nineNine);

  // validate voucer filename
  const voucerFileName = document.querySelector('.voucerFileName').value;
  //const validVoucerFileName = objBankAccountTransactions.validateText(voucerFileName, 3, 45);

  // Check if the file exist
  let validVoucerFileName = false;
  if (await objVouchers.checkIfFileExists(voucerFileName)) {
    validVoucerFileName = true;
  } else {
    objVouchers.showMessage(objVouchers, 'Ugyldig filnavn på bilag.');
  }

  if (validVoucerFileName && validbankAccountTransactionId) {

    // Check if the bankAccountTransactionId exist
    const rowNumberBankAccountTransaction = objBankAccountTransactions.arrayBankAccountTransactions.findIndex(condo => condo.bankAccountTransactionId === bankAccountTransactionId);
    if (rowNumberBankAccountTransaction !== -1) {

      // update the bankaccounttransactions row
      if (await objBankAccountTransactions.updateVoucerFileName(user, bankAccountTransactionId, voucerFileName)) {

        await objBankAccountTransactions.loadBankAccountTransactionsTable('condoId ASC, date DESC, income ASC', condominiumId, 'N', objVouchers.nineNine, objVouchers.nineNine, 0, '20000101', '20991231');
      } else {

        objVouchers.showMessage(objVouchers, 'Navn på bilag er ikke oppdatert.');
      }

      let menuNumber = 0;

      // Show filter
      menuNumber = showFilter(menuNumber, bankAccountTransactionId);

      menuNumber = showResult(bankAccountTransactionId, menuNumber);
    }
  }
}