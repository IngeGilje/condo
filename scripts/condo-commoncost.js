// maintenance of commoncosts

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');
const objCommonCosts = new CommonCost('commoncost');
 
let condominium = 0;

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    condominiumId = Number(sessionStorage.getItem("condominiumId"));
    const email = sessionStorage.getItem("email");
    if ((condominiumId === 0 || email === null)) {

      // LogIn is not valid
      window.location.href = 'http://localhost/condo-login.html';
    } else {

      const resident = 'Y';
      await objUsers.loadUsersTable(condominiumId, resident);
      await objCondos.loadCondoTable(condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      await objCommonCosts.loadCommonCostsTable(condominiumId);

      // Show commonCost
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeatings.showMessage(objRemoteHeatings, 'Server condo-server.js har ikke startet.');
  }
}

// Events for commoncosts
function events() {

  // Delete commoncosts row
  document.addEventListener('change', (event) => {

    const arrayPrefixes = ['delete'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCosts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // delete
      const classNameDelete = `.${className}`
      const deleteCommonCostRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteCommonCostRowValue === "Ja") {

        const commonCostId = Number(className.substring(6));
        deleteCommonCostsSync();

        async function deleteCommonCostsSync() {

          await deleteCommonCostsRow(commonCostId, className);

          await objCommonCosts.loadCommonCostsTable(condominiumId);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });

  // update a commoncosts row
  document.addEventListener('change', (event) => {

    const arrayPrefixes = ['year', 'commonCostSquareMeter', 'fixedCostCondo'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))) {

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

      updateCommonCostsSync();

      // Update a commoncosts row
      async function updateCommonCostsSync() {

        await updateCommonCostsRow(commonCostId);
      }
    };
  });

  // Delete suppliers row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objCommonCosts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objCommonCosts.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const commonCostId = Number(className.substring(6));
        deleteAccountSync();

        async function deleteAccountSync() {

          deleteAccountRow(commonCostId, className);

          await objCommonCosts.loadCommonCostsTable(condominiumId);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });
}

// Show header
function showHeader() {

  // Start table
  let html = objCommonCosts.startTable('width:950px;');

  // show main header
  html += objCommonCosts.showTableHeader('width:175px;', 'Felleskostnader');

  // The end of the table header
  html += objCommonCosts.endTableHeader();

  // The end of the table
  html += objCommonCosts.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";
  let date = "";

  // insert table columns in start of a row
  html += objCommonCosts.insertTableColumns('', rowNumber);

  html += "<td class='center'>Ny felleskostnad</td>";

  // Select year
  const year = today.getFullYear();
  html += objCommonCosts.selectInterval('year0', 'width:175px;', 2020, 2030, year);

  // commonCostSquareMeter 
  html += objCommonCosts.inputTableColumn('commonCostSquareMeter0', '', '', 10);

  // fixed cost per condo 
  html += objCommonCosts.inputTableColumn('fixedCostCondo0', '', '', 10);


  html += "</tr>";
  return html;
}

// Show commoncosts
function showResult(rowNumber) {

  // start table
  let html = objCommonCosts.startTable('width:950px;');

  rowNumber++;
  html += objCommonCosts.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Slett', 'År', `Felleskostnad m2`, `Fast felleskostnad`);

  objCommonCosts.arrayCommonCosts.forEach((commonCost) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objCommonCosts.insertTableColumns('', rowNumber);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (commonCost.deleted === 'Y') selectedChoice = "Ja";
    if (commonCost.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${commonCost.commonCostId}`;
    html += objCommonCosts.showSelectedValues(className, 'width:175px;', selectedChoice, 'Nei', 'Ja')

    // Select year
    const year = commonCost.year;
    className = `year${commonCost.commonCostId}`;
    html += objCommonCosts.selectInterval(className, 'width:175px;', 2020, 2030, year);

    // common cost per squaremeter
    let commonCostSquareMeter = commonCost.commonCostSquareMeter;
    className = `commonCostSquareMeter${commonCost.commonCostId}`;
    commonCostSquareMeter = formatOreToKroner(commonCostSquareMeter);
    html += objCommonCosts.inputTableColumn(className, '', commonCostSquareMeter, 10);

    // fixed cost per condo
    let fixedCostCondo = commonCost.fixedCostCondo;
    className = `fixedCostCondo${commonCost.commonCostId}`;
    fixedCostCondo = formatOreToKroner(fixedCostCondo);
    html += objCommonCosts.inputTableColumn(className, '', fixedCostCondo, 10);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // Show the rest of the menu
  rowNumber++;
  html += objCommonCosts.showRestMenu(rowNumber);

  // The end of the table
  html += objCommonCosts.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Delete one commonCost row
async function deleteAccountRow(commonCostId, className) {

  const user = objUserInfo.email;

  // Check if commonCost row exist
  accountsRowNumber = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
  if (accountsRowNumber !== -1) {

    // delete commonCost row
    objCommonCosts.deleteAccountsTable(commonCostId, user);
  }

  await objCommonCosts.loadCommonCostsTable(condominiumId);
}

// Update a commoncosts table row
async function updateCommonCostsRow(commonCostId) {

  commonCostId = Number(commonCostId);

  //const condominiumId = Number(condominiumId);
  const user = objUserInfo.email;

  // year
  className = `.year${commonCostId}`;
  let year = document.querySelector(className).value;
  className = `year${commonCostId}`;
  const validYear = objCommonCosts.validateNumber(className, year, 2020, 2030);

  // commonCostSquareMeter
  className = `.commonCostSquareMeter${commonCostId}`;
  let commonCostSquareMeter = document.querySelector(className).value;
  commonCostSquareMeter = formatKronerToOre(commonCostSquareMeter);
  className = `commonCostSquareMeter${commonCostId}`;
  const validcommonCostSquareMeter = objCommonCosts.validateNumber(className, commonCostSquareMeter, 1, objCommonCosts.nineNine);

  // fixedCostCondo
  className = `.fixedCostCondo${commonCostId}`;
  let fixedCostCondo = document.querySelector(className).value;
  fixedCostCondo = formatKronerToOre(fixedCostCondo);
  className = `fixedCostCondo${commonCostId}`;
  const validfixedCostCondo = objCommonCosts.validateNumber(className, fixedCostCondo, 1, objCommonCosts.nineNine);

  // Validate commoncosts columns
  if (validYear && validcommonCostSquareMeter && validfixedCostCondo) {

    // Check if the commonCost id exist
    const rowNumberCommonCosts = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
    if (rowNumberCommonCosts !== -1) {

      // update a commoncosts row
      await objCommonCosts.updateCommonCostsTable(user, commonCostId, year, commonCostSquareMeter, fixedCostCondo);
    } else {

      // Insert a commoncosts row
      await objCommonCosts.insertCommonCostsTable(condominiumId, user, year, commonCostSquareMeter, fixedCostCondo);
    }

    await objCommonCosts.loadCommonCostsTable(condominiumId);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Delete a commoncosts row
async function deleteCommonCostsRow(commonCostId) {

  const user = objUserInfo.email;

  // Check if commoncosts row exist
  rowNumberCommonCosts = objCommonCosts.arrayCommonCosts.findIndex(commonCost => commonCost.commonCostId === commonCostId);
  if (rowNumberCommonCosts !== -1) {

    // delete commoncosts row
    objCommonCosts.deleteCommonCostsTable(commonCostId, user);
  }
}
