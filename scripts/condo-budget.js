// Budget maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBudget = new Budget('budget');

const disableChanges = (objBudget.securityLevel < 5);
const condominiumId = objBudget.condominiumId;
const user = objBudget.user;

const tableWidth = 'width:1100px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);

      // Show header
      showHeader();

      // Show filter
      let menuNumber = 0;
      menuNumber = showFilter(menuNumber);

      const accountId = Number(document.querySelector('.filterAccountId').value);
      const year = Number(document.querySelector('.filterYear').value);
      await objBudget.loadBudgetsTable(condominiumId, year, accountId);

      // Show result of filter
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}


// Make budget events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterYear')
      || event.target.classList.contains('filterAccountId')) {

      const year = Number(document.querySelector('.filterYear').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      await objBudget.loadBudgetsTable(condominiumId, year, accountId);

      let menuNumber = 0;
      menuNumber = showResult(menuNumber);
    };
  });

  // update a accounts row
  document.addEventListener('change', async (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('accountId'))
      || [...event.target.classList].some(cls => cls.startsWith('amount'))
      || [...event.target.classList].some(cls => cls.startsWith('text'))
      || [...event.target.classList].some(cls => cls.startsWith('year'))) {

      const arrayPrefixes = ['accountId', 'amount', 'year', 'text'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBudget.getClassByPrefix(event.target, prefix))
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

  // Delete budgets row
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDue.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objBudget.getDeleteClass(event.target);
      const budgetId = Number(className.substring(6));

      deleteBudgetRow(budgetId, className);

      const year = Number(document.querySelector('.filterYear').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      await objBudget.loadBudgetsTable(condominiumId, year, accountId);

      let menuNumber = 0;
      menuNumber = showResult(menuNumber);
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objBudget.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Delete budgets row
async function deleteBudgetRow(budgetId, className) {



  // Check if budget row exist
  budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    // delete budget row
    objBudget.deleteBudgetsTable(budgetId, user);
  }

  const year = Number(document.querySelector('.filterYear').value);
  await objBudget.loadBudgetsTable(condominiumId, year, objBudget.nineNine);
}

// Update a budgets row
async function updateBudgetsRow(budgetId) {

  budgetId = Number(budgetId);



  // Get budgets row values

  // accountId
  className = `.accountId${budgetId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${budgetId}`;
  const validAccountId = objBudget.validateNumber(className, accountId, 1, objBudget.nineNine);

  // amount
  className = `.amount${budgetId}`;
  let amount = document.querySelector(className).value;
  amount = Number(formatKronerToOre(amount));
  className = `amount${budgetId}`;
  let validAmount = objBudget.validateNumber(className, amount, objBudget.minusNineNine, objBudget.nineNine);
  if (amount === 0) validAmount = false;

  // year
  className = `.year${budgetId}`;
  let year = Number(document.querySelector(`${className}`).value);
  className = `year${budgetId}`;
  const validYear = objBudget.validateNumber(className, year, 2020, 2029);

  // text
  className = `.text${budgetId}`;
  let text = document.querySelector(`${className}`).value;
  let validText = objBudget.validateText(text, 0, 45);

  // Validate budgets columns
  if (validAccountId && validAmount && validAmount && validYear && validText) {

    // Check if the budgets row exist
    budgetsRowNumber = objBudget.arrayBudgets.findIndex(budgets => budgets.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update the budgets row
      await objBudget.updateBudgetsTable(budgetId, user, accountId, amount, year, text);

    } else {

      // Insert the budget row in budgets table
      await objBudget.insertBudgetsTable(condominiumId, user, accountId, amount, year, text);
    }

    accountId = Number(document.querySelector('.filterAccountId').value);
    year = Number(document.querySelector('.filterYear').value);
    await objBudget.loadBudgetsTable(condominiumId, year, accountId);
    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Calculate sum budget
function calculateSum() {

  let sumAmount = 0;

  objBudget.arrayBudgets.forEach((budget) => {

    // accumulate (øre)
    sumAmount += Number(budget.amount);
  });

  sumAmount = formatOreToKroner(String(sumAmount));
  document.querySelector('.sum2').value = sumAmount;
};

/*
// Show header
function showHeader() {

  // Start table
  let html = objBudget.startTable(tableWidth);

  // show main header
  html += objBudget.showTableHeader('width:175px;', 'Budsjett');

  // The end of the table
  html += objBudget.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objBudget.startTable(tableWidth);

  // start table body
  html += objBudget.startTableBody();

  // show main header
  html += objBudget.showTableHeaderLogOut('width:175px;', '', '', '', 'Budsjett', '', '');
  html += "</tr>";

  // end table body
  html += objBudget.endTableBody();

  // The end of the table
  html += objBudget.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objBudget.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objBudget.showTableHeaderMenu('width:175px;', rowNumber, '', '', 'Konto', 'År', '');

  // start table body
  html += objBudget.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objBudget.insertTableColumns('', rowNumber, '', '');

  // Selected accounts
  html += objAccount.showSelectedAccounts('filterAccountId', '', 0, '', 'Alle', false);

  // Selected year
  const year = String(today.getFullYear());
  html += objBudget.showSelectedNumbers('filterYear', "width:175px;", 2020, 2030, year, false);

  html += "</tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objBudget.insertTableColumns('', rowNumber, '');

  // end table body
  html += objBudget.endTableBody();

  // The end of the table
  html += objBudget.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show bankaccounttransactions
function showResult(rowNumber) {

  // start table
  let html = objBudget.startTable(tableWidth);

  // table header
  rowNumber++;
  html += objBudget.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Slett', 'Konto', 'Budsjett', 'År', 'Tekst');

  let sumAmount = 0;

  objBudget.arrayBudgets.forEach((budget) => {

    // Show menu
    rowNumber++;
    html += objBudget.insertTableColumns('', rowNumber,);

    // Delete
    let selected = "Ugyldig verdi";
    if (budget.deleted === 'Y') selected = "Ja";
    if (budget.deleted === 'N') selected = "Nei";

    let className = `delete${budget.budgetId}`;
    html += objBudget.showSelectedValues(className, 'width:175px;', disableChanges, selected, 'Nei', 'Ja');

    // accountId
    className = `accountId${budget.budgetId}`;
    html += objAccount.showSelectedAccounts(className, '', budget.accountId, '', '', disableChanges);

    // due amount
    const amount = formatOreToKroner(budget.amount);
    className = `amount${budget.budgetId}`;
    html += objBudget.inputTableColumn(className, '', amount, 10,disableChanges);

    // Year
    const year = Number(budget.year);
    className = `year${budget.budgetId}`;
    html += objBudget.showSelectedNumbers(className, 'width:175px;', 2020, 2030, year,disableChanges);

    // text
    const text = (budget.text === null) ? '' : budget.text;
    className = `text${budget.budgetId}`;
    html += objBudget.inputTableColumn(className, '', text, 45,disableChanges);

    html += "</tr>";

    // accumulate
    sumAmount += Number(budget.amount);
  });

  // Insert empty table row for insertion
  if (!disableChanges) {

    rowNumber++;
    html += insertEmptyTableRow(rowNumber);
  }

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  rowNumber++;
  html += objBudget.insertTableColumns('font-weight: 600;', rowNumber, '', 'Sum', sumAmount, '', '');

  // Show the rest of the menu
  rowNumber++;
  html += objBudget.showRestMenu(rowNumber);

  // The end of the table
  html += objBudget.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

function insertEmptyTableRow(rowNumber) {

  html += objAccount.insertTableColumns('', rowNumber, 'Nytt budsjett');

  // accounts
  let className = `accountId0`;
  html += objAccount.showSelectedAccounts(className, '', 0, 'Ingen konto er valgt', '', disableChanges);

  // budget amount
  const amount = "";
  html += objBudget.inputTableColumn('amount0', '', amount, 10);

  // Year
  const year = Number(document.querySelector('.filterYear').value);
  className = `year0`;
  html += objBudget.showSelectedNumbers(className, disableChanges, 'width:175px;', 2020, 2030, year);

  // text
  const text = "";
  className = `text0`;
  html += objBudget.inputTableColumn(className, '', text, 45);

  html += "</tr>";
  return html;
}