// Show projects for condominium

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objAccount = new Account('account');
const objCondo = new Condo('condo');
const objTransaction = new Transaction('transaction');
const objProject = new Project('project');

const enableChanges = (objProject.securityLevel > 5);

// column widths
const columnWidths = [175, 175, 175, 175, 175, 100];

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

        const projectId = Number(document.querySelector('.filterProjectId').value);
        const orderBy = 'condoId ASC, date DESC, income ASC';
        await objTransaction.loadTransactionsTable(orderBy, objProject.condominiumId, 'N', objProject.nineNine, objProject.nineNine, projectId, 0, 2019010, 20991231);

        // Show project per year
        menuNumber = showProjects(menuNumber, projectId);

        // Show transactions this project
        menuNumber = showTransactions(menuNumber);

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
      menuNumber = showProjects(menuNumber);

      // Show project cost per condo
      //menuNumber = showProjectCondo(menuNumber);
    };
  });

  // update a projects row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['name', 'amount'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

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
      menuNumber = showProjects(menuNumber);

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
  html += objProject.showTableHeaderLogOut('1', '2', '3Prosjekt', '4', '5');
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
  html += objProject.showTableHeaderMenu(menuNumber, objProject.accountMenu, '', '2', '3', '4Prosjekt', '5', '6');

  // start table body
  html += objProject.startTableBody();

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2');

  // Project (<td></td>)
  html += objProject.showSelectedProjects('filterProjectId', 'width:175px;', projectId, 'Velg prosjekt', '', enableChanges);
  html += "<td>4</td><td>5</td><td>6</td></tr>";

  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2', '3', '4', '5', '6');

  // end table body
  html += objProject.endTableBody();

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Show projects per condo
function showProjects(menuNumber) {

  // start table
  let html = objProject.initializeTable(columnWidths);

  menuNumber++;
  html += objProject.showTableHeaderMenu(menuNumber, objProject.accountMenu, '#e0f0e0', '2', '3', '4Navn', '5Beløp', '6');

  objProject.arrayProjects.forEach((project) => {

    // insert a table row (<tr></td>)
    menuNumber++;
    html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2', '3');

    // name
    let name = project.name;
    let className = `name${project.projectId}`;
    html += objProject.inputTableCell(className, '', name, 45, enableChanges);

    // amount
    let amount = project.amount;
    amount = formatOreToKroner(amount);
    className = `amount${project.projectId}`;
    html += objProject.inputTableCell(className, '', amount, 11, enableChanges);

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

  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2', '3', '4', '5', '6');

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.showProjects').innerHTML = html;

  return menuNumber;
}

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

  // amount
  className = `.amount${projectId}`;
  let amount = document.querySelector(className).value;
  amount = formatKronerToOre(amount);
  className = `amount${projectId}`;
  const validAmount = objProject.validateInterval(className, columnWidths, '', 'Ugyldig beløp', true, amount, objProject.minusNineNine, objProject.nineNine, '');

  // Validate projects columns
  if (validName && validAmount) {

    document.querySelector('.message').style.display = "none";

    // Check if the project id exist
    const rowNumberProjects = objProject.arrayProjects.findIndex(project => project.projectId === projectId);
    if (rowNumberProjects !== -1) {

      // update a projects row
      const accountId = 0;
      await objProject.updateProjectsTable(projectId, objProject.user, name, accountId, amount);
    } else {

      // Insert a projects row
      const accountId = 0;
      await objProject.insertProjectsTable(objProject.condominiumId, objProject.user, name, accountId, amount);
    }

    await objProject.loadProjectsTable(objProject.condominiumId);

    let menuNumber = 0;
    menuNumber = showProjects(menuNumber);
  }
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // insert a table row (<tr></td>)
  menuNumber++;
  html += objProject.insertTableRow('', menuNumber, objProject.accountMenu, '2', '3');

  // name
  let name = "";
  let className = `name0`;
  html += objProject.inputTableCell(className, '', name, 45, enableChanges);

  // amount
  let amount = 0;
  className = `amount0`;
  html += objProject.inputTableCell(className, '', amount, 11, enableChanges);

  // Insert new account
  html += "<td>6Nytt prosjekt</td></tr>";

  return html;
}

// Show transactions
function showTransactions(menuNumber) {

  // Start table
  let html = objProject.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  menuNumber++;
  html += objCondo.showTableHeaderMenu(menuNumber, objCondo.accountMenu, '#e0f0e0', '2Dato', '3Konto', '4Leilighet', '5Beløp', '');
  let sumAmount = 0;

  for (const bankTransaction of objTransaction.arrayTransactions) {

    // Show menu
    menuNumber++;
    html += objAccount.insertTableRow('', menuNumber, objTransaction.accountMenu);

    // Date
    const date = formatNumberToNorDate(bankTransaction.date);
    let className = `date${bankTransaction.transactionId}`;
    html += objTransaction.inputTableCell(className, 'left', date, 10, false);

    // account
    className = `accountId${bankTransaction.transactionId}`;
    html += objAccount.showSelectedAccounts(className, 'width:175px;', bankTransaction.accountId, 'Velg konto', '', false);

    // condos
    className = `condoId${bankTransaction.transactionId}`;
    html += objCondo.showSelectedCondos(className, 'width:175px;', bankTransaction.condoId, '-', '', false);

    /*
    // accounts
    className = `accountId${bankTransaction.transactionId}`;
    objAccount.showSelectedAccounts(className, 'width:175px;', bankTransaction.accountId, 'Velg konto', '', false);
    */

    // amount
    let amount = bankTransaction.income + bankTransaction.payment;
    amount = formatOreToKroner(amount);
    className = `amount${bankTransaction.transactionId}`;
    html += objTransaction.inputTableCell(className, 'left', amount, 10, false);

    // Show button for voucher
    className = `voucher${bankTransaction.transactionId}`;
    html += objProject.showButton(className, 'Vis bilag');

    html += "</tr>";

    // accumulate
    sumAmount += Number(bankTransaction.income) + Number(bankTransaction.payment);
  };

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  menuNumber++;
  html += objTransaction.insertTableRow('', menuNumber, objTransaction.accountMenu, '2', '3', '4Sum', sumAmount, '6');

  // Show the rest of the menu
  menuNumber++;
  html += objTransaction.showRestMenu(menuNumber, objTransaction.accountMenu, '2', '3', '4', '5', '6');

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.showTransactions').innerHTML = html;
}