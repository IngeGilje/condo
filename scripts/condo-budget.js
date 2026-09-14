// Budget maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objBudgets = new Budgets('budgets');

const enableChanges = (objBudgets.securityLevel > 5);
const applicationName = "condo-budget";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramBudgetId = Number(queryParameters.get("budgetId"));
const paramYear = Number(queryParameters.get("year"));
const paramBackApplication = queryParameters.get("backApplication");

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

      // Show vertical menu
      let html = objBudgets.showMenu();
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objBudgets.condominiumId, resident, objBudgets.nineNine);
      const fixedCost = "A";
      await objAccounts.loadAccountsTable(objBudgets.condominiumId, fixedCost);
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

      let URL = (objBudgets.serverStatus === 1)
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
      await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);

      showBudget(budgetId);
    };
  });

  // insert a new budget row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

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
}

// Show filter
function showFilter(budgetId) {

  // Start filter
  let html = startFilter("Forfall");

  const rowNumberBudget = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);

  // Show budgets
  html += objBudgets.showSelectedBudgetsNew('filterBudgetId', 'Budsjett', budgetId, 'Velg Budsjett', '', true);

  // End filter
  html += endFilter();

  document.querySelector(".showFilter").innerHTML = html;
}

// Show budget
function showBudget(budgetId) {

  const rowNumberBudget = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);

  let html = startContent('Budsjett');

  // Year
  const year = objBudgets.arrayBudgets[rowNumberBudget]?.year ?? "";
  html += showSelectedNumbers('year', 'År', 2020, 2030, year, enableChanges);
  html += "<div></div>";
  html += "<div></div>";

  // Show accounts
  const accountId = objBudgets.arrayBudgets[rowNumberBudget]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId', 'Konto', accountId, 'Velg Konto', '', enableChanges);
  html += "<div></div>";
  html += "<div></div>";

  // Amount
  let amount = objBudgets.arrayBudgets[rowNumberBudget]?.amount ?? '0';
  amount = formatNumberToNorAmount(amount);
  html += showTextNew('amount', 'Beløp', amount, enableChanges, 'Beløp');
  html += "<div></div>";
  html += "<div></div>";

  // text
  const text = objBudgets.arrayBudgets[rowNumberBudget]?.text ?? '';
  html += showTextNew('text', 'Tekst', text, enableChanges, "Tekst");
  html += "<div></div>";
  html += "<div></div>";

  /*
   // Buttons
  if (enableChanges) {
 
    // Start buttons
    html += startButtons();
 
    html += inputButton("update secondary", "Oppdater", "submit");
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
  */
  html += endContent();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    html += inputButton("cancel secondary", "Angre", "reset");

    // check for return back to an application
    if (paramBackApplication) {

      html += inputButton("back secondary", "Tilbake", "button");
    }

    html += inputButton("delete danger", "Slett", "button");
  }

  // End buttons
  html += endButtons();
  document.querySelector('.showBudget').innerHTML = html;
}

// Delete budgets row
async function deleteBudgetRow(budgetId, className) {

  // Check if budget row exist
  const budgetsRowNumber = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
  if (budgetsRowNumber !== -1) {

    // delete budget row
    await objBudgets.deleteBudgetsTable(budgetId, objBudgets.user);
  }

  const year = Number(document.querySelector('.filterYear').value);
  await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);
}

// Update a budgets row
async function updateBudgetsRow(budgetId) {

  budgetId = Number(budgetId);

  // accountId
  let accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = validateIntervalNew('accountId', 'Ugyldig konto', true, accountId, 1, objBudgets.nineNine);

  // amount
  let amount = document.querySelector('.amount').value;
  amount = Number(formatNorAmountToNumber(amount));
  let validAmount = validateIntervalNew('amount', 'Ugyldig budsjett', true, amount, objBudgets.minusNineNine, objBudgets.nineNine);

  // year
  let year = Number(document.querySelector('.year').value);
  const validYear = validateIntervalNew('year', 'Ugyldig budsjettår', true, year, 2020, 2029);

  // text
  let text = document.querySelector('.text').value;

  // Validate budgets columns
  if (validAccountId && validAmount && validYear) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the budget Id exist
    const rowNumberBudget = objBudgets.arrayBudgets.findIndex(budget => budget.budgetId === budgetId);
    if (rowNumberBudget !== -1) {

      // update a budgets row
      await objBudgets.updateBudgetsTable(budgetId, objBudgets.user, accountId, amount, year, text);
    } else {

      // Insert a budgets row
      await objBudgets.insertBudgetsTable(objBudgets.condominiumId, objBudgets.user, accountId, amount, year, text);
      await objBudgets.getHighestBudgetId(objBudgets.condominiumId);
      budgetId = objBudgets.arrayBudgets[0].budgetId;
    }

    await objBudgets.loadBudgetsTable(objBudgets.condominiumId, objBudgets.nineNine, objBudgets.nineNine);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);

      // Filter
      disableButton('filterBudgetId', false);
    }

    // Show filter
    showFilter(budgetId);

    // Show budget
    showBudget(budgetId);
  }
}

// resetValues
function resetValues() {

  // Filter
  document.querySelector('.filterBudgetId').value = 0;

  // year
  document.querySelector('.year').value = 0;

  // accountId
  document.querySelector('.accountId').value = 0;

  // amount
  document.querySelector('.amount').value = "";

  // text
  document.querySelector('.text').value = "";

  // Buttons
  removeMessage();

  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('update', false);

    // Filter
    disableButton('filterBudgetId', true);
  }
}