// Show projects for condominium

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objAccounts = new Accounts('accounts');
const objCondo = new Condo('condo');
const objTransaction = new Transaction('transaction');
const objProject = new Project('project');

const enableChanges = (objProject.securityLevel > 5);

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

      // Show main menu
      let html = objProject.showHorizontalMenu(objProject.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show project menu
      html = objProject.showHorizontalMenu(objProject.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objProject.condominiumId, resident, objProject.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objProject.condominiumId, objProject.nineNine);
      await objProject.loadProjectsTable(objProject.condominiumId);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objProject.condominiumId, fixedCost);
      await objProject.loadProjectsTable(objProject.condominiumId);

      // Show header
      //showHeader();

      // Show filter
      projectId = (objProject.arrayProjects.length === 0)
        ? 0
        : objProject.arrayProjects.at(-1).projectId;
      showFilter(projectId);

      // Show project
      // Get row number for condominium
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objProject.condominiumId);
      if (rowNumberCondominium !== -1) {

        const projectId = Number(document.querySelector('.filterProjectId').value);
        const orderBy = 'date DESC, income ASC';
        await objTransaction.loadTransactionsTable(orderBy, objProject.condominiumId, 'N', objProject.nineNine, objProject.nineNine, projectId, 0, 2019010, 20991231);

        // Show project per year
        showProject(projectId);

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

    const arrayPrefixes = ['filterProjectId'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      const projectId = Number(document.querySelector('.filterProjectId').value)

      // Show project
      showProject(projectId);
    };
  });

  // update projects row
  document.addEventListener('click', async (event) => {
    const arrayPrefixes = ['update'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objProject.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const projectId = Number(document.querySelector('.filterProjectId').value);
      await updateProjectsRow(projectId);
      await objProject.loadProjectsTable(objProject.condominiumId);

      showProject(projectId);
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

      await deleteProjectsRow(projectId);
      await objProject.loadProjectsTable(objProject.condominiumId);

      showProject();

      //showProjectCondo();
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

/*
// Show header
function showHeader() {

  // Start table
  let html = objProject.initializeTable(columnWidths);

  // start table body
  html += objProject.startTableBody();

  // show main header
  html += objProject.showTableHeaderLogOut('', '', 'Prosjekt', '');
  html += "</tr>";

  // end table body
  html += objProject.endTableBody();

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}
*/

// Show filter
function showFilter(projectId) {

  // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show projects
  html += objProject.showSelectedProjectsNew('Prosjekt', 'filterProjectId', '', projectId, '', '', true);

  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

/*
// Sow project
function showProject() {

  // start table
  let html = objProject.initializeTable(columnWidths);

  html += objProject.showTableHeaderMenu('#e0f0e0', 'center', '', '', 'Navn', 'Beløp', '');

  objProject.arrayProjects.forEach((project) => {

    // insert a table row (<tr></td>)
    html += objProject.insertTableRow('', '', '');

    // name
    let name = project.name;
    let className = `name${project.projectId}`;
    html += objProject.editTableCell(className, name, 45, enableChanges);

    // amount
    let amount = project.amount;
    amount = formatOreToKroner(amount);
    className = `amount${project.projectId}`;
    html += objProject.editTableCell(className, amount, 11, enableChanges);

    // Delete
    className = `delete${project.projectId}`;
    html += objProject.showButton(className, 'Slett');
    html += "</tr>";
  });

  if (enableChanges) {

    // Insert empty table row for insertion
    html += insertEmptyTableRow();
  };

  html += objProject.insertTableRow('', '', '', '', '', '');

  // The end of the table
  html += objProject.endTable();
  document.querySelector('.showProject').innerHTML = html;
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
  let name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig tekst', true, name, 3, 45);

  // amount
  let amount = document.querySelector('.amount').value;
  amount = formatKronerToOre(amount);
  const validAmount = validateNumberNew('amount', '', 'Ugyldig beløp', true, amount, objProject.minusNineNine, objProject.nineNine);

  // Validate projects columns
  if (validName && validAmount) {

    document.querySelector('.showMessage').style.display = "none";

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
    showProject();
  }
}

// Insert empty table row
function insertEmptyTableRow() {

  let html = "";

  // insert a table row (<tr></td>)

  html += objProject.insertTableRow('', '', '');

  // name
  let name = "";
  let className = `name0`;
  html += objProject.editTableCell(className, name, 45, enableChanges);

  // amount
  let amount = 0;
  className = `amount0`;
  html += objProject.editTableCell(className, amount, 11, enableChanges);

  // Insert new account
  html += "<td>Nytt prosjekt</td></tr>";

  return html;
}

// Show project
function showProject(projectId) {

  // row number project
  const rowNumberProject = objProject.arrayProjects.findIndex(project => project.projectId === projectId);

  // name
  let html = emptyRow();

  const name = objProject.arrayProjects[rowNumberProject]?.name.trim() ?? '';
  html += showTextNew('Navn', 'name', name, enableChanges, "Navn");
  html += "</div>";

  // amount
  html += startRow();

  // amount
  let amount = objProject.arrayProjects[rowNumberProject]?.amount ?? '';
  amount = formatOreToKroner(amount);
  html += showTextNew('Beløp', 'amount', amount, enableChanges, "Beløp");
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startRow();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startRow();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }
  html += startRow();
  html += showButtonNew('back', 'Tilbake');
  html += "</div>";

  document.querySelector('.showProject').innerHTML = html;
  if (enableChanges) document.querySelector('.cancel').disabled = true;
}