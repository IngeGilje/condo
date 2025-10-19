// Budget maintenance

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');
const objBudgets = new Budgets('budgets');

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

    await objUsers.loadUsersTable(objUserPassword.condominiumId);
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
    const year = today.getFullYear();
    const accountId = 999999999;
    await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

    // Find selected budget id
    const budgetId = objBudgets.getSelectedBudgetId('select-budgets-budgetId');


    // Show leading text filter
    showLeadingTextFilter();

    // Show budget
    showBudgets();

    // Show leading text
    showLeadingText(budgetId);

    // Show all values for budget
    showValues(budgetId);

    // Make events
    createEvents();
  }
}

// Make budget events
function createEvents() {

  // Select filter
  // budget 
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budgets-filterAccountId')) {

      // Reload budgets
      reloadBudgetAccountIdSync();

      // Reload budgets
      async function reloadBudgetAccountIdSync() {

        const year = document.querySelector('.select-budgets-filterYear').value;
        const accountId = document.querySelector('.select-budgets-filterAccountId').value;
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Show budget
        showBudgets();

        // Show leading text
        //let budgetId = objAccountBudgets.arrayBudgets.at(-1).budgetsId;
        let budgetId = (objBudgets.arrayBudgets.length > 0) ? objBudgets.arrayBudgets.at(-1).budgetId : 0;
        showLeadingText(budgetId);

        // Show all values for budget
        budgetId = objBudgets.getSelectedBudgetId('select-budgets-budgetId');
        showValues(budgetId);
      };
    };
  });

  // select year
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budgets-filterYear')) {

      // Reload budgets
      reloadBudgetYearSync();

      // Reload budgets
      async function reloadBudgetYearSync() {

        const year = document.querySelector('.select-budgets-filterYear').value;
        const accountId = document.querySelector('.select-budgets-filterAccountId').value;
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Show budgets
        showBudgets();

        // Show leading text
        //let budgetId = objBudgets.arrayBudgets.at(-1).budgetId;
        let budgetId = (objBudgets.arrayBudgets.length > 0) ? objBudgets.arrayBudgets.at(-1).budgetId : 0;
        showLeadingText(budgetId);

        // Show all values for budget
        showValues(budgetId);
      };
    };
  });

  // Select budget id
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budgets-budgetId')) {

      showValues(Number(event.target.value));
    };
  });

  // Select account number
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('select-budgets-accountId')) {

      accountId = Number(event.target.value);
    };
  });

  // Update budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budgets-update')) {

      // Update budgets and reload budgets
      updateBudgetSync();

      // Update budget and reload budgets
      async function updateBudgetSync() {

        if (validateValues()) {

          await updateBudget();

          condominiumId = objUserPassword.condominiumId;

          // Account
          const accountId = Number(document.querySelector('.select-budgets-filterAccountId').value);

          // Year
          document.querySelector('.select-budgets-filterYear').value = document.querySelector('.select-budgets-year').value;
          const year = Number(document.querySelector('.select-budgets-filterYear').value);

          await objBudgets.loadBudgetsTable(condominiumId, year, accountId);

          // Select last budgets if budgetId is 0
          let budgetId = (objBudgets.arrayBudgets.length > 0) ? objBudgets.arrayBudgets.at(-1).budgetId : 0;

          // Show dues 
          showBudgets();

          // Show leading text maintenance
          showLeadingText(budgetId);

          // Show due Id
          showValues(budgetId);
        }
      }
    }
  });

  // Insert budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budgets-insert')) {

      resetValues();
    };
  });

  // Delete budget
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budgets-delete')) {

      // Delete budget and reload budgets
      deleteBudgetSync();

      // Delete budget and reload budgets
      async function deleteBudgetSync() {

        await deleteBudget();

        // Load budgets
        const year = document.querySelector('.select-budgets-filterYear').value;
        const accountId = Number(document.querySelector('.select-budgets-filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Show leading text
        //const budgetId = objBudgets.arrayBudgets.at(-1).budgetId;
        const budgetId = (objBudgets.arrayBudgets.length > 0) ? objBudgets.arrayBudgets.at(-1).budgetId : 0;

        // Show leading text
        showLeadingText(budgetId);

        // Show budgets
        showBudgets();

        // Show all values for budget
        showValues(budgetId);
      };
    };
  });

  // Cancel
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('button-budgets-cancel')) {

      cancelBudgetSynch();

      // Main entry point
      async function cancelBudgetSynch() {

        const year = document.querySelector('.select-budgets-filterYear').value;
        const accountId = Number(document.querySelector('.select-budgets-filterAccountId').value);
        await objBudgets.loadBudgetsTable(objUserPassword.condominiumId, year, accountId);

        // Find selected budget id
        const budgetId = objBudgets.getSelectedBudgetId('select-budgets-budgetId');

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

  // Budgets
  objBudgets.showSelectedBudgets('budgets-budgetId', budgetId, '', 'Ingen budsjett er valgt');

  // accounts
  objAccounts.showSelectedAccounts('budgets-accountId', accountId, '', 'Ingen konti er valgt');

  // years
  const budgetYear = document.querySelector('.select-budgets-filterYear').value;
  objBudgets.selectNumber('budgets-year', 2020, 2030, budgetYear, 'År');

  // amount
  objBudgets.showInput('budgets-amount', '* Budsjett', 10, '');

  // show update button
  if (Number(objUserPassword.securityLevel) >= 9) {

    objBudgets.showButton('budgets-update', 'Oppdater');

    // show new button
    objBudgets.showButton('budgets-insert', 'Ny');

    // show delete button
    objBudgets.showButton('budgets-delete', 'Slett');

    // cancel button
    objBudgets.showButton('budgets-cancel', 'Avbryt');
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
      objAccounts.selectAccountId(accountId, 'budgets-accountId');

      // Show select year
      document.querySelector('.select-budgets-year').value = objBudgets.arrayBudgets[budgetRowNumberObj].year;

      // Show amount
      document.querySelector('.input-budgets-amount').value = formatOreToKroner(objBudgets.arrayBudgets[budgetRowNumberObj].amount);
    }
  }
}

// Reset values for budget
function resetValues() {

  // selected budget Id
  document.querySelector('.select-budgets-budgetId').value = 0;

  // selected account Id
  //document.querySelector('.select-budgets-accountId').value = 0;
  document.querySelector('.select-budgets-accountId').value =
    (Number(document.querySelector('.select-budgets-filterAccountId').value) === 999999999)
      ? 0 : Number(document.querySelector('.select-budgets-filterAccountId').value);

  // selected year
  //document.querySelector('.select-budgets-year').value = 0;
  document.querySelector('.select-budgets-year').value =
    (Number(document.querySelector('.select-budgets-filterYear').value) === 999999999)
      ? 0 : Number(document.querySelector('.select-budgets-filterYear').value);

  // amount
  document.querySelector('.input-budgets-amount').value = '';

  document.querySelector('.select-budgets-budgetId').disabled = true;
  document.querySelector('.button-budgets-delete').disabled = true;
  document.querySelector('.button-budgets-insert').disabled = true;
}

// Check for valid budget values
function validateValues() {

  // Check account id
  const accountId = document.querySelector('.select-budgets-accountId').value;
  const validAccountId = validateNumber(accountId, 1, 99999, "budgets-accountId", "Konto");

  // Check year
  const year = document.querySelector('.select-budgets-year').value;
  const validYear = validateNumber(year, 2020, 2099, "budgets-year", "År");

  // Check amount
  const amount = document.querySelector('.input-budgets-amount').value;
  const validAmount = objBudgets.validateAmount(amount, "budgets-amount", "Budsjett");

  return (validAmount && validAccountId && validYear) ? true : false;
}

// Check for valid filter
function validateFilter() {

  // Check account
  const accountId = document.querySelector('.select-budgets-filterAccountId').value;
  const validAccountId = validateNumber(accountId, 1, 999999999, 'budgets-filterAccountId', 'Konto');

  const year = document.querySelector('.select-budgets-filterYear').value;
  const validYear =
    validateNumber(year, 2020, 2030, 'budgets-year', 'Budsjettår');

  return (validAccountId && validYear) ? true : false;
}

// Show filter for search
function showLeadingTextFilter() {

  // Show all accounts
  const accountId = (isClassDefined('select-budgets-filterAccountId')) ? Number(document.querySelector('.select-budgets-filterAccountId').value) : 0;
  objAccounts.showSelectedAccounts('budgets-filterAccountId', accountId, 'Alle');

  // Show budget year
  if (!isClassDefined('select-budgets-filterYear')) {
    const year = today.getFullYear();
    objBudgets.selectNumber('budgets-filterYear', 2020, 2030, year, 'År');
  }
}

// Show budgets
function showBudgets() {

  // Validate search filter
  if (validateFilter()) {

    // Filter
    let htmlColumnLine = '<div class="columnHeaderCenter">Linje</div><br>';
    let htmlColumnAccountName = '<div class="columnHeaderLeft">Konto</div><br>';
    let htmlcolumnBudget = '<div class="columnHeaderRight">Budsjett</div><br>';

    let sumAmount = 0;
    let lineNumber = 0;

    const budgetYear = Number(document.querySelector('.select-budgets-filterYear').value);
    objBudgets.arrayBudgets.forEach((budget) => {

      // Check for budget year
      if (Number(budget.year) === budgetYear) {

        lineNumber++;

        // check if the number is odd
        const colorClass =
          (lineNumber % 2 !== 0) ? "green" : "";

        // line number
        htmlColumnLine +=
          `
          <div 
            class="centerCell ${colorClass}"
          >
            ${lineNumber}
          </div >
        `;

        // account name
        const accountName = objAccounts.getAccountName(budget.accountId);
        const colorClassAccountName = (accountName === '-') ? 'red' : colorClass;
        htmlColumnAccountName +=
          `
          <div
            class="leftCell ${colorClassAccountName} one-line"
          >
            ${accountName}    
          </div >
        `;

        // budget
        const amount =
          formatOreToKroner(budget.amount);
        htmlcolumnBudget +=
          `
          <div
            class="rightCell ${colorClass}"
          >
            ${amount}
          </div>
        `;

        // accumulate
        sumAmount += Number(budget.amount);
      }
    });

    // Sum line

    // budget
    amount = formatOreToKroner(sumAmount);
    htmlcolumnBudget +=
      `
        <div
          class="sumCellRight"
        >
          ${amount}
        </div >
      `;

    // Show line number
    document.querySelector('.div-budgets-columnLine').innerHTML = htmlColumnLine;

    // Show account name
    document.querySelector('.div-budgets-columnAccountName').innerHTML = htmlColumnAccountName;

    // Show budget
    document.querySelector('.div-budgets-columnAmount').innerHTML = htmlcolumnBudget;
  }
}

// Update budget
async function updateBudget() {

  // Check values
  if (validateValues()) {

    const budgetId = Number(document.querySelector('.select-budgets-budgetId').value);

    const condominiumId = Number(objUserPassword.condominiumId);
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    const accountId = Number(document.querySelector('.select-budgets-accountId').value);
    const amount = formatKronerToOre(document.querySelector('.input-budgets-amount').value);
    const year = document.querySelector('.select-budgets-year').value;

    // Check if budget id exist
    const objBudgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (objBudgetsRowNumber !== -1) {

      // update budget
      await objBudgets.updateBudgetsTable(budgetId, user, lastUpdate, accountId, amount, year);

    } else {

      // Insert budget row in budgets table
      await objBudgets.insertBudgetsTable(condominiumId, user, lastUpdate, accountId, amount, year);
    }
  }
}

// Delete budget row
async function deleteBudget() {

  // Check for budget Id
  const budgetId = Number(document.querySelector('.select-budgets-budgetId').value);

  // Check if budget id exist
  const budgetRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetRowNumber !== -1) {

    // delete budget row
    const user = objUserPassword.email;
    const lastUpdate = today.toISOString();
    objBudgets.deleteBudgetsTable(budgetId, user, lastUpdate);
  }
}