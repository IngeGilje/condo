// Due maintenance

// Activate objects
const today = new Date();
const objUsers = new Users('users');
const objCondo = new Condo('condo');
const objAccounts = new Account('account');
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
      await objUsers.loadUsersTable(condominiumId);
      await objCondo.loadCondoTable(condominiumId);
      await objAccounts.loadAccountsTable(condominiumId);

      const accountId = 999999999;
      const condoId = 999999999;
      const year = String(today.getFullYear());
      const fromDate = year + "0101";
      let toDate = getCurrentDate();
      toDate = Number(convertDateToISOFormat(toDate));
      await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

      // Show header
      showHeader();

      // Show filter
      showFilter();

      // Show result
      showResult();

      // Create events
      createEvents();
    }
  }
}

// Make due events
function createEvents() {

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

        showResult();
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
        prefix = prefixes.find(p => className.startsWith(p));
        dueId = Number(className.slice(prefix.length));
      }
      /*
      // get class
      if (objDues.getClassByPrefix(event.target,'condo')) className = objDues.getClassByPrefix(event.target,'condo');
      if (objDues.getClassByPrefix(event.target,'account')) className = objDues.getClassByPrefix(event.target,'account');
      if (objDues.getClassByPrefix(event.target,'amount')) className = objDues.getClassByPrefix(event.target,'amount');
      if (objDues.getClassByPrefix(event.target,'date')) className = objDues.getClassByPrefix(event.target,'date');
      if (objDues.getClassByPrefix(event.target,'text')) className = objDues.getClassByPrefix(event.target,'text');

      // get number after prefix (rownumber)
      if (className.startsWith('condo')) dueId = Number(className.substring(5));
      if (className.startsWith('account')) dueId = Number(className.substring(7));
      if (className.startsWith('amount')) dueId = Number(className.substring(6));
      if (className.startsWith('date')) dueId = Number(className.substring(4));
      if (className.startsWith('text')) dueId = Number(className.substring(4));

      if (objDues.getCondoClass(event.target)) className = objDues.getCondoClass(event.target);
      if (objDues.getAccountClass(event.target)) className = objDues.getAccountClass(event.target);
      if (objDues.getAmountClass(event.target)) className = objDues.getAmountClass(event.target);
      if (objDues.getDateClass(event.target)) className = objDues.getDateClass(event.target);
      if (objDues.getTextClass(event.target)) className = objDues.getTextClass(event.target);

      if (objDues.getCondoClass(event.target)) dueId = Number(className.substring(7));
      if (objDues.getAccountClass(event.target)) dueId = Number(className.substring(9));
      if (objDues.getAmountClass(event.target)) dueId = className.substring(6);
      if (objDues.getDateClass(event.target)) dueId = className.substring(4);
      if (objDues.getTextClass(event.target)) dueId = className.substring(4);
      */

      updateDuesSync();

      // Update a dues row
      async function updateDuesSync() {

        updateDuesRow(dueId);
      }
    };
  });

  /*
  // Update condo id
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('condo'))) {

      const className = objDues.getCondoClass(event.target);
      const dueId = Number(className.substring(5));

      updateCondoIdSync();

      // Update condoId
      async function updateCondoIdSync() {

        updateDuesRow('condoId', className, dueId);
      }
    };
  });

  // Update account id
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('account'))) {

      const className = objDues.getAccountClass(event.target);
      const dueId = Number(className.substring(7));

      updateAccountIdSync();

      // Update amount
      async function updateAccountIdSync() {

        updateDuesRow('accountId', className, dueId);
      }
    };
  });

  // Update amount
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('amount'))) {

      const className = objDues.getAmountClass(event.target);
      const dueId = className.substring(6);
      updateAmountSync();

      // Update amount
      async function updateAmountSync() {

        updateDuesRow('amount', className, dueId);
      }
    };
  });

  // Update date
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('date'))) {

      const className = objDues.getDateClass(event.target);
      const dueId = className.substring(5);
      updateDateSync();

      // Update amount
      async function updateDateSync() {

        updateDuesRow('date', className, dueId);
      }
    };
  });

  // Update text
  document.addEventListener('change', (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('text'))) {

      const className = objDues.getTextClass(event.target);
      const dueId = className.substring(4);
      updateTextSync();

      // Update amount
      async function updateTextSync() {

        updateDuesRow('text', className, dueId);
      }
    };
  });
  */

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

          showResult();
        };
      };
    };
  });
}

// Check for valid values
function validateValues(dueId) {

  // Check for valid condo Id
  const condoId = document.querySelector('.select-dues-condoId').value;
  const validCondoId = validateNumber(condoId, 1, 99999, 'dues-condoId', 'Leilighet');

  // Check for valid account Id
  const accountId = document.querySelector('.select-dues-accountId').value;
  const validAccountId = validateNumber(condoId, 1, 99999, 'dues-accountId', 'Konto');

  // Check for valid date
  const date = document.querySelector('.input-dues-date').value;
  const validDate = validateNorDate(date, 'dues-date', 'Dato');

  // Check amount
  const amount = formatToNorAmount(document.querySelector('.input-dues-amount').value);
  const validAmount = objDues.validateNorAmount(amount, "dues-amount", "Månedsbetaling");

  // Check text
  const text = document.querySelector('.input-dues-text').value;
  const validText = objDues.validateText(text, "label-dues-text", "Tekst");

  return (validAccountId && validCondoId && validDate && validAmount && validText) ? true : false;
}

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
      objCondo.selectCondoId(condoId, 'dues-condoId');

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

// Show header
function showHeader() {

  // Start table
  let html = startHTMLTable();

  // Main header
  html += showHTMLMainTableHeader('', '', '', 'Forfall', '', '', '');

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter() {

  // Start table
  html = startHTMLTable();

  // Header filter for search
  html += showHTMLFilterHeader('', 'Leilighet', 'Velg konto', 'Fra dato', 'Til dato','','');

  // Filter for search
  html += showHTMLFilterSearch();

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.filter').innerHTML = html;
}

// Filter for search
function showHTMLFilterSearch() {

  let html = "<tr><td></td>";

  // Show all selected condos
  html += objCondo.showSelectedCondosNew('filterCondoId', 'width:100px;', 0, 'Alle', '');

  // Show all selected accounts
  html += objAccounts.showSelectedAccountsNew('filterAccountId', '', 0, 'Alle', '');

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objDues.showInputHTMLNew('filterFromDate', fromDate, 10);

  // show to date
  html += objDues.showInputHTMLNew('filterToDate', getCurrentDate(), 10);

  html += "</tr>";

  return html;
}

// Show dues
function showResult() {

  // Start HTML table
  html = startHTMLTable();

  // Header
  html += showHTMLMainTableHeader('Meny', 'Slett', 'Leilighet', 'Dato', 'Konto', 'Beløp', 'Tekst');

  let sumAmount = 0;
  let rowNumber = 0;

  objDues.arrayDues.forEach((due) => {

    rowNumber++;

    html += '<tr class="menu">';

    // Show menu
    html += objDues.menuNew(rowNumber - 1);

    // Delete
    let selectedChoice = "Ugyldig verdi";
    switch (due.deleted) {
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

    let className = `delete${due.dueId}`;
    html += objDues.showSelectedValuesNew(className, 'width:75px;', selectedChoice,'Nei', 'Ja')

    // condos
    className = `condo${due.dueId}`;
    html += objCondo.showSelectedCondosNew(className, '', due.condoId, '', 'Ingen er valgt');

    // Date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objDues.showInputHTMLNew(className, date, 10);

    // accounts
    className = `account${due.dueId}`;
    html += objAccounts.showSelectedAccountsNew(className, '', due.accountId, '', 'Ingen er valgt');

    // due amount
    const amount = formatOreToKroner(due.amount);
    className = `amount${due.dueId}`;
    html += objDues.showInputHTMLNew(className, amount, 10);

    // text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objDues.showInputHTMLNew(className, text, 10);

    html +=
      `
        </tr>
      `;

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
  html += showRestMenu(rowNumber);

  // The end of the table
  html += endHTMLTable();
  document.querySelector('.result').innerHTML = html;

}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "<tr>";

  // Show menu
  html += objDues.menuNew(rowNumber - 1);

  // delete
  html += "<td class='center bold'>Nytt forfall</td>";

  // condos
  html += objCondo.showSelectedCondosNew("condo0", '', 0, '', 'Ingen er valgt');

  // Date
  html += objDues.showInputHTMLNew("date0", "", 10);

  // accounts
  html += objAccounts.showSelectedAccountsNew("account0", '', 0, '', 'Ingen er valgt');

  // due amount
  html += objDues.showInputHTMLNew('amount0', "", 10);

  // text
  html += objDues.showInputHTMLNew('text0', "", 10);

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
  html += objDues.menuNew(rowNumber - 1);

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

// Show the rest of the menu
function showRestMenu(rowNumber) {

  let html = "";
  for (; objDues.arrayMenu.length > rowNumber; rowNumber++) {

    html +=
      `
        <tr 
          class="menu"
        >
      `;
    // Show menu
    html += objDues.menuNew(rowNumber - 1);
    html +=
      `
        </tr>
      `;
  }

  return html;
}

// Delete dues row
async function deleteDuesRow(dueId, className) {

  const user = objUserPassword.email;
  const lastUpdate = today.toISOString();

  // Check if dues row exist
  duesRowNumber = objDues.arrayDues.findIndex(due => due.dueId === dueId);
  if (duesRowNumber !== -1) {

    // delete dues row
    objDues.deleteDuesTable(dueId, user, lastUpdate);
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
  const lastUpdate = today.toISOString();

  // Check dues columns
  let className = `.condo${dueId}`;
  let condoId = Number(document.querySelector(className).value);

  className = `.account${dueId}`;
  let accountId = Number(document.querySelector(className).value);

  className = `.amount${dueId}`;
  amount = Number(formatKronerToOre(document.querySelector(`${className}`).value));

  className = `.date${dueId}`;
  date = Number(convertDateToISOFormat(document.querySelector(`${className}`).value));

  className = `.text${dueId}`;
  let text = document.querySelector(className).value;
  const validText = objDues.validateTextNew(text);

  // Validate dues columns
  if ((accountId => 1 && accountId <= 999999999)
    && (condoId => 1 && condoId <= 999999999)
    && (amount => 0 && amount <= 999999999)
    && (date => 20000101 && date <= 20991231)
    && validText ) {

    // Check if the dues row exist
    duesRowNumber = objDues.arrayDues.findIndex(dues => dues.dueId === dueId);
    if (duesRowNumber !== -1) {

      // update the dues row
      await objDues.updateDuesTable(dueId, user, lastUpdate, condoId, accountId, amount, date, text);

    } else {

      // Insert the account row in accounts table
      await objDues.insertDuesTable(condominiumId, user, lastUpdate, condoId, accountId, amount, date, text);
    }

    const condominiumId = Number(objUserPassword.condominiumId);
    condoId = Number(document.querySelector('.filterCondoId').value);
    accountId = Number(document.querySelector('.filterAccountId').value);
    let fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(formatNorDateToNumber(fromDate));
    let toDate = document.querySelector('.filterToDate').value;
    toDate = Number(formatNorDateToNumber(toDate));
    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
    
    showResult();
  }
}