// maintenance of accounts

// Activate classes
const today = new Date();
const objUsers = new User('user');
const objAccounts = new Account('account');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

testMode();

// Exit application if no activity for 1 hour
exitIfNoActivity();

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
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

    // Show header
    let menuNumber = 0;
    showHeader();

    // Show filter
    showFilter()

    // Show account
    menuNumber = showResult(menuNumber);

    // Events
    events();
  }
}

// Events for accounts
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterFixedCost')) {

      filterSync();

      async function filterSync() {

        let fixedCost = document.querySelector('.filterFixedCost').value;
        if (fixedCost === 'Fast kostnad') fixedCost = 'Y';
        if (fixedCost === 'Variabel kostnad') fixedCost = 'N';
        await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });

  // update a accounts row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('update')) {

      const arrayPrefixes = ['fixedCost', 'name'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objAccounts.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let accountId = 0;
      let prefix = "";
      if (className) {
        prefix = prefixes.find(p => className.startsWith(p));
        accountId = Number(className.slice(prefix.length));
      }

      updateAccountRowSync();

      // Update a accounts row
      async function updateAccountRowSync() {

        updateAccountsRow(accountId);
      }
    };
  });

  // Delete suppliers row
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objAccounts.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const accountId = Number(className.substring(6));
        deleteAccountSync();

        async function deleteAccountSync() {

          deleteAccountRow(accountId, className);

          const fixedCost = 'A';
          await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
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

  document.querySelector('.select-accounts-accountId').disabled = true;
  document.querySelector('.button-accounts-delete').disabled = true;
  document.querySelector('.button--accounts-insert').disabled = true;
}

/*
// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:750px;');

  // Main header
  html += objAccounts.showTableHeader('width:250px;', 'Konto');

  // The end of the table
  html += endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  let html = objAccounts.startTable('width:750px;');

  // show main header
  html += objAccounts.showTableHeader('width:250px;', 'Konto');

  // The end of the table header
  html += objAccounts.endTableHeaderNew();

  // The end of the table
  html += objAccounts.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = objAccounts.startTable('width:750px;');

  // Header filter
  html += objAccounts.showTableHeader('width:250px;', '', 'Kostnadstype', '');

  // start table body
  html += objAccounts.startTableBody();

  // insert table columns in start of a row
  html += objAccounts.insertTableColumns('', 0, '');

  // fixed or not fixed cost
  html += objAccounts.showSelectedValues('filterFixedCost', 'width:100px;', 'Alle', constFixedCost, constVariableCost, 'Alle');

  html += "</tr>";

  // insert table columns in start of a row
  html += objAccounts.insertTableColumns('', 0, '');

  // end table body
  html += objAccounts.endTableBody();

  // The end of the table
  html += objAccounts.endTable();
  document.querySelector('.filter').innerHTML = html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";

  // Show menu
  // insert table columns in start of a row
  html += objAccounts.insertTableColumns('', rowNumber);

    // delete
  html += "<td class='center'>Ny konto</td>";

  // Fixed cost
  html += objAccounts.showSelectedValues('fixedCost0', '', constFixedCost, constFixedCost, constVariableCost);

  // name
  html += objAccounts.inputTableColumn('name0', "", 45);

  html += "</tr>";
  return html;
}

// Show accounts
function showResult(rowNumber) {

  // start table
  let html = objAccounts.startTable('width:750px;');

  // table header
  html += objAccounts.showTableHeader('width:250px;', '', 'Slett', 'Kostnadstype', 'Tekst');

  /*
  // Start HTML table
  html = startHTMLTable('width:750px;');

  // Header
  html += objAccounts.showTableHeader('width:250px;', '', 'Slett', 'Kostnadstype', 'Tekst');
  */

  objAccounts.arrayAccounts.forEach((account) => {

    //html += '<tr>';

    // Show menu
    rowNumber++;
    //html += objAccounts.verticalMenu(rowNumber);
    html += objAccounts.insertTableColumns('', rowNumber);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (account.deleted === 'Y') selectedChoice = "Ja";
    if (account.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${account.accountId}`;
    html += objAccounts.showSelectedValues(className, 'width:75px;', selectedChoice, 'Nei', 'Ja')

    // fixed cost
    selectedChoice = "Ugyldig verdi";
    switch (account.fixedCost) {
      case 'Y': {

        selectedChoice = constFixedCost;
        break;
      }
      case 'N': {

        selectedChoice = constVariableCost;
        break;
      }
      default: {

        selectedChoice = "Ugyldig verdi";
        break
      }
    }

    className = `fixedCost${account.accountId}`;
    html += objAccounts.showSelectedValues(className, '', selectedChoice, constFixedCost, constVariableCost)

    // name
    const name = account.name;
    className = `name${account.accountId}`;
    html += objAccounts.inputTableColumn(className, name, 45);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // Show the rest of the menu
  rowNumber++;
  html += objAccounts.showRestMenu(rowNumber);

  // The end of the table
  html += objAccounts.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Delete one account row
async function deleteAccountRow(accountId, className) {

  const user = objUserPassword.email;

  // Check if account row exist
  accountsRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    objAccounts.deleteAccountsTable(accountId, user);
  }

  const fixedCost = 'A';
  await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
}

// Update a accounts table row
async function updateAccountsRow(accountId) {

  accountId = Number(accountId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;


  // name
  className = `.name${bankAccountTransactionId}`;
  const name = document.querySelector(className).value;
  const validName = objBankAccountTransactions.validateText(name, 3, 50);

  className = `.fixedCost${accountId}`;
  let fixedCost = document.querySelector(className).value;
  if (fixedCost === constFixedCost) fixedCost = 'Y';
  if (fixedCost === constVariableCost) fixedCost = 'N';

  // Validate accounts columns
  if (validName && (fixedCost === "Y" || fixedCost === "N")) {

    // Check if the account id exist
    rowNumberAccount = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      // update the accounts row
      await objAccounts.updateAccountsTable(user, accountId, fixedCost, name);

    } else {

      // Insert the account row in accounts table
      await objAccounts.insertAccountsTable(condominiumId, user, accountName, fixedCost, accountName);
    }

    const fixedCost = 'A';
    await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);
    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}