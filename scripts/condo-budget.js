// Budget maintenance

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objBudgets = new Budget('budget');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    const resident = 'Y';
    await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

    // Show header
    showHeader();

    // Show filter
    showFilter()

    const condominiumId = Number(objUserPassword.condominiumId);
    const accountId = Number(document.querySelector('.filterAccountId').value);
    const year = Number(document.querySelector('.filterYear').value);
    await objBudgets.loadBudgetsTable(condominiumId, year, accountId);

    // Show result of filter
    let menuNumber = 0;
    menuNumber = showResult(menuNumber);

    // Events
    events();
  }
}

// Make budget events
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterYear')
      || event.target.classList.contains('filterAccountId')) {

      filterSync();

      async function filterSync() {

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });

  // update a accounts row
  document.addEventListener('change', (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('accountId'))
      || [...event.target.classList].some(cls => cls.startsWith('amount'))
      || [...event.target.classList].some(cls => cls.startsWith('text'))
      || [...event.target.classList].some(cls => cls.startsWith('year'))) {

      const arrayPrefixes = ['accountId', 'amount', 'year', 'text'];

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

      updateAccountSync();

      // Update amount
      async function updateAccountSync() {

        await updateBudgetsRow(budgetId);
      }
    };
  });

  // Delete budgets row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objBudgets.getDeleteClass(event.target);
      const budgetId = Number(className.substring(6));
      deleteBudgetSync(budgetId);

      async function deleteBudgetSync(budgetId) {

        deleteBudgetRow(budgetId, className);

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });
}

// Delete budgets row
async function deleteBudgetRow(budgetId, className) {

  const user = objUserPassword.email;

  // Check if budget row exist
  budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    // delete budget row
    objBudgets.deleteBudgetsTable(budgetId, user);
  }

  const year = Number(document.querySelector('.filterYear').value);
  await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, 999999999);
}

// Update a budgets row
async function updateBudgetsRow(budgetId) {

  budgetId = Number(budgetId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;

  // Get budgets row values

  // accountId
  className = `.accountId${budgetId}`;
  let accountId = Number(document.querySelector(className).value);
  const validAccountId = validateNumberNew(accountId, 1, 999999999);

  // amount
  className = `.amount${budgetId}`;
  let amount = document.querySelector(className).value;
  amount = Number(formatKronerToOre(amount));
  let validAmount = validateNumberNew(amount, -999999999, 999999999);
  if (amount === 0) validAmount = false;

  // year
  className = `.year${budgetId}`;
  let year = Number(document.querySelector(`${className}`).value);
  const validYear = objBudgets.validateIntervalNew(year, 2020, 2029);

  // text
  className = `.text${budgetId}`;
  let text = document.querySelector(`${className}`).value;
  let validText = objBudgets.validateText(text, 0, 45);

  // Validate budgets columns
  if (validAccountId && validAmount && validAmount && validYear && validText) {

    // Check if the budgets row exist
    budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budgets => budgets.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update the budgets row
      await objBudgets.updateBudgetsTable(budgetId, user, accountId, amount, year, text);

    } else {

      // Insert the budget row in budgets table
      await objBudgets.insertBudgetsTable(condominiumId, user, accountId, amount, year, text);
    }

    accountId = Number(document.querySelector('.filterAccountId').value);
    year = Number(document.querySelector('.filterYear').value);
    await objBudgets.loadBudgetsTable(condominiumId, year, accountId);
    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Calculate sum budget
function calculateSum() {

  let sumAmount = 0;

  objBudgets.arrayBudgets.forEach((budget) => {

    // accumulate (øre)
    sumAmount += Number(budget.amount);
  });

  sumAmount = formatOreToKroner(String(sumAmount));
  document.querySelector('.sum2').value = sumAmount;
};

// Show header
function showHeader() {

  // Start table
  let html = objBudgets.startTableNew('width:1000px;');

  // show main header
  html += objBudgets.showTableHeaderNew('width:200px;', 'Budsjett');

  // The end of the table
  html += objBudgets.endTableNew();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = objBudgets.startTableNew('width:1000px;');

  // Header filter
  html += objBudgets.showTableHeaderNew('', '', '', 'Konto', 'År', '', '', '');

  // start table body
  html += objBudgets.startTableBodyNew();

  // insert table columns in start of a row
  html += objBudgets.insertTableColumnsNew('', 0, '', '');

  // Selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, '', 'Alle');

  // Selected year
  const year = String(today.getFullYear());
  html += objBudgets.showSelectedNumbersNew('filterYear', "width:100px;", 2020, 2030, year);

  html += "</tr>";

  // insert table columns in start of a row
  html += objBudgets.insertTableColumnsNew('', 0, '');

  // end table body
  html += objBudgets.endTableBodyNew();

  // The end of the table
  html += objBudgets.endTableNew();
  document.querySelector('.filter').innerHTML = html;
}

// Show bankaccounttransactions
function showResult(rowNumber) {

  // start table
  let html = objBudgets.startTableNew('width:1000px;');

  // table header
  html += objBudgets.showTableHeaderNew("width:1000px;", '', 'Slett', 'Konto', 'Budsjett', 'År', 'Tekst');

  let sumAmount = 0;

  objBudgets.arrayBudgets.forEach((budget) => {

    //html += '<tr>';

    // Show menu
    //html += objBudgets.showMenu(rowNumber);
    rowNumber++;
    html += objBudgets.insertTableColumnsNew('', rowNumber, '');

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (budget.deleted === 'Y') selectedChoice = "Ja";
    if (budget.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${budget.budgetId}`;
    html += objBudgets.showSelectedValuesNew(className, 'width:75px;', selectedChoice, 'Nei', 'Ja');

    // accountId
    className = `accountId${budget.budgetId}`;
    html += objAccounts.showSelectedAccountsNew(className, '', budget.accountId, '', '');

    // due amount
    const amount = formatOreToKroner(budget.amount);
    className = `amount${budget.budgetId}`;
    html += objBudgets.inputTableColumn(className, amount, 10);

    // Year
    const year = Number(budget.year);
    className = `year${budget.budgetId}`;
    html += objBudgets.showSelectedNumbersNew(className, 'width:100px;', 2020, 2030, year);

    // text
    const text = (budget.text === null) ? '' : budget.text;
    className = `text${budget.budgetId}`;
    html += objBudgets.inputTableColumn(className, text, 45);

    html += "</tr>";

    // accumulate
    sumAmount += Number(budget.amount);
  });

  // Make one last table row for insertion in table 
  //html += "<tr>";

  // Show menu
  rowNumber++;
  //html += objBudgets.showMenu(rowNumber);
  // insert table columns in start of a row
  html += objAccounts.insertTableColumnsNew('', rowNumber, '', 'Nytt budsjett');
  //html += "<td class='bold'>Nytt budsjett</td>";

  // accounts
  let className = `accountId0`;
  html += objAccounts.showSelectedAccountsNew(className, '', 0, 'Ingen konto er valgt', '');

  // budget amount
  const amount = "";
  html += objBudgets.inputTableColumn('amount0', amount, 10);

  // Year
  const year = Number(document.querySelector('.filterYear').value);
  className = `year0`;
  html += objBudgets.showSelectedNumbersNew(className, 'width:100px;', 2020, 2030, year);

  // text
  const text = "";
  className = `text0`;
  html += objBudgets.inputTableColumn(className, text, 45);

  html += "</tr>";

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  rowNumber++;
  html += objBudgets.insertTableColumnsNew('font-weight: 600;', rowNumber, '', '', 'Sum', sumAmount);

  // Show the rest of the menu
  rowNumber++;
  html += objBudgets.showRestMenu(rowNumber);

  // The end of the table
  html += objBudgets.endTableNew();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}