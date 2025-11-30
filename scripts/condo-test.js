// Budget maintenance

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');
const objBudget = new Budget('budget');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

objBudgets.menu();
objBudgets.markSelectedMenu('Budsjett');

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
    const year = today.getFullYear();
    const accountId = 999999999;
    await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

    // Find selected budget id
    const budgetId = objBudgets.getSelectedBudgetId('select-budget-budgetId');

    // Show leading text filter
    //showLeadingTextFilter();

    // Show leading text
    //showLeadingText(budgetId);

    // Show budget
    showBudget();

    // Show all values for budget
    //showValues(budgetId);

    // Events
    //events();
  }
}

// Make budget events
function events() {

  // Select filter
  // budget 
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budget-filterAccountId')) {

      // Reload budgets
      reloadBudgetAccountIdSync();

      // Reload budgets
      async function reloadBudgetAccountIdSync() {

        const year = document.querySelector('.select-budget-filterYear').value;
        const accountId = document.querySelector('.select-budget-filterAccountId').value;
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Show budget
        showBudget();

        // Show leading text
        let budgetId = objAccountBudgets.arrayBudgets.at(-1).budgetsId;
        showLeadingText(budgetId);

        // Show all values for budget
        budgetId = objBudgets.getSelectedBudgetId('select-budget-budgetId');
        showValues(budgetId);
      };
    };
  });

  // select year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budget-filterYear')) {

      // Reload budgets
      reloadBudgetYearSync();

      // Reload budgets
      async function reloadBudgetYearSync() {

        const year = document.querySelector('.select-budget-filterYear').value;
        const accountId = document.querySelector('.select-budget-filterAccountId').value;
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Show budget
        showBudget();

        // Show leading text
        let budgetId = objBudgets.arrayBudgets.at(-1).budgetId;
        showLeadingText(budgetId);

        // Show all values for budget
        showValues(budgetId);
      };
    };
  });

  // Select budget id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budget-budgetId')) {

      showValues(Number(event.target.value));
    };
  });

  // Select account number
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budget-accountId')) {

      accountId = Number(event.target.value);
    };
  });

  // Update budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-update')) {

      // Update budget and reload budgets
      updateBudgetSync();

      // Update budget and reload budgets
      async function updateBudgetSync() {

        // Load budgets

        let budgetId;
        if (document.querySelector('.select-budget-budgetId').value === '') {

          // Insert new row into budgets table
          budgetId = 0;
        } else {

          // Update existing row in budgets table
          budgetId = Number(document.querySelector('.select-budget-budgetId').value);
        }

        await updateBudget(budgetId);

        const condominiumId = Number(objUserPassword.condominiumId);
        const year = document.querySelector('.select-budget-filterYear').value;
        const accountId = Number(document.querySelector('.select-budget-filterAccountId').value);
        await objBudgets.loadBudgetsTable(condominiumId, year, accountId);

        // Select last budget if budgetId is 0
        if (budgetId === 0) budgetId = objBudgets.arrayBudgets.at(-1).budgetId;

        // Show budget
        showBudget();

        // Show values for selected budget Id
        showValues(budgetId);
      }
    };
  });

  // Insert budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-insert')) {

      resetValues();
    };
  });

  // Delete budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-delete')) {

      // Delete budget and reload budgets
      deleteBudgetSync();

      // Delete budget and reload budgets
      async function deleteBudgetSync() {

        await deleteBudget();

        // Load budgets
        const year = document.querySelector('.select-budget-filterYear').value;
        const accountId = Number(document.querySelector('.select-budget-filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Show leading text
        const budgetId = objBudgets.arrayBudgets.at(-1).budgetId;
        showLeadingText(budgetId);

        // Show all values for budget
        showValues(budgetId);

      };
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budget-cancel')) {

      cancelBudgetSynch();

      // Main entry point
      async function cancelBudgetSynch() {

        const year = document.querySelector('.select-budget-filterYear').value;
        const accountId = Number(document.querySelector('.select-budget-filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Find selected budget id
        const budgetId = objBudgets.getSelectedBudgetId('select-budget-budgetId');

        // Show leading text
        showLeadingText(budgetId);

        // Show all values for budget
        showValues(budgetId);
      }
    }
  });
};

// Show leading text for budget
function showLeadingText(budgetId) {

  const budgetYear = today.getFullYear();

  // Show budget
  objBudgets.showSelectedBudgets('budget-budgetId', budgetId)

  // Show all accounts
  const accountId = objAccounts.arrayAccounts.at(-1).accountId;
  objAccounts.showSelectedAccounts('budget-accountId', accountId, '', 'Ingen konti er valgt');

  // Show years
  objBudgets.selectNumber('budget-year', 2020, 2030, budgetYear, 'År');

  // amount
  objBudgets.showInput('budget-amount', '* Budsjett', 10, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {

    objBudgets.showButton('budget-update', 'Oppdater');

    // show new button
    objBudgets.showButton('budget-insert', 'Ny');

    // show delete button
    objBudgets.showButton('budget-delete', 'Slett');

    // cancel button
    objBudgets.showButton('budget-cancel', 'Avbryt');
  }
}

// Show values for budget
function showValues(budgetId) {

  // Check for valid budget Id
  if (budgetId >= 0) {

    // Find object number budget array
    const budgetRowNumberObj = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (budgetRowNumberObj !== -1) {

      // Select account
      const accountId = objBudgets.arrayBudgets[budgetRowNumberObj].accountId;
      objAccounts.selectAccountId(accountId, 'budget-accountId');

      // Show select year
      document.querySelector('.select-budget-year').value = objBudgets.arrayBudgets[budgetRowNumberObj].year;

      // Show amount
      document.querySelector('.input-budget-amount').value = formatOreToKroner(objBudgets.arrayBudgets[budgetRowNumberObj].amount);
    }
  }
}

// Reset values for budget
function resetValues() {

  // selected budget Id
  document.querySelector('.select-budget-budgetId').value = 0;

  // selected account Id
  document.querySelector('.select-budget-accountId').value = 0;

  // selected year
  document.querySelector('.select-budget-year').value = 0;

  // amount
  document.querySelector('.input-budget-amount').value = '';

  document.querySelector('.select-budget-budgetId').disabled = true;
  document.querySelector('.button-budget-delete').disabled = true;
  document.querySelector('.button-budget-insert').disabled = true;
}

// Check for valid budget values
function validateValues() {

  // Check account id
  const accountId = document.querySelector('.select-budget-accountId').value;
  const validAccountId = validateNumber(accountId, 1, 99999, "budget-accountId", "Konto");

  // Check year
  const year = document.querySelector('.select-budget-year').value;
  const validYear = validateNumber(year, 2020, 2099, "budget-year", "År");

  // Check amount
  const amount = document.querySelector('.input-budget-amount').value;
  const validAmount = objBudgets.validateNorAmount(amount, "budget-amount", "Budsjett");

  return (validAmount && validAccountId && validYear) ? true : false;
}

// Check for valid filter
function validateFilter() {

  // Check account
  const accountId = document.querySelector('.select-budget-filterAccountId').value;
  const validAccountId = validateNumber(accountId, 1, 999999999, 'budget-filterAccountId', 'Konto');

  const year = document.querySelector('.select-budget-filterYear').value;
  const validYear =
    validateNumber(year, 2020, 2030, 'budget-year', 'Budsjettår');

  return (validAccountId && validYear) ? true : false;
}

// Show filter for search
function showLeadingTextFilter() {

  // Show all accounts
  const accountId = (isClassDefined('select-budget-filterAccountId')) ? Number(document.querySelector('.select-budget-filterAccountId').value) : 0;
  objAccounts.showSelectedAccounts('budget-filterAccountId', accountId, 'Alle');

  // Show budget year
  if (!isClassDefined('select-budget-filterYear')) {
    const year = today.getFullYear();
    objBudgets.selectNumber('budget-filterYear', 2020, 2030, year, 'År');
  }
}

// Show budget
function showBudget() {

  let html = "";
  html += startHTMLTable("width:150px;");
  html += HTMLTableHeader('', 'Linje', 'Konto', 'Budsjett');

  let sumAmount = 0;
  let rowNumber = 0;

  objBudgets.arrayBudgets.forEach((budget) => {

    // row number
    rowNumber++;

    // check if the number is odd
    const colorClass = (rowNumber % 2 !== 0) ? "green" : "";

    // from date
    let fromDateHTML = '';
    if (rowNumber === 1) fromDateHTML = objAccounts.showInputHTML('input-fromDate', 'Fra dato', 10, 'mm.dd.åååå');

    // account name
    const accountName = objAccounts.getAccountName(budget.accountId);

    // budget
    const amount = formatOreToKroner(budget.amount);

    // Row
    //html += HTMLTableRow('<div><label class="one-line">Fra dato</label><input type="text" class="icon-input one-line" maxlength="10" placeholder="mm.dd.åååå"></div>', rowNumber, accountName, amount);
   html += HTMLTableRow(fromDateHTML, rowNumber, accountName, amount);

    // accumulate
    sumAmount += Number(budget.amount);
    //}
  });

  // Sum line
  // budget
  amount = formatOreToKroner(sumAmount);

  html += HTMLTableRow('','', '', amount);
        
  html += endHTMLTableBody();
  html += endHTMLTable();
  document.querySelector('.div-grid-budget').innerHTML = html;
}

// Update budget
async function updateBudget(budgetId) {

  // Check values
  if (validateValues()) {

    const budgetId = Number(document.querySelector('.select-budget-budgetId').value);

    const condominiumId = Number(objUserPassword.condominiumId);
    const user = objUserPassword.email;
    
    const accountId = Number(document.querySelector('.select-budget-accountId').value);
    const amount = formatKronerToOre(document.querySelector('.input-budget-amount').value);
    const year = document.querySelector('.select-budget-year').value;

    // Check if budget id exist
    const budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update budget
      await objBudgets.updateBudgetsTable(budgetId, user, accountId, amount, year);

    } else {

      // Insert budget row in budgets table
      await objBudgets.insertBudgetsTable(condominiumId, user, accountId, amount, year);
    }
  }
}