// Show projects for condominium

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objAccounts = new Accounts('accounts');
const objCondo = new Condo('condo');
const objTransactions = new Transactions('transactions');
const objProjects = new Projects('projects');
const objProject = new Project('project');

// Fixed values
const enableChanges = (objProject.securityLevel > 5);
const applicationName = "condo-project";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramTransactionId = Number(queryParameters.get("transactionId"));
const paramCondoId = Number(queryParameters.get("condoId"));
const paramAccountId = Number(queryParameters.get("accountId"));
const paramProjectId = Number(queryParameters.get("projectId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));
const paramAmount = Number(queryParameters.get("amount"));
const paramBackApplication = queryParameters.get("backApplication");

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
      let html = objProject.showHorizontalMenu("filter-frame", objProject.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show project menu
      html = objProject.showHorizontalMenu("filter-frame", objProject.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objProject.markActivatedApplication(objProject.arrayMenuTransaction, applicationName);

      const resident = 'Y';
      await objUser.loadUsersTable(objProject.condominiumId, resident, objProject.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objProject.condominiumId, objProject.nineNine);
      await objProjects.loadProjectsTable(objProject.condominiumId);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objProject.condominiumId, fixedCost);
      await objProjects.loadProjectsTable(objProject.condominiumId);

      // Show filter
      projectId = (objProjects.arrayProjects.length === 0)
        ? 0
        : objProjects.arrayProjects.at(-1)?.projectId ?? 0;
      showFilter(projectId);

      // Show project
      // Get row number for condominium
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objProject.condominiumId);
      if (rowNumberCondominium !== -1) {

        const projectId = Number(document.querySelector('.filterProjectId').value);
        const orderBy = 'date DESC';
        await objTransactions.loadTransactionsTable(orderBy, objProject.condominiumId, 'N', objProject.nineNine, objProject.nineNine, projectId, 0, 2019010, 20991231);

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
      await objProjects.loadProjectsTable(objProject.condominiumId);

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
      await objProjects.loadProjectsTable(objProject.condominiumId);

      showProject();
    };
  });

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objProject.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-transactions.html?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&projectId=${paramProjectId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}&backApplication=${paramBackApplication}`;
      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(projectId) {

  // Start frame
  let html = startFrame('filter-frame');

  // Show projects
  html += objProjects.showSelectedProjectsNew('Prosjekt', 'filterProjectId', '', projectId, '', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Show project
function showProject(projectId) {

  // row number project
  const rowNumberProject = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);

  // account
  let html = emptyLine();
  const accountId = objProjects.arrayProjects[rowNumberProject]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('Konto', 'accountId', '', accountId, 'Velg Konto', '', enableChanges)
  html += "</div>";

  // name
  html += emptyLine();
  const name = objProjects.arrayProjects[rowNumberProject]?.name.trim() ?? '';
  html += showTextNew('Navn', 'name', name, enableChanges, "Navn");
  html += "</div>";

  // amount
  html += startLine();
  let amount = objProjects.arrayProjects[rowNumberProject]?.amount ?? '';
  amount = formatNumberToNorAmount(amount);
  html += showTextNew('Beløp', 'amount', amount, enableChanges, "Beløp");
  html += "</div>";

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

  html += startLine();
  html += showButtonNew('back', 'Tilbake');
  html += "</div>";

  document.querySelector('.showProject').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterProjectId', false);
  }
}

// Update a projects table row
async function updateProjectsRow(projectId) {

  projectId = Number(projectId);

  // account
  let accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = validateIntervalNew('accountId', '', 'Ugyldig konto', true, accountId, 1, objProject.nineNine);

  // name
  let name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig tekst', true, name, 3, 45);

  // amount
  let amount = document.querySelector('.amount').value;
  amount = formatNorAmountToNumber(amount);
  const validAmount = validateNumberNew('amount', '', 'Ugyldig beløp', true, amount, objProject.minusNineNine, objProject.nineNine);

  // Validate projects columns
  if (validName && validAmount && accountId) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the project id exist
    const rowNumberProjects = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);
    if (rowNumberProjects !== -1) {

      // update a projects row
      const accountId = 0;
      await objProject.updateProjectsTable(projectId, objProject.user, name, accountId, amount);
    } else {

      // Insert a projects row
      const accountId = 0;
      await objProject.insertProjectsTable(objProject.condominiumId, objProject.user, name, accountId, amount);
    }

    await objProjects.loadProjectsTable(objProject.condominiumId);
    showProject();
  }
  */
    document.querySelector('.showMessage').style.display = "none";

    // Check if the project id exist
    const rowNumberProjects = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);
    if (rowNumberProjects !== -1) {

      // update a projects row
      await objProjects.updateProjectsTable(projectId, objProject.user, name, accountId, amount);
    } else {

      // Insert a projects row
      await objProjects.insertProjectsTable(objProject.condominiumId, objProject.user, name, accountId, amount);
      await objProjects.getHighestpProjectId(objProject.condominiumId);
      projectIdId = objProjects.arrayProjects[0].projectId;
    }

    await objProjects.loadProjectsTable(objProject.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterProjectId', false);
    }

    // Show filter
    showFilter(projectId);

    // Show project
    showProject(projectId);
  }
}

// Delete a projects row
async function deleteProjectsRow(projectId) {

  // Check if projects row exist
  rowNumberProjects = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);
  if (rowNumberProjects !== -1) {

    // delete projects row
    await objProject.deleteProjectsTable(projectId, objProject.user);
  }
}