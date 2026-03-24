// Due maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objCondominium = new Condominium('condominium');
const objDue = new Due('due');

tableWidth = 'width:1450px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objDue.condominiumId === 0 || objDue.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1) ? 'http://ingegilje.no/condo-login.html' : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objDue.condominiumId, resident);
      await objCondo.loadCondoTable(objDue.condominiumId);
      await objCondominium.loadCondominiumsTable();
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objDue.condominiumId, fixedCost);

      let menuNumber = 0;

      // Show header
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber);

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objDue.formatNorDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objDue.formatNorDateToNumber(toDate));

      await objDue.loadDuesTable(objDue.condominiumId, accountId, condoId, fromDate, toDate);

      // Show result
      menuNumber = showResult(menuNumber);

      // Events
      events();
    }
  } else {

    objRemoteHeating.showMessage(objRemoteHeating, '', 'condo-server.js er ikke startet.');
  }
}

// Make due events
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterAccountId')
      || event.target.classList.contains('filterCondoId')
      || event.target.classList.contains('filterFromDate')
      || event.target.classList.contains('filterToDate')) {

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objDue.formatNorDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objDue.formatNorDateToNumber(toDate));

      await objDue.loadDuesTable(objDue.condominiumId, accountId, condoId, fromDate, toDate);

      let menuNumber = 0;
      menuNumber = showResult(menuNumber);
    };
  });

  // update a dues row
  document.addEventListener('change', async (event) => {

    const arrayPrefixes = ['condoId', 'accountId', 'amount', 'date', 'kilowattHour', 'text'];

    if ([...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[0]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[1]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[2]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[3]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[4]))
      || [...event.target.classList].some(cls => cls.startsWith(arrayPrefixes[5]))) {

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDue.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let dueId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        dueId = Number(className.slice(prefix.length));
      }

      // Update a dues row
      updateDuesRow(dueId);
    };
  });

  // Delete dues row
  document.addEventListener('change', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('delete'))) {

      const arrayPrefixes = ['delete'];

      // Find the first matching class
      const className = arrayPrefixes
        .map(prefix => objDue.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      const classNameDelete = `.${className}`
      const deleteDueRowValue = document.querySelector(`${classNameDelete}`).value;
      if (deleteDueRowValue === "Ja") {

        //const className = objBudget.getDeleteClass(event.target);
        const dueId = Number(className.substring(6));

        deleteDueRow(dueId, className);

        const condoId = Number(document.querySelector('.filterCondoId').value);
        const accountId = Number(document.querySelector('.filterAccountId').value);
        let fromDate = document.querySelector('.filterFromDate').value;
        fromDate = Number(objDue.formatNorDateToNumber(fromDate));
        let toDate = document.querySelector('.filterToDate').value;
        toDate = Number(objDue.formatNorDateToNumber(toDate));

        await objDue.loadDuesTable(objDue.condominiumId, accountId, condoId, fromDate, toDate);

        let menuNumber = 0;
        menuNumber = showResult(menuNumber);
      };
    };
  });
  // Log out
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('logOut')) {

      let url = (objDue.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      url = `${url}condo-login.html`;
      window.location.href = url;
    };
  });
}

