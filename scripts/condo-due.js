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
exitIfNoActivity();

// Validate user/password
const objUserPassword = JSON.parse(sessionStorage.getItem('user'));
if (!(objUserPassword && typeof objUserPassword.email !== 'undefined')) {

  window.location.href =
    'http://localhost/condo-login.html';
} else {

  // Call main when script loads
  main();
  async function main() {

    // Check if server is running
    if (await objUsers.checkServer()) {

      const condominiumId = Number(objUserPassword.condominiumId);
      const resident = 'Y';
      await objUsers.loadUsersTable(objUserPassword.condominiumId, resident);
      await objCondos.loadCondoTable(condominiumId);
      await objCondominiums.loadCondominiumsTable();
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objUserPassword.condominiumId, fixedCost);

      let menuNumber = 0;

      // Show horizontal menu
      showHorizontalMenu();

      // Show header
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objDues.formatNorDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objDues.formatNorDateToNumber(toDate));

      await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

      // Show result
      menuNumber = showResult(menuNumber);

      // Events
      events();
    } else {

      objDues.showMessage(objDues, 'Server condo-server.js har ikke startet.');
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
        fromDate = Number(objDues.formatNorDateToNumber(fromDate));
        let toDate = document.querySelector('.filterToDate').value;
        toDate = Number(objDues.formatNorDateToNumber(toDate));

        await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      }
    };
  });

  // update a dues row
  document.addEventListener('change', (event) => {

    const arrayPrefixes = ['condoId', 'accountId', 'amount', 'date', 'kilowattHour', 'text'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[4]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[5]))) {

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

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const classNameDelete = `.${className}`
      const deleteDueRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteDueRowValue === "Ja") {

        //const className = objBudgets.getDeleteClass(event.target);
        const dueId = Number(className.substring(6));
        deleteBudgetSync();

        async function deleteBudgetSync() {

          deleteDueRow(dueId, className);

          const condominiumId = Number(objUserPassword.condominiumId);
          const condoId = Number(document.querySelector('.filterCondoId').value);
          const accountId = Number(document.querySelector('.filterAccountId').value);
          let fromDate = document.querySelector('.filterFromDate').value;
          fromDate = Number(objDues.formatNorDateToNumber(fromDate));
          let toDate = document.querySelector('.filterToDate').value;
          toDate = Number(objDues.formatNorDateToNumber(toDate));

          await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

          let menuNumber = 0;
          menuNumber = showResult(menuNumber);
        };
      };
    };
  });
}

// Show dues
function showResult(rowNumber) {

  // start table
  let html = objCondos.startTable('width:1500px;');

  // table header
  rowNumber++;
  html += objCondos.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, '1 Slett', '2 Leilighet', '3 Dato', '4 Konto', '5 Beløp', '6 kilowatt Timer', '7 Tekst');

  let sumAmount = 0;
  let sumKilowattHour = 0;

  objDues.arrayDues.forEach((due) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominiums.insertTableColumns('', rowNumber)

    // Delete
    let selectedChoice = "Ugyldig verdi";
    if (due.deleted === 'Y') selectedChoice = "Ja";
    if (due.deleted === 'N') selectedChoice = "Nei";

    let className = `delete${due.dueId}`;
    html += objDues.showSelectedValues(className, 'width:175px;', selectedChoice, 'Nei', 'Ja')

    // condos
    className = `condoId${due.dueId}`;
    html += objCondos.showSelectedCondos(className, 'width:175px;', due.condoId, 'ngen er valgt', '');

    // Date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objDues.inputTableColumn(className, date, 10);

    // accounts
    className = `accountId${due.dueId}`;
    html += objAccounts.showSelectedAccounts(className, '', due.accountId, 'Ingen er valgt', '');

    // due amount
    const amount = formatOreToKroner(due.amount);
    className = `amount${due.dueId}`;
    html += objDues.inputTableColumn(className, amount, 10);

    // kilowattHour
    const kilowattHour = formatOreToKroner(due.kilowattHour);
    className = `kilowattHour${due.dueId}`;
    html += objDues.inputTableColumn(className, kilowattHour, 10);

    // text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objDues.inputTableColumn(className, text, 45);

    html += "</tr>";

    // accumulate
    sumAmount += Number(due.amount);
    sumKilowattHour += Number(due.kilowattHour);
  });

  // Make one last table row for insertion in table 

  // Insert empty table row for insertion
  rowNumber++;
  html += insertEmptyTableRow(rowNumber);

  // Show table sum row
  rowNumber++;
  sumAmount = formatOreToKroner(sumAmount);
  sumKilowattHour = formatOreToKroner(sumKilowattHour);
  html += objDues.insertTableColumns('font-weight: 600;', rowNumber, '', '', '', 'Sum', sumAmount, sumKilowattHour);

  // Show the rest of the menu
  rowNumber++;
  html += objDues.showRestMenu(rowNumber);

  // The end of the table
  html += objDues.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";

  // insert table columns in start of a row
  html += objCondominiums.insertTableColumns('', rowNumber, 'Nytt forfall');

  // condoId
  const condoId = Number(document.querySelector('.filterCondoId').value);
  html += objCondos.showSelectedCondos("condoId0", 'width:175px;', condoId, '', '');

  // Date
  html += objDues.inputTableColumn("date0", "", 10);

  // accountId
  let accountId = Number(document.querySelector('.filterAccountId').value);
  if (Number(document.querySelector('.filterAccountId').value) === objDues.nineNine) accountId = 0;
  html += objAccounts.showSelectedAccounts("accountId0", '', accountId, 'Ingen er valgt', '');

  // due amount
  html += objDues.inputTableColumn('amount0', "", 10);

  // text
  html += objDues.inputTableColumn('text0', "", 45);

  html += "</tr>";
  return html;
}

// Delete dues row
async function deleteDueRow(dueId, className) {

  const user = objUserPassword.email;


  // Check if dues row exist
  rowNumberDue = objDues.arrayDues.findIndex(due => due.dueId === dueId);
  if (rowNumberDue !== -1) {

    // delete dues row
    objDues.deleteDuesTable(dueId, user);
  }

  const condominiumId = Number(objUserPassword.condominiumId);
  const condoId = Number(document.querySelector('.filterCondoId').value);
  const accountId = Number(document.querySelector('.filterAccountId').value);
  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(objDues.formatNorDateToNumber(fromDate));
  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(objDues.formatNorDateToNumber(toDate));

  await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);
}

// Update a dues row
async function updateDuesRow(dueId) {

  dueId = Number(dueId);

  const condominiumId = Number(objUserPassword.condominiumId);
  const user = objUserPassword.email;

  // Check dues columns
  let className = `.condoId${dueId}`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId${dueId}`;
  const validCondoId = objCondos.validateNumber(className, condoId, 1, objDues.nineNine);

  className = `.accountId${dueId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${dueId}`;
  const validAccountId = objCondos.validateNumber(className, accountId, 1, objDues.nineNine);

  className = `.amount${dueId}`;
  const amount = Number(formatKronerToOre(document.querySelector(`${className}`).value));
  className = `amount${dueId}`;
  const validAmount = objCondos.validateNumber(className, amount, objDues.minusNineNine, objDues.nineNine);

  className = `.kilowattHour${dueId}`;
  const kilowattHour = Number(formatKronerToOre(document.querySelector(`${className}`).value));
  className = `kilowattHour${dueId}`;
  const validKilowattHour = objCondos.validateNumber(className, kilowattHour, 0, objDues.nineNine);

  className = `.date${dueId}`;
  const date = Number(convertDateToISOFormat(document.querySelector(`${className}`).value));
  className = `date${dueId}`;
  const validDate = objCondos.validateNumber(className, date, 20200101, 20991231);

  className = `.text${dueId}`;
  const text = document.querySelector(className).value;
  const validText = objDues.validateText(text, 3, 45);

  // Validate dues columns
  if (validAccountId && validCondoId && validAmount && validDate && validKilowattHour && validText) {

    // Check if the dues row exist
    rowNumberDue = objDues.arrayDues.findIndex(dues => dues.dueId === dueId);
    if (rowNumberDue !== -1) {

      // update the dues row
      await objDues.updateDuesTable(dueId, user, condoId, accountId, amount, date, kilowattHour, text);

    } else {

      // Insert the account row in accounts table
      await objDues.insertDuesTable(condominiumId, user, condoId, accountId, amount, date, kilowattHour, text);
    }

    condoId = Number(document.querySelector('.filterCondoId').value);
    accountId = Number(document.querySelector('.filterAccountId').value);
    let fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(objDues.formatNorDateToNumber(fromDate));
    let toDate = document.querySelector('.filterToDate').value;
    toDate = Number(objDues.formatNorDateToNumber(toDate));

    await objDues.loadDuesTable(condominiumId, accountId, condoId, fromDate, toDate);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

// Show header
function showHeader() {

  // Start table
  let html = objDues.startTable('width:1500px;');

  // show main header
  html += objDues.showTableHeader('width:175px;', 'Forfall');

  // The end of the table
  html += objDues.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objDues.startTable('width:1500px;');

  // Header filter
  rowNumber++;
  html += objDues.showTableHeaderMenu('width:175px;', rowNumber, '1', '2', '3 Leilighet', '4 Konto', '5 Fra dato', '6 Til dato','7');

  // start table body
  html += objDues.startTableBody();

  // insert table columns in start of a row
   rowNumber++;
  html += objDues.insertTableColumns('', rowNumber++, '1', '2');

  // Show all selected condos
  html += objCondos.showSelectedCondos('filterCondoId', 'width:175px;', 0);

  // Get condominiumId
  const condominiumsRowNumber = objCondominiums.arrayCondominiums.findIndex(condominium => condominium.condominiumId === Number(objUserPassword.condominiumId));
  if (condominiumsRowNumber !== -1) {

    const commonCostAccountId = objCondominiums.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccounts.showSelectedAccounts('filterAccountId', 'width:175px;', commonCostAccountId, '', 'Vis alle konti');
  }

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objDues.inputTableColumn('filterFromDate', fromDate, 10);

  // Current date
  let toDate = getCurrentDate();

  // Next year
  toDate = Number(convertDateToISOFormat(toDate)) + 10000;
  toDate = formatToNorDate(toDate);
  html += objDues.inputTableColumn('filterToDate', toDate, 10);

  html += "<td>7<td></tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objDues.insertTableColumns('', rowNumber, '1','2','3','4','5','6','7')

  // end table body
  html += objDues.endTableBody();

  // The end of the table
  html += objDues.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}

// show horizontal menu
function showHorizontalMenu() {

  html = objDues.showHorizontalMenu();

  document.querySelector('.horizontalMenu').innerHTML = html;
};