// Due maintenance

// Activate objects
const today = new Date();
const objUsers = new User('user');
const objCondos = new Condo('condo');
const objAccounts = new Account('account');
const objCondominiums = new Condominium('condominium');
const objDues = new Due('due');

testMode();

// Exit application if no activity for 1 hour
//exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();

  // Main entry point
  async function main() {

    // Call main when script loads
    main();

    // Main entry point
    async function main() {

      const condominiumId = Number(objUserPassword.condominiumId);
      const resident = 'Y';
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      await objCondos.loadCondoTable(condominiumId);
      await objCondominiums.loadCondominiumsTable();
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

      // Show header
      let menuNumber = 0;
      showHeader();

      // Show filter

    showFilter()

      const accountId = Number(document.querySelector('.filterAccountId').value);
      const condoId = Number(document.querySelector('.filterCondoId').value);

      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = formatNorDateToNumber(fromDate);

      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatNorDateToNumber(toDate);

      await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

      // Show result
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  }
}

// Make due events
function events() {

  // Filter
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('filterAccountId')
      || event.target.classList.contains('filterCondoId')
      || event.target.classList.contains('filterFromDate')
      || event.target.classList.contains('filterToDate')) {

      filterSync();

      async function filterSync() {

        const condominiumId = Number(objUserPassword.condominiumId);
        const condoId = Number(document.querySelector('.filterCondoId').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        let fromDate = document.querySelector('.filterFromDate').value;
        fromDate = Number(formatNorDateToNumber(fromDate));
        let toDate = document.querySelector('.filterToDate').value;
        toDate = Number(formatNorDateToNumber(toDate));
        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });

  // update a dues row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('condo'))
      || [...event.target.classList].some(cls => cls.startsWith('account'))
      || [...event.target.classList].some(cls => cls.startsWith('amount'))
      || [...event.target.classList].some(cls => cls.startsWith('date'))
      || [...event.target.classList].some(cls => cls.startsWith('text'))) {

      const arrayPrefixes = ['condo', 'account', 'amount', 'date', 'text'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let dueId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        dueId = Number(className.slice(prefix.length));
      }

      updateDuesSync();

      // Update a dues row
      async function updateDuesSync() {

        updateDuesRow(dueId);
      }
    };
  });

  // Delete dues row
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const className = objDues.getDeleteClass(event.target);
      const classNameDelete = `.${className}`
      const deleteDueRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteDueRowValue === "Ja") {

        //const className = objBudgets.getDeleteClass(event.target);
        const dueId = Number(className.substring(6));
        deleteBudgetSync();

        async function deleteBudgetSync() {

          deleteDuesRow(dueId, className);

          const condominiumId = Number(objUserPassword.condominiumId);
          const condoId = Number(document.querySelector('.filterCondoId').value);
          const accountId = Number(document.querySelector('.filterAccountId').value);
          let fromDate = document.querySelector('.filterFromDate').value;
          fromDate = Number(formatNorDateToNumber(fromDate));
          let toDate = document.querySelector('.filterToDate').value;
          toDate = Number(formatNorDateToNumber(toDate));
          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });
}

/*
// Show values for due
function showValues(dueId) {

  dueId = Number(dueId);

  // Check for valid due Id
  if (dueId >= 0) {

    // Check if due Id exist
    const dueRowNumber = objDues.arrayDues.findIndex(due => due.dueId === dueId);
    if (dueRowNumber !== -1) {

      // Show due id
      document.querySelector('.select-dues-dueId').value = objDues.arrayDues[dueRowNumber].dueId;

      // Show condo id
      const condoId = objDues.arrayDues[dueRowNumber].condoId;
      objCondos.selectCondoId(condoId, 'dues-condoId');

      // Show account id
      const accountId = objDues.arrayDues[dueRowNumber].accountId;
      objAccounts.selectAccountId(accountId, 'dues-accountId');

      // Show due date
      const dueDate = formatToNorDate(objDues.arrayDues[dueRowNumber].date);
      document.querySelector('.input-dues-date').value = dueDate;

      // Show amount
      document.querySelector('.input-dues-amount').value = formatOreToKroner(objDues.arrayDues[dueRowNumber].amount);

      // Show text
      document.querySelector('.input-dues-text').value = objDues.arrayDues[dueRowNumber].text;
    }
  }
}
*/