// Show dues
function showResult(rowNumber) {

  // start table
  let html = objCondo.startTable(tableWidth);

  // table header
  rowNumber++;
  html += objCondo.showTableHeaderMenu('width:175px;background:#e0f0e0;', rowNumber, 'Slett', 'Leilighet', 'Dato', 'Konto', 'Beløp', 'kilowatt Timer', 'Tekst');

  let sumAmount = 0;
  let sumKilowattHour = 0;

  objDue.arrayDues.forEach((due) => {

    // insert table columns in start of a row
    rowNumber++;
    html += objCondominium.insertTableColumns('', rowNumber)

    // Delete
    let selected = "Ugyldig verdi";
    if (due.deleted === 'Y') selected = "Ja";
    if (due.deleted === 'N') selected = "Nei";

    let className = `delete${due.dueId}`;
    html += objDue.showSelectedValues(className, 'width:175px;', selected, disableChanges, 'Nei', 'Ja')

    // condos
    className = `condoId${due.dueId}`;
    html += objCondo.showSelectedCondos(className, 'width:175px;', due.condoId, 'ngen er valgt', '', disableChanges, disableChanges);

    // Date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objDue.inputTableColumn(className, '', date, 10, disableChanges);

    // accounts
    className = `accountId${due.dueId}`;
    html += objAccount.showSelectedAccounts(className, '', due.accountId, 'Ingen er valgt', '', disableChanges);

    // due amount
    const amount = formatOreToKroner(due.amount);
    className = `amount${due.dueId}`;
    html += objDue.inputTableColumn(className, '', amount, 10, disableChanges);

    // kilowattHour
    const kilowattHour = formatOreToKroner(due.kilowattHour);
    className = `kilowattHour${due.dueId}`;
    html += objDue.inputTableColumn(className, '', kilowattHour, 10, disableChanges);

    // text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objDue.inputTableColumn(className, '', text, 45, disableChanges);

    html += "</tr>";

    // accumulate
    sumAmount += Number(due.amount);
    sumKilowattHour += Number(due.kilowattHour);
  });

  // Make one last table row for insertion in table 

  if (!disableChanges) {
    
    // Insert empty table row for insertion
    rowNumber++;
    html += insertEmptyTableRow(rowNumber);
  }

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);
  sumKilowattHour = formatOreToKroner(sumKilowattHour);
  rowNumber++;
  html += objDue.insertTableColumns('font-weight: 600;', rowNumber, '', '', '', 'Sum', sumAmount, sumKilowattHour);

  // Show the rest of the menu
  rowNumber++;
  html += objDue.showRestMenu(rowNumber);

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.result').innerHTML = html;

  return rowNumber;
}

// Insert empty table row
function insertEmptyTableRow(rowNumber) {

  let html = "";

  // insert table columns in start of a row
  html += objCondominium.insertTableColumns('', rowNumber, 'Nytt forfall');

  // condoId
  const condoId = Number(document.querySelector('.filterCondoId').value);
  html += objCondo.showSelectedCondos("condoId0", 'width:175px;', condoId, '', '');

  // Date
  html += objDue.inputTableColumn("date0", '', "", 10);

  // accountId
  let accountId = Number(document.querySelector('.filterAccountId').value);
  if (Number(document.querySelector('.filterAccountId').value) === objDue.nineNine) accountId = 0;
  html += objAccount.showSelectedAccounts("accountId0", '', accountId, 'Ingen er valgt', '', (objDue.selected < 5));

  // due amount
  html += objDue.inputTableColumn('amount0', '', "", 10);

  // text
  html += objDue.inputTableColumn('text0', '', "", 45);

  html += "</tr>";
  return html;
}

// Delete dues row
async function deleteDueRow(dueId, className) {

  // Check if dues row exist
  rowNumberDue = objDue.arrayDues.findIndex(due => due.dueId === dueId);
  if (rowNumberDue !== -1) {

    // delete dues row
    objDue.deleteDuesTable(dueId, objDue.user);
  }

  const condoId = Number(document.querySelector('.filterCondoId').value);
  const accountId = Number(document.querySelector('.filterAccountId').value);
  let fromDate = document.querySelector('.filterFromDate').value;
  fromDate = Number(objDue.formatNorDateToNumber(fromDate));
  let toDate = document.querySelector('.filterToDate').value;
  toDate = Number(objDue.formatNorDateToNumber(toDate));

  await objDue.loadDuesTable(objDue.condominiumId, accountId, condoId, fromDate, toDate);
}

