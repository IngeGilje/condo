// Show projects for condominium

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondominiums = new Condominiums('condominiums');
const objAccounts = new Accounts('accounts');
const objCondo = new Condo('condo');
const objTransactions = new Transactions('transactions');
const objProjects = new Projects('projects');

// Fixed values
const enableChanges = (objProjects.securityLevel > 5);
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
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objProjects.condominiumId === 0) || (objProjects.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objProjects.showMenu(objProjects.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objProjects.condominiumId, resident, objProjects.nineNine);
      await objCondominiums.loadCondominiumsTable();
      await objCondo.loadCondoTable(objProjects.condominiumId);
      await objProjects.loadProjectsTable(objProjects.condominiumId);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objProjects.condominiumId, fixedCost);
      await objProjects.loadProjectsTable(objProjects.condominiumId);

      // Show filter
      projectId = (objProjects.arrayProjects.length === 0)
        ? 0
        : objProjects.arrayProjects.at(-1)?.projectId ?? 0;
      showFilter(projectId);

      // Show project
      // Get row number for condominium
      const rowNumberCondominium = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objProjects.condominiumId);
      if (rowNumberCondominium !== -1) {

        const projectId = Number(document.querySelector('.filterProjectId').value);
        const orderBy = 'date DESC';
        await objTransactions.loadTransactionsTable(orderBy, objProjects.condominiumId, 'N', objProjects.nineNine, objProjects.nineNine, projectId, 0, 2019010, 20991231);

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
    if (event.target.classList.contains('filterProjectId')) {

      const projectId = Number(document.querySelector('.filterProjectId').value)

      // Show project
      showProject(projectId);
    };
  });

  // update project
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const projectId = Number(document.querySelector('.filterProjectId').value);
      await updateProjectsRow(projectId);
      await objProjects.loadProjectsTable(objProjects.condominiumId);

      showProject(projectId);
    };
  });

  // Insert a bankaccounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // Delete projects row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const projectId = Number(document.querySelector('.filterProjectId').value);
      await deleteProjectsRow(projectId);
    };
  });

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objAccounts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let accountId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        accountId = Number(className.slice(prefix.length));
      }

      let URL = (objProjects.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-showtransactions.html?transactionId=${paramTransactionId}&condoId=${paramCondoId}&accountId=${paramAccountId}&projectId=${paramProjectId}&fromDate=${paramFromDate}&toDate=${paramToDate}&amount=${paramAmount}&backApplication=${paramBackApplication}`;
      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(projectId) {

  // Start frame
  //let html = startTableFilter('filter-frame');

  // Start filter
  let html = startGridFilter("Prosjekt");

  // Show projects
  html += objProjects.showSelectedProjectsNew('filterProjectId', 'Prosjekt', projectId, 'Velg prosjekt', '', true);

  // End filter
  html += endGridFilter();

  document.querySelector(".showFilter").innerHTML = html;

  // Change frame title
  //setFrameTitle("filter-frame", "Filter");
}

// Show project
function showProject(projectId) {

  // row number project
  const rowNumberProject = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);

  let html = startGrid('Prosjekt');

  /*
  // account
  const accountId = objProjects.arrayProjects[rowNumberProject]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId', 'Konto', accountId, 'Velg Konto', '', enableChanges)
  html += "<div></div>";
  html += "<div></div>";
  */

  // name
  const name = objProjects.arrayProjects[rowNumberProject]?.name.trim() ?? '';
  html += inputText('name', 'Navn', name, 45, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // amount
  let amount = objProjects.arrayProjects[rowNumberProject]?.amount ?? '';
  amount = formatNumberToNorAmount(amount);
  html += inputText('amount', 'Beløp', amount, 11, enableChanges);
  html += "<div></div>";
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
  document.querySelector('.showProject').innerHTML = html;

  /*
  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    //disableButton('cancel', true);
    disableButton('filterProjectId', false);
  }
  */
}

// Update a projects table row
async function updateProjectsRow(projectId) {

  projectId = Number(projectId);

  // name
  let name = document.querySelector('.name').value;
  const validName = validateTextNew('name', 'Ugyldig tekst', name, 3, 45);

  // amount
  let amount = document.querySelector('.amount').value;
  amount = formatNorAmountToNumber(amount);
  const validAmount = validateIntervalNew('amount', 'Ugyldig beløp', amount, objProjects.minusNineNine, objProjects.nineNine);

  // Validate projects columns
  //if (validName && validAmount && accountId) {
  if (validName && validAmount) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the project id exist
    const rowNumberProjects = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);
    if (rowNumberProjects !== -1) {

      // update a projects row
      const accountId = 0;
      await objProjects.updateProjectsTable(projectId, objProjects.user, name, accountId, amount);
    } else {

      // Insert a projects row
      const accountId = 0;
      await objProjects.insertProjectsTable(objProjects.condominiumId, objProjects.user, name, accountId, amount);
    }

    await objProjects.loadProjectsTable(objProjects.condominiumId);
    showProject();
  }
  */
    document.querySelector('.showMessage').style.display = "none";

    // Check if the project id exist
    const rowNumberProjects = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);
    if (rowNumberProjects !== -1) {

      // update a projects row
      await objProjects.updateProjectsTable(projectId, objProjects.user, name, 0, amount);
    } else {

      // Insert a projects row
      await objProjects.insertProjectsTable(objProjects.condominiumId, objProjects.user, name, 0, amount);
      await objProjects.getHighestProjectId(objProjects.condominiumId);
      projectId = objProjects.arrayProjects[0].projectId;
    }

    await objProjects.loadProjectsTable(objProjects.condominiumId);


    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(projectId);

    // Show project
    showProject(projectId);
  }
}

// Reset values
function resetValues() {

  // Bank name
  document.querySelector('.name').value = '';

  // amount
  document.querySelector('.amount').value = "";

  document.querySelector('.filterProjectId').value = 0;

  // Buttons
  if (enableChanges) {
    disableButton('delete', true);
  }
}

// Delete one projects row
async function deleteProjectsRow(projectId) {

  // Check if projects row exist
  const projectsRowNumber = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);
  if (projectsRowNumber !== -1) {

    // delete projects row
    await objProjects.deleteProjectsTable(projectId, objProjects.user);
    await objProjects.getHighestProjectId(objProjects.condominiumId);

    //projectId = objProjects.arrayProjects[0].projectId;
    // Check for empty array
    projectId = 0;
    if (objProjects.arrayProjects.length > 0) projectId = objProjects.arrayProjects[0].projectId;
  }

  await objProjects.loadProjectsTable(objProjects.condominiumId);

  // Show filter
  showFilter(projectId);

  // Show project
  showProject(projectId);
}
