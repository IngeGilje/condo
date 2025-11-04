// maintenance of accounts

// Activate classes
const today = new Date();
const objUsers = new Users('users');
const objAccounts = new Account('account');

// Fixed values
const constVariableCost = 'Variabel kostnad';
const constFixedCost = 'Fast kostnad';

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

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

    // Show header
    showHeader();

    // Show filter
    showFilter();

    // Show account
    showAccounts();

    // Create events
    createEvents();
  }
}

// Make events for accounts
function createEvents() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterFixedCost')) {

      filterSync();

      async function filterSync() {

        await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

        showAccounts();
      }
    };
  });

  // update a accounts row
  document.addEventListener('change', (event) => {

    if ([...event.target.classList].some(cls => cls.startsWith('fixedCost'))
      || [...event.target.classList].some(cls => cls.startsWith('name'))) {

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

      /*
      if ([...event.target.classList].some(cls => cls.startsWith('fixedCost'))
        || [...event.target.classList].some(cls => cls.startsWith('name'))) {
  
        const className = objAccounts.getNameClass(event.target);
        const accountId = Number(className.substring(4));
  
        updateAccountRowSync();
      */

      // Update a accounts row
      async function updateAccountRowSync() {

        updateAccountsRow(accountId);
      }
    };
  });
  /*
  // Fixed cost
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('fixedCost'))) {

      const className = objAccounts.getFixedCostClass(event.target);
      const accountId = Number(className.substring(9));

      updateFixedCostSync();

      // Update condoId
      async function updateFixedCostSync() {

        updateAccountsRow('fixedCost', className, accountId);
      }
    };
  });

  // Update name
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('name'))) {

      const className = objAccounts.getNameClass(event.target);
      const accountId = className.substring(4);
      updateNameSync();

      // Update amount
      async function updateNameSync() {

        updateAccountsRow('name', className, accountId);
      }
    };
  });
  */

  // Delete accounts row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const className = objAccounts.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteAccountRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteAccountRowValue === "Ja") {

        const accountId = Number(className.substring(6));
        deleteAccountSync();

        async function deleteAccountSync() {

          deleteAccountRow(accountId, className);

          await objAccounts.loadAccountsTable(objUserPassword.condominiumId);

          showAccounts();
        };
      };
    };
  });
}

// Check for valid values
function validateValues() {

  // Check account Name
  const accountName = document.querySelector('.input-accounts-accountName').value;
  const validName = objAccounts.validateText(accountName, "label-accounts-accountName", "Kontonavn");

  const fixedCost = document.querySelector('.select-accounts-fixedCost').value;
  const validFixedCost = objAccounts.validateText(fixedCost, "label-accounts-fixedCost", fixedCost);

  return (validName && validFixedCost) ? true : false;
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

function showHeader() {

  // Start table
  const style = 'width: 50%';
  let html = startHTMLTable(style);

  // Main header
  html += showHTMLMainTableHeader('', 'Konto', '', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  const style = 'width: 50%';
  html = startHTMLTable(style);

  // Header filter for search
  html += showHTMLFilterHeader('', 'Kostnadstype', '', '');

  // Filter for search
  html += showHTMLFilterSearch();

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Filter for search
function showHTMLFilterSearch() {

  let html =
    `
      <tr>
        <td></td>
    `;

  // fixed or not fixed cost
  html += objAccounts.showSelectedValuesNew('filterFixedCost', 'Alle', constFixedCost, constVariableCost, 'Alle');
  html +=
    `
      </tr>
    `;

  return html;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "<tr>";

  // Show menu
  html += objAccounts.menuNew(rowNumber - 1);

  // delete
  html += "<td class='center'>Ny konto</td>";

  // Fixed cost
  html += objAccounts.showSelectedValuesNew('fixedCost0', constFixedCost, constFixedCost, constVariableCost);

  // name
  html += objAccounts.showInputHTMLNew('name0', "", 45);

  html += "</tr>";
  return html;
}

// Show table sum row
function showTableSumRow(rowNumber, amount) {

  let html = "<tr>";

  // Show menu
  html += objAccounts.menuNew(rowNumber - 1);

  // condo
  html += "<td></td>";
  // Date
  html += "<td></td>";
  // account
  html += "<td></td>";
  // text sum
  html += "<td class='right bold'>Sum</td>";
  // Amount
  html += `<td class="center bold">${amount}</td>`;
  // Text
  html += "<td></td>";
  html += "</tr>"

  return html;
}

// Show accounts
function showAccounts() {

  // Start HTML table
  const style = 'width: 50%';
  html = startHTMLTable(style);

  // Header
  html += showHTMLMainTableHeader('Meny', 'Slett', 'Kostnadstype', 'Tekst');

  //let sumAmount = 0;
  let rowNumber = 0;

  objAccounts.arrayAccounts.forEach((account) => {

    rowNumber++;

    html += "<tr>";

    // Show menu
    html += objAccounts.menuNew(rowNumber - 1);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    switch (account.deleted) {
      case 'Y': {

        selectedChoice = "Ja";
        break;
      }
      case 'N': {

        selectedChoice = "Nei";
        break;
      }
      default: {

        selectedChoice = "Ugyldig verdi";
        break
      }
    }
    let className = `delete${account.accountId}`;
    html += objAccounts.showSelectedValuesNew(className, selectedChoice, 'Nei', 'Ja')

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
    html += objAccounts.showSelectedValuesNew(className, selectedChoice, constFixedCost, constVariableCost)

    // name
    const name = account.name;
    className = `name${account.accountId}`;
    html += objAccounts.showInputHTMLNew(className, name, 45);

    html += "</tr>";
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  /*
  // Show table sum row
  rowNumber++;
  sumAmount = formatOreToKroner(sumAmount);
  html += showTableSumRow(rowNumber, sumAmount);
  */

  // Show the rest of the menu
  rowNumber++;
  html += showRestMenu(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.account').innerHTML = html;
}

// Show the rest of the menu
function showRestMenu(rowNumber) {

  let html = "";
  for (; objAccounts.arrayMenu.length > rowNumber; rowNumber++) {

    html += "<tr>";

    // Show menu
    html += objAccounts.menuNew(rowNumber - 1);
    html += "</tr>"
  }

  // The end of the table
  html += endHTMLTable();
  return html;
  //document.querySelector('.account').innerHTML = html;
}

// Delete one account row
async function deleteAccountRow(accountId, className) {

  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  // Check if account row exist
  accountsRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
  if (accountsRowNumber !== -1) {

    // delete account row
    objAccounts.deleteAccountsTable(accountId, user, lastUpdate);
  }

  await objAccounts.loadAccountsTable(objUserPassword.condominiumId);
}

// Update a accounts table row
async function updateAccountsRow(accountId) {

  accountId = Number(accountId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  // name
  className = `.name${bankAccountTransactionId}`;
  const name = document.querySelector(className).value;
  const validName = objBankAccountTransactions.validateTextNew(name);

  className = `.fixedCost${accountId}`;
  let fixedCost = document.querySelector(className).value;
  if (fixedCost === constFixedCost) fixedCost = 'Y';
  if (fixedCost === constVariableCost) fixedCost = 'N';

  // Validate accounts columns
  if (validName && (fixedCost === "Y" || fixedCost === "N")) {

    // Check if the account id exist
    accountRowNumber = objAccounts.arrayAccounts.findIndex(account => account.accountId === accountId);
    if (accountRowNumber !== -1) {

      // update the accounts row
      await objAccounts.updateAccountsTable(user, accountId, fixedCost, lastUpdate, name);

    } else {

      // Insert the account row in accounts table
      await objAccounts.insertAccountsTable(condominiumId, user, lastUpdate, accountName, fixedCost, accountName);
    }

    await objAccounts.loadAccountsTable(condominiumId);
    showAccounts();
  }
}