// Update a dues row
async function updateDuesRow(dueId) {

  dueId = Number(dueId);



  // Check dues columns
  let className = `.condoId${dueId}`;
  let condoId = Number(document.querySelector(className).value);
  className = `condoId${dueId}`;
  const validCondoId = objCondo.validateNumber(className, condoId, 1, objDue.nineNine);

  className = `.accountId${dueId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${dueId}`;
  const validAccountId = objCondo.validateNumber(className, accountId, 1, objDue.nineNine);

  className = `.amount${dueId}`;
  const amount = Number(formatKronerToOre(document.querySelector(`${className}`).value));
  className = `amount${dueId}`;
  const validAmount = objCondo.validateNumber(className, amount, objDue.minusNineNine, objDue.nineNine);

  className = `.kilowattHour${dueId}`;
  const kilowattHour = Number(formatKronerToOre(document.querySelector(`${className}`).value));
  className = `kilowattHour${dueId}`;
  const validKilowattHour = objCondo.validateNumber(className, kilowattHour, 0, objDue.nineNine);

  className = `.date${dueId}`;
  const date = Number(convertDateToISOFormat(document.querySelector(`${className}`).value));
  className = `date${dueId}`;
  const validDate = objCondo.validateNumber(className, date, 20200101, 20991231);

  className = `.text${dueId}`;
  const text = document.querySelector(className).value;
  const validText = objDue.validateText(text, 3, 45);

  // Validate dues columns
  if (validAccountId && validCondoId && validAmount && validDate && validKilowattHour && validText) {

    // Check if the dues row exist
    rowNumberDue = objDue.arrayDues.findIndex(dues => dues.dueId === dueId);
    if (rowNumberDue !== -1) {

      // update the dues row
      await objDue.updateDuesTable(dueId, objDue.user, condoId, accountId, amount, date, kilowattHour, text);

    } else {

      // Insert the account row in accounts table
      await objDue.insertDuesTable(objDue.condominiumId, objDue.user, condoId, accountId, amount, date, kilowattHour, text);
    }

    condoId = Number(document.querySelector('.filterCondoId').value);
    accountId = Number(document.querySelector('.filterAccountId').value);
    let fromDate = document.querySelector('.filterFromDate').value;
    fromDate = Number(objDue.formatNorDateToNumber(fromDate));
    let toDate = document.querySelector('.filterToDate').value;
    toDate = Number(objDue.formatNorDateToNumber(toDate));

    await objDue.loadDuesTable(objDue.condominiumId, accountId, condoId, fromDate, toDate);

    let menuNumber = 0;
    menuNumber = showResult(menuNumber);
  }
}

/*
// Show header
function showHeader() {

  // Start table
  let html = objDue.startTable(tableWidth);

  // show main header
  html += objDue.showTableHeader('width:175px;', 'Forfall');

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.header').innerHTML = html;
}
*/

// Show header
function showHeader() {

  // Start table
  html = objDue.startTable(tableWidth);

  // start table body
  html += objDue.startTableBody();

  // show main header
  html += objDue.showTableHeaderLogOut('width:175px;', '', '', '', '', 'Forfall', '', '', '');
  html += "</tr>";

  // end table body
  html += objDue.endTableBody();

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.header').innerHTML = html;
}

// Show filter
function showFilter(rowNumber) {

  // Start table
  html = objDue.startTable(tableWidth);

  // Header filter
  rowNumber++;
  html += objDue.showTableHeaderMenu('width:175px;', rowNumber, '', '', 'Leilighet', 'Konto', 'Fra dato', 'Til dato', '');

  // start table body
  html += objDue.startTableBody();

  // insert table columns in start of a row
  rowNumber++;
  html += objDue.insertTableColumns('', rowNumber, '', '');

  // Show all selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', 0);

  // Get condominiumId
  const condominiumsRowNumber = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === objDue.condominiumId);
  if (condominiumsRowNumber !== -1) {

    const commonCostAccountId = objCondominium.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccount.showSelectedAccounts('filterAccountId', 'width:175px;', commonCostAccountId, '', 'Vis alle konti', false);
  }

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objDue.inputTableColumn('filterFromDate', '', fromDate, 10);

  // Current date
  let toDate = getCurrentDate();

  // Next year
  toDate = Number(convertDateToISOFormat(toDate)) + 10000;
  toDate = formatToNorDate(toDate);
  html += objDue.inputTableColumn('filterToDate', '', toDate, 10);

  html += "<td><td></tr>";

  // insert table columns in start of a row
  rowNumber++;
  html += objDue.insertTableColumns('', rowNumber, '', '', '', '', '', '', '')

  // end table body
  html += objDue.endTableBody();

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.filter').innerHTML = html;

  return rowNumber;
}