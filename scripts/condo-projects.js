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
const columnWidths = [125, 125, 125, 100, 100];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramTransactionId = Number(queryParameters.get("transactionId"));
const paramCondoId = Number(queryParameters.get("condoId"));
const paramAccountId = Number(queryParameters.get("accountId"));
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

      // Show vertical menu
      let html = objProjects.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      //setFrameTitle("menu-frame", "Meny");

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

  // change bank account transaction
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('change'))) {

      const arrayPrefixes = ['change'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objTransactions.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let transactionId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        transactionId = Number(className.slice(prefix.length));
      }

      // Project id
      const rowNumberTransaction = objTransactions.arrayTransactions.findIndex(transaction => transaction.transactionId === transactionId);
      if (rowNumberTransaction !== -1) {

        const condoId = objTransactions.arrayTransactions[rowNumberTransaction].condoId;
        const projectId = objTransactions.arrayTransactions[rowNumberTransaction].projectId;
        const accountId = objTransactions.arrayTransactions[rowNumberTransaction].accountId;
        const fromDate = objTransactions.arrayTransactions[rowNumberTransaction].date;
        const toDate = objTransactions.arrayTransactions[rowNumberTransaction].date;
        const amount = (objTransactions.arrayTransactions[rowNumberTransaction].income)
          ? (objTransactions.arrayTransactions[rowNumberTransaction].income)
          : (objTransactions.arrayTransactions[rowNumberTransaction].payment);

        let URL = (objTransactions.serverStatus === 1)
          ? 'http://ingegilje.no/'
          : 'http://localhost/';
        URL = `${URL}condo-transaction.html?transactionId=${transactionId}&condoId=${condoId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}&amount=${amount}&projectId=${projectId}&backApplication=${applicationName}.html`;
        window.location.href = URL;
      }
    };
  });
}

/*
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
*/

// Show filter
function showFilter(projectId) {

  // Start frame
  let html = startFrame('filter-frame');

  // show filter
  //html += startLine();

  // Show projects
  html += objProjects.showSelectedProjectsNew('filterProjectId', 'Prosjekt', projectId, 'Velg prosjekt', '', true);

  // End filter
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame", "Filter");
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
  html += objCondo.showTableHeader('center', 'Dato', 'Konto', 'Leilighet', 'Beløp', '');
  let sumAmount = 0;

  for (const bankTransaction of objTransactions.arrayTransactions) {
    if (bankTransaction.projectId === projectId) {

      // Insert Table Row
      html += objProjects.insertTableRow('');

      // Date
      const date = formatNumberToNorDate(bankTransaction.date);
      let className = `date${bankTransaction.transactionId}`;
      //html += editTableCell(className, date, 10, false);
      html += showTableText(className, date);

      // account
      className = `accountId${bankTransaction.transactionId}`;
      //html += objAccounts.showSelectedAccounts(className, '', bankTransaction.accountId, 'Velg konto', '', false);
      const accountName = objAccounts.getAccountNameById(bankTransaction.accountId)
      html += showTableText(className, accountName);

      // condo
      className = `condoId${bankTransaction.transactionId}`;
      //html += objCondo.showSelectedCondos(className, '', bankTransaction.condoId, '-', '', false);
      const condoName = objCondo.getCondoNameById(bankTransaction.condoId)
      html += showTableText(className, condoName);

      // amount
      let amount = bankTransaction.income + bankTransaction.payment;
      amount = formatNumberToNorAmount(amount);
      className = `amount${bankTransaction.transactionId}`;
      //html += editTableCell(className, amount, 10, false);
      html += showTableText(className, amount);

      // Show button for change of bank account transaction
      className = `change${bankTransaction.transactionId}`;
      html += objProjects.showButton(className, 'Rediger');
      html += "</tr>";

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