// Filter for search
function showHTMLFilterSearch() {

  let html = "<tr><td></td>";

  // Show all selected condos
  html += objCondos.showSelectedCondosNew('filterCondoId', 'width:100px;', 0, '', 'Alle');

  // Show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, '', 'Alle');

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objDues.showInputHTMLNew('filterFromDate', fromDate, 10);

  // show to date
  html += objDues.showInputHTMLNew('filterToDate', getCurrentDate(), 10);

  html += "</tr>";

  return html;
}

// Show dues
function showResult(rowNumber) {

  // Start HTML table
  html = startHTMLTable('width:1100px;');

  // Header
  rowNumber++;
  html += objDues.showTableHeaderNew("width:750px;", '', 'Slett', 'Leilighet', 'Dato', 'Konto', 'Beløp', 'Tekst');

  let sumAmount = 0;

  objDues.arrayDues.forEach((due) => {

    rowNumber++;

    html += '<tr class="menu">';

    // Show menu
    html += objDues.menuNew(rowNumber);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (due.deleted === 'Y') selectedChoice = "Ja";
    if (due.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${due.dueId}`;
    html += objDues.showSelectedValuesNew(className, 'width:75px;', selectedChoice, 'Nei', 'Ja')

    // condos
    className = `condoId${due.dueId}`;
    html += objCondos.showSelectedCondosNew(className, 'width:100px;', due.condoId, 'ngen er valgt', '');

    // Date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objDues.showInputHTMLNew(className, date, 10);

    // accounts
    className = `accountId${due.dueId}`;
    html += objAccounts.showSelectedAccountsNew(className, '', due.accountId, 'Ingen er valgt', '');

    // due amount
    const amount = formatOreToKroner(due.amount);
    className = `amount${due.dueId}`;
    html += objDues.showInputHTMLNew(className, amount, 10);

    // text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objDues.showInputHTMLNew(className, text, 45);

    html += "</tr>";

    // accumulate
    sumAmount += Number(due.amount);
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // Show table sum row
  rowNumber++;
  sumAmount = formatOreToKroner(sumAmount);
  html += showTableSumRow(rowNumber, sumAmount);

  // Show the rest of the menu
  rowNumber++;
  html += objDues.showRestMenuNew(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "<tr>";

  // Show menu
  html += objDues.menuNew(rowNumber);

  // delete
  html += "<td class='center bold'>Nytt forfall</td>";

  // condoId
  const condoId = Number(document.querySelector('.filterCondoId').value);
  html += objCondos.showSelectedCondosNew("condoId0", 'width:100px;', condoId, '', '');

  // Date
  html += objDues.showInputHTMLNew("date0", "", 10);

  // accountId
  const accountId = Number(document.querySelector('.filterAccountId').value);
  html += objAccounts.showSelectedAccountsNew("accountId0", '', accountId, '', '');

  // due amount
  html += objDues.showInputHTMLNew('amount0', "", 10);

  // text
  html += objDues.showInputHTMLNew('text0', "", 45);

  html += "</tr>";
  return html;
}

// Show table sum row
function showTableSumRow(rowNumber, amount) {

  let html =
    `
      <tr 
        class="menu"
      >
    `;
  // Show menu
  html += objDues.menuNew(rowNumber);

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
  html +=
    `
      </tr>
    `;

  return html;
}

// Delete dues row
async function deleteDuesRow(dueId, className) {

  const user = objUserPassword.email;


  // Check if dues row exist
  duesRowNumber = objDues.arrayDues.findIndex(due => due.dueId === dueId);
  if (duesRowNumber !== -1) {

    // delete dues row
    objDues.deleteDuesTable(dueId, user);
  }

  const condominiumId = Number(objUserPassword.condominiumId);
  const condoId = Number(document.querySelector('.filterCondoId').value);
  const accountId = Number(document.querySelector('.filterAccountId').value);
  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(formatNorDateToNumber(fromDate));
  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(formatNorDateToNumber(toDate));
  await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
}

// Update a dues row
async function updateDuesRow(dueId) {

  dueId = Number(dueId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;

  // Check dues columns
  let className = `.condoId${dueId}`;
  const condoId = Number(document.querySelector(className).value);
  const validCondoId = validateNumberNew(condoId, 1, 999999999);

  className = `.accountId${dueId}`;
  const accountId = Number(document.querySelector(className).value);
  const validAccountId = validateNumberNew(accountId, 1, 999999999);

  className = `.amount${dueId}`;
  const amount = Number(formatKronerToOre(document.querySelector(`${className}`).value));
  const validAmount = validateNumberNew(amount, -999999999, 999999999);

  className = `.date${dueId}`;
  const date = Number(convertDateToISOFormat(document.querySelector(`${className}`).value));
  const validDate = validateNumberNew(date, 20200101, 20991231);

  className = `.text${dueId}`;
  const text = document.querySelector(className).value;
  const validText = objDues.validateTextNew(text, 3, 45);

  // Validate dues columns
  if (validAccountId && validCondoId && validAmount && validDate && validText) {

    // Check if the dues row exist
    duesRowNumber = objDues.arrayDues.findIndex(dues => dues.dueId === dueId);
    if (duesRowNumber !== -1) {

      // update the dues row
      await objDues.updateDuesTable(dueId, user, condoId, accountId, amount, date, text);

    } else {

      // Insert the account row in accounts table
      await objDues.insertDuesTable(condominiumId, user, condoId, accountId, amount, date, text);
    }

    //condoId = Number(document.querySelector('.filterCondoId').value);
    //accountId = Number(document.querySelector('.filterAccountId').value);
    let fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(formatNorDateToNumber(fromDate));
    let toDate = document.querySelector('.filterToDate').value;
    toDate = Number(formatNorDateToNumber(toDate));
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable('width:1100px;');

  // Main header
  html += showHTMLMainTableHeader('widht:250px;', 'Forfall');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable('width:1100px;');

  // Header filter for search
  html += objDues.showHTMLFilterHeader("width:200px;", 0, '', '', '', '', '', '', '');
  html += objDues.showHTMLFilterHeader('', 0, '', '', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato');

  // Filter for search
  html += "<tr>";

  html += "<td></td><td></td>";

  // Show all selected condos
  html += objCondos.showSelectedCondosNew('filterCondoId', 'width:100px;', 0, '', '');

  // Get condominiumId
  const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === Number(objUserPassword.condominiumId));
  if (condominiumsRowNumber !== -1) {

    const commonCostAccountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccounts.showSelectedAccountsNew('filterAccountId', '', commonCostAccountId, '', '');

    // show from date
    const fromDate = '01.01.' + String(today.getFullYear());
    html += objDues.showInputHTMLNew('filterFromDate', fromDate, 10);

    // show to date
    // Current date
    let toDate = getCurrentDate();

    // Next year
    toDate = Number(convertDateToISOFormat(toDate)) + 10000;
    toDate = formatToNorDate(toDate);
    html += objDues.showInputHTMLNew('filterToDate', toDate, 10);

    html += "</tr>";

    // Header filter for search
    html += objDues.showHTMLFilterHeader("width:750px;", 0, '', '', '', '', '', '', '');

    // The end of the table
    html += endHTMLTable();
    document.querySelector('.filter').innerHTML = html;

    // show icons
    objDues.showIconNew('filterCondoId');
    objDues.showIconNew('filterAccountId');
    objDues.showIconNew('filterFromDate');
    objDues.showIconNew('filterToDate');
  }
}