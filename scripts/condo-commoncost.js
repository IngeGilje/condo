// Show common costs for condos

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objBudgets = new Budgets('budgets');
const objAccounts = new Accounts('accounts');
const objBankAccount = new BankAccount('bankaccount');
const objTransaction = new Transaction('bankTransaction');
const objCondo = new Condo('condo');
const objCommonCost = new CommonCost('commoncost');

const enableChanges = (objCommonCost.securityLevel > 5);

// column widths
const columnWidths = [100, 175, 175, 175, 175];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objCommonCost.condominiumId === 0) || (objCommonCost.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objCommonCost.showHorizontalMenu(objCommonCost.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show due menu
      html = objCommonCost.showHorizontalMenu(objCommonCost.arrayMenuDue);
      document.querySelector('.menuDue').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objCommonCost.condominiumId, resident, objCommonCost.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objCommonCost.condominiumId, objCommonCost.nineNine);
      await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);
      await objBudgets.loadBudgetsTable(objCommonCost.condominiumId, objCommonCost.nineNine, objCommonCost.nineNine);
      await objBankAccount.loadBankAccountsTable(objCommonCost.condominiumId, objCommonCost.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objCommonCost.condominiumId, fixedCost);

      // Show header

      showHeader();

      // Show filter
      const year = today.getFullYear();
      showFilter(year);

      // Show remote Heating
      // Get row number for payment Remote Heating Account Id
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objCommonCost.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show common cost per year
        showCommonCostYear();

        // Show common cost per condo
        showCommonCostCondo();

        // Events
        events();
      }
    }
  } else {

    showMessageNew( 'Server er ikke startet.');
  }
}

// Make events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['filterYear'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCost.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract commonCostId in the class name
      let commonCostId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        commonCostId = Number(className.slice(prefix.length));
      }

      // Show common cost per year
      showCommonCostYear();

      // Show common cost per condo
      showCommonCostCondo();
    };
  });

  // update a commoncosts row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['commonCostSquareMeter', 'fixedCostCondo'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCost.getClassByPrefix(event.target, prefix))
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

  // Delete commoncosts row
  document.addEventListener('click', async (event) => {
    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCost.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let commonCostId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        commonCostId = Number(className.slice(prefix.length));
      }

      await deleteCommonCostsRow(commonCostId, className);
      await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);


      showCommonCostYear();


      showCommonCostCondo();
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objCommonCost.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objCommonCost.initializeTable(columnWidths);

  // start table body
  html += objCommonCost.startTableBody();

  // show main header
  html += objCommonCost.showTableHeaderLogOut('', '', 'Felleskostnader', '');
  html += "</tr>";

  // end table body
  html += objCommonCost.endTableBody();

  // The end of the table
  html += objCommonCost.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(year) {

    // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show years
  html += showSelectedNumbersNew('År', 'filterYear', 'align:center;', 2020, 2030, year, true);

  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show commoncosts per year
function showCommonCostYear() {

  const year = Number(document.querySelector(".filterYear").value);
  const rowNumberCommonCost = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);
  const commonCostId = objCommonCost.arrayCommonCosts[rowNumberCommonCost]?.commonCostId || 0;

  // start table
  let html = objCommonCost.initializeTable(columnWidths);


  html += objCommonCost.showTableHeaderMenu('#e0f0e0', 'center', '', '', 'Felleskostnad/m2', 'Fast felleskostnad', '');

  // insert a table row (<tr></td>)
  html += objCommonCost.insertTableRow('', '', '');

  // common cost per squaremeter
  let commonCostSquareMeter = "";
  if (rowNumberCommonCost !== -1) commonCostSquareMeter = objCommonCost.arrayCommonCosts[rowNumberCommonCost].commonCostSquareMeter;
  let className = `commonCostSquareMeter${commonCostId}`;
  commonCostSquareMeter = formatOreToKroner(commonCostSquareMeter);
  html += objCommonCost.editTableCell(className, commonCostSquareMeter, 11, enableChanges);

  // fixed cost per condo
  let fixedCostCondo = "";
  if (rowNumberCommonCost !== -1) fixedCostCondo = objCommonCost.arrayCommonCosts[rowNumberCommonCost].fixedCostCondo;
  className = `fixedCostCondo${commonCostId}`;
  fixedCostCondo = formatOreToKroner(fixedCostCondo);
  html += objCommonCost.editTableCell(className, fixedCostCondo, 10, enableChanges);

  // Delete
  className = `delete${commonCostId}`;
  html += objCommonCost.showButton(className, 'Slett');
  html += "</tr>";

  html += objCommonCost.insertTableRow('', '', '', '', '', '');

  // The end of the table
  html += objCommonCost.endTable();
  document.querySelector('.showcommoncostyear').innerHTML = html;
}

// Show common costs per condo
function showCommonCostCondo() {

  const year = Number(document.querySelector(".filterYear").value);
  const rowNumberCommonCost = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);

  // start table
  let html = objCommonCost.initializeTable(columnWidths);

  html += objCommonCost.startTableBody();

  // Table header (<tr></tr>)
  html += objCommonCost.showTableHeaderMenu('#e0f0e0', 'center', 'Leilighet', 'Areal', 'Fast beløp', 'Per måned', 'Årlig');

  let totalCommonCostsCondoMonth = 0;
  let totalCommonCostsCondoYear = 0;
  let totalSquareMeters = 0;
  let totalFixedCostsCondoYear = 0;

  // Get fixed costs per month
  let fixedCostCondoMonth = 0;
  if (rowNumberCommonCost !== -1) {

    // Fixed cost per month per condo
    fixedCostCondoMonth = Number(objCommonCost.arrayCommonCosts[rowNumberCommonCost].fixedCostCondo);
  }

  objCondo.arrayCondo.forEach((condo) => {

    const year = Number(document.querySelector(".filterYear").value);
    const rowNumberCommonCost = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.year === year);
    const commonCostId = objCommonCost.arrayCommonCosts[rowNumberCommonCost]?.commonCostId || 0;

    // insert a table row (<tr></td>)

    html += objCommonCost.insertTableRow('');

    // condo name
    let className = `name${condo.condoId}`;
    html += objCommonCost.editTableCellCenter(className, condo.name, 45, false);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objCommonCost.editTableCell(className, squareMeters, 11, false);

    // fixed cost per month per condo
    fixedCostCondoMonth = formatOreToKroner(fixedCostCondoMonth);
    className = `fixedCostCondoMonth${condo.condoId}`;
    html += objCommonCost.editTableCell(className, fixedCostCondoMonth, 10, false);

    // Common cost per month per condo
    let commonCostSquareMeter = 0;
    if (rowNumberCommonCost !== -1) commonCostSquareMeter = objCommonCost.arrayCommonCosts[rowNumberCommonCost].commonCostSquareMeter;
    squareMeters = formatKronerToOre(squareMeters);
    fixedCostCondoMonth = formatKronerToOre(fixedCostCondoMonth);
    let commonCostsMonth = (((squareMeters * commonCostSquareMeter) / 100) + (fixedCostCondoMonth));
    className = `commonCostsMonth${commonCostId}`;
    commonCostsMonth = formatOreToKroner(commonCostsMonth);
    html += objCommonCost.editTableCell(className, commonCostsMonth, 11, enableChanges);

    // Common cost per year per condo
    commonCostsMonth = formatKronerToOre(commonCostsMonth);
    let commonCostsCondoYear = commonCostsMonth * 12;
    commonCostsCondoYear = formatOreToKroner(commonCostsCondoYear);
    className = `commonCostsCondoYear${condo.condoId}`;
    html += objCommonCost.editTableCell(className, commonCostsCondoYear, 10, false);

    html += "</tr>";

    // Accomulate
    totalSquareMeters += Number(squareMeters);
    totalFixedCostsCondoYear += Number(fixedCostCondoMonth);
    totalCommonCostsCondoMonth += Number(commonCostsMonth);
    commonCostsCondoYear = formatKronerToOre(commonCostsCondoYear)
    totalCommonCostsCondoYear += commonCostsCondoYear;
  });

  totalSquareMeters = formatOreToKroner(totalSquareMeters);
  totalFixedCostsCondoYear = formatOreToKroner(totalFixedCostsCondoYear);
  totalCommonCostsCondoMonth = formatOreToKroner(totalCommonCostsCondoMonth);
  totalCommonCostsCondoYear = formatOreToKroner(totalCommonCostsCondoYear);

  html += objCommonCost.insertTableRow('', 'Sum', totalSquareMeters, totalFixedCostsCondoYear, totalCommonCostsCondoMonth, totalCommonCostsCondoYear);
  html += "</tr>";

  // The end of the table
  html += objCommonCost.endTable();
  document.querySelector('.incomeNextYear').innerHTML = html;
}

// get price per squaremeter
function getpriceSquaremeter(budgetYear) {

  budgetYear = Number(budgetYear);
  let commonCostSquareMeter = 0;
  objCommonCost.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatOreToKroner(commonCostSquareMeter);
  return commonCostSquareMeter;
}

// get price per squaremeter
function getpriceSquaremeter(budgetYear) {

  budgetYear = Number(budgetYear);
  let commonCostSquareMeter = 0;
  objCommonCost.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatOreToKroner(commonCostSquareMeter);
  return commonCostSquareMeter;
}

// Delete a commoncosts row
async function deleteCommonCostsRow(commonCostId) {

  // Check if commoncosts row exist
  rowNumberCommonCosts = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
  if (rowNumberCommonCosts !== -1) {

    // delete commoncosts row
    await objCommonCost.deleteCommonCostsTable(commonCostId, objCommonCost.user);
  }
}

// Update a commoncosts table row
async function updateCommonCostsRow(commonCostId) {

  commonCostId = Number(commonCostId);

  // year
  let className = '.filterYear';
  let year = Number(document.querySelector(className).value);
  className = 'filterYear';
  const validYear = objCommonCost.validateInterval(className, columnWidths, '', 'Ugyldig årstall', true, year, 2020, 2030);

  // commonCostSquareMeter
  className = `.commonCostSquareMeter${commonCostId}`;
  let commonCostSquareMeter = document.querySelector(className).value;
  commonCostSquareMeter = formatKronerToOre(commonCostSquareMeter);
  className = `commonCostSquareMeter${commonCostId}`;
  const validcommonCostSquareMeter = objCommonCost.validateInterval(className, columnWidths, '', 'Ugyldig m2 pris', true, commonCostSquareMeter, 1, objCommonCost.nineNine);

  // fixedCostCondo
  className = `.fixedCostCondo${commonCostId}`;
  let fixedCostCondo = document.querySelector(className).value;
  fixedCostCondo = formatKronerToOre(fixedCostCondo);
  className = `fixedCostCondo${commonCostId}`;
  const validfixedCostCondo = objCommonCost.validateInterval(className, columnWidths, '', 'Ugyldig fast felleskostnad', true, fixedCostCondo, 1, objCommonCost.nineNine, '');

  // Validate commoncosts columns
  if (validYear && validcommonCostSquareMeter && validfixedCostCondo) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the commonCost id exist
    const rowNumberCommonCosts = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
    if (rowNumberCommonCosts !== -1) {

      // update a commoncosts row
      await objCommonCost.updateCommonCostsTable(objCommonCost.user, commonCostId, year, commonCostSquareMeter, fixedCostCondo);
    } else {

      // Insert a commoncosts row
      await objCommonCost.insertCommonCostsTable(objCommonCost.condominiumId, objCommonCost.user, year, commonCostSquareMeter, fixedCostCondo);
    }

    await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);


    showCommonCostYear();

    showCommonCostCondo();
  }
}