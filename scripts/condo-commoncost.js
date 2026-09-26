// Show common costs for condos

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondominiums = new Condominiums('condominiums');
const objBudgets = new Budgets('budgets');
const objAccounts = new Accounts('accounts');
const objBankAccounts = new BankAccounts('bankaccounts');
const objTransactions = new Transactions('bankTransactions');
const objCondo = new Condo('condo');
const objCommonCosts = new CommonCosts('commoncosts');

// Fixed values
const enableChanges = (objCommonCosts.securityLevel > 5);
const applicationName = "condo-commoncost";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramCommonCostId = Number(queryParameters.get("commonCostId"));
const paramYear = Number(queryParameters.get("year"));
const paramBackApplication = queryParameters.get("backApplication");


// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objCommonCosts.condominiumId === 0) || (objCommonCosts.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objCommonCosts.showMenu(objCommonCosts.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objCommonCosts.condominiumId, resident, objCommonCosts.nineNine);
      await objCondominiums.loadCondominiumsTable();
      await objCondo.loadCondoTable(objCommonCosts.condominiumId);
      await objCommonCosts.loadCommonCostsTable(objCommonCosts.condominiumId);
      await objBudgets.loadBudgetsTable(objCommonCosts.condominiumId, objCommonCosts.nineNine, objCommonCosts.nineNine);
      await objBankAccounts.loadBankAccountsTable(objCommonCosts.condominiumId);
      const orderBy = 'date DESC, income DESC';
      await objTransactions.loadTransactionsTable(orderBy, objCommonCosts.condominiumId, 'N', objCommonCosts.nineNine, objCommonCosts.nineNine, objCommonCosts.nineNine, 0, 20200101, 20291231, false);

      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objCommonCosts.condominiumId, fixedCost);

      let commonCostId = 0;
      if (paramCommonCostId === 0) {

        await objCommonCosts.getHighestCommonCostId(objCommonCosts.condominiumId);
        commonCostId = objCommonCosts.arrayCommonCosts.at(-1)?.commonCostId ?? 0;
        const fixedCost = "A";
        await objCommonCosts.loadCommonCostsTable(objCommonCosts.condominiumId, fixedCost);
      } else {

        commonCostId = paramCommonCostId;
      }

      // Show filter
      const year = today.getFullYear();
      showFilter(year);

      // Show commoncost
      showCommonCost(year);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Make events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')) {

      const year = Number(document.querySelector(".filterYear").value);

      // Show common cost per year
      showCommonCost(year);
    };
  });

  // update a commoncosts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const year = Number(document.querySelector('.filterYear').value);
      updateCommonCostsRow(year);
    };
  });

  /*
  // update a commoncosts row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['commonCostSquareMeter', 'fixedCostCondo'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCosts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract commonCostId in the class name
      let commonCostId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        commonCostId = Number(className.slice(prefix.length));
      }

      // Update a commoncosts row
      await updateCommonCostsRow(commonCostId);
    };
  });
  */

  // Delete commoncosts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const year = Number(document.querySelector('.filterYear').value);
      await deleteCommonCostsRow(year);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objCommonCosts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show filter
