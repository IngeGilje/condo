// Due maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objCondominium = new Condominium('condominium');
const objDues = new Dues('dues');

const enableChanges = (objDues.securityLevel > 5);
const applicationName = "condo-dues";

const columnWidths = [175, 100, 175, 175, 175, 90];

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramDueId = Number(queryParameters.get("dueId"));
const paramCondoId = Number(queryParameters.get("condoId"));
const paramAccountId = Number(queryParameters.get("accountId"));
const paramFromDate = Number(queryParameters.get("fromDate"));
const paramToDate = Number(queryParameters.get("toDate"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objDues.condominiumId === 0) || (objDues.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = showHorizontalMenu(objDues.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show due menu
      html = showHorizontalMenu(objDues.arrayMenuDue);
      document.querySelector('.menuDue').innerHTML = html;
      objDues.markActivatedApplication(objDues.arrayMenuDue, applicationName);

      const resident = 'Y';
      await objUser.loadUsersTable(objDues.condominiumId, resident, objDues.nineNine);
      await objCondo.loadCondoTable(objDues.condominiumId, objDues.nineNine);
      await objCondominium.loadCondominiumsTable();
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objDues.condominiumId, fixedCost);

      // Show filter
      let condoId = 0;
      const rowNumberUser = objUser.arrayUsers.findIndex(user => user.userId === objDues.userId);
      if (rowNumberUser !== -1) condoId = objUser.arrayUsers[rowNumberUser].condoId;
      condoId = (paramCondoId === 0)
        ? condoId
        : paramCondoId;

      let accountId = (paramAccountId === 0)
        ? objDues.nineNine
        : paramAccountId;

      // From date
      let fromDate = (paramFromDate === 0)
        ? `${String(today.getFullYear())}-01-01`
        : formatNumberToISODate(paramFromDate);

      // To date
      let toDate = (paramToDate === 0)
        ? getCurrentISODate()
        : formatNumberToISODate(paramToDate);

      showFilter(condoId, accountId, fromDate, toDate);

      condoId = Number(document.querySelector('.filterCondoId').value);
      accountId = Number(document.querySelector('.filterAccountId').value);
      fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(objDues.formatDateToNumber(fromDate));
      toDate = document.querySelector('.filterToDate').value;
      toDate = Number(objDues.formatDateToNumber(toDate));

      await objDues.loadDuesTable(objDues.condominiumId, accountId, condoId, fromDate, toDate);

      // Show result
      showDues();

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
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
      fromDate = formatISODateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);

      await objDues.loadDuesTable(objDues.condominiumId, accountId, condoId, fromDate, toDate);

      showDues();
    };
  });

  // change due
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('edit'))) {
      const arrayPrefixes = ['edit'];

      // Find the first matching class
      let className = arrayPrefixes
        .map(prefix => objDues.getClassByPrefix(event.target, prefix))
        .find(Boolean); // find the first non-null/undefined one

      // Extract the number in the class name
      let dueId = 0;
      let prefix = "";
      if (className) {
        prefix = arrayPrefixes.find(p => className.startsWith(p));
        dueId = Number(className.slice(prefix.length));
      }

      className = `date${dueId}`
      let date = document.querySelector(`.${className}`).value;
      date = formatNorDateToNumber(date);

      const condoId = Number(document.querySelector('.filterCondoId').value);
      const accountId = Number(document.querySelector('.filterAccountId').value);
      let fromDate = document.querySelector('.filterFromDate').value;
      fromDate = Number(formatISODateToNumber(fromDate));
      let toDate = document.querySelector('.filterToDate').value;
      toDate = Number(formatISODateToNumber(toDate));
      let URL = (objDues.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-due.html?dueId=${dueId}&condoId=${condoId}&accountId=${accountId}&fromDate=${fromDate}&toDate=${toDate}`;
      window.location.href = URL;
    };
  });
}

// Show filter
function showFilter(condoId, accountId, fromDate, toDate) {

  // Start frame
  let html = startFrame();

  // Show condos
  html += objCondo.showSelectedCondosNew('Leilighet', 'filterCondoId', '', condoId, '', 'Vis alle', true);

  // Show accounts
  html += objAccounts.showSelectedAccountsNew('Konto', 'filterAccountId', '', accountId, '', 'Vis alle', true);

  // From date
  html += showDate('Fra Dato', 'filterFromDate', fromDate, true)

  // To date
  html += showDate('Til Dato', 'filterToDate', toDate, true)

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// show dues
function showDues() {

  // start table
  let html = objCondo.initializeTable(columnWidths);

  // Table header (<tr></tr>)
  html += objCondo.showTableHeader('center', 'Dato', 'Leilighet', 'Konto', 'Beløp', 'Kilowatt Timer', '');

  let sumAmount = 0;
  //let sumKilowattHour = 0;

  objDues.arrayDues.forEach((due) => {

    // insert a table row (<tr></td>)
    html += objDues.insertTableRow('')

    // Date
    const date = formatNumberToNorDate(due.date);
    let className = `date${due.dueId}`;
    html += editTableCell(className, date, 10, false);

    // condos
    className = `condoId${due.dueId}`;
    html += objCondo.showSelectedCondos(className, '', due.condoId, 'ngen er valgt', '', false);

    // accounts
    className = `accountId${due.dueId}`;
    html += objAccounts.showSelectedAccounts(className, '', due.accountId, 'Velg konto', '', false);

    // due amount
    const amount = formatNumberToNorAmount(due.amount);
    className = `amount${due.dueId}`;
    html += editTableCell(className, amount, 11, false);

    /*
    // kilowattHour
    const kilowattHour = formatNumberToNorAmount(due.kilowattHour);
    className = `kilowattHour${due.dueId}`;
    html += editTableCell(className, kilowattHour, 10, false);
    */

    // text
    const text = due.text;
    className = `text${due.dueId}`;
    html += editTableCell(className, text, 45, false);

    // Change due
    className = `edit${due.dueId}`;
    html += objDues.showButton(className, 'Endre');
    html += "</tr>";

    // accumulate
    sumAmount += Number(due.amount);
    //sumKilowattHour += Number(due.kilowattHour);
  });

  // Show table sum row
  sumAmount = formatNumberToNorAmount(sumAmount);
  //sumKilowattHour = formatNumberToNorAmount(sumKilowattHour);

  html += objDues.insertTableRow('font-weight: 600;', '', '', 'Sum', sumAmount, '', '', '');

  // The end of the table
  html += objDues.endTable();
  document.querySelector('.showDues').innerHTML = html;
}