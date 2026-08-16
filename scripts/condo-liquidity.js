// show liquidity

// Activate classes
const today = new Date();
const objUser = new User('user');
const objBankAccount = new BankAccount('bankAccount');
const objTransactions = new Transactions('transactions');
const objLiquidity = new Liquidity('liquidity');

const enableChanges = (objLiquidity.securityLevel > 5);
const applicationName = "condo-liquidity";

// Reference to the chart
let liquidityChart;

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objLiquidity.condominiumId === 0) || (objLiquidity.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objLiquidity.showHorizontalMenu("filter-frame", objLiquidity.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show condominium menu
      html = objLiquidity.showHorizontalMenu("filter-frame", objLiquidity.arrayMenuCondominium);
      document.querySelector('.menuCondominium').innerHTML = html;
      objLiquidity.markActivatedApplication(objLiquidity.arrayMenuCondominium, applicationName);

      await objBankAccount.loadBankAccountsTable(objLiquidity.condominiumId, objLiquidity.nineNine);

      const orderBy = 'condoId ASC';
      const fromDate = 20200101;
      let toDate = getCurrentDate();
      toDate = formatNorDateToNumber(toDate);
      await objTransactions.loadTransactionsTable(orderBy, objLiquidity.condominiumId, 'N', objLiquidity.nineNine, objLiquidity.nineNine, objLiquidity.nineNine, 0, fromDate, toDate);

      // Show filter
      showFilter();

      // Show liquidity
      showLiquidity();

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for accounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')) {

      // Show liquidity
      showLiquidity();
    };
  });
}

// Show filter
function showFilter() {

  // Start frame
  let html = startFrame("filter-frame");

  // Show years
  const year = today.getFullYear();
  html += showSelectedNumbersNew('År', 'filterYear', '', 2020, 2030, year, true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame", "Filter");
}

// Show liquidity
function showLiquidity() {

  const canvas = document.getElementById("showLiquidity");
  const year = Number(document.querySelector('.filterYear').value);

  const januar = getBankBalance(year, 1);
  const februar = getBankBalance(year, 2);
  const march = getBankBalance(year, 3);
  const april = getBankBalance(year, 4);
  const may = getBankBalance(year, 5);
  const june = getBankBalance(year, 6);
  const july = getBankBalance(year, 7);
  const august = getBankBalance(year, 8);
  const september = getBankBalance(year, 9);
  const october = getBankBalance(year, 10);
  const november = getBankBalance(year, 11);
  const december = getBankBalance(year, 12);

  // Remove previous chart
  if (liquidityChart) {
    liquidityChart.destroy();
  }

  liquidityChart = new Chart(canvas, {
    type: "line",

    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "Liquidity",
        data: [januar, februar, march, april, may, june, july, august, september, october, november, december],
      }]
    }
  });
}

// What was the bank balance on last day of each month this year
function getBankBalance(year, month) {

  // opening balance
  let bankBalance = 0;
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objLiquidity.condominiumId);
  if (rowNumberBankAccount !== -1) bankBalance += Number(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance);

  /*
  objTransactions.arrayTransactions.forEach(transaction => {

    const transactionYear = Number(String(transaction.date).slice(0, 4));
    const transactionMonth = Number(String(transaction.date).slice(4, 6));

    // All transaction for the last years
    if ((transactionYear < year)) {

      // Add payment or income to bank balance for the month
      bankBalance += transaction.income + transaction.payment;
    }
  });
  */

  // Bank balance from 01.01 to 31.12 for selected year
  objTransactions.arrayTransactions.forEach(transaction => {

    const transactionYear = Number(String(transaction.date).slice(0, 4));
    const transactionMonth = Number(String(transaction.date).slice(4, 6));
    // All transaction for the last years
    if ((transactionYear < year) || (transactionYear === year && transactionMonth < month)) {

      // Add payment or income to bank balance for the month
      bankBalance += transaction.income + transaction.payment;
    }
  });

  if (bankBalance !== 0) bankBalance = bankBalance / 100;

  return bankBalance;
}

/*
// What was the bank balance on last day of each month for selected year
function getBankBalance(year) {

  // opening balance
  let openingBalance = 0;
  const rowNumberBankAccount = objBankAccount.arrayBankAccounts.findIndex(bankAccount => bankAccount.condominiumId === objLiquidity.condominiumId);
  if (rowNumberBankAccount !== -1) openingBalance = Number(objBankAccount.arrayBankAccounts[rowNumberBankAccount].openingBalance);

  const bankBalance = [
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance,
    openingBalance
  ];

  // Bank balance from 01.01 to 31.12 for selected year
  objTransactions.arrayTransactions.forEach(transaction => {

    const transactionYear = Number(String(transaction.date).slice(0, 4));
    const transactionMonth = Number(String(transaction.date).slice(4, 6));

    // All transaction for the last years
    if ((transactionYear < year) || (transactionYear === year && transactionMonth < month)) {

      // Add payment or income to bank balance
      //bankBalance += transaction.income + transaction.payment;
      bankBalance[transactionMonth - 1] += transaction.income + transaction.payment;
    }
  });

  if (bankBalance[0] !== 0) bankBalance[0] = bankBalance[0] / 100;
  if (bankBalance[1] !== 0) bankBalance[1] = bankBalance[1] / 100;
  if (bankBalance[2] !== 0) bankBalance[2] = bankBalance[2] / 100;
  if (bankBalance[3] !== 0) bankBalance[3] = bankBalance[3] / 100;
  if (bankBalance[4] !== 0) bankBalance[4] = bankBalance[4] / 100;
  if (bankBalance[5] !== 0) bankBalance[5] = bankBalance[5] / 100;
  if (bankBalance[6] !== 0) bankBalance[6] = bankBalance[6] / 100;
  if (bankBalance[7] !== 0) bankBalance[7] = bankBalance[7] / 100;
  if (bankBalance[8] !== 0) bankBalance[8] = bankBalance[8] / 100;
  if (bankBalance[9] !== 0) bankBalance[9] = bankBalance[9] / 100;
  if (bankBalance[10] !== 0) bankBalance[10] = bankBalance[10] / 100;
  if (bankBalance[11] !== 0) bankBalance[11] = bankBalance[11] / 100;

  return bankBalance;
}
*/