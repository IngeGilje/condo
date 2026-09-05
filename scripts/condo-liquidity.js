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

      /*
            // Show vertical menu
      let html = objLiquidity.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");
      */

      /*
      // Show main menu
      let html = objLiquidity.showHorizontalMenu("filter-frame", objLiquidity.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show condominium menu
      html = objLiquidity.showHorizontalMenu("filter-frame", objLiquidity.arrayMenuCondominium);
      document.querySelector('.menuCondominium').innerHTML = html;
      objLiquidity.markActivatedApplication(objLiquidity.arrayMenuCondominium, applicationName);
      */

      // Show menu
      let html = objLiquidity.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

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
  //let html = startFrame("filter-frame");

  // Start filter
  let html = startFilter("Tømmekalender");

  // Show years
  const year = today.getFullYear();
  html += inputSelectedNumbers('filterYear', 'År', 2020, 2030, year, true);

  /*
  // End filter
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame", "Filter");
  */

  // End filter
  html += endFilter();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show liquidity
function showLiquidity() {

  const canvas = document.getElementById("showLiquidity");

  const year = document.querySelector('.filterYear').value;

  let mounth = 0;
  let arrayMonth = [];

  for (month = 1; month < 13; month++) {
    if (month < 10) month = "0" + String(month);
    let date = year + String(month) + "31";
    arrayMonth[month - 1] = objTransactions.getBankBalance(Number(date));
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