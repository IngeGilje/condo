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
const paramProjectId = Number(queryParameters.get("projectId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));
const paramAmount = Number(queryParameters.get("amount"));
let paramBackApplication = queryParameters.get("backApplication")

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
      let html = objVoucher.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      //setFrameTitle("menu-frame", "Meny");

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

  // return to bank account transactions
  //document.addEventListener('click', async (event) => {
  //if ([...event.target.classList].some(cls => cls.startsWith('back'))) {
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('back')) {

      /*
      let URL = (objTransactions.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-transactions.html?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}`;
      window.location.href = URL;
      */
    let URL = (objProjects.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}${paramBackApplication}?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&projectId=${paramProjectId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}&backApplication=${paramBackApplication}`;
      window.location.href = URL;
    };
  });
}

// Show voucher
function showVoucher(transactionId) {

  // row number voucher
  const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);

  let html = startContent('Bilag');

  // transaction Id
  html += showTextNew('transactionId', 'Bilagsnummer', transactionId, false, "Bilagsnummer");
  html += "<div></div>";
  html += "<div></div>";

  // Date
  let date = objTransactions.arrayTransactions[rowNumberTransaction]?.date ?? '';
  date = formatNumberToISODate(date);
  html += showTextNew('date', 'Dato', date, false);

  // amount
  const income = objTransactions.arrayTransactions[rowNumberTransaction]?.income ?? 0;
  const payment = objTransactions.arrayTransactions[rowNumberTransaction]?.payment ?? 0;
  const amount = formatNumberToNorAmount((income) ? income : payment);
  html += showTextNew('amount', 'Beløp', amount, false, "Beløp");
  html += "<div></div>";

  // Account
  const accountId = objTransactions.arrayTransactions[rowNumberTransaction]?.accountId ?? 0;
  const accountName = objAccounts.getAccountNameById(accountId);
  html += showTextNew('accountName', 'Konto', accountName, false);
  html += "<div></div>";
  html += "<div></div>";

  // File name
  let voucherFileName = objTransactions.arrayTransactions[rowNumberTransaction]?.voucherFileName ?? '';
  voucherFileName = (voucherFileName)
    ? ''
    : `${transactionId}.pdf`;
  html += showTextNew('voucherFileName', 'Filnavn', voucherFileName, false, "Filnavn");
  html += "<div></div>";
  html += "<div></div>";

  // Start buttons
  html += startButtons();

  html += inputButton("back primary", "Tilbake", "submit");

  // End buttons
  html += endButtons();

  /*
  className = `back`;
  html += showButtonNew(className, 'Tilbake');
    html += "<div></div>";
      html += "<div></div>";
  */

  /*
  html += `
  <iframe
    src="/data/${voucherFileName}"
  >`;
  html += "</div>";
  */

  /*
  html += `
  <iframe 
    src="/data/${voucherFileName}"
    width="100%" 
    height="400px"
  >
    </iframe>
  `;
  */
  html += endContent();
  document.querySelector('.showVoucher').innerHTML = html;

  // Show Voucher
  const path = `/data/${voucherFileName}`;

  const iframe = document.createElement("iframe");
  iframe.src = path;
  iframe.width = "100%";
  iframe.height = "600px";

  document.body.appendChild(iframe);
}