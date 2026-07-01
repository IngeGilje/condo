// Show projects for condominium

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondominium = new Condominium('condominium');
const objAccounts = new Accounts('accounts');
const objCondo = new Condo('condo');
const objTransaction = new Transaction('transaction');
const objProjects = new Projects('projects');

const enableChanges = (objProjects.securityLevel > 5);

// column widths
const columnWidths = [175, 175, 175, 175];

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
      let html = objProjects.showHorizontalMenu(objProjects.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show project menu
      html = objProjects.showHorizontalMenu(objProjects.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objProjects.condominiumId, resident, objProjects.nineNine);
      await objCondominium.loadCondominiumsTable();
      await objCondo.loadCondoTable(objProjects.condominiumId, objProjects.nineNine);
      await objProjects.loadProjectsTable(objProjects.condominiumId);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objProjects.condominiumId, fixedCost);
      await objProjects.loadProjectsTable(objProjects.condominiumId);

      // Show header
      //showHeader();

      // Show filter
      projectId = (objProjects.arrayProjects.length === 0)
        ? 0
        : objProjects.arrayProjects.at(-1).projectId;
      showFilter(projectId);

      // Show project
      // Get row number for condominium
      const rowNumberCondominium = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objProjects.condominiumId);
      if (rowNumberCondominium !== -1) {

        const projectId = Number(document.querySelector('.filterProjectId').value);
        const orderBy = 'date DESC, income ASC';
        await objTransaction.loadTransactionsTable(orderBy, objProjects.condominiumId, 'N', objProjects.nineNine, objProjects.nineNine, projectId, 0, 2019010, 20991231);

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
  // Show bank voucher
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('voucher'))) {

      const arrayPrefixes = ['voucher'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value)
      URL = `${URL}condo-voucher.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}`;
      window.location.href = URL;
    };
  });
  */

  /*
  // Change project
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {

      const arrayPrefixes = ['change'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objTransaction.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let projectId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        projectId = Number(className.slice(prefix.length));
      }

      let URL = (objTransaction.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      //const projectId = Number(document.querySelector('.filterProjectId').value);
      URL = `${URL}condo-project.html?projectId=${projectId}`;
      window.location.href = URL;
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
  html += startRow();

  // Show projects
  html += objProjects.showSelectedProjectsNew('Prosjekt', 'filterProjectId', '', projectId, 'Velg prosjekt', '', true);

  // End row
  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

/*
// Show projects
function showProjects(projectId) {

  // start table
  let html = objProjects.initializeTable(columnWidths);

  html += objProjects.showTableHeaderMenu('#e0f0e0', 'center', '', '', 'Navn', 'Beløp', '');

  objProjects.arrayProjects.forEach((project) => {

    // insert a table row (<tr></td>)
    html += objProjects.insertTableRow('', '', '');

    // name
    let name = project.name;
    let className = `name${project.projectId}`;
    html += objProjects.editTableCell(className, name, 45, enableChanges);

    // amount
    let amount = project.amount;
    amount = formatOreToKroner(amount);
    className = `amount${project.projectId}`;
    html += objProjects.editTableCell(className, amount, 11, enableChanges);

    // Delete
    className = `delete${project.projectId}`;
    html += objProjects.showButton(className, 'Slett');
    html += "</tr>";
  });

  if (enableChanges) {

    // Insert empty table row for insertion
    html += insertEmptyTableRow();
  };

  html += objProjects.insertTableRow('', '', '', '', '', '');

  // The end of the table
  html += objProjects.endTable();
  document.querySelector('.showProjectTransactions').innerHTML = html;
}
*/

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
/*
// Update a projects table row
async function updateProjectsRow(projectId) {

  projectId = Number(projectId);

  // name
  let className = `.name${projectId}`;
  let name = document.querySelector(className).value;
  className = `name${projectId}`;
  const validName = objProjects.validateText(className, columnWidths, '', 'Ugyldig navn', true, name, 2, 100);

  // amount
  className = `.amount${projectId}`;
  let amount = document.querySelector(className).value;
  amount = formatKronerToOre(amount);
  className = `amount${projectId}`;
  const validAmount = objProjects.validateInterval(className, columnWidths, '', 'Ugyldig beløp', true, amount, objProjects.minusNineNine, objProjects.nineNine, '');

  // Validate projects columns
  if (validName && validAmount) {

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

    //showProjects();
  }
}
*/

/*
// Insert empty table row
function insertEmptyTableRow() {

  let html = "";

  // insert a table row (<tr></td>)

  html += objProjects.insertTableRow('', '', '');

  // name
  let name = "";
  let className = `name0`;
  html += objProjects.editTableCell(className, name, 45, enableChanges);

  // amount
  let amount = 0;
  className = `amount0`;
  html += objProjects.editTableCell(className, amount, 11, enableChanges);

  // Insert new account
  html += "<td>Nytt prosjekt</td></tr>";

  return html;
}
*/

// show bank account transactions this project
function showProjectTransactions(projectId) {

  // Start table
  let html = objProjects.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objCondo.showTableHeaderMenu('#e0f0e0', 'center', 'Dato', 'Konto', 'Leilighet', 'Beløp');
  let sumAmount = 0;

  for (const bankTransaction of objTransaction.arrayTransactions) {
    if (bankTransaction.projectId === projectId) {

      // Insert Table Row
      html += objAccount.insertTableRow('');

      // Date
      const date = formatNumberToNorDate(bankTransaction.date);
      let className = `date${bankTransaction.transactionId}`;
      html += objTransaction.editTableCell(className, date, 10, false);

      // account
      className = `accountId${bankTransaction.transactionId}`;
      html += objAccount.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);

      // condos
      className = `condoId${bankTransaction.transactionId}`;
      html += objCondo.showSelectedCondos(className, '', bankTransaction.condoId, '-', '', false);

      // amount
      let amount = bankTransaction.income + bankTransaction.payment;
      amount = formatOreToKroner(amount);
      className = `amount${bankTransaction.transactionId}`;
      html += objTransaction.editTableCell(className, amount, 10, false);

      // accumulate
      sumAmount += Number(bankTransaction.income) + Number(bankTransaction.payment);
    }
  };

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  html += objTransaction.insertTableRow('', '', '', 'Sum', sumAmount);

  // The end of the table
  html += objProjects.endTable();
  document.querySelector('.showProjectTransactions').innerHTML = html;
}