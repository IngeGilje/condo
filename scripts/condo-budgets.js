// Budget maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objBudgets = new Budgets('budgets');

const enableChanges = (objBudgets.securityLevel > 5);

const columnWidths = [100, 175, 175, 175, 100];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramProjectId = Number(queryParameters.get("projectId"));
const paramYear = Number(queryParameters.get("year"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objBudgets.condominiumId === 0) || (objBudgets.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = showHorizontalMenu(objBudgets.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show transaction menu
      html = showHorizontalMenu(objBudgets.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objBudgets.condominiumId, resident, objBudgets.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objBudgets.condominiumId, fixedCost);

      // Show header
      //showHeader();

      // Show filter
      showFilter();

      //const accountId = Number(document.querySelector('.filterAccountId').value);
      const year = Number(document.querySelector('.filterYear').value);
      await objBudgets.loadBudgetsTable(objBudgets.condominiumId, year, objBudgets.nineNine);

      // Show budgets
      showBudgets();

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Make budget events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')) {

      const year = Number(document.querySelector('.filterYear').value);
      await objBudgets.loadBudgetsTable(objBudgets.condominiumId, year, objBudgets.nineNine);

      showBudgets();
    };
  });

  // change budget
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('edit'))) {

      const arrayPrefixes = ['edit'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBudgets.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let budgetId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        budgetId = Number(className.slice(prefix.length));
      }

      const year = Number(document.querySelector('.filterYear').value);
      let URL = (objBudgets.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-budget.html?budgetId=${budgetId}&year=${year}`;
      window.location.href = URL;
    };
  });
}

/*
// update a accounts row
document.addEventListener('change', async (event) => {

  const arrayPrefixes = ['accountId', 'amount', 'text'];

  if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
    || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
    || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))) {

    // Find the first matching class
    const className = arrayPrefixes
      .map(prefix => objBudgets.getClassByPrefix(event.target, prefix))
      .find(Boolean); // find the first non-null/undefined one

    // Extract the number in the class name
    let budgetId = 0;
    let prefix = "";
    if (className) {
      prefix = arrayPrefixes.find(p => className.startsWith(p));
      budgetId = Number(className.slice(prefix.length));
    }

    // Update amount
    await updateBudgetsRow(budgetId);
  };
});
*/

/*
// Delete budgets row
document.addEventListener('click', async (event) => {

  const arrayPrefixes = ['delete'];
  if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

    // Find the first matching class
    const className = arrayPrefixes
      .map(prefix => objBudgets.getClassByPrefix(event.target, prefix))
      .find(Boolean); // find the first non-null/undefined one

    // Extract the number in the class name
    let budgetId = 0;
    let prefix = "";
    if (className) {
      prefix = arrayPrefixes.find(p => className.startsWith(p));
      budgetId = Number(className.slice(prefix.length));
    }

    await deleteBudgetRow(budgetId, className);

    const year = Number(document.querySelector('.filterYear').value);
    const accountId = Number(document.querySelector('.filterAccountId').value);
    await objBudgets.loadBudgetsTable(objBudgets.condominiumId, year, accountId);

    showBudgets();
  };
});
*/

/*
// Log out
document.addEventListener('click', async (event) => {
  if (event.target.classList.contains('logOut')) {

    let url = (objBudgets.serverStatus === 1)
      ? 'http://ingegilje.no/'
      : 'http://localhost/';
    url = `${url}condo-login.html`;
    window.location.href = url;
  };
});
*/

/*
// Delete budgets row
async function deleteBudgetRow(budgetId, className) {
 
  // Check if budget row exist
  budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {
 
    // delete budget row
    await objBudgets.deleteBudgetsTable(budgetId, objBudgets.user);
  }
 
  const year = Number(document.querySelector('.filterYear').value);
  await objBudgets.loadBudgetsTable(objBudgets.condominiumId, year, objBudgets.nineNine);
}
*/

// Calculate sum budget
function calculateSum() {

  let sumAmount = 0;

  objBudgets.arrayBudgets.forEach((budget) => {

    // accumulate (øre)
    sumAmount += Number(budget.amount);
  });

  sumAmount = formatNumberToNorAmount(String(sumAmount));
  document.querySelector('.sum2').value = sumAmount;
};

// Show filter
function showFilter() {

  // Start frame
  let html = startFrame();

  // show filter
  //html += startLine();

  // Show years
  const year = today.getFullYear();
  html += showSelectedNumbersNew('År', 'filterYear', '', 2020, 2030, year, true);

  //html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show budgets
function showBudgets() {

  // start table
  let html = objBudgets.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objBudgets.showTableHeaderMenu('#e0f0e0', 'center', 'År', 'Konto', 'Budsjett', 'Tekst', '');

  let sumAmount = 0;

  objBudgets.arrayBudgets.forEach((budget) => {

    // Show menu
    html += objBudgets.insertTableRow('');

    // Year (<td></td>)
    const year = Number(budget.year);
    let className = `year${budget.budgetId}`;
    html += objBudgets.showSelectedNumbers(className, '', 2020, 2030, year, enableChanges);

    // accountId
    className = `accountId${budget.budgetId}`;
    html += objAccounts.showSelectedAccounts(className, '', budget.accountId, '', '', enableChanges);

    // due amount
    const amount = formatNumberToNorAmount(budget.amount);
    className = `amount${budget.budgetId}`;
    html += editTableCell(className, amount, 11, enableChanges);

    // text
    const text = (budget.text === null) ? '' : budget.text;
    className = `text${budget.budgetId}`;
    html += editTableCell(className, text, 45, enableChanges);

    // Edit budget
    className = `edit${budget.budgetId}`;
    html += objBudgets.showButton(className, 'Endre');
    html += "</tr>";

    // accumulate
    sumAmount += Number(budget.amount);
  });

  // Show table sum row
  sumAmount = formatNumberToNorAmount(sumAmount);

  html += objBudgets.insertTableRow('font-weight: 600;', '', 'Sum', sumAmount, '', '');

  // The end of the table
  html += objBudgets.endTable();
  document.querySelector('.showBudgets').innerHTML = html;
}

/*
function insertEmptyTableRow() {

  // Show menu
  html = objBudgets.insertTableRow('');

  // Year (<td></td>)
  const year = Number(document.querySelector('.filterYear').value);
  html += objBudgets.showSelectedNumbers('year0', '', 2020, 2030, year, enableChanges);

  // accounts
  html += objAccounts.showSelectedAccounts('accountId0', '', 0, 'Velg konto', '', enableChanges);

  const amount = "";
  html += editTableCell('amount0', amount, 11, enableChanges);

  // text
  const text = "";
  html += editTableCell('text0', text, 45, enableChanges);

  html += "<td>Nytt budsjett</td></tr>";
  return html;
}
*/