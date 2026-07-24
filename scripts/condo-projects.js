// Show projects for condominium

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objAccounts = new Accounts('accounts');
const objCondo = new Condo('condo');
const objTransactions = new Transactions('transactions');
const objProjects = new Projects('projects');

const enableChanges = (objProjects.securityLevel > 5);
const applicationName = "condo-projects";

// column widths
const columnWidths = [125, 125, 125, 100];

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

      // Show main menu
      let html = objProjects.showHorizontalMenu(objProjects.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show project menu
      html = objProjects.showHorizontalMenu(objProjects.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objProjects.markActivatedApplication(objProjects.arrayMenuTransaction, applicationName);

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
        const orderBy = 'date DESC, income ASC';
        await objTransactions.loadTransactionsTable(orderBy, objProjects.condominiumId, 'N', objProjects.nineNine, objProjects.nineNine, projectId, 0, 2019010, 20991231);

        // show bank account transactions this project
        showProjectTransactions(projectId);

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

      const projectId = Number(document.querySelector('.filterProjectId').value);
      showProjectTransactions(projectId);
    };
  });

  /*
  // update a projects row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['name', 'amount'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objProjects.getClassByPrefix(event.target, prefix))
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
  */

  /*
  // Delete projects row
  document.addEventListener('click', async (event) => {
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

      await deleteProjectsRow(projectId, className);
      await objProjects.loadProjectsTable(objProjects.condominiumId);


      //showProjects();

      //showProjectCondo();
    };
  });
  */

  /*
  // change projects row
  document.addEventListener('click', async (event) => {
    const arrayPrefixes = ['change'];
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
    };
  });
  */

  /*
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objProjects.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
  */
}

// Show header
function showHeader() {

  // Start table
  let html = objProjects.initializeTable(columnWidths);

  // start table body
  html += objProjects.startTableBody();

  // show main header
  html += objProjects.showTableHeaderLogOut('', '', 'Prosjekt', '');
  html += "</tr>";

  // end table body
  html += objProjects.endTableBody();

  // The end of the table
  html += objProjects.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter(projectId) {

  // Start frame
  let html = startFrame();

  // show filter
  //html += startLine();

  // Show projects
  html += objProjects.showSelectedProjectsNew('Prosjekt', 'filterProjectId', '', projectId, 'Velg prosjekt', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

/*
// Delete a projects row
async function deleteProjectsRow(projectId) {

  // Check if projects row exist
  rowNumberProjects = objProjects.arrayProjects.findIndex(project => project.projectId === projectId);
  if (rowNumberProjects !== -1) {

    // delete projects row
    await objProjects.deleteProjectsTable(projectId, objProjects.user);
  }
}
*/

// show bank account transactions this project
function showProjectTransactions(projectId) {

  // Empty line
  let html = emptyLine();

  // Start table
  html += objProjects.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objCondo.showTableHeader('center', 'Dato', 'Konto', 'Leilighet', 'Beløp');
  let sumAmount = 0;

  for (const bankTransaction of objTransactions.arrayTransactions) {
    if (bankTransaction.projectId === projectId) {

      // Insert Table Row
      html += objProjects.insertTableRow('');

      // Date
      const date = formatNumberToNorDate(bankTransaction.date);
      let className = `date${bankTransaction.transactionId}`;
      html += editTableCell(className, date, 10, false);

      // account
      className = `accountId${bankTransaction.transactionId}`;
      html += objAccounts.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

      // condos
      className = `condoId${bankTransaction.transactionId}`;
      html += objCondo.showSelectedCondos(className, '', bankTransaction.condoId, '-', '', false);

      // amount
      let amount = bankTransaction.income + bankTransaction.payment;
      amount = formatNumberToNorAmount(amount);
      className = `amount${bankTransaction.transactionId}`;
      html += editTableCell(className, amount, 10, false);

      // accumulate
      sumAmount += Number(bankTransaction.income) + Number(bankTransaction.payment);
    }
  };

  // Show table sum row
  sumAmount = formatNumberToNorAmount(sumAmount);

  html += objTransactions.insertTableRow('', '', '', 'Sum', sumAmount);

  // The end of the table
  html += objProjects.endTable();
  document.querySelector('.showProjectTransactions').innerHTML = html;
}