function showFilter(year) {

  // Start frame
  //let html = startLineFilter('filter-frame');

  // Start filter
  let html = startBoxFilter("Felleskostnader");

  // Show year
  html += showSelectedNumbers('filterYear', "Regnskapsår", year, 2020, 2030, true)

  // End filter
  html += endBoxFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show commoncost
function showCommonCost(year) {

  const rowNumberCommonCost = objCommonCosts.arrayCommonCosts.findIndex(commoncost => commoncost.year === year);

  html = startGrid('Felleskostnader');

  // common cost per squaremeter
  let commonCostSquareMeter = 0;
  if (rowNumberCommonCost !== -1) commonCostSquareMeter = objCommonCosts.arrayCommonCosts[rowNumberCommonCost].commonCostSquareMeter;
  commonCostSquareMeter = formatNumberToNorAmount(commonCostSquareMeter);
  html += inputText('commonCostSquareMeter', 'Felleskostnad/m2', commonCostSquareMeter, 11, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // fixed cost per condo per year
  let fixedCostCondo = 0;
  if (rowNumberCommonCost !== -1) fixedCostCondo = objCommonCosts.arrayCommonCosts[rowNumberCommonCost].fixedCostCondo;
  fixedCostCondo = formatNumberToNorAmount(fixedCostCondo);
  html += inputText('fixedCostCondo', 'Fast kostnad', fixedCostCondo, 11, enableChanges);

  // calculated fixed cost
  // month
  let month = 0;
  const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex((condominium) => condominium.condominiumId === objCommonCosts.condominiumId);
  if (rowNumberCondominium !== -1) {
    month = objCondominiums.arrayCondominiums[rowNumberCondominium].fromMonth;
  }
  if (month < 10) month = Number("0" + month);

  // from date
  const fromYear = Number(document.querySelector('.filterYear').value) - 1;
  const fromDate = String(fromYear) + String(month) + "01";

  // todate
  const toYear = Number(document.querySelector('.filterYear').value);
  const toDate = String(toYear) + String(month) + "31";

  let calculatedFixedCost = objTransactions.getFixedCostPeriod(Number(fromDate), Number(toDate));
  calculatedFixedCost = calculatedFixedCost / 12;
  calculatedFixedCost = calculatedFixedCost / 7;
  calculatedFixedCost = formatNumberToNorAmount(-calculatedFixedCost);
  html += inputText('calculatedFixedCost', 'Beregnet Fast Kostnad', calculatedFixedCost, 11, enableChanges);
  //html += "<div></div>";

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    //html += inputButton("cancel secondary", "Angre", "reset");

    // check for return back to an application
    if (paramBackApplication) {

      html += inputButton("back secondary", "Tilbake", "button");
    }
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }
  document.querySelector('.showCommonCost').innerHTML = html;
}

// get price per squaremeter
function getpriceSquaremeter(budgetYear) {

  budgetYear = Number(budgetYear);
  let commonCostSquareMeter = 0;
  objCommonCosts.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatNumberToNorAmount(commonCostSquareMeter);
  return commonCostSquareMeter;
}

// get price per squaremeter
function getpriceSquaremeter(budgetYear) {

  budgetYear = Number(budgetYear);
  let commonCostSquareMeter = 0;
  objCommonCosts.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatNumberToNorAmount(commonCostSquareMeter);
  return commonCostSquareMeter;
}

/*
// Delete a commoncosts row
async function deleteCommonCostsRow(year) {

  // Check if commoncosts row exist
  rowNumberCommonCosts = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);
  if (rowNumberCommonCosts !== -1) {

    // delete commoncosts row
    await objCommonCosts.deleteCommonCostsTable(commonCostId, objCommonCosts.user);
    await objCommonCosts.loadCommonCostsTable(objCommonCosts.condominiumId);
  }
}
*/

// Delete commoncosts row
async function deleteCommonCostsRow(year) {

  // Check if commoncosts row exist
  const rowNumberCommonCosts = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);
  if (rowNumberCommonCosts !== -1) {

    // delete commoncosts row
    let commonCostId = objCommonCosts.arrayCommonCosts[rowNumberCommonCosts]?.commonCostId ?? 0;
    await objCommonCosts.deleteCommonCostsTable(commonCostId, objCommonCosts.user);
    await objCommonCosts.getHighestCommonCostId(objCommonCosts.condominiumId);

    //commonCostId = objCommonCosts.arrayCommonCosts[0].commonCostId;
    // Check for empty array
    commonCostId = 0;
    if (objCommonCosts.arrayCommonCosts.length > 0) commonCostId = objCommonCosts.arrayCommonCosts[0].commonCostId;
  }

  await objCommonCosts.loadCommonCostsTable(objCommonCosts.condominiumId);

  // Show filter
  showFilter(year);

  // Show account
  showCommonCost(year);
}

// Update a commoncosts table row
async function updateCommonCostsRow(year) {

  const rowNumberCommonCost = objCommonCosts.arrayCommonCosts.findIndex(commoncost => commoncost.year === year);

  // commoncost Id
  /*
  const commonCostId = (rowNumberCommonCost === -1)
    ? 0
    : objCommonCosts.arrayCommonCosts[rowNumberCommonCost].commonCostId;
  */
  const commonCostId = objCommonCosts.arrayCommonCosts[rowNumberCommonCost]?.commonCostId ?? 0;

  // year
  const validYear = validateIntervalNew('filterYear', 'Ugyldig årstall', year, 2020, 2030);

  // common cost per squaremeter 
  let commonCostSquareMeter = document.querySelector('.commonCostSquareMeter').value;
  commonCostSquareMeter = formatNorAmountToNumber(commonCostSquareMeter);
  const validCommonCostSquareMeter = validateIntervalNew('commonCostSquareMeter', 'Ugyldig Felleskost/m2', commonCostSquareMeter, 0, objCommonCosts.nineNine);

  // fix common cost per condo
  let fixedCostCondo = document.querySelector('.fixedCostCondo').value;
  fixedCostCondo = formatNorAmountToNumber(fixedCostCondo);
  const validFixedCostCondo = validateIntervalNew('fixedCostCondo', 'Ugyldig fast kost per leilighet', fixedCostCondo, 0, objCommonCosts.nineNine);

  // Validate commoncosts columns
  if (validYear && validCommonCostSquareMeter && validFixedCostCondo) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the Common Cost row
    if (rowNumberCommonCost !== -1) {

      // update a commoncosts row
      await objCommonCosts.updateCommonCostsTable(objCommonCosts.user, commonCostId, year, commonCostSquareMeter, fixedCostCondo);
    } else {

      // Insert a commoncosts row
      await objCommonCosts.insertCommonCostsTable(objCommonCosts.condominiumId, objCommonCosts.user, year, commonCostSquareMeter, fixedCostCondo);
      await objCommonCosts.getHighestCommonCostId(objCommonCosts.condominiumId);
      commonCostId = objCommonCosts.arrayCommonCosts[0].commonCostId;
    }

    await objCommonCosts.loadCommonCostsTable(objCommonCosts.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(year);

    // Show commoncost
    showCommonCost(year);
  }
}