// maintenance of accounts
debugger;
// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

const enableChanges = (objAccount.securityLevel > 5);

// column widths
const columnWidths = [175, 175, 175];

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

      // Show main menu
      let html = objAccount.ShowHorizontalMenu(objAccount.arrayMainMenu);
      document.querySelector('.mainMenu').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objAccount.condominiumId, resident, objAccount.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objAccount.condominiumId, fixedCost);

      // Show header

      showHeader();

      // Show filter
      showFilter;

      // Show account
      editAccounts();

      // Events
      events();
    }
  } else {

    objAccount.showMessageNew(columnWidths, '', 'Server er ikke startet.');
  }
}

// Events for accounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterFixedCost')) {

      let fixedCost = document.querySelector('.filterFixedCost').value;
      if (fixedCost === 'Fast') fixedCost = 'Y';
      if (fixedCost === 'Variabel') fixedCost = 'N';
      await objAccount.loadAccountsTable(objAccount.condominiumId, fixedCost);

      // Show account
      editAccounts(3);
    };
  });

  // update a accounts row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['fixedCost', 'name'];
    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))) {

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

      updateAccountsRow(accountId);
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

      deleteAccountRow(accountId, className);

      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objAccount.condominiumId, fixedCost);

      // Show account
      editAccounts(3);
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objAccount.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

function resetValues() {

  // account Id
  document.querySelector('.select-accounts-accountId').value = '';

  // account Name
  document.querySelector('.input-accounts-accountName').value = '';

  // Fixed cost
  document.querySelector('.select-accounts-fixedCost').value = '';
}

// Show header
function showHeader() {

  // Start table
  let html = objAccount.initializeTable(columnWidths);

  // start table body
  html += objAccount.startTableBody();

  // show main header
  html += objAccount.showTableHeaderLogOut('', 'Konto');
  html += "</tr>";

  // end table body
  html += objAccount.endTableBody();

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.showHeader').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  let html = objAccount.initializeTable(columnWidths);

  // Header filter (<tr></tr>)

  html += objAccount.showTableHeaderMenu('', 'center', '1', '2Kostnadstype', '3');

  // start table body
  html += objAccount.startTableBody();

  // insert a table row (<tr></td>)

  html += objAccount.insertTableRow('', '');

  // fixed or not fixed cost
  html += objAccount.showSelectedValues('filterFixedCost', 'width:175px;', true, 'Alle', constFixedCost, constVariableCost, 'Alle');
  html += "<td></td></tr>";

  // insert a table row (<tr></td>)

  html += objAccount.insertTableRow('', '');
  html += "<td></td><td></td></tr>";

  // end table body
  html += objAccount.endTableBody();

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.editFilter').innerHTML = html;


}

// Show accounts
function editAccounts() {

  // start table
  let html = objAccount.initializeTable(columnWidths);

  // Table header (<tr></tr>)

  html += objAccount.showTableHeaderMenu('#e0f0e0', 'center', 'Kostnadstype', 'Tekst', '');

  objAccount.arrayAccounts.forEach((account) => {

    // Show menu
    html += objAccount.insertTableRow('');

    // fixed cost
    let selected = "Ugyldig verdi";
    if (account.fixedCost === 'Y') selected = constFixedCost;
    if (account.fixedCost === 'N') selected = constVariableCost;

    let className = `fixedCost${account.accountId}`;
    html += objAccount.showSelectedValues(className, '', enableChanges, selected, constFixedCost, constVariableCost);

    // name
    const name = account.name;
    className = `name${account.accountId}`;
    html += objAccount.editTableCell(className, name, 45, enableChanges);

    // Delete
    selected = "";
    if (account.deleted === 'Y') selected = "";
    if (account.deleted === 'N') selected = "Slett";

    className = `delete${account.accountId}`;
    html += objAccount.showButton(className, selected);
    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  if (enableChanges) {

    // Insert empty table row for insertion

    html += insertEmptyTableRow();
  };

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.editAccounts').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow() {

  let html = "";

  // Show menu
  // insert a table row (<tr></td>)
  html += objAccount.insertTableRow('');

  // Fixed cost
  html += objAccount.showSelectedValues('fixedCost0', '', enableChanges, 'Velg kostnadstype', constFixedCost, constVariableCost, 'Velg kostnadstype');

  // name
  html += objAccount.editTableCell('name0', '', 45, enableChanges);

  // Insert new account
  html += "<td>Ny konto</td></tr>";

  return html;
}

// Delete one account row
async function deleteAccountRow(accountId, className) {

  // Check if account row exist
  accountsRowNumber = objAccount.arrayAccounts.findIndex(account => account.accountId === accountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    await objAccount.deleteAccountsTable(accountId, objAccount.user);
  }

  const fixedCost = 'A';
  await objAccount.loadAccountsTable(objAccount.condominiumId, fixedCost);
}

// Update a accounts table row
async function updateAccountsRow(accountId) {

  accountId = Number(accountId);

  // name
  className = `name${accountId}`;
  const name = document.querySelector(`.${className}`).value;
  const validName = objAccount.validateText(className, columnWidths, '', 'Ugyldig kontonavn', true, name, 3, 50);

  className = `.fixedCost${accountId}`;
  let fixedCost = document.querySelector(className).value;
  className = `fixedCost${accountId}`;
  if (fixedCost === constFixedCost) fixedCost = 'Y';
  if (fixedCost === constVariableCost) fixedCost = 'N';
  const validFixedCost = objAccount.validateValues(className, columnWidths, '', 'Ugyldig kostnadstype', true, fixedCost, 'Y', 'N');

  // Validate accounts columns
  if (validName && validFixedCost) {

    document.querySelector('.message').style.display = "none";

    // Check if the account id exist
    rowNumberAccount = objAccount.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      // update the accounts row
      await objAccount.updateAccountsTable(objAccount.user, accountId, fixedCost, name);

    } else {

      // Insert the account row in accounts table
      await objAccount.insertAccountsTable(objAccount.condominiumId, objAccount.user, name, fixedCost);
    }

    fixedCost = 'A';
    await objAccount.loadAccountsTable(objAccount.condominiumId, fixedCost);

    // Show account
    editAccounts(3);
  }
}