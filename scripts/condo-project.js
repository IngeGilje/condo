// Show projects for condominium

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
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
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objProjects.condominiumId === 0) || (objProjects.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      /*
      // Show vertical menu
      let html = objProjects.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      //setFrameTitle("menu-frame", "Meny");
      */
      // Show menu
      let html = objProjects.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      /*
      // Show main menu
      let html = objProjects.showHorizontalMenu("filter-frame", objProjects.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show project menu
      html = objProjects.showHorizontalMenu("filter-frame", objProjects.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objProjects.markActivatedApplication(objProjects.arrayMenuTransaction, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objProjects.condominiumId, resident, objProjects.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objProjects.condominiumId, objProjects.nineNine);
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
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objProjects.condominiumId);
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

      /*
      //const arrayPrefixes = ['update'];
      //if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objProjects.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one
      */

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
      /*
      const arrayPrefixes = ['delete'];
      if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {
  
        // Find the first matching class
        const className = arrayPrefixes
          .map(prefix => objProjects.getClassByPrefix(event.target, prefix))
          .find(Boolean); // find the first non-null/undefined one
  
        // Extract the number in the class name
        let projectId = 0;
        let prefix = "";
        if (className) {
          prefix = arrayPrefixes.find(p => className.startsWith(p));
          projectId = Number(className.slice(prefix.length));
        }
        */

      const projectId = Number(document.querySelector('.filterProjectId').value);
      await deleteProjectsRow(projectId);
      await objProjects.loadProjectsTable(objProjects.condominiumId);

      showProject(projectId);
    };
  });

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objProjects.serverStatus === 1)
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
  //let html = startFrame('filter-frame');

  // Start filter
  let html = startFilter("Prosjekt");

  // Show projects
  html += objProjects.showSelectedProjectsNew('filterProjectId', 'Prosjekt', projectId, 'Velg prosjekt', '', true);

  // End filter
  html += endFilter();

  document.querySelector(".showFilter").innerHTML = html;

  // Change frame title
  //setFrameTitle("filter-frame", "Filter");
}

// Show project
function showProject(projectId) {

  // row number project
  const rowNumberProject = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);

  let html = startContent('Konto');

  /*
  // account
  const accountId = objProjects.arrayProjects[rowNumberProject]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId', 'Konto', accountId, 'Velg Konto', '', enableChanges)
  html += "<div></div>";
  html += "<div></div>";
  */

  // name
  const name = objProjects.arrayProjects[rowNumberProject]?.name.trim() ?? '';
  html += inputText('name', 'Navn', name, enableChanges, "Navn");
  html += "<div></div>";
  html += "<div></div>";

  // amount
  let amount = objProjects.arrayProjects[rowNumberProject]?.amount ?? '';
  amount = formatNumberToNorAmount(amount);
  html += inputText('amount', 'Beløp', amount, enableChanges);
  html += "<div></div>";
  html += "<div></div>";

  html += endContent();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update primary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("cancel secondary", "Angre", "reset");
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
    disableButton('cancel', true);
    disableButton('filterProjectId', false);
  }
  */
}

// Update a projects table row
async function updateProjectsRow(projectId) {

  projectId = Number(projectId);

  /*
  // account
  let accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = validateIntervalNew('accountId', 'Ugyldig konto', true, accountId, 1, objProjects.nineNine);
  */

  // name
  let name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig tekst', true, name, 3, 45);

  // amount
  let amount = document.querySelector('.amount').value;
  amount = formatNorAmountToNumber(amount);
  const validAmount = validateNumberNew('amount', '', 'Ugyldig beløp', true, amount, objProjects.minusNineNine, objProjects.nineNine);

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
      await objProjects.getHighestpProjectId(objProjects.condominiumId);
      projectIdId = objProjects.arrayProjects[0].projectId;
    }

    await objProjects.loadProjectsTable(objProjects.condominiumId);

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
    await objProjects.deleteProjectsTable(projectId, objProjects.user);
  }
}

// Reset values
function resetValues() {

  // Bank name
  document.querySelector('.name').value = '';

  // account id
  //document.querySelector('.accountId').value = 0;

  // amount
  document.querySelector('.amount').value = "";

  document.querySelector('.filterProjectId').value = 0;

  // Filter
  document.querySelector('.filterProjectId').disabled = true;

  removeMessage();
}