// Budget maintenance

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objBudgets = new Budget('budget');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

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
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId,fixedCost);

    const condominiumId = objUserPassword.condominiumId;
    const year = today.getFullYear();
    const accountId = 999999999;
    await objBudgets.loadBudgetsTable(condominiumId, year, accountId);

    // Show filter
    showFilter();

    // Show header
    showHeader();

    // Show result of filter
    showResult();

    // Events
    events();
  }
}

// Make budget events
function events() {

  // update a accounts row
  document.addEventListener('change', (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('account'))
      || [...event.target.classList].some(cls => cls.startsWith('amount'))) {

      const arrayPrefixes = ['account', 'amount'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objBudgets.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let budgetId = 0;
      let prefix = "";
      if (className) {
        prefix = prefixes.find(p => className.startsWith(p));
        budgetId = Number(className.slice(prefix.length));
      }

      updateAccountSync();

      // Update amount
      async function updateAccountSync() {

        await updateBudgetsRow(budgetId);
      }
    };
  });

  /*
  // Update amount
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('amount'))) {

      const className = objBudgets.getAmountClass(event.target);
      const budgetId = className.substring(6);
      updateAmountSync();

      // Update amount
      async function updateAmountSync() {

        updateBudgetsRow('amount', className, budgetId);
      }
    };
  });
  */

  // Delete budgets row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const className = objBudgets.getDeleteClass(event.target);
      const budgetId = Number(className.substring(6));
      deleteBudgetSync(budgetId);

      async function deleteBudgetSync(budgetId) {

        deleteBudgetRow(budgetId, className);

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        showResult();
      }
    };
  });

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterYear')
      || event.target.classList.contains('filterAccountId')) {

      filterSync();

      async function filterSync() {

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        showResult();
      }
    };
  });
};

// Delete budgets row
async function deleteBudgetRow(budgetId, className) {

  const user = objUserPassword.email;
  

  // Check if budget row exist
  budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    // delete budget row
    objBudgets.deleteBudgetsTable(budgetId, user);
  }

  await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, 999999999);
}

// Update a budgets row
async function updateBudgetsRow(budgetId) {

  budgetId = Number(budgetId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;
  

  // Get budgets row values

  // accountId
  className = `.account${budgetId}`;
  let accountId = Number(document.querySelector(className).value);

  // amount
  className = `.amount${budgetId}`;
  let amount = document.querySelector(className).value;
  amount = Number(formatKronerToOre(amount));

  // year
  className = `.filterYear`;
  let year = Number(document.querySelector(`${className}`).value);

  // Validate budgets columns
  if (budgetId, accountId, amount, year) {

    // Check if the budgets row exist
    budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budgets => budgets.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update the budgets row
      await objBudgets.updateBudgetsTable(budgetId, user, accountId, amount, year);

    } else {

      // Insert the budget row in budgets table
      await objBudgets.insertBudgetsTable(condominiumId, user, accountId, amount, year);
    }

    accountId = Number(document.querySelector('.filterAccountId').value);
    year = Number(document.querySelector('.filterYear').value);
    await objBudgets.loadBudgetsTable(condominiumId, year, accountId);
    showResult();
  }
}

// Filter for search
function showHTMLFilterSearch() {

  let html = "<tr><td></td>";

  // Show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, 'Alle', '');

  // Show budget year
  const year = today.getFullYear();
  html += objBudgets.selectNumberNew('filterYear', '', 2020, 2030, year);

  html += "</tr>";

  return html;
}

// Show budgets
function showResult() {

  // Start HTML table
  html = startHTMLTable();

  let sumAmount = 0;
  let rowNumber = 0;

  // Header
  html += showHTMLMainTableHeader('Meny', 'Slett', 'Konto', 'Budsjett');

  objBudgets.arrayBudgets.forEach((budget) => {

    rowNumber++;

    html += "<tr>";

    // Show menu
    html += objBudgets.menuNew(rowNumber);

    let selectedChoice = "Ugyldig verdi";
    switch (budget.deleted) {
      case 'Y': {

        selectedChoice = "Ja";
        break;
      }
      case 'N': {

        selectedChoice = "Nei";
        break;
      }
      default: {

        selectedChoice = "Ugyldig verdi";
        break
      }
    }

    let className = `deleted${budget.budgetId}`;
    html += objBudgets.showSelectedValuesNew(className, '', selectedChoice, '', 'Nei', 'Ja')

    // accounts
    className = `account${budget.budgetId}`;
    html += objAccounts.showSelectedAccountsNew(className, '', budget.accountId, '', 'Ingen er valgt');

    // budget amount
    const amount = formatOreToKroner(budget.amount);
    className = `amount${budget.budgetId}`;
    html += objBudgets.showInputHTMLNew(className, amount, 10);

    html +=
      `
        </tr>
      `;

    // accumulate
    sumAmount += Number(budget.amount);
  });

  // Make one last table row for insertion in table 
  rowNumber++;

  // Insert empty table row for insertion
  html += insertEmptyTableRow(rowNumber);

  // Sum row
  rowNumber++;

  // budget
  sumAmount = formatOreToKroner(sumAmount);

  // Show table sum row
  rowNumber++;
  html += showTableSumRow(rowNumber, sumAmount);

  // Show the rest of the menu
  rowNumber++;
  html += showRestMenu(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.table-result').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "<tr>";

  // Show menu
  html += objBudgets.menuNew(rowNumber);

  html += "<td></td>";

  // accounts
  let className = `account${0}`;
  html += objAccounts.showSelectedAccountsNew(className, '', 0, '', 'Ingen er valgt');

  // budget amount
  const amount = "";
  html += objBudgets.showInputHTMLNew('amount0', amount, 10);

  html += "</tr>";
  return html;
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
  let html = startHTMLTable();

  // Main header
  html += showHTMLMainTableHeader('', '', 'Budsjett', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.table-header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable();

  // Header filter for search
  html += showHTMLFilterHeader('', 'Velg konto', 'Velg år', '');

  // Filter for search
  html += showHTMLFilterSearch();

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.table-filter').innerHTML = html;
}

// Show the rest of the menu
function showRestMenu(rowNumber) {

  let html = "";
  for (; objBudgets.arrayMenu.length >= rowNumber; rowNumber++) {

    html +=
      `
        <tr 
          class="menu"
        >
      `;
    // Show menu
    html += objBudgets.menuNew(rowNumber);
    html +=
      `
        </tr>
      `;
  }

  return html;
}

// Show table sum row
function showTableSumRow(rowNumber, amount) {

  let html =
    `
      <tr 
        class="menu"
      >
    `;
  // Show menu
  html += objBudgets.menuNew(rowNumber);
  html += "<td></td>";
  html += "<td class='bold'>Sum</td>";
  html += `<td class="center bold">${amount}</td>`;
  html +=
    `
      </tr>
    `;

  return html;
}