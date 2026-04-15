// maintenance of commoncosts

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objCommonCost = new CommonCost('commoncost');

const enableChanges = (objCommonCost.securityLevel > 5);

const tableWidth = 'width:950px';

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
      const URL = (objCommonCost.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objCommonCost.condominiumId, resident, objCommonCost.nineNine);
      await objCondo.loadCondoTable(objCommonCost.condominiumId,objCommonCost.nineNine);

      // Show header
      let menuNumber = 0;
      showHeader();

      await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);

      // Show commonCost
      menuNumber = showCommonCost(menuNumber);

      // Events
      events();
    }
  } else {

    objCommonCost.showMessage(objCommonCost, '', 'Server er ikke startet.');
  }
}

// Events for commoncosts
async function events() {

  // Delete commoncosts row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCost.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // delete
      const classNameDelete = `.${className}`
      const deleteCommonCostRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteCommonCostRowValue === "Ja") {

        const commonCostId = Number(className.substring(6));
        await deleteCommonCostsRow(commonCostId, className);

        await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);

        let menuNumber = 0;
        menuNumber = showCommonCost(menuNumber);
      };
    };
  });

  // update a commoncosts row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['year', 'commonCostSquareMeter', 'fixedCostCondo'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))) {

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

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCost.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objCommonCost.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const commonCostId = Number(className.substring(6));

        deleteAccountRow(commonCostId);
        await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);

        let menuNumber = 0;
        menuNumber = showCommonCost(menuNumber);
      };
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
  let html = objCommonCost.startTable(tableWidth);

  // start table body
  html += objCommonCost.startTableBody();

  // show main header
  html += objCommonCost.showTableHeaderLogOut('width:175px;', '', '', 'Felleskostnader', '', '');
  html += "</tr>";

  // end table body
  html += objCommonCost.endTableBody();

  // The end of the table
  html += objCommonCost.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // insert table columns in start of a row
  html += objCommonCost.insertTableColumns('', menuNumber);

  html += "<td class='center'>Ny felleskostnad</td>";

  // Select year
  const year = today.getFullYear();
  html += objCommonCost.selectInterval('year0', 'width:175px;', 2020, 2030, year, enableChanges);

  // commonCostSquareMeter 
  html += objCommonCost.inputTableColumn('commonCostSquareMeter0', '', '0,00', 10, enableChanges);

  // fixed cost per condo 
  html += objCommonCost.inputTableColumn('fixedCostCondo0', '', '', 10, enableChanges);

  html += "</tr>";
  return html;
}

// Show commoncosts
function showCommonCost(menuNumber) {

  // start table
  let html = objCommonCost.startTable(tableWidth);

  menuNumber++;
  html += objCommonCost.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Slett', 'År', `Felleskostnad m2`, `Fast felleskostnad`);

  objCommonCost.arrayCommonCosts.forEach((commonCost) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objCommonCost.insertTableColumns('', menuNumber);

    // Delete
    let selected = "Ugyldig verdi";
    if (commonCost.deleted === 'Y') selected = "Ja";
    if (commonCost.deleted === 'N') selected = "Nei";

    let className = `delete${commonCost.commonCostId}`;
    html += objCommonCost.showSelectedValues(className, 'width:175px;', enableChanges, selected, 'Nei', 'Ja');

    // Select year
    const year = commonCost.year;
    className = `year${commonCost.commonCostId}`;
    html += objCommonCost.selectInterval(className, 'width:175px;', 2020, 2030, year, enableChanges);

    // common cost per squaremeter
    let commonCostSquareMeter = commonCost.commonCostSquareMeter;
    className = `commonCostSquareMeter${commonCost.commonCostId}`;
    commonCostSquareMeter = formatOreToKroner(commonCostSquareMeter);
    html += objCommonCost.inputTableColumn(className, '', commonCostSquareMeter, 11, enableChanges);

    // fixed cost per condo
    let fixedCostCondo = commonCost.fixedCostCondo;
    className = `fixedCostCondo${commonCost.commonCostId}`;
    fixedCostCondo = formatOreToKroner(fixedCostCondo);
    html += objCommonCost.inputTableColumn(className, '', fixedCostCondo, 10, enableChanges);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 
  if (enableChanges) {

    // Insert empty table row for insertion
    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  }

  // Show the rest of the menu
  menuNumber++;
  html += objCommonCost.showRestMenu(menuNumber);

  // The end of the table
  html += objCommonCost.endTable();
  document.querySelector('.result').innerHTML = html;

  return menuNumber;
}

// Delete one commonCost row
async function deleteAccountRow(commonCostId) {

  // Check if commonCost row exist
  accountsRowNumber = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
  if (accountsRowNumber !== -1) {

    // delete commonCost row
    objCommonCost.deleteAccountsTable(commonCostId, user);
  }

  await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);
}

// Update a commoncosts table row
async function updateCommonCostsRow(commonCostId) {

  commonCostId = Number(commonCostId);

  // year
  className = `.year${commonCostId}`;
  let year = document.querySelector(className).value;
  className = `year${commonCostId}`;
  const validYear = objCommonCost.validateNumber(className, year, 2020, 2030, objCommonCost, '', 'Ugyldig årstall');

  // commonCostSquareMeter
  className = `.commonCostSquareMeter${commonCostId}`;
  let commonCostSquareMeter = document.querySelector(className).value;
  commonCostSquareMeter = formatKronerToOre(commonCostSquareMeter);
  className = `commonCostSquareMeter${commonCostId}`;
  const validcommonCostSquareMeter = objCommonCost.validateNumber(className, commonCostSquareMeter, 1, objCommonCost.nineNine, objCommonCost, '', 'Ugyldig m2 pris');

  // fixedCostCondo
  className = `.fixedCostCondo${commonCostId}`;
  let fixedCostCondo = document.querySelector(className).value;
  fixedCostCondo = formatKronerToOre(fixedCostCondo);
  className = `fixedCostCondo${commonCostId}`;
  const validfixedCostCondo = objCommonCost.validateNumber(className, fixedCostCondo, 1, objCommonCost.nineNine, objCommonCost, '', 'Ugyldig fast felleskostnad');

  // Validate commoncosts columns
  if (validYear && validcommonCostSquareMeter && validfixedCostCondo) {

    document.querySelector('.message').style.display = "none";

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

    let menuNumber = 0;
    menuNumber = showCommonCost(menuNumber);
  }
}

// Delete a commoncosts row
async function deleteCommonCostsRow(commonCostId) {

  // Check if commoncosts row exist
  rowNumberCommonCosts = objCommonCost.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
  if (rowNumberCommonCosts !== -1) {

    // delete commoncosts row
    objCommonCost.deleteCommonCostsTable(commonCostId, objCommonCost.user);
  }
}