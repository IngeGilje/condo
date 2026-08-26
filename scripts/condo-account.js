// maintenance of accounts

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');
const objAccount = new Account('account');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

const enableChanges = (objAccount.securityLevel > 5);
const applicationName = "condo-account";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramAccountId = Number(queryParameters.get("accountId"));
const paramFixedCost = queryParameters.get("fixedCost");

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objAccount.condominiumId === 0) || (objAccount.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show vertical menu
      let html = objAccount.showMenu(applicationName);
      document.querySelector('.menuVertical').innerHTML = html;

      // Change frame title
      setFrameTitle("menu-frame", "Meny",);
      setFrameTitle("news", "Nyheter",);

      const resident = 'Y';
      await objUser.loadUsersTable(objAccount.condominiumId, resident, objAccount.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);

      let accountId = 0;
      if (paramAccountId === 0) {

        await objAccounts.getHighestAccountId(objAccount.condominiumId);
        accountId = objAccounts.arrayAccounts.at(-1)?.accountId ?? 0;
        await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);
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
      await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);

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

      let URL = (objAccount.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-accounts.html?accountId=${paramAccountId}&fixedCost=${paramFixedCost}`;
      window.location.href = URL;
    };
  });

  // Delete account row
  document.addEventListener('click', async (event) => {
    //if (event.target.classList.contains('delete')) {
    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objAccount.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let accountId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        accountId = Number(className.slice(prefix.length));
      }

      await deleteAccountRow(accountId, className);

      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);

      // Show account
      showAccounts(accountId);
    };
  });
}

// Show filter
function showFilter(accountId) {

  // Start frame
  let html = startFrame("filter-frame");

  // Show types of account
  html += objAccounts.showSelectedAccountsNew('Konto', 'filterAccountId',  accountId, '', '', true);

  // End frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame", "Filter");
}

// Show account
function showAccount(accountId) {

  const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);

  // Empty line
  let html = emptyLine();

  // fixed cost
  html += startLine();

  let selected = "Ugyldig verdi";
  if (objAccounts.arrayAccounts[rowNumberAccount].fixedCost === 'Y') selected = constFixedCost;
  if (objAccounts.arrayAccounts[rowNumberAccount].fixedCost === 'N') selected = constVariableCost;

  let className = `fixedCost`;
  html += showSelectedValuesNew('Kostnadstype', 'fixedCost', '', enableChanges, selected, constFixedCost, constVariableCost)
  html += "</div>";

  // name
  html += startLine();

  const name = objAccounts.arrayAccounts[rowNumberAccount]?.name ?? '';
  html += showTextNew('Kontonavn', 'name', objAccounts.arrayAccounts[rowNumberAccount].name.trim(), enableChanges, 'Kontonavn');
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  if (paramAccountId > 0) {
    html += startLine();
    html += showButtonNew('back', 'Tilbake');
    html += "</div>";
  }

  document.querySelector('.showAccount').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterAccountId', false);
  }
}

function resetValues() {

  // account Id
  document.querySelector('.select-accounts-accountId').value = '';

  // account Name
  document.querySelector('.input-accounts-accountName').value = '';

  // Fixed cost
  document.querySelector('.select-accounts-fixedCost').value = '';

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('update', true);
    disableButton('cancel', false);
    disableButton('filterFixedCost', true);
  }
}

// Delete one account row
async function deleteAccountRow(accountId, className) {

  // Check if account row exist
  accountsRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    await objAccount.deleteAccountsTable(accountId, objAccount.user);
  }

  const fixedCost = 'A';
  await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);
}

// Update a accounts table row
async function updateAccountsRow(accountId) {

  accountId = Number(accountId);

  // name
  const name = document.querySelector('.name').value;
  const validName = validateTextNew('name', '', 'Ugyldig kontonavn', true, name, 3, 50);

  className = `.fixedCost`;
  let fixedCost = document.querySelector(className).value;
  className = `fixedCost`;
  if (fixedCost === constFixedCost) fixedCost = 'Y';
  if (fixedCost === constVariableCost) fixedCost = 'N';
  const validFixedCost = validateValuesNew(className, 'Ugyldig kostnadstype', true, fixedCost, 'Y', 'N');

  // Validate accounts columns
  if (validName && validFixedCost) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the account Id exist
    const rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      // update a accounts row
      await objAccounts.updateAccountsTable(objAccount.user, accountId, fixedCost, name);
    } else {

      // Insert a accounts row
      await objAccount.insertAccountsTable(objAccount.condominiumId, objAccount.user, year, priceKilowattHour);
      await objAccount.getHighestAccountId(objAccount.condominiumId);
      accountId = objAccount.arrayAccounts[0].accountId;
    }

    fixedCost = 'A';
    await objAccounts.loadAccountsTable(objAccount.condominiumId, fixedCost);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterAccountId', false);
    }

    // Show filter
    showFilter(accountId);

    // Show account
    showAccount(accountId);
  }
}