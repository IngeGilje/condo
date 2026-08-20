// Voucher maintenance

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objTransactions = new Transactions('transactions');
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

            // Show vertical menu
      let html = objVoucher.showMenu();
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objTransactions.showHorizontalMenu("filter-frame", objVoucher.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show transaction menu
      html = objTransactions.showHorizontalMenu("filter-frame", objTransactions.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objTransactions.markActivatedApplication(objTransactions.arrayMenuTransaction, applicationName);
      */

      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objVoucher.condominiumId, fixedCost);

      // Show filter
      let fromDate = 20000101;
      let toDate = 20991231;
      const orderBy = 'transactionId DESC, date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objTransactions.condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransactions.nineNine, 0, fromDate, toDate);

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

  /*
  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterTransactionId')) {

      const orderBy = 'transactionId DESC, date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, condominiumId, 'N', objVoucher.nineNine, objVoucher.nineNine, objTransactions.nineNine, 0, objVoucher.nineNine);

      const transactionId = Number(document.querySelector('.filterTransactionId').value);
      showVoucher(transactionId);
    };
  });
  */

  /*
  // file name pdf document
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('voucherFileName')) {

      // Update a transaction row
      const transactionId = Number(document.querySelector('.filterTransactionId').value);
      updateTransactionRow(transactionId);
    };
  });
  */

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-transactions.html?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}`;
      window.location.href = URL;
    };
  });
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

  // Account
  const accountId = objTransactions.arrayTransactions[rowNumberTransaction]?.accountId ?? '';
  const accountName = objAccounts.getAccountNameById(accountId);
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