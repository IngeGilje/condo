// maintenance of remote heating

// Activate classes
const today = new Date();
const objUser = new User('user');
const objAccount = new Account('account');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

const enableChanges = (objAccount.securityLevel > 5);

const tableWidth = 'width:600px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((condominiumId === 0 || user === null)) {

      // LogIn is not valid
      //window.location.href = 'http://localhost/condo-login.html';
      const URL = (objUser.serverStatus === 1) 
      ? 'http://ingegilje.no/condo-login.html' 
      : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(condominiumId, resident, objAccount.nineNine);
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      // Show account
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Events for accounts
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterFixedCost')) {

      let fixedCost = document.querySelector('.filterFixedCost').value;
      if (fixedCost === 'Fast kostnad') fixedCost = 'Y';
      if (fixedCost === 'Variabel kostnad') fixedCost = 'N';
      await objAccount.loadAccountsTable(condominiumId, fixedCost);

      /*
      let menuNumber = 0;
      menuNumber = showResult(menuNumber);
      */
     showResult(3);
    };
  });

  // update a accounts row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const arrayPrefixes = ['fixedCost', 'name'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objAccount.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let accountId = 0;
      let prefix = "";
      if (className) {
        prefix = prefixes.find(p => className.startsWith(p));
        accountId = Number(className.slice(prefix.length));
      }

      // Update a accounts row
      updateAccountsRow(accountId);
    };
  });

  // Delete suppliers row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDue.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      //const className = objAccount.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const accountId = Number(className.substring(6));

        deleteAccountRow(accountId, className);

        const fixedCost = 'A';
        await objAccount.loadAccountsTable(condominiumId, fixedCost);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });

  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objHeatings.serverStatus === 1)
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

  document.querySelector('.select-accounts-accountId').disabled = true;
  document.querySelector('.button-accounts-delete').disabled = true;
  document.querySelector('.button--accounts-insert').disabled = true;
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objAccount.startTable(tableWidth);

  // show main header
  html += objAccount.showTableHeader('width:250px;', 'Konto');

  // The end of the table header
  html += objAccount.endTableHeader();

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objAccount.startTable(tableWidth);

  // start table body
  html += objAccount.startTableBody();

  // show main header
  html += objAccount.showTableHeaderLogOut('width:175px;', '', '', 'Konto', '');
  html += "</tr>";

  // end table body
  html += objAccount.endTableBody();

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(menuNumber) {

  // Start table
  html = objAccount.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objAccount.showTableHeaderMenu('width:150px;', menuNumber, '', 'Kostnadstype', '');

  // start table body
  html += objAccount.startTableBody();

  // insert table columns in start of a row
  html += objAccount.insertTableColumns('', 0, '');

  // fixed or not fixed cost
  html += objAccount.showSelectedValues('filterFixedCost', 'width:100px;', true, 'Alle', constFixedCost, constVariableCost, 'Alle');

  html += "</tr>";

  // insert table columns in start of a row
  html += objAccount.insertTableColumns('', 0, '');

  // end table body
  html += objAccount.endTableBody();

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = "";

  // Show menu
  //html += objAccount.verticalMenu(menuNumber);
  // insert table columns in start of a row
  html += objAccount.insertTableColumns('', menuNumber);

  // delete
  html += "<td class='center'>Ny konto</td>";

  // Fixed cost
  html += objAccount.showSelectedValues('fixedCost0', '', enableChanges, constFixedCost, constFixedCost, constVariableCost);

  // name
  html += objAccount.inputTableColumn('name0', "", 45);

  html += "</tr>";
  return html;
}

// Show accounts
function showResult(menuNumber) {

  // start table
  let html = objAccount.startTable(tableWidth);

  // table header
  html += objAccount.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, '', 'Slett', 'Kostnadstype', 'Tekst');

  objAccount.arrayAccounts.forEach((account) => {

    // Show menu
    menuNumber++;
    //html += objAccount.verticalMenu(menuNumber);
    html += objAccount.insertTableColumns('', menuNumber);

    // Delete
    let selected = "Ugyldig verdi";
    if (account.deleted === 'Y') selected = "Ja";
    if (account.deleted === 'N') selected = "Nei";

    let className = `delete${account.accountId}`;
    html += objAccount.showSelectedValues(className, 'width:75px;', enableChanges, selected, 'Nei', 'Ja')

    // fixed cost
    selected = "Ugyldig verdi";
    switch (account.fixedCost) {
      case 'Y': {

        selected = constFixedCost;
        break;
      }
      case 'N': {

        selected = constVariableCost;
        break;
      }
      default: {

        selected = "Ugyldig verdi";
        break
      }
    }

    className = `fixedCost${account.accountId}`;
    html += objAccount.showSelectedValues(className, '', enableChanges, selected, constFixedCost, constVariableCost)

    // name
    const name = account.name;
    className = `name${account.accountId}`;
    html += objAccount.inputTableColumn(className, name, 45);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  menuNumber++;
  html += insertEmptyTableRow(menuNumber);

  // Show the rest of the menu
  menuNumber++;
  html += objAccount.showRestMenu(menuNumber);

  // The end of the table
  html += objAccount.endTable();
  document.querySelector('.result').innerHTML = html;

  return menuNumber;
}

// Delete one account row
async function deleteAccountRow(accountId, className) {



  // Check if account row exist
  accountsRowNumber = objAccount.arrayAccounts.findIndex(account => account.accountId === accountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    objAccount.deleteAccountsTable(accountId, user);
  }

  const fixedCost = 'A';
  await objAccount.loadAccountsTable(condominiumId, fixedCost);
}

// Update a accounts table row
async function updateAccountsRow(accountId) {

  accountId = Number(accountId);

  //const condominiumId = Number(condominiumId);



  // name
  className = `.name${bankAccountTransactionId}`;
  const name = document.querySelector(className).value;
  const validName = objBankAccountTransaction.validateText(className,name, 3, 45,objBankAccountTransaction, '', 'Ugyldig navn');

  className = `.fixedCost${accountId}`;
  let fixedCost = document.querySelector(className).value;
  if (fixedCost === constFixedCost) fixedCost = 'Y';
  if (fixedCost === constVariableCost) fixedCost = 'N';

  // Validate accounts columns
  if (validName && (fixedCost === "Y" || fixedCost === "N")) {

    // Check if the account id exist
    rowNumberAccount = objAccount.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (rowNumberAccount !== -1) {

      // update the accounts row
      await objAccount.updateAccountsTable(user, accountId, fixedCost, name);

    } else {

      // Insert the account row in accounts table
      await objAccount.insertAccountsTable(condominiumId, user, accountName, fixedCost, accountName);
    }

    const fixedCost = 'A';
    await objAccount.loadAccountsTable(condominiumId, fixedCost);
    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}