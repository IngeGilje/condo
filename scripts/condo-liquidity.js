// show liquidity

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objBankAccounts = new BankAccounts('bankAccounts');
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
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objLiquidity.condominiumId === 0) || (objLiquidity.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objLiquidity.showMenu(objLiquidity.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      await objBankAccounts.loadBankAccountsTable(objLiquidity.condominiumId);

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
  //let html = startLineFilter("filter-frame");

  // Start filter
  let html = startBoxFilter("Tømmekalender");

  // Show years
  const year = today.getFullYear();
  html += showSelectedNumbers('filterYear', 'År', year, 2020, 2030, true);

  // End filter
  html += endBoxFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show liquidity
function showLiquidity() {

  const canvas = document.getElementById("showLiquidity");

  const year = document.querySelector('.filterYear').value;

  let month = 0;
  let arrayMonth = [];

  for (month = 1; month < 13; month++) {
    if (month < 10) month = "0" + String(month);
    let date = year + String(month) + "31";
    arrayMonth[month - 1] = objTransactions.getBankBalance(Number(date))/100;
  }

  // Remove previous chart
  if (liquidityChart) {
    liquidityChart.destroy();
  }

  liquidityChart = new Chart(canvas, {
    type: "line",

    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "Likviditet",
        data: [arrayMonth[0], arrayMonth[1], arrayMonth[2], arrayMonth[3], arrayMonth[4], arrayMonth[5], arrayMonth[6], arrayMonth[7], arrayMonth[8], arrayMonth[9], arrayMonth[10], arrayMonth[11]]
      }]
    }
  });
}