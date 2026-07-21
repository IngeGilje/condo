// Voucher maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objTransaction = new Transaction('transaction');
const objVoucher = new Voucher('voucher');

const enableChanges = (objVoucher.securityLevel > 5);
const applicationName = "condo-voucher";

const columnWidths = [175, 175, 175, 200, 100];

const queryParameters = new URLSearchParams(window.location.search);
const paramTransactionId = Number(queryParameters.get("transactionId"));
const paramCondoId = Number(queryParameters.get("condoId"));
const paramAccountId = Number(queryParameters.get("accountId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));
const paramAmount = Number(queryParameters.get("amount"));

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

      // Show main menu
      let html = showHorizontalMenu(objVoucher.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show transaction menu
      html = showHorizontalMenu(objTransaction.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objTransaction.markActivatedApplication(objTransaction.arrayMenuTransaction, applicationName);

      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objVoucher.condominiumId, fixedCost);

      // Show header
      //showHeader();

      // Show filter
      let fromDate = 20000101;
      let toDate = 20991231;
      const orderBy = 'transactionId DESC, date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objTransaction.condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransaction.nineNine, 0, fromDate, toDate);

      //showFilter();

      // Show result
      //if (transactionId === 0) transactionId = objTransactions.arrayTransactions[0].transactionId;
      showVoucher(paramTransactionId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for voucher
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterTransactionId')) {

      const orderBy = 'transactionId DESC, date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransaction.nineNine, 0, objVoucher.nineNine);

      const transactionId = Number(document.querySelector('.filterTransactionId').value);

      showVoucher(transactionId);
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

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-transactions.html?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}`;
      window.location.href = URL;
    };
  });
}

// Update a transaction row
async function updateTransactionRow(transactionId) {

  if (transactionId === '') transactionId = -1
  const validTransactionId = validateIntervalNew('transactionId', columnWidths, '', 'Ugyldig bankkonto', true, Number(transactionId), -1, objTransaction.nineNine);

  // validate voucher filename
  const voucherFileName = document.querySelector('.voucherFileName').value;

  // Check if the file exist
  let validVoucherFileName = false;
  if (await objVoucher.checkIfFileExist(voucherFileName)) {
    validVoucherFileName = true;
  } else {
    showMessageNew('Ugyldig filnavn på bilag.');
  }

  if (validVoucherFileName && validTransactionId) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the transactionId exist
    const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(condo => condo.transactionId === transactionId);
    if (rowNumberTransaction !== -1) {

      // update the transactions row
      if (await objTransaction.updateVoucherFileName(user, transactionId, voucherFileName)) {

        const orderBy = 'transactionId DESC, date DESC, income DESC';
        await objTransactions.loadTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransaction.nineNine, 0, objVoucher.nineNine);
      } else {

        showMessageNew('Bilag er ikke oppdatert.');
      }

      removeMessage();

      if (enableChanges) {
        disableButton('delete', false);
        disableButton('insert', false);
        disableButton('update', false);
        disableButton('cancel', true);
        disableButton('filterUserId', false, 'white');
      }

      // Show transaction
      showVoucher(transactionId, 2);
    }
  }
}

// Show voucher
function showVoucher(transactionId) {

  // row number voucher
  const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);

  // Empty line
  let html = emptyLine();

  // date
  html += startLine();

  // transaction Id
  html += showTextNew('Bilagsnummer', 'transactionId', transactionId, false, "Bilagsnummer");
  html += "</div>";

  // Date
  html += startLine();

  let date = objTransactions.arrayTransactions[rowNumberTransaction]?.date ?? '';
  date = formatNumberToISODate(date);
  html += showDate('Dato', 'date', date, false)

  // Amount
  const income = objTransactions.arrayTransactions[rowNumberTransaction].income;
  const payment = objTransactions.arrayTransactions[rowNumberTransaction].payment;
  const amount = formatNumberToNorAmount((income) ? income : payment);
  html += showTextNew('Beløp', 'amount', amount, false, "Beløp");
  html += "</div>";

  // Account
  html += startLine();

  const accountId = objTransactions.arrayTransactions[rowNumberTransaction]?.accountId ?? '';
  // get account name
  const accountName = objAccount.getAccountNameById(accountId);
  html += showTextNew('Konto', 'accountName', accountName, false, "Konto");

  // File name
  let voucherFileName = objTransactions.arrayTransactions[rowNumberTransaction]?.voucherFileName ?? '';
  voucherFileName = (voucherFileName)
    ? ''
    : `${transactionId}.pdf`;
  html += showTextNew('Filnavn', 'voucherFileName', voucherFileName, false, "Filnavn");
  html += "</div>";

  html += startLine();
  className = `back`;
  html += showButtonNew(className, 'Tilbake');
  html += "</div>";

  html += startLine();
  html += `
  <iframe
    src="/data/${voucherFileName}"
  >`;
  html += "</div>";

  document.querySelector('.showVoucher').innerHTML = html;
}