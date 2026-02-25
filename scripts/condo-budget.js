// Budget maintenance

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objBudgets = new Budget('budget');

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Validate LogIn
const condominiumId = Number(sessionStorage.getItem("condominiumId"));
const email = sessionStorage.getItem("email");
if ((condominiumId === 0 || email === null)) {

  // LogIn is not valid
  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      const resident = 'Y';
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

      // Show header
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const condominiumId = Number(objUserPassword.condominiumId);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      const year = Number(document.querySelector('.filterYear').value);
      await objBudgets.loadBudgetsTable(condominiumId, year, accountId);

      // Show result of filter
      let menuNumber = 0;
      menuNumber = showResult(menuNumber);

      // Events
      events();
    } else {

      objBudgets.showMessage(objBudgets, 'Server condo-server.js har ikke startet.');
    }
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

  const user = objUserInfo.email;

  // Check if budget row exist
  budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    // delete budget row
    objBudgets.deleteBudgetsTable(budgetId, user);
  }

  const year = Number(document.querySelector('.filterYear').value);
  await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, objBudgets.nineNine);
}

// Update a budgets row
async function updateBudgetsRow(budgetId) {

  budgetId = Number(budgetId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserInfo.email;

  // Get budgets row values

  // accountId
  className = `.accountId${budgetId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${budgetId}`;
  const validAccountId = objBudgets.validateNumber(className, accountId, 1, objBudgets.nineNine);

  // amount
  className = `.amount${budgetId}`;
  let amount = document.querySelector(className).value;
  amount = Number(formatKronerToOre(amount));
    className = `amount${budgetId}`;
  let validAmount = objBudgets.validateNumber(className, amount, objBudgets.minusNineNine, objBudgets.nineNine);
  if (amount === 0) validAmount = false;

  // year
  className = `.year${budgetId}`;
  let year = Number(document.querySelector(`${className}`).value);
  className = `year${budgetId}`;
  const validYear = objBudgets.validateNumber(className, year, 2020, 2029);

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
  let html = objBudgets.startTable('width:1000px;');

  // show main header
  html += objBudgets.showTableHeader('width:200px;', 'Budsjett');

  // The end of the table
  html += objBudgets.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objBudgets.startTable('width:1000px;');

  // Header filter
  rowNumber++;
  html += objBudgets.showTableHeaderMenu('width:150px;', rowNumber, '', '', 'Konto', 'År', '', '', '');

  // start table body
  html += objBudgets.startTableBody();

  // insert table columns in start of a row
  html += objBudgets.insertTableColumns('', 0, '', '');

  // Selected accounts
  html += objAccounts.showSelectedAccounts('filterAccountId', '', 0, '', 'Alle');

  // Selected year
  const year = String(today.getFullYear());
  html += objBudgets.showSelectedNumbers('filterYear', "width:100px;", 2020, 2030, year);

  html += "</tr>";

  // insert table columns in start of a row
  html += objBudgets.insertTableColumns('', 0, '');

  // end table body
  html += objBudgets.endTableBody();

  // The end of the table
  html += objBudgets.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// Show bankaccounttransactions
function showResult(rowNumber) {

  // start table
  let html = objBudgets.startTable('width:1000px;');

  // table header
  rowNumber++;
  html += objBudgets.showTableHeaderMenu("width:1000px;", rowNumber, '', '', 'Slett', 'Konto', 'Budsjett', 'År', 'Tekst');

  let sumAmount = 0;

  objBudgets.arrayBudgets.forEach((budget) => {

    // Show menu
    rowNumber++;
    html += objBudgets.insertTableColumns('', rowNumber, '');

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (budget.deleted === 'Y') selectedChoice = "Ja";
    if (budget.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${budget.budgetId}`;
    html += objBudgets.showSelectedValues(className, 'width:75px;', selectedChoice, 'Nei', 'Ja');

    // accountId
    className = `accountId${budget.budgetId}`;
    html += objAccounts.showSelectedAccounts(className, '', budget.accountId, '', '');

    // due amount
    const amount = formatOreToKroner(budget.amount);
    className = `amount${budget.budgetId}`;
    html += objBudgets.inputTableColumn(className, amount, 10);

    // Year
    const year = Number(budget.year);
    className = `year${budget.budgetId}`;
    html += objBudgets.showSelectedNumbers(className, 'width:100px;', 2020, 2030, year);

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
  //html += objBudgets.verticalMenu(rowNumber);
  // insert table columns in start of a row
  html += objAccounts.insertTableColumns('', rowNumber, '', 'Nytt budsjett');
  //html += "<td class='bold'>Nytt budsjett</td>";

  // accounts
  let className = `accountId0`;
  html += objAccounts.showSelectedAccounts(className, '', 0, 'Ingen konto er valgt', '');

  // budget amount
  const amount = "";
  html += objBudgets.inputTableColumn('amount0', amount, 10);

  // Year
  const year = Number(document.querySelector('.filterYear').value);
  className = `year0`;
  html += objBudgets.showSelectedNumbers(className, 'width:100px;', 2020, 2030, year);

  // text
  const text = "";
  className = `text0`;
  html += objBudgets.inputTableColumn(className, text, 45);

  html += "</tr>";

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  rowNumber++;
  html += objBudgets.insertTableColumns('font-weight: 600;', rowNumber, '', '', 'Sum', sumAmount);

  // Show the rest of the menu
  rowNumber++;
  html += objBudgets.showRestMenu(rowNumber);

  // The end of the table
  html += objBudgets.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}