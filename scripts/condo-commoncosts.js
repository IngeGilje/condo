// Show common costs for condos

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objBudgets = new Budgets('budgets');
const objAccounts = new Accounts('accounts');
const objTransactions = new Transactions('bankTransactions');
const objCondo = new Condo('condo');
const objCommonCosts = new CommonCosts('commoncosts');

// Fixed values
const enableChanges = (objCommonCosts.securityLevel > 5);
const applicationName = "condo-commoncost";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramYear = Number(queryParameters.get("year"));
const paramCommonCostId = Number(queryParameters.get("commonCostId"));
const paramBackApplication = queryParameters.get("backApplication");

// column widths
const columnWidths = [100, 125, 125, 125, 125];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objCommonCosts.condominiumId === 0) || (objCommonCosts.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objCommonCosts.showMenu();
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objCommonCosts.condominiumId, resident, objCommonCosts.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objCommonCosts.condominiumId, objCommonCosts.nineNine);
      await objCommonCosts.loadCommonCostsTable(objCommonCosts.condominiumId);
      await objBudgets.loadBudgetsTable(objCommonCosts.condominiumId, objCommonCosts.nineNine, objCommonCosts.nineNine);
      //await objBankAccount.loadBankAccountsTable(objCommonCosts.condominiumId, objCommonCosts.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objCommonCosts.condominiumId, fixedCost);

      // Show filter
      const year = today.getFullYear();
      showFilter(year);

      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objCommonCosts.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show common costs
        showCommonCosts();

        // Events
        events();
      }
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')) {

      // Show common costs
      showCommonCosts();
    };
  });

  // maintain commoncost
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {

      const arrayPrefixes = ['change'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCosts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let commonCostId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        commonCostId = Number(className.slice(prefix.length));
      }

      const year = Number(document.querySelector('.filterYear').value);

      let URL = (objCommonCosts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-commoncost.html?backApplication=${applicationName}.html&year=${year}&commonCostId=${commonCostId}`;
      window.location.href = URL;
    }
  });
}

// Show filter
function showFilter(year) {

  // Start frame
  //let html = startFrame('filter-frame');

  // Start frame
  let html = startFrame('filter-frame');

  // Show years
  html += showSelectedNumbers('filterYear', 'År', 2020, 2030, year, true);

  // End frame
  html += "</div>";
  document.querySelector(".showFilter").innerHTML = html;
}

// Show common costs
function showCommonCosts() {

  const year = Number(document.querySelector(".filterYear").value);
  const rowNumberCommonCost = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);

  // Start table
  let html = startTable("Felleskostnader", "");
  html += tableHeader(columnWidths, 'Leilighet', 'Areal', 'Fast beløp', 'Per måned', 'Årlig');

  let totalCommonCostsCondoMonth = 0;
  let totalCommonCostsCondoYear = 0;
  let totalSquareMeters = 0;
  let totalFixedCostsCondoYear = 0;

  // Get fixed costs per month
  let fixedCostCondoMonth = 0;
  if (rowNumberCommonCost !== -1) {

    // Fixed cost per month
    fixedCostCondoMonth = Number(objCommonCosts.arrayCommonCosts[rowNumberCommonCost].fixedCostCondo);
  }

  objCondo.arrayCondo.forEach((condo) => {

    const year = Number(document.querySelector(".filterYear").value);
    const rowNumberCommonCost = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);
    const commonCostId = objCommonCosts.arrayCommonCosts[rowNumberCommonCost]?.commonCostId || 0;

    // insert a table row (<tr></td>)
    html += objCommonCosts.insertTableRow('');

    // condo name
    let className = `name${condo.condoId}`;
    html += showTableText(className, condo.name);

    // Square meters
    let squareMeters = formatNumberToNorAmount(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += showTableText(className, squareMeters);

    // fixed cost 
    fixedCostCondoMonth = formatNumberToNorAmount(fixedCostCondoMonth);
    className = `fixedCostCondoMonth${condo.condoId}`;
    html += showTableText(className, fixedCostCondoMonth);

    // Common cost per month
    let commonCostSquareMeter = 0;
    if (rowNumberCommonCost !== -1) commonCostSquareMeter = objCommonCosts.arrayCommonCosts[rowNumberCommonCost].commonCostSquareMeter;
    squareMeters = formatNorAmountToNumber(squareMeters);
    fixedCostCondoMonth = formatNorAmountToNumber(fixedCostCondoMonth);
    let commonCostsMonth = (((squareMeters * commonCostSquareMeter) / 100) + (fixedCostCondoMonth));
    className = `commonCostsMonth${condo.condoId}`;
    commonCostsMonth = formatNumberToNorAmount(commonCostsMonth);
    html += showTableText(className, commonCostsMonth);

    // Common cost per year
    commonCostsMonth = formatNorAmountToNumber(commonCostsMonth);
    let commonCostsCondoYear = commonCostsMonth * 12;
    commonCostsCondoYear = formatNumberToNorAmount(commonCostsCondoYear);
    className = `commonCostsCondoYear${condo.condoId}`;
    html += showTableText(className, commonCostsCondoYear);

    /*
    // Change commoncosts row
    className = `change${condo.condoId}`;
    html += showTableButton(className, 'Rediger');
    html += "</tr>";
    */

    // Accomulate
    totalSquareMeters += Number(squareMeters);
    totalFixedCostsCondoYear += Number(fixedCostCondoMonth);
    totalCommonCostsCondoMonth += Number(commonCostsMonth);
    commonCostsCondoYear = formatNorAmountToNumber(commonCostsCondoYear)
    totalCommonCostsCondoYear += commonCostsCondoYear;
  });

  totalSquareMeters = formatNumberToNorAmount(totalSquareMeters);
  totalFixedCostsCondoYear = formatNumberToNorAmount(totalFixedCostsCondoYear);
  totalCommonCostsCondoMonth = formatNumberToNorAmount(totalCommonCostsCondoMonth);
  totalCommonCostsCondoYear = formatNumberToNorAmount(totalCommonCostsCondoYear);

  html += objCommonCosts.insertTableRow('', 'Sum', totalSquareMeters, totalFixedCostsCondoYear, totalCommonCostsCondoMonth, totalCommonCostsCondoYear);
  html += "</tr>";

  /*
  // The end of the table
  html += objCommonCosts.endTable();
  document.querySelector('.showCommonCosts').innerHTML = html;
  */
  // The end of the table
  html += endTable();
  document.querySelector('.showCommonCosts').innerHTML = html;
}