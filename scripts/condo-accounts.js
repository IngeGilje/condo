// maintenance of accounts

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

const enableChanges = (objAccounts.securityLevel > 5);
const applicationName = "condo-accounts";

// column widths
const columnWidths = [175, 175, 100];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramAccountId = Number(queryParameters.get("accountId"));
let paramFixedCost = queryParameters.get("fixedCost");

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objAccounts.condominiumId === 0) || (objAccounts.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objAccounts.showHorizontalMenu("filter-frame", objAccounts.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show condominium menu
      html = objAccounts.showHorizontalMenu("filter-frame", objAccounts.arrayMenuCondominium);
      document.querySelector('.menuCondominium').innerHTML = html;
      objAccounts.markActivatedApplication(objAccounts.arrayMenuCondominium,applicationName);

      // mark activated application
      objAccounts.markActivatedApplication(objAccounts.arrayMenuCondominium, applicationName);

      let resident = 'Y';
      await objUser.loadUsersTable(objAccounts.condominiumId, resident, objAccounts.nineNine);
      if (paramFixedCost !== 'Y' && paramFixedCost !== 'N') paramFixedCost = 'A';
      await objAccounts.loadAccountsTable(objAccounts.condominiumId, paramFixedCost);

       // Show filter
      showFilter(paramFixedCost);

      // Show account
      showAccounts();

      // Events
      events();
    }
  } else {

    objAccounts.showMessageNew(columnWidths, '', 'Server er ikke startet.');
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
      showAccounts();
    };
  });

  // change budget
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('edit'))) {

      const arrayPrefixes = ['edit'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objAccounts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let accountId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        accountId = Number(className.slice(prefix.length));
      }

      let fixedCost = document.querySelector('.filterFixedCost').value;
      if (fixedCost === constVariableCost) fixedCost = 'N';
      if (fixedCost === constFixedCost) fixedCost = 'Y';
      if (fixedCost !== 'Y' && fixedCost !== 'N') fixedCost = 'A';

      let URL = (objAccounts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-account.html?accountId=${accountId}&fixedCost=${fixedCost}`;
      window.location.href = URL;
    };
  });

  /*
  // update a accounts row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['fixedCost', 'name'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objAccounts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let accountId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        accountId = Number(className.slice(prefix.length));
      }

      updateAccountsRow(accountId);
    };
  });
  */

  /*
  // Delete account row
  document.addEventListener('click', async (event) => {
    //if (event.target.classList.contains('delete')) {
    const arrayPrefixes = ['delete'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objAccounts.getClassByPrefix(event.target, prefix))
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
      await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

      // Show account
      showAccounts();
    };
  });
  */

  /*
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objAccounts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
  */
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
    disableButton('cancel', false);
    disableButton('filterFixedCost', true);
  }
}

// Show filter
function showFilter(fixedCost) {

  // Start frame
  let html = startFrame('filter-frame');

  // Show types of account
  if (fixedCost === 'Y') fixedCost = constFixedCost;
  if (fixedCost === 'N') fixedCost = constVariableCost;
  if (fixedCost === 'A') fixedCost = 'Alle';
  html += showSelectedValuesNew('Kostnadstype', 'filterFixedCost', '', true, fixedCost, constFixedCost, constVariableCost, 'Alle')

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("filter-frame","Filter");
}

// Show accounts
function showAccounts() {

  // start table
  let html = objAccounts.initializeTable(columnWidths);

  html += objAccounts.insertTableRow('', '');

  // Table header (<tr></tr>)
  html += objAccounts.showTableHeader('center', 'Kostnadstype', 'Tekst', '');

  objAccounts.arrayAccounts.forEach((account) => {

    // Show menu
    html += objAccounts.insertTableRow('');

    // fixed cost
    let selected = "Ugyldig verdi";
    if (account.fixedCost === 'Y') selected = constFixedCost;
    if (account.fixedCost === 'N') selected = constVariableCost;

    let className = `fixedCost${account.accountId}`;
    html += objAccounts.showSelectedValues(className, '', false, selected, constFixedCost, constVariableCost);

    // name
    const name = account.name;
    className = `name${account.accountId}`;
    html += editTableCell(className, name, 45, false);

    // edit account
    className = `edit${account.accountId}`;
    html += objAccounts.showButton(className, 'Endre');
    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // The end of the table
  html += objAccounts.endTable();
  document.querySelector('.showAccounts').innerHTML = html;
}

// Delete one account row
async function deleteAccountRow(accountId, className) {

  // Check if account row exist
  accountsRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    await objAccounts.deleteAccountsTable(accountId, objAccounts.user);
  }

  const fixedCost = 'A';
  await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);
}