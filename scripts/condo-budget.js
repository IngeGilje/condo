// Budget maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');
const objBudget = new Budget('budget');

const enableChanges = (objBudget.securityLevel > 5);

const columnWidths = [ 100, 175, 175, 175, 100];

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objBudget.condominiumId === 0) || (objBudget.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objBudget.showHorizontalMenu(objBudget.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

     // Show transaction menu
      html = objBudget.showHorizontalMenu(objBudget.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objBudget.condominiumId, resident, objBudget.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objBudget.condominiumId, fixedCost);

      // Show header
      showHeader();

      // Show filter
      showFilter();

      const accountId = Number(document.querySelector('.filterAccountId').value);
      const year = Number(document.querySelector('.filterYear').value);
      await objBudget.loadBudgetsTable(objBudget.condominiumId, year, accountId);

      // Show result of filter
      showBudgets();

      // Events
      events();
    }
  } else {

    showMessageNew( 'Server er ikke startet.');
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
      await objBudget.loadBudgetsTable(objBudget.condominiumId, year, accountId);

      showBudgets(3);
    };
  });

  // update a accounts row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['accountId', 'amount', 'text'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))) {

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
  document.addEventListener('click', async (event) => {

    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

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

      deleteBudgetRow(budgetId, className);

      const year = Number(document.querySelector('.filterYear').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      await objBudget.loadBudgetsTable(objBudget.condominiumId, year, accountId);

      showBudgets(3);
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
    await objBudget.deleteBudgetsTable(budgetId, objBudget.user);
  }

  const year = Number(document.querySelector('.filterYear').value);
  await objBudget.loadBudgetsTable(objBudget.condominiumId, year, objBudget.nineNine);
}

// Update a budgets row
async function updateBudgetsRow(budgetId) {

  budgetId = Number(budgetId);

  // Get budgets row values

  // accountId
  className = `.accountId${budgetId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${budgetId}`;
  const validAccountId = objBudget.validateInterval(className, columnWidths, '', 'Ugyldig konto', true, accountId, 1, objBudget.nineNine);

  // amount
  className = `.amount${budgetId}`;
  let amount = document.querySelector(className).value;
  amount = Number(formatKronerToOre(amount));
  className = `amount${budgetId}`;
  let validAmount = objBudget.validateInterval(className, columnWidths, '', 'Ugyldig budsjett', true, amount, objBudget.minusNineNine, objBudget.nineNine);

  // year
  className = `.year${budgetId}`;
  let year = Number(document.querySelector(`${className}`).value);
  className = `year${budgetId}`;
  const validYear = objBudget.validateInterval(className, columnWidths, '', 'Ugyldig budsjettår', true, year, 2020, 2029);

  // text
  className = `.text${budgetId}`;
  let text = document.querySelector(className).value;
  className = `text${budgetId}`;
  let validText = objBudget.validateText(className, columnWidths, '', 'Ugyldig tekst', true, text, 0, 45);

  // Validate budgets columns
  if (validAccountId && validAmount && validAmount && validYear && validText) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the budgets row exist
    budgetsRowNumber = objBudget.arrayBudgets.findIndex(budgets => budgets.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update the budgets row
      await objBudget.updateBudgetsTable(budgetId, objBudget.user, accountId, amount, year, text);

    } else {

      // Insert the budget row in budgets table
      await objBudget.insertBudgetsTable(objBudget.condominiumId, objBudget.user, accountId, amount, year, text);
    }

    accountId = Number(document.querySelector('.filterAccountId').value);
    year = Number(document.querySelector('.filterYear').value);
    await objBudget.loadBudgetsTable(objBudget.condominiumId, year, accountId);
    showBudgets(3);
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

// Show header
function showHeader() {

  // Start table
  let html = objBudget.initializeTable(columnWidths);

  // start table body
  html += objBudget.startTableBody();

  // show main header
  html += objBudget.showTableHeaderLogOut('', '',  'Budsjett', '');
  html += "</tr>";

  // end table body
  html += objBudget.endTableBody();

  // The end of the table
  html += objBudget.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter() {

    // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show accounts
  html += objAccount.showSelectedAccountsNew('Konto', 'filterAccountId', '', objBudget.nineNine, '', 'Vis alle', true);

  // Show years
  const year = today.getFullYear();
  html += showSelectedNumbersNew('År', 'filterYear',    '', 2020, 2030, year, true);
 
  html += "</div>";

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show transactions
function showBudgets() {

  // start table
  let html = objBudget.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objBudget.showTableHeaderMenu('#e0f0e0', 'center', 'År', 'Konto', 'Budsjett', 'Tekst', '');

  let sumAmount = 0;

  objBudget.arrayBudgets.forEach((budget) => {

    // Show menu
    html += objBudget.insertTableRow('');

    // Year (<td></td>)
    const year = Number(budget.year);
    let className = `year${budget.budgetId}`;
    html += objBudget.showSelectedNumbers(className, '', 2020, 2030, year, enableChanges);

    // accountId
    className = `accountId${budget.budgetId}`;
    html += objAccount.showSelectedAccounts(className, '', budget.accountId, '', '', enableChanges);

    // due amount
    const amount = formatOreToKroner(budget.amount);
    className = `amount${budget.budgetId}`;
    html += objBudget.editTableCell(className, amount, 11, enableChanges);

    // text
    const text = (budget.text === null) ? '' : budget.text;
    className = `text${budget.budgetId}`;
    html += objBudget.editTableCell(className, text, 45, enableChanges);

    // Delete
    className = `delete${budget.budgetId}`;
    html += objBudget.showButton(className, 'Slett');
    html += "</tr>";

    // accumulate
    sumAmount += Number(budget.amount);
  });

  // Insert empty table row for insertion
  if (enableChanges) {

    html += insertEmptyTableRow();
  }

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);

  html += objBudget.insertTableRow('font-weight: 600;', '', 'Sum', sumAmount, '', '');

  // The end of the table
  html += objBudget.endTable();
  document.querySelector('.result').innerHTML = html;
}

function insertEmptyTableRow() {

  // Show menu
  html = objBudget.insertTableRow('');

  // Year (<td></td>)
  const year = Number(document.querySelector('.filterYear').value);
  html += objBudget.showSelectedNumbers('year0', '', 2020, 2030, year, enableChanges);

  // accounts
  html += objAccount.showSelectedAccounts('accountId0', '', 0, 'Velg konto', '', enableChanges);

  const amount = "";
  html += objBudget.editTableCell('amount0', amount, 11, enableChanges);

  // text
  const text = "";
  html += objBudget.editTableCell('text0', text, 45, enableChanges);

  html += "<td>Nytt budsjett</td></tr>";
  return html;
}