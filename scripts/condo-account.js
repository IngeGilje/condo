// maintenance of accounts

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Accounts('accounts');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

const enableChanges = (objAccounts.securityLevel > 5);
const applicationName = "condo-account";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramAccountId = Number(queryParameters.get("accountId"));
const paramFixedCost = queryParameters.get("fixedCost");
const paramBackApplication = queryParameters.get("backApplication");

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUsers.checkServer()) {

    // Validate LogIn
    if ((objAccounts.condominiumId === 0) || (objAccounts.user === null)) {

      // LogIn is not valid
      const URL = (objUsers.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show menu
      let html = objAccounts.showMenu(objAccounts.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUsers.loadUsersTable(objAccounts.condominiumId, resident, objAccounts.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

      let accountId = 0;
      if (paramAccountId === 0) {

        await objAccounts.getHighestAccountId(objAccounts.condominiumId);
        accountId = objAccounts.arrayAccounts.at(-1)?.accountId ?? 0;
        await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);
      } else {

        accountId = paramAccountId;
      }

      // Show filter
      showFilter(accountId);

      // Show account
      showAccount(accountId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for accounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterFixedCost')) {

      let fixedCost = document.querySelector('.filterFixedCost').value;
      if (fixedCost === constFixedCost) fixedCost = 'Y';
      if (fixedCost === constVariableCost) fixedCost = 'N';
      await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

      // Show account
      showAccount(accountId);
    };
  });

  // update a accounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const accountId = document.querySelector('.filterAccountId').value;
      updateAccountsRow(accountId);
    };
  });

  // return to accounts
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objAccounts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-showaccounts.html?accountId=${paramAccountId}&fixedCost=${paramFixedCost}`;
      window.location.href = URL;
    };
  });

  // Delete account row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const accountId = Number(document.querySelector('.filterAccountId').value);
      await deleteAccountsRow(accountId);
    };
  });
}

// Show filter
function showFilter(accountId) {

  // Start filter
  let html = startGridFilter("Tømmekalender");

  // Show types of account
  html += objAccounts.showSelectedAccountsNew('filterAccountId', 'Konto', accountId, '', '', true);

  // End filter
  html += endGridFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Show account
function showAccount(accountId) {

  const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);

  let html = startGrid('Konto');

  // fixed cost
  //let selected = "Ugyldig verdi";
  let selected = objAccounts.arrayAccounts[rowNumberAccount]?.fixedCost ?? '';
  if (selected === 'Y') selected = constFixedCost;
  if (selected === 'N') selected = constVariableCost;
  if (selected !== constFixedCost && selected !== constVariableCost) selected = "Ukjent";
  //if (objAccounts.arrayAccounts[rowNumberAccount].fixedCost === 'N') selected = constVariableCost;
  //html += inputValues('Kostnadstype', 'fixedCost', '', enableChanges, selected, constFixedCost, constVariableCost)
  html += inputValues('Kostnadstype', 'fixedCost', enableChanges, selected, constFixedCost, constVariableCost);
  html += "<div></div>";
  //html += "<div></div>";

  // name
  const name = objAccounts.arrayAccounts[rowNumberAccount]?.name ?? '';
  html += showTextNew('name', 'Kontonavn', name, enableChanges, 'Kontonavn');
  html += "<div></div>";
  //html += "<div></div>";

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");

    // check for return back to an application
    if (paramBackApplication) {

      html += inputButton("back secondary", "Tilbake", "button");
    }
    html += inputButton("delete danger", "Slett", "button");

    // End buttons
    html += endButtons();
  }
  document.querySelector('.showAccount').innerHTML = html;
}

function resetValues() {

  // account Id
  document.querySelector('.select-accounts-accountId').value = '';

  // account Name
  document.querySelector('.input-accounts-accountName').value = '';

  // Fixed cost
  document.querySelector('.select-accounts-fixedCost').value = '';

  // Buttons
  if (enableChanges) {
    disableButton('delete', true);

    // Filter
    //disableButton('filterFixedCost', true);
  }
}

// Delete one account row
async function deleteAccountRow(accountId) {

  // Check if account row exist
  rowNumberAccounts = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
  if (rowNumberAccounts !== -1) {

    // delete account row
    await objAccounts.deleteAccountsTable(accountId, objAccounts.user);
    await objAccounts.getHighestAccountId(objAccounts.condominiumId);

    // Check for empty array
    if (Array.isArray(objAccounts.arrayAccounts) && objAccounts.arrayAccounts === 0) {

      // Empty array
      accountId = 0;
    } else {

      accountId = objAccounts.arrayAccounts[0].accountId;
    }
  }

  const fixedCost = 'A';
  await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

  // Show filter
  showFilter(accountId);

  // Show account
  showAccount(accountId);
}

// Update a accounts table row
async function updateAccountsRow(accountId) {

  accountId = Number(accountId);

  // name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', 'Ugyldig kontonavn',  name, 3, 50);

  className = `.fixedCost`;
  let fixedCost = document.querySelector(className).value;
  className = `fixedCost`;
  if (fixedCost === constFixedCost) fixedCost = 'Y';
  if (fixedCost === constVariableCost) fixedCost = 'N';
  const validFixedCost = validateValuesNew(className, 'Ugyldig kostnadstype',  fixedCost, 'Y', 'N');

  // Validate accounts columns
  if (validName && validFixedCost) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the account Id exist
    const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      // update a accounts row
      await objAccounts.updateAccountsTable(objAccounts.user, accountId, fixedCost, name);
    } else {

      // Insert a accounts row
      await objAccounts.insertAccountsTable(objAccounts.condominiumId, objAccounts.user, year, priceKilowattHour);
      await objAccounts.getHighestAccountId(objAccounts.condominiumId);
      accountId = objAccounts.arrayAccounts.at(-1)?.accountId ?? 0;
    }

    fixedCost = 'A';
    await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
    }

    // Show filter
    showFilter(accountId);

    // Show account
    showAccount(accountId);
  }
}