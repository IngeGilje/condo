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
const objCommonCosts = new CommonCosts('commoncosts');
const objCommonCost = new CommonCost('commoncost');

// Fixed values
const enableChanges = (objCommonCost.securityLevel > 5);
const applicationName = "condo-commoncost";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramCommonCostId = Number(queryParameters.get("commonCostId"));

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

      // Show vertical menu
      let html = objCommonCost.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objCommonCost.showHorizontalMenu("filter-frame", objCommonCost.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show due menu
      html = objCommonCost.showHorizontalMenu("filter-frame", objCommonCost.arrayMenuDue);
      document.querySelector('.menuDue').innerHTML = html;
      objCommonCost.markActivatedApplication(objCommonCost.arrayMenuDue, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objCommonCost.condominiumId, resident, objCommonCost.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objCommonCost.condominiumId, objCommonCost.nineNine);
      await objCommonCosts.loadCommonCostsTable(objCommonCost.condominiumId);
      await objBudgets.loadBudgetsTable(objCommonCost.condominiumId, objCommonCost.nineNine, objCommonCost.nineNine);
      await objBankAccount.loadBankAccountsTable(objCommonCost.condominiumId, objCommonCost.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objCommonCost.condominiumId, fixedCost);

      let commonCostId = 0;
      if (paramCommonCostId === 0) {

        await objCommonCosts.getHighestCommonCostId(objCommonCost.condominiumId);
        commonCostId = objCommonCosts.arrayCommonCosts.at(-1)?.commonCostId ?? 0;
        const fixedCost = "A";
        await objCommonCosts.loadCommonCostsTable(objCommonCosts.condominiumId, fixedCost);
      } else {

        commonCostId = paramCommonCostId;
      }

      // Show filter
      showFilter(commonCostId);

      // Show remote Heating
      // Get row number for payment Remote Heating Account Id
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objCommonCost.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show common cost per year
        showCommonCost(commonCostId);

        // Events
        events();
      }
    }
  } else {

    showMessageNew('Server er ikke startet.');
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
      showCommonCost(commonCostId);
    };
  });

  // update a commoncosts row
  document.addEventListener('click', async (event) => {

    if (event.target.classList.contains('update')) {

      const commonCostId = Number(document.querySelector('.filterCommonCostId').value);
      updateCommonCostsRow(commonCostId);
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
  */

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
      await objCommonCosts.loadCommonCostsTable(objCommonCost.condominiumId);


      // Show common cost
      showCommonCost(commonCostId);
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

// Show filter
function showFilter(commonCostId) {

  // Start frame
  //let html = startFrame('filter-frame');

  // Start filter
  let html = startFilter("Tømmekalender");

  // Show commoncosts
  html += objCommonCosts.showSelectedCommonCostsNew('filterCommonCostId', 'Felleskost', commonCostId, 'Velg Felleskost', '', true);

  // End filter
  html += endFilter();

  document.querySelector('.showFilter').innerHTML = html;
}

// Show commoncost
function showCommonCost(commonCostId) {

  const rowNumberCommonCost = objCommonCosts.arrayCommonCosts.findIndex(commoncost => commoncost.commonCostId === commonCostId);

  // Empty line
  //let html = emptyLine();

  let html = startContent('Felleskostnader');

  // common cost per squaremeter
  let commonCostSquareMeter = 0;
  if (rowNumberCommonCost !== -1) commonCostSquareMeter = objCommonCosts.arrayCommonCosts[rowNumberCommonCost].commonCostSquareMeter;
  commonCostSquareMeter = formatNumberToNorAmount(commonCostSquareMeter);
  html += inputText('commonCostSquareMeter', 'Felleskostnad/m2', commonCostSquareMeter, enableChanges);
  html += "<div></div>";
  html += "<div></div>";

  // fixed cost per condo
  if (rowNumberCommonCost !== -1) fixedCostCondo = objCommonCosts.arrayCommonCosts[rowNumberCommonCost].fixedCostCondo;
  fixedCostCondo = formatNumberToNorAmount(fixedCostCondo);
  html += inputText('fixedCostCondo', 'Fast kostnad', fixedCostCondo, enableChanges, 'Fast Kostnad');
  html += "<div></div>";
  html += "<div></div>";

  /*
  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  if (paramCommonCostId > 0) {
    html += startLine();
    html += showButtonNew('back', 'Tilbake');
    html += "</div>";
  }

  document.querySelector('.showCommonCost').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterCommonCostId', false);
  }
  */
  html += endContent();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update primary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("cancel secondary", "Angre", "reset");
    html += inputButton("back secondary", "Tilbake", "button");
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
  objCommonCost.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatNumberToNorAmount(commonCostSquareMeter);
  return commonCostSquareMeter;
}

// get price per squaremeter
function getpriceSquaremeter(budgetYear) {

  budgetYear = Number(budgetYear);
  let commonCostSquareMeter = 0;
  objCommonCost.arrayCommonCosts.forEach((commonCost) => {

    if (commonCost.year === budgetYear) commonCostSquareMeter = Number(commonCost.commonCostSquareMeter);
  });

  commonCostSquareMeter = formatNumberToNorAmount(commonCostSquareMeter);
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

  const rowNumberCommonCost = objCommonCosts.arrayCommonCosts.findIndex(commoncost => commoncost.commonCostId === commonCostId);

  // year
  const year = objCommonCosts.arrayCommonCosts[rowNumberCommonCost]?.year ?? 0;
  const validYear = validateIntervalNew('filterCommonCostId', '', 'Ugyldig årstall', true, year, 2020, 2030);

  // common cost per squaremeter 
  let commonCostSquareMeter = document.querySelector('.commonCostSquareMeter').value;
  commonCostSquareMeter = formatNorAmountToNumber(commonCostSquareMeter);
  const validCommonCostSquareMeter = validateIntervalNew('commonCostSquareMeter', '', 'Ugyldig Felleskost/m2', true, commonCostSquareMeter, 0, objCommonCost.nineNine);

  // fix common cost per condo
  let fixedCostCondo = document.querySelector('.fixedCostCondo').value;
  fixedCostCondo = formatNorAmountToNumber(fixedCostCondo);
  const validFixedCostCondo = validateIntervalNew('fixedCostCondo', '', 'Ugyldig fast kost per leilighet', true, fixedCostCondo, 0, objCommonCost.nineNine);

  // Validate commoncosts columns
  if (validYear && validCommonCostSquareMeter && validFixedCostCondo) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the Common Cost row
    if (rowNumberCommonCost !== -1) {

      // update a commoncosts row
      await objCommonCosts.updateCommonCostsTable(objCommonCost.user, commonCostId, year, commonCostSquareMeter, fixedCostCondo);
    } else {

      // Insert a commoncosts row
      await objCommonCosts.insertCommonCostsTable(objCommonCost.condominiumId, objCommonCost.user, year, commonCostSquareMeter, fixedCostCondo);
      await objCommonCosts.getHighestCommonCostId(objCommonCost.condominiumId);
      commonCostId = objCommonCosts.arrayCommonCosts[0].commonCostId;
    }

    await objCommonCosts.loadCommonCostsTable(objCommonCost.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterCommonCostId', false);
    }

    // Show filter
    showFilter(commonCostId);

    // Show commoncost
    showCommonCost(commonCostId);
  }
}