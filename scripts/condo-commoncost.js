// maintenance of commoncosts

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objCommonCost = new CommonCost('commoncost');

const enableChanges = (objCommonCost.securityLevel > 5);

const columnWidths = [175, 175, 175, 175, 75];

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
      const URL = (objCommonCost.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show horizonal menu
      let html = objCommonCost.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objCommonCost.condominiumId, resident, objCommonCost.nineNine);
      await objCondo.loadCondoTable(objCommonCost.condominiumId, objCommonCost.nineNine);

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

    objCommonCost.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for commoncosts
async function events() {

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

      let menuNumber = 0;
      menuNumber = showCommonCost(menuNumber);
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
  document.querySelector('.header').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // insert a table row (<tr></td>)
  html += objCommonCost.insertTableRow('', menuNumber, objCommonCost.accountMenu);

  //html += "<td class='center'>Ny felleskostnad</td>";

  // Select year
  const year = today.getFullYear();
  html += objCommonCost.showSelectedNumbers('year0', 'width:175px;', 2020, 2030, year, true);

  // commonCostSquareMeter 
  html += objCommonCost.inputTableColumn('commonCostSquareMeter0', '', '0,00', 10, enableChanges);

  // fixed cost per condo 
  html += objCommonCost.inputTableColumn('fixedCostCondo0', '', '', 10, enableChanges);

  html += "<td class='center'>Ny</td>";

  html += "</tr>";
  return html;
}

// Show commoncosts
function showCommonCost(menuNumber) {

  // start table
  let html = objCommonCost.initializeTable(columnWidths);

  menuNumber++;
  html += objCommonCost.showTableHeaderMenu(menuNumber, objCommonCost.accountMenu, '#e0f0e0', 'År', `Felleskostnad/m2`, `Fast felleskostnad`, 'Slett',);

  objCommonCost.arrayCommonCosts.forEach((commonCost) => {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objCommonCost.insertTableRow('', menuNumber, objCommonCost.accountMenu);

    // Select year
    const year = commonCost.year;
    className = `year${commonCost.commonCostId}`;
    html += objCommonCost.showSelectedNumbers(className, 'width:175px;', 2020, 2030, year, true);

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

    // Delete
    selected = "";
    if (commonCost.deleted === 'Y') selected = "";
    if (commonCost.deleted === 'N') selected = "Slett";

    className = `delete${commonCost.commonCostId}`;
    html += objCommonCost.showButton(className, selected);
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
  html += objCommonCost.showRestMenu(menuNumber, objCommonCost.accountMenu, '', '', '', '');

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
    await objCommonCost.deleteAccountsTable(commonCostId, objCommonCost.user);
  }

  await objCommonCost.loadCommonCostsTable(objCommonCost.condominiumId);
}

// Update a commoncosts table row
async function updateCommonCostsRow(commonCostId) {

  commonCostId = Number(commonCostId);

  // year
  className = `.year${commonCostId}`;
  let year = Number(document.querySelector(className).value);
  className = `year${commonCostId}`;
  const validYear = objCommonCost.validateInterval(className, columnWidths, '', 'Ugyldig årstall', true, year, 2020, 2030);

  // commonCostSquareMeter
  className = `.commonCostSquareMeter${commonCostId}`;
  let commonCostSquareMeter = document.querySelector(className).value;
  commonCostSquareMeter = formatKronerToOre(commonCostSquareMeter);
  className = `commonCostSquareMeter${commonCostId}`;
  const validcommonCostSquareMeter = objCommonCost.validateInterval(className, columnWidths,    '', 'Ugyldig m2 pris',               true,commonCostSquareMeter, 1, objCommonCost.nineNine);

  // fixedCostCondo
  className = `.fixedCostCondo${commonCostId}`;
  let fixedCostCondo = document.querySelector(className).value;
  fixedCostCondo = formatKronerToOre(fixedCostCondo);
  className = `fixedCostCondo${commonCostId}`;
  const validfixedCostCondo = objCommonCost.validateInterval(className, columnWidths,    '', 'Ugyldig fast felleskostnad',               true,fixedCostCondo, 1, objCommonCost.nineNine, '');
  
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
    await objCommonCost.deleteCommonCostsTable(commonCostId, objCommonCost.user);
  }
}