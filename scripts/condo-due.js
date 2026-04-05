// Due maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccount = new Account('account');
const objCondominium = new Condominium('condominium');
const objDue = new Due('due');

const enableChanges = (objDue.securityLevel > 5);

tableWidth = 'width:1450px;';

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objDue.condominiumId === 0) || (objDue.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      const resident = 'Y';
      await objUser.loadUsersTable(objDue.condominiumId, resident, objDue.nineNine);
      await objCondo.loadCondoTable(objDue.condominiumId);
      await objCondominium.loadCondominiumsTable();
      const fixedCost = 'A';
      await objAccount.loadAccountsTable(objDue.condominiumId, fixedCost);

      let menuNumber = 0;

      // Show header
      showHeader();

      // Show filter
      menuNumber = showFilter(menuNumber, objDue.condominiumId);

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objDue.formatNorDateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objDue.formatNorDateToNumber(toDate));

      await objDue.loadDuesTable(objDue.condominiumId, accountId, condoId, fromDate, toDate);

      // Show result
      showDues(menuNumber);

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

      showDues(3);
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
      let prefix = '';
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

        showDues(3);
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
function showDues(menuNumber) {

  // start table
  let html = objCondo.startTable(tableWidth);

  // table header
  menuNumber++;
  html += objCondo.showTableHeaderMenu('width:175px;background:#e0f0e0;', menuNumber, 'Slett', 'Leilighet', 'Dato', 'Konto', 'Beløp', 'kilowatt Timer', 'Tekst');

  let sumAmount = 0;
  let sumKilowattHour = 0;

  objDue.arrayDues.forEach((due) => {

    // insert table columns in start of a row
    menuNumber++;
    html += objCondominium.insertTableColumns('', menuNumber)

    // Delete
    let selected = "Ugyldig verdi";
    if (due.deleted === 'Y') selected = "Ja";
    if (due.deleted === 'N') selected = "Nei";

    let className = `delete${due.dueId}`;
    html += objDue.showSelectedValues(className, 'width:75px;', enableChanges, selected, 'Nei', 'Ja')

    // condos
    className = `condoId${due.dueId}`;
    html += objCondo.showSelectedCondos(className, 'width:175px;', due.condoId, 'ngen er valgt', '', enableChanges);

    // Date
    const date = formatToNorDate(due.date);
    className = `date${due.dueId}`;
    html += objDue.inputTableColumn(className, '', date, 10, enableChanges);

    // accounts
    className = `accountId${due.dueId}`;
    html += objAccount.showSelectedAccounts(className, '', due.accountId, 'Velg konto', '', enableChanges);

    // due amount
    const amount = formatOreToKroner(due.amount);
    className = `amount${due.dueId}`;
    html += objDue.inputTableColumn(className, '', amount, 10, enableChanges);

    // kilowattHour
    const kilowattHour = formatOreToKroner(due.kilowattHour);
    className = `kilowattHour${due.dueId}`;
    html += objDue.inputTableColumn(className, '', kilowattHour, 10, enableChanges);

    // text
    const text = due.text;
    className = `text${due.dueId}`;
    html += objDue.inputTableColumn(className, '', text, 45, enableChanges);

    html += "</tr>";

    // accumulate
    sumAmount += Number(due.amount);
    sumKilowattHour += Number(due.kilowattHour);
  });

  // Make one last table row for insertion in table 
  if (enableChanges) {

    // Insert empty table row for insertion
    menuNumber++;
    html += insertEmptyTableRow(menuNumber);
  }

  // Show table sum row
  sumAmount = formatOreToKroner(sumAmount);
  sumKilowattHour = formatOreToKroner(sumKilowattHour);
  menuNumber++;
  html += objDue.insertTableColumns('font-weight: 600;', menuNumber, '', '', '', 'Sum', sumAmount, sumKilowattHour);

  // Show the rest of the menu
  menuNumber++;
  html += objDue.showRestMenu(menuNumber);

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.result').innerHTML = html;

  return menuNumber;
}

// Insert empty table row
function insertEmptyTableRow(menuNumber) {

  let html = '';

  // insert table columns in start of a row
  html += objCondominium.insertTableColumns('', menuNumber, 'Nytt forfall');

  // condoId
  const condoId = Number(document.querySelector('.filterCondoId').value);
  html += objCondo.showSelectedCondos("condoId0", '', 0, 'Velg leilighet', '', enableChanges);

  // Date
  html += objDue.inputTableColumn("date0", '', '', 10, enableChanges);

  // accountId
  html += objAccount.showSelectedAccounts("accountId0", '', 0, 'Velg konto', '', enableChanges);

  // due amount
  html += objDue.inputTableColumn('amount0', '', '0,00', 10, enableChanges);

  // kilowatt hour
  html += objDue.inputTableColumn('kilowattHour0', '', '0,00', 10, enableChanges);

  // text
  html += objDue.inputTableColumn('text0', '', '', 45, enableChanges);

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
  const validCondoId = objCondo.validateNumber(className, condoId, 1, objDue.nineNine, objDue, '', 'Ugyldig leilighet');

  className = `.date${dueId}`;
  const date = Number(convertDateToISOFormat(document.querySelector(`${className}`).value));
  className = `date${dueId}`;
  const validDate = objCondo.validateNumber(className, date, 20200101, 20991231, objDue, '', 'Ugyldig dato');

  className = `.accountId${dueId}`;
  let accountId = Number(document.querySelector(className).value);
  className = `accountId${dueId}`;
  const validAccountId = objCondo.validateNumber(className, accountId, 1, objDue.nineNine, objDue, '', 'Ugyldig konto');

  className = `.amount${dueId}`;
  const amount = Number(formatKronerToOre(document.querySelector(`${className}`).value));
  className = `amount${dueId}`;
  const validAmount = objCondo.validateNumber(className, amount, objDue.minusNineNine, objDue.nineNine, objDue, '', 'Ugyldig beløp');

  className = `.kilowattHour${dueId}`;
  const kilowattHour = Number(formatKronerToOre(document.querySelector(`${className}`).value));
  className = `kilowattHour${dueId}`;
  const validKilowattHour = objCondo.validateNumber(className, kilowattHour, 0, objDue.nineNine, objDue, '', 'Ugyldig kilowattimer');

  /*
  className = `.text${dueId}`;
  const text = document.querySelector(className).value;
   className = `text${dueId}`;
  const validText = objDue.validateText(className, text, 3, 45, objDue, '', 'Ugyldig forfall');
  */
  className = `.text${dueId}`;
  const text = document.querySelector(className).value;
  const validText = true;

  // Validate dues columns
  if (validAccountId && validCondoId && validAmount && validDate && validKilowattHour && validText) {

    document.querySelector('.message').style.display = "none";

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

    showDues(3);
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
  let html = objDue.startTable(tableWidth);

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
function showFilter(menuNumber, condominiumId) {

  // Start table
  let html = objDue.startTable(tableWidth);

  // Header filter
  menuNumber++;
  html += objDue.showTableHeaderMenu('width:175px;', menuNumber, '', '', 'Leilighet', 'Konto', 'Fra dato', 'Til dato', '');

  // start table body
  html += objDue.startTableBody();

  // insert table columns in start of a row
  menuNumber++;
  html += objDue.insertTableColumns('', menuNumber, '', '');

  // Show all selected condos
  html += objCondo.showSelectedCondos('filterCondoId', 'width:175px;', objDue.nineNine, '', 'Vis alle', true);

  // Get condominiumId
  const condominiumsRowNumber = objCondominium.arrayCondominiums.findIndex(condominium => condominium.condominiumId === condominiumId);
  if (condominiumsRowNumber !== -1) {

    const commonCostAccountId = objCondominium.arrayCondominiums[condominiumsRowNumber].commonCostAccountId;
    html += objAccount.showSelectedAccounts('filterAccountId', '', commonCostAccountId, '', 'Vis alle', true);

  }

  // show from date
  const fromDate = '01.01.' + String(today.getFullYear());
  html += objDue.inputTableColumn('filterFromDate', '', fromDate, 10, enableChanges);

  // Current date
  let toDate = getCurrentDate();

  // Next year
  toDate = Number(convertDateToISOFormat(toDate)) + 10000;
  toDate = formatToNorDate(toDate);
  html += objDue.inputTableColumn('filterToDate', '', toDate, 10, enableChanges);

  html += "<td><td></tr>";

  // insert table columns in start of a row
  menuNumber++;
  html += objDue.insertTableColumns('', menuNumber, '', '', '', '', '', '', '')

  // end table body
  html += objDue.endTableBody();

  // The end of the table
  html += objDue.endTable();
  document.querySelector('.filter').innerHTML = html;

  return menuNumber;
}