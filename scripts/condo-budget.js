// Budget maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objBudgets = new Budgets('budgets');
const objBudget = new Budget('budget');

const enableChanges = (objBudget.securityLevel > 5);
const applicationName = "condo-budget";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramBudgetId = Number(queryParameters.get("budgetId"));
const paramYear = Number(queryParameters.get("year"));

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

            // Show vertical menu
      let html = objBudget.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      //setFrameTitle("menu-frame", "Meny");

      /*
      // Show main menu
      let html = objBudget.showHorizontalMenu("filter-frame", objBudget.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show transaction menu
      html = objBudget.showHorizontalMenu("filter-frame", objBudget.arrayMenuTransaction);
      document.querySelector('.menuTransaction').innerHTML = html;
      objBudget.markActivatedApplication(objBudget.arrayMenuTransaction, applicationName);
      */

      const resident = 'Y';
      await objUser.loadUsersTable(objBudget.condominiumId, resident, objBudget.nineNine);
      const fixedCost = "A";
      await objAccounts.loadAccountsTable(objBudget.condominiumId, fixedCost);
      await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);

      // Show filter
      showFilter(paramBudgetId);

      // Show result of filter
      showBudget(paramBudgetId);

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
    if (event.target.classList.contains('filterBudgetId')) {

      const budgetId = Number(document.querySelector('.filterBudgetId').value);
      await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);

      showBudget(budgetId);
    };
  });

  // return to condo-budgets.js
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('back')) {

      let URL = (objBudget.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-budgets.html?budgetId=${paramBudgetId}&year=${paramYear}`;
      window.location.href = URL;
    };
  });

  // update a budgets row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update budget
      budgetId = Number(document.querySelector('.filterBudgetId').value);
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

      awaitdeleteBudgetRow(budgetId, className);

      const year = Number(document.querySelector('.filterYear').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);

      showBudget(budgetId);
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
  budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    // delete budget row
    await objBudgets.deleteBudgetsTable(budgetId, objBudget.user);
  }

  const year = Number(document.querySelector('.filterYear').value);
  await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);
}

// Update a budgets row
async function updateBudgetsRow(budgetId) {

  debugger;
  budgetId = Number(budgetId);

  // accountId
  let accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = validateIntervalNew('accountId',  'Ugyldig konto', true, accountId, 1, objBudget.nineNine);

  // amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatNorAmountToNumber(amount));
  let validAmount = validateIntervalNew('amount',  'Ugyldig budsjett', true, amount, objBudget.minusNineNine, objBudget.nineNine);

  // year
  let year = Number(document.querySelector('.year').value);
  const validYear = validateIntervalNew('year',  'Ugyldig budsjettår', true, year, 2020, 2029);

  // text
  let text = document.querySelector('.text').value;
 
  // Validate budgets columns
  if (validAccountId && validAmount && validYear) {

    /*
    document.querySelector('.showMessage').style.display = "none";

    // Check if the budgets row exist
    budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budgets => budgets.budgetId === budgetId);
    if (budgetsRowNumber !== -1) {

      // update the budgets row
      await objBudgets.updateBudgetsTable(budgetId, objBudget.user, accountId, amount, year, text);

    } else {

      // Insert the budget row in budgets table
      await objBudget.insertBudgetsTable(objBudget.condominiumId, objBudget.user, accountId, amount, year, text);
    }

    accountId = Number(document.querySelector('.filterAccountId').value);
    year = Number(document.querySelector('.filterYear').value);
    await objBudgets.loadBudgetsTable(objBudget.condominiumId, year, accountId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterBudgetId', false, 'white');
    }

    // show filter
    showFilter(budgetId);

    // Show budget
    showBudget(budgetId);
  }
  */
    debugger;
    document.querySelector('.showMessage').style.display = "none";

    // Check if the budget Id exist
    const rowNumberBudget = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (rowNumberBudget !== -1) {

      // update a budgets row
      await objBudgets.updateBudgetsTable(budgetId, objBudget.user, accountId, amount, year, text);
    } else {

      // Insert a budgets row
      await objBudget.insertBudgetsTable(objBudget.condominiumId, objBudget.user, accountId, amount, year, text);
      await objBudget.getHighestBudgetId(objBudget.condominiumId);
      budgetId = objBudget.arrayBudgets[0].budgetId;
    }

    await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterBudgetId', false);
    }

    // Show filter
    showFilter(budgetId);

    // Show budget
    showBudget(budgetId);
  }
}

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
function showFilter(budgetId) {

  // Start frame
  let html = startFrame('filter-frame');

  // Show budgets
  html += objBudgets.showSelectedBudgetsNew('Budsjett', 'filterBudgetId', '', budgetId, '', '', true);

  // End filter
  html += "</div>";

  document.querySelector(".showFilter").innerHTML = html;

  // Change frame title
  //setFrameTitle("filter-frame","Filter");
}

// Show budget
function showBudget(budgetId) {

  // row number budget
  const rowNumberBudget = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);

  // Empty line
  let html = emptyLine();

  const year = objBudgets.arrayBudgets[rowNumberBudget]?.year ?? '';
  html += inputSelectedNumbers('year','År',  2020, 2030, year, true);

  const accountId = objBudgets.arrayBudgets[rowNumberBudget]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId','Konto',  accountId, 'Velg konto', '', true);

  // amount
  /*
  let amount = (rowNumberBudget === -1)
    ? ''
    : objBudgets.arrayBudgets[rowNumberBudget].amount;
  */
  let amount = objBudgets.arrayBudgets[rowNumberBudget]?.amount ?? '0';
  amount = formatNumberToNorAmount(amount);
  html += showTextNew('amount','Beløp',  amount, enableChanges, "Beløp");

  // text
  /*
  const text = (rowNumberBudget === -1)
    ? ''
    : objBudgets.arrayBudgets[rowNumberBudget].text.trim();
  */
  const text = objBudgets.arrayBudgets[rowNumberBudget]?.text ?? '';
  html += showTextNew('text','Tekst',  text, enableChanges, "Tekst");
  html += "</div>";

  /*
  // Buttons
  if (enableChanges) {

    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');

    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
  }
    */
   // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update primary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("cancel secondary", "Angre", "reset");
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }

  document.querySelector('.showBudget').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterBudgetId', false, 'white');
  }
}