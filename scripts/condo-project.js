// Show projects for condominium
debugger;
// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objAccount = new Account('account');
const objCondo = new Condo('condo');
const objProject = new Project('project');

const enableChanges = (objProject.securityLevel > 5);

// column widths
const columnWidths = [175, 175, 175, 175, 175];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objProject.condominiumId === 0) || (objProject.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show horizonal menu
      let html = objProject.showHorizontalMenu();
      document.querySelector('.horizontalMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objProject.condominiumId, resident, objProject.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objProject.condominiumId, objProject.nineNine);
      await objProject.loadProjectsTable(objProject.condominiumId);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objProject.condominiumId, fixedCost);
      await objProject.loadProjectsTable(objProject.condominiumId);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      projectId = (objProject.arrayProjects.length === 0)
        ? 0
        : objProject.arrayProjects.at(-1).projectId;
      menuNumber = showFilter(menuNumber, projectId);

      // Show project
      // Get row number for condominium
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objProject.condominiumId);
      if (rowNumberCondominium !== -1) {

        // Show project per year
        menuNumber = showProject(menuNumber, projectId);

        // Show project cost per condo
        //menuNumber = showProjectCondo(menuNumber);

        // Events
        events();
      }
    }
  } else {

    objBudget.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Make events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['filterProjectId'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objProject.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract projectId in the class name
      let projectId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        projectId = Number(className.slice(prefix.length));
      }

      let menuNumber = 3;

      // Show project per year
      menuNumber = showProject(menuNumber);

      // Show project cost per condo
      //menuNumber = showProjectCondo(menuNumber);
    };
  });

  // update a projects row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['name', 'accountId', 'amount'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objProject.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract projectId in the class name
      let projectId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        projectId = Number(className.slice(prefix.length));
      }

      // Update a projects row
      await updateProjectsRow(projectId);
    };
  });

  // Delete projects row
  document.addEventListener('click', async (event) => {
    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objProject.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let projectId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        projectId = Number(className.slice(prefix.length));
      }

      await deleteProjectsRow(projectId, className);
      await objProject.loadProjectsTable(objProject.condominiumId);

      let menuNumber = 0;
      menuNumber = showProject(menuNumber);

      menuNumber++;
      //menuNumber = showProjectCondo(menuNumber);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objProject.serverStatus === 1)
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
  let html = objProject.initializeTable(columnWidths);

  // start table body
  html += objProject.startTableBody();

  // show main header
  html += objProject.showTableHeaderLogOut('1', '2', '3Prosjekt', '4');
  html += "</tr>";

  // end table body
  html += objProject.endTableBody();

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber, projectId) {

  // Start table
  let html = objProject.initializeTable(columnWidths);

  // Header filter (<tr></tr>)
  menuNumber++;
  html += objProject.showTableHeaderMenu(menuNumber, objProject.accountMenu, '', '2', '3Prosjekt', '4', '5');

  // start table body
  html += objProject.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '');

  // Project (<td></td>)
  html += objProject.showSelectedProjects('filterProjectId', 'width:175px;', projectId, 'Velg prosjekt', '', enableChanges);
  html += "<td>4</td><td>5</td></tr>";

  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2', '3', '4', '5');

  // end table body
  html += objProject.endTableBody();

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show projects per condo
function showProject(menuNumber) {

  // start table
  let html = objProject.initializeTable(columnWidths);

  menuNumber++;
  html += objProject.showTableHeaderMenu(menuNumber, objProject.accountMenu, '#e0f0e0', '2Navn', '3Konto', '4Beløp', '5Slett');

  objProject.arrayProjects.forEach((project) => {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objProject.insertTableRow('', menuNumber, objProject.accountMenu);

    // name
    let name = project.name;
    let className = `name${project.projectId}`;
    html += objProject.inputTableColumn(className, '', name, 45, enableChanges);

    // account Id
    let accountId = project.accountId;
    className = `accountId${project.projectId}`;
    html += objAccount.showSelectedAccounts(className, '', accountId, 'Velg konto', '', enableChanges);

    // amount
    let amount = project.amount;
    className = `amount${project.projectId}`;
    html += objProject.inputTableColumn(className, '', amount, 11, enableChanges);

    // Delete
    className = `delete${project.projectId}`;
    html += objProject.showButton(className, 'Slett');
    html += "</tr>";
  });

  if (enableChanges) {

    // Insert empty table row for insertion
    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  };

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.project').innerHTML = html;

  return menuNumber;
}

/*
// Show project cost per condo
function showProjectCondo(menuNumber) {

  const projectId = Number(document.querySelector(".filterProjectId").value);
  const rowNumberProject = objProject.arrayProjects.findIndex(project => project.projectId === projectId);

  // start table
  let html = objProject.initializeTable(columnWidths);

  html += objProject.startTableBody();

  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2', '3', '4', '5');

  // Table header (<tr></tr>)
  menuNumber++;
  html += objProject.showTableHeaderMenu(menuNumber, objProject.accountMenu, '#e0f0e0', '2', '3Leilighet', '4Areal', '5Beløp');

  let totalAmount = 0;

  let totalSquareMeters = 0;
  objCondo.arrayCondo.forEach((condo) => {

    totalSquareMeters += Number(condo.squareMeters);
  });

  // Show project cost per condo
  objCondo.arrayCondo.forEach((condo) => {

    const rowNumberProject = objProject.arrayProjects.findIndex(project => project.projectId === projectId);
    const projectId = objProject.arrayProjects[rowNumberProject]?.projectId || 0;

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objProject.insertTableRow('', menuNumber, objProject.accountMenu,'2');

    // condo name
    let className = `name${condo.condoId}`;
    html += objProject.inputTableColumn(className, '', condo.name, 45, false);

    // Square meters
    let squareMeters = formatOreToKroner(condo.squareMeters);
    className = `squareMeters${condo.condoId}`;
    html += objProject.inputTableColumn(className, '', squareMeters, 11, false);

    // how much to pay for each condo: condoareal/ total areal * project total cost
    squareMeters = formatKronerToOre(squareMeters);
    const amount = objProject.arrayProjects[rowNumberProject]?.amount || 0;
    let toPay = (squareMeters / totalSquareMeters) * amount;

    toPay = formatOreToKroner(toPay);
    className = `toPay${condo.condoId}`;
    html += objProject.inputTableColumn(className, '', toPay, 10, false);
    html += "</tr>";

    // Accomulate
    toPay = formatKronerToOre(toPay);
    totalAmount += Number(toPay);
  });

  menuNumber++;
  totalSquareMeters = formatOreToKroner(totalSquareMeters);
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2','3Sum', totalSquareMeters, totalAmount);
  html += "</tr>";

  // empty table row
  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2', '3', '4', '5');
  html += "</tr>";

  // Show the rest of the menu
  menuNumber++;
  html += objAccount.showRestMenu(menuNumber, objAccount.accountMenu, '2', '3', '4', '5');

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.condos').innerHTML = html;

  return menuNumber;
}
*/

// Delete a projects row
async function deleteProjectsRow(projectId) {

  // Check if projects row exist
  rowNumberProjects = objProject.arrayProjects.findIndex(project => project.projectId === projectId);
  if (rowNumberProjects !== -1) {

    // delete projects row
    await objProject.deleteProjectsTable(projectId, objProject.user);
  }
}

// Update a projects table row
async function updateProjectsRow(projectId) {

  projectId = Number(projectId);

  // name
  let className = `.name${projectId}`;
  let name = document.querySelector(className).value;
  className = `name${projectId}`;
  const validName = objProject.validateText(className, columnWidths, '', 'Ugyldig navn', true, name, 2, 100);

  // account Id
  className = `.accountId${projectId}`;
  let accountId = document.querySelector(className).value;
  className = `accountId${projectId}`;
  const validAccountId = objProject.validateInterval(className, columnWidths,    '', 'Ugyldig konto',               true, accountId,   1, objProject.nineNine);
  
  // amount
  className = `.amount${projectId}`;
  let amount = document.querySelector(className).value;
  amount = formatKronerToOre(amount);
  className = `amount${projectId}`;
  const validAmount = objProject.validateInterval(className, columnWidths, '', 'Ugyldig beløp', true, amount, objProject.minusNineNine, objProject.nineNine, '');

   // Validate projects columns
  if (validName && validAccountId && validAmount) {

    document.querySelector('.message').style.display = "none";

    // Check if the project id exist
    const rowNumberProjects = objProject.arrayProjects.findIndex(project => project.projectId === projectId);
    if (rowNumberProjects !== -1) {

      // update a projects row
      await objProject.updateProjectsTable(objProject.user, projectId, name, accountId, amount);
    } else {

      // Insert a projects row
      await objProject.insertProjectsTable(objProject.condominiumId, objProject.user, name, accountId, amount);
    }

    await objProject.loadProjectsTable(objProject.condominiumId);

    let menuNumber = 0;
    menuNumber = showProject(menuNumber);
  }
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu);

  // name
  let name = "";
  let className = `name0`;
  html += objProject.inputTableColumn(className, '', name, 45, enableChanges);

  // account Id
  let accountId = 0;
  className = `accountId0`;
  html += objAccount.showSelectedAccounts(className, '', accountId, 'Velg konto', '', enableChanges);

  // amount
  let amount = 0;
  className = `amount0`;
  html += objProject.inputTableColumn(className, '', amount, 11, enableChanges);

  // Insert new account
  html += "<td>5Nytt prosjekt</td></tr>";

  return html;
}
