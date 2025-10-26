// Budget maintenance

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objBudget = new Budget('budget');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

//objBudget.menu();
//objBudget.markSelectedMenu('Budsjett');

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href = 'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
    const year = today.getFullYear();
    const accountId = 999999999;
    await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

    // Show header
    showHeader();

    // Show filter
    showFilter();

    // Show budget
    showBudget();

    /*
    // Start HTML table
    let html = startHTMLTable();

    // Main header
    html += showHTMLMainTableHeader('', '', 'Budsjett', '', '');

    // Header filter for search
    html += showHTMLFilterHeader('', 'Velg konto', 'Velg år', '');

    // Filter for search
    html += showHTMLFilterSearch();

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.show-budget').innerHTML = html;

    // Start HTML table
    html = startHTMLTable();

    // Header
    html += showHTMLMainTableHeader('Meny', 'Slett', 'Konto', 'Budsjett', 'År');

    // Show budgets
    html += showBudgets();

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.show-budgets').innerHTML = html;
    */

    // Make events
    createEvents();
  }
}

// Make budget events
function createEvents() {

  // Update account id
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('account'))) {

      const className = objBudget.getAccountClass(event.target);
      const budgetId = Number(className.substring(7));
      updateAccountId(budgetId, className);
    };
  });

  // Update amount
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('amount'))) {

      const className = objBudget.getAmountClass(event.target);
      const budgetId = Number(className.substring(6));
      updateAmountSync();

      // Update amount
      async function updateAmountSync() {

        updateAmount(budgetId, className);

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccount').value);
        await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Calculate sum budget
        calculateSum();
      }

    };
  });

  // Filter account id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterAccount')) {

      filterAccountSync();

      async function filterAccountSync() {

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccount').value);
        await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        showBudget();
      }
    };
  });

  // Delete budgets row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const className = objBudget.getDeleteClass(event.target);
      const budgetId = Number(className.substring(6));
      deleteBudgetSync(budgetId);

      async function deleteBudgetSync(budgetId) {
        deleteBudgetRow(budgetId, className);

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccount').value);
        await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        /*
        // Calculate sum budget
        calculateSum();
        */
        showBudget();
      }
    };
  });

  // Filter year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterYear')) {

      filterYearSync();

      async function filterYearSync() {

        const year = Number(document.querySelector('.filterYear').value);
        const accountId = Number(document.querySelector('.filterAccount').value);
        await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        /*
        // Start HTML table
        html = startHTMLTable();

        // Header
        html += showHTMLMainTableHeader('Meny', 'Slett', 'Konto', 'Budsjett');

        // Show budgets
        html += showBudgets();

        // The end of the table
        html += endHTMLTable();
        document.querySelector('.show-budgets').innerHTML = html;
        */
        showBudget();
      }
    };
  });
};

/*
// Show leading text for budget
function showLeadingText(budgetId) {

  // Budgets
  objBudget.showSelectedBudgets('budget-budgetId', budgetId, '', 'Ingen budsjett er valgt');

  // accounts
  objAccounts.showSelectedAccounts('budget-accountId', accountId, '', 'Ingen konti er valgt');

  // years
  const budgetYear = document.querySelector('.select-budget-filterYear').value;
  objBudget.selectNumber('budget-year', 2020, 2030, budgetYear, 'År');

  // amount
  objBudget.showInput('budget-amount', '* Budsjett', 10, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {

    objBudget.showButton('budget-update', 'Oppdater');

    // show new button
    objBudget.showButton('budget-insert', 'Ny');

    // show delete button
    objBudget.showButton('budget-delete', 'Slett');

    // cancel button
    objBudget.showButton('budget-cancel', 'Avbryt');
  }
}
*/

// Show values for budget
function showValues(budgetId) {

  // Check for valid budget Id
  if (budgetId >= 0) {

    // Find object number budget array
    const budgetRowNumberObj = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (budgetRowNumberObj !== -1) {

      // Select account
      const accountId = objBudget.arrayBudgets[budgetRowNumberObj].accountId;
      objAccounts.selectAccountId(accountId, 'budget-accountId');

      // Show select year
      document.querySelector('.select-budget-year').value = objBudget.arrayBudgets[budgetRowNumberObj].year;

      // Show amount
      document.querySelector('.input-budget-amount').value = formatOreToKroner(objBudget.arrayBudgets[budgetRowNumberObj].amount);
    }
  }
}

// Validate budgets columns
function validateColumns(accountId, amount, year) {

  // Check account id
  const validAccountId = validateNumberNew(accountId, 1, 99999);

  // Check year
  const validYear = validateNumberNew(year, 2020, 2099);

  // Check amount
  amount = formatOreToKroner(amount);
  const validAmount = objBudget.validateNorAmount(amount);

  return (validAmount && validAccountId && validYear) ? true : false;
}

// Delete budgets row
async function deleteBudgetRow(budgetId, className) {

  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  // Check if budget row exist
  budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    // delete budget row
    objBudget.deleteBudgetsTable(budgetId, user, lastUpdate);
  }

  await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, 999999999);
}

// Update accountId
async function updateAccountId(budgetId, className) {

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  let accountId = 0;
  let amount = 0;
  let year = 0;

  // Get current budgets values
  budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    accountId = objBudget.arrayBudgets[budgetsRowNumber].accountId;
    amount = objBudget.arrayBudgets[budgetsRowNumber].amount;
    year = objBudget.arrayBudgets[budgetsRowNumber].year;
  }

  // Account Id
  accountId = Number(document.querySelector(`.${className}`).value);

  // Validate budgets columns
  if (validateColumns(accountId, amount, year)) {

    // Check if budget id exist
    budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update budget
      await objBudget.updateBudgetsTable(budgetId, user, lastUpdate, accountId, amount, year);

    } else {

      // Insert budget row in budgets table
      await objBudget.insertBudgetsTable(condominiumId, user, lastUpdate, accountId, amount, year);
    }

    await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, 999999999);
  }
}

// Update amount
async function updateAmount(budgetId, className) {

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  let accountId = 0;
  let amount = 0;
  let year = 0;

  // Get current budgets values
  budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    accountId = objBudget.arrayBudgets[budgetsRowNumber].accountId;
    amount = objBudget.arrayBudgets[budgetsRowNumber].amount;
    year = objBudget.arrayBudgets[budgetsRowNumber].year;
  }

  // amount
  amount = formatKronerToOre(document.querySelector(`.${className}`).value);

  // Validate budgets columns
  if (validateColumns(accountId, amount, year)) {

    // Check if budget id exist
    budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update budget
      await objBudget.updateBudgetsTable(budgetId, user, lastUpdate, accountId, amount, year);

    } else {

      // Insert budget row in budgets table
      await objBudget.insertBudgetsTable(condominiumId, user, lastUpdate, accountId, amount, year);
    }

    await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, 999999999);
  }
}

// Update year
async function updateYear(budgetId, className) {

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  let accountId = 0;
  let amount = 0;
  let year = 0;

  // Get current budgets values
  budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    accountId = objBudget.arrayBudgets[budgetsRowNumber].accountId;
    amount = objBudget.arrayBudgets[budgetsRowNumber].amount;
    year = objBudget.arrayBudgets[budgetsRowNumber].year;
  }

  // year
  year = document.querySelector(`.${className}`).value;

  // Validate budgets columns
  if (validateColumns(accountId, amount, year)) {

    // Check if budget id exist
    budgetsRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update budget
      await objBudget.updateBudgetsTable(budgetId, user, lastUpdate, accountId, amount, year);

    } else {

      // Insert budget row in budgets table
      await objBudget.insertBudgetsTable(condominiumId, user, lastUpdate, accountId, amount, year);
    }

    await objBudget.loadBudgetsTable(objUserPassword.condominiumId, year, 999999999);
  }
}

// Delete budget row
async function deleteBudget() {

  // Check for budget Id
  const budgetId = Number(document.querySelector('.select-budget-budgetId').value);

  // Check if budget id exist
  const budgetRowNumber = objBudget.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetRowNumber !== -1) {

    // delete budget row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objBudget.deleteBudgetsTable(budgetId, user, lastUpdate);
  }
}

// Filter for search
function showHTMLFilterSearch() {

  let html =
    `
      <tr>
        <td></td>
    `;

  // Show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccount', 0, 'Alle', '');

  // Show budget year
  const year = today.getFullYear();
  html += objBudget.selectNumberNew('filterYear', 2020, 2030, year);

  html +=
    `
      </tr>
    `;

  return html;
}

// Show budgets
function showBudgets() {

  let html = "";

  let sumAmount = 0;
  let rowNumber = 0;

  objBudget.arrayBudgets.forEach((budget) => {

    rowNumber++;

    html +=
      `<tr 
        class="menu"
      >
      `;

    // Show menu
    html += objBudget.menuNew(rowNumber - 1);

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

    html += objBudget.showSelectedValuesNew(selectedChoice, 'Nei', 'Ja')

    // accounts
    let className = `account${budget.budgetId}`;
    html += objAccounts.showSelectedAccountsNew(className, budget.accountId, '', 'Ingen er valgt');

    // budget amount
    const amount = formatOreToKroner(budget.amount);
    className = `amount${budget.budgetId}`;
    html += objBudget.showInputHTMLNew(className, amount, 10);

    // Show budget year
    //className = `year${budget.budgetId}`;
    //html += objBudget.selectNumberNew(className, 2020, 2030, budget.year);

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

  return html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html =
    `
      <tr 
        class="menu"
      >
    `;

  // Show menu
  html += objBudget.menuNew(rowNumber - 1);

  /*
  let selectedChoice = "Nei";
  html += objBudget.showSelectedValuesNew(selectedChoice, 'Nei', 'Ja')
  */
  html += "<td></td>";

  // accounts
  let className = `account${0}`;
  html += objAccounts.showSelectedAccountsNew(className, 0, '', 'Ingen er valgt');

  // budget amount
  const amount = "";
  html += objBudget.showInputHTMLNew('amount0', amount, 10);

  // Show budget year
  //const year = Number(document.querySelector('.filterYear').value);
  //html += objBudget.selectNumberNew('year0', 2020, 2030, year);

  html = "</tr>";
  return html;
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
  let html = startHTMLTable();

  // Main header
  html += showHTMLMainTableHeader('', '', 'Budsjett', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
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
  document.querySelector('.filter').innerHTML = html;
}

// Show budgets table
function showBudget() {

  // Start HTML table
  html = startHTMLTable();

  // Header
  html += showHTMLMainTableHeader('Meny', 'Slett', 'Konto', 'Budsjett');

  // Show budgets
  html += showBudgets();

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.budget').innerHTML = html;
}

// Show the rest of the menu
function showRestMenu(rowNumber) {

  let html = "";
  for (; objBudget.arrayMenu.length > rowNumber; rowNumber++) {

    html +=
      `
        <tr 
          class="menu"
        >
      `;
    // Show menu
    html += objBudget.menuNew(rowNumber - 1);
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
  html += objBudget.menuNew(rowNumber - 1);
  html += "<td></td>";
  html += "<td class='bold'>Sum</td>";
  html += `<td class="center bold">${amount}</td>`;
  html +=
    `
      </tr>
    `;

  return html;
}