// maintenance of accounts

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccounts = new Accounts('accounts');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

const enableChanges = (objAccounts.securityLevel > 5);

// column widths
const columnWidths = [175, 175, 100];

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
      let html = objAccounts.showHorizontalMenu(objAccounts.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show condominium menu
      html = objAccounts.showHorizontalMenu(objAccounts.arrayMenuCondominium);
      document.querySelector('.menuCondominium').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objAccounts.condominiumId, resident, objAccounts.nineNine);
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

      // Show header
      //showHeader();

      // Show filter
      showFilter();

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

      let URL = (objAccounts.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-account.html?accountId=${accountId}`;
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

      deleteAccountRow(accountId, className);

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
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objAccounts.initializeTable(columnWidths);

  // start table body
  html += objAccounts.startTableBody();

  // show main header
  html += objAccounts.showTableHeaderLogOut('', 'Konto');
  html += "</tr>";

  // end table body
  html += objAccounts.endTableBody();

  // The end of the table
  html += objAccounts.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}
*/

// Show filter
function showFilter() {

   // Start frame
  let html = startFrame();

  // show filter
  html += startRow();

  // Show types of account
  html += showSelectedValuesNew('Kostnadstype', 'filterFixedCost', '', true, 'Alle', constFixedCost, constVariableCost, 'Alle')

  html += "</div>";

   // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show accounts
function showAccounts() {

  // start table
  let html = objAccounts.initializeTable(columnWidths);

  // Table header (<tr></tr>)

  html += objAccounts.showTableHeaderMenu('#e0f0e0', 'center', 'Kostnadstype', 'Tekst', '');

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
    html += objAccounts.editTableCell(className, name, 45, false);

    // edit account
    className = `edit${account.accountId}`;
    html += objAccounts.showButton(className, 'Endre');
    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  if (enableChanges) {

    // Insert empty table row for insertion
    html += insertEmptyTableRow();
  };

  // The end of the table
  html += objAccounts.endTable();
  document.querySelector('.showAccounts').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow() {

  let html = "";

  // Show menu
  // insert a table row (<tr></td>)
  html += objAccounts.insertTableRow('');

  // Fixed cost
  html += objAccounts.showSelectedValues('fixedCost0', '', enableChanges, 'Velg kostnadstype', constFixedCost, constVariableCost, 'Velg kostnadstype');

  // name
  html += objAccounts.editTableCell('name0', '', 45, enableChanges);

  // Insert new account
  html += "<td>Ny konto</td></tr>";

  return html;
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

// Update a accounts table row
async function updateAccountsRow(accountId) {

  accountId = Number(accountId);

  // name
  className = `name${accountId}`;
  const name = document.querySelector(`.${className}`).value;
  const validName = objAccounts.validateText(className, columnWidths, '', 'Ugyldig kontonavn', true, name, 3, 50);

  className = `.fixedCost${accountId}`;
  let fixedCost = document.querySelector(className).value;
  className = `fixedCost${accountId}`;
  if (fixedCost === constFixedCost) fixedCost = 'Y';
  if (fixedCost === constVariableCost) fixedCost = 'N';
  const validFixedCost = objAccounts.validateValues(className, columnWidths, '', 'Ugyldig kostnadstype', true, fixedCost, 'Y', 'N');

  // Validate accounts columns
  if (validName && validFixedCost) {

    document.querySelector('.message').style.display = "none";

    // Check if the account id exist
    rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      // update the accounts row
      await objAccounts.updateAccountsTable(objAccounts.user, accountId, fixedCost, name);

    } else {

      // Insert the account row in accounts table
      await objAccounts.insertAccountsTable(objAccounts.condominiumId, objAccounts.user, name, fixedCost);
    }

    fixedCost = 'A';
    await objAccounts.loadAccountsTable(objAccounts.condominiumId, fixedCost);

    // Show account
    showAccounts();
  }
}