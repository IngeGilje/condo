// Due maintenance

// Activate objects
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objCondominium = new Condominium('condominium');
const objDues = new Dues('dues');
const objDue = new Due('due');

const enableChanges = (objDue.securityLevel > 5);

const columnWidths = [175, 100, 175, 175, 175, 175, 90];

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
    if ((objDue.condominiumId === 0) || (objDue.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = showHorizontalMenu(objDue.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show due menu
      html = showHorizontalMenu(objDue.arrayMenuDue);
      document.querySelector('.menuDue').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objDue.condominiumId, resident, objDue.nineNine);
      await objCondo.loadCondoTable(objDue.condominiumId, objDue.nineNine);
      await objCondominium.loadCondominiumsTable();
      const fixedCost = 'A';
      await objAccounts.loadAccountsTable(objDue.condominiumId, fixedCost);

      await objDues.loadDuesTable(objDue.condominiumId, objDue.nineNine, objDue.nineNine, 20200101, 21000101);

      // Show filter
      let dueId = (paramDueId === 0)
        ? getHighestDueId(condominiumId)
        : paramDueId;
      showFilter(dueId);

      // Show due
      showDue(dueId);

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

      await objDues.loadDuesTable(objDue.condominiumId, objDue.nineNine, objDue.nineNine, 20200101, 21000101);

      showDue(dueId);
    };
  });

  // return to emptyingcalendars
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objDues.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';

      URL = `${URL}condo-dues.html?dueId=${paramDueId}&condoId=${paramCondoId}&accountId=${paramAccountId}&fromDate=${paramFromDate}&toDate=${paramToDate}`;
      window.location.href = URL;
    };
  });

  // update/insert a dues row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a dues row
      let dueId = document.querySelector('.filterDueId').value;
      updateDuesRow(dueId);
    };
  });

  // Delete dues row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      let dueId = Number(document.querySelector('.filterDueId').value);
      await deleteDueRow(dueId);

      // Show last row in dues tabel
      await  objDues.getHighestDueId(objDues.condominiumId);
      dueId = objDues.arrayDues.at(-1)?.dueId ?? 0;
      await objDues.loadDuesTable(objDue.condominiumId, objDue.nineNine, objDue.nineNine, 20200101, 21000101);

      // Show filter
      showFilter(dueId);

      // Show due
      showDue(dueId);
    };
  });

  // insert a new news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      // Insert new news row
      resetValues();
    };
  });
}

// Show filter
function showFilter(dueId) {

  // Start frame
  let html = startFrame();

  // Show dues
  html += objDues.showSelectedDuesNew('Forfall', 'filterDueId', '', dueId, '', 'Vis alle', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// show due
function showDue(dueId) {

  // row number due array
  const rowNumberDue = objDues.arrayDues.findIndex(due => due.dueId === dueId);

  // Empty line
  let html = emptyLine();

  // date
  html += startLine();
  let dueDate = objDues.arrayDues[rowNumberDue]?.date ?? 0;
  dueDate = formatNumberToISODate(dueDate);
  html += showDate('Dato', 'dueDate', dueDate, enableChanges);
  html += "</div>";

  // condoId
  html += startLine();
  const condoId = objDues.arrayDues[rowNumberDue]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('Leilighet', 'condoId', '', condoId, 'Velg Leilighet', '', true);

  // accountId
  const accountId = objDues.arrayDues[rowNumberDue]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('Konto', 'accountId', '', accountId, 'Velg Konto', '', true);
  html += "</div>";

  // amount
  html += startLine();
  let amount = objDues.arrayDues[rowNumberDue]?.amount ?? 0;
  amount = formatNumberToNorAmount(amount);
  html += showTextNew('Beløp', 'amount', amount, enableChanges, 'Beløp');

  // kilowattHour
  let kilowattHour = objDues.arrayDues[rowNumberDue]?.kilowattHour ?? 0;
  kilowattHour = formatNumberToNorAmount(kilowattHour);
  html += showTextNew('Kilowatt Timer', 'kilowattHour', kilowattHour, enableChanges, 'Beløp');
  html += "</div>";

  // text
  html += startLine();
  const text = objDues.arrayDues[rowNumberDue]?.text ?? '';
  html += showTextNew('Tekst', 'text', text, enableChanges, 'Tekst');
  html += "</div>";

  // Buttons
  if (enableChanges) {

    html += startLine();
    html += showButtonNew('update', 'Oppdater');
    html += showButtonNew('cancel', 'Angre');
    html += "</div>";

    html += startLine();
    html += showButtonNew('delete', 'Slett');
    html += showButtonNew('insert', 'Ny');
    html += "</div>";
  }

  if (paramDueId !== 0) {
    html += startLine();
    html += showButtonNew('back', 'Tilbake');
    html += "</div>";
  }

  // Show empty calendar
  document.querySelector('.showDue').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterDueId', false, 'white');
  }
}

// Update a dues row
async function updateDuesRow(dueId) {

  dueId = Number(dueId);

  // date
  let className = '.dueDate';
  const date = Number(objDue.formatDateToNumber(document.querySelector(`${className}`).value));
  className = 'dueDate';
  const validDate = validateInterval(className, '', 'Ugyldig dato', true, date, 20000101, 21001231);

  // condo Id
  className = '.condoId';
  let condoId = Number(document.querySelector(className).value);
  className = 'condoId';
  const validCondoId = validateInterval(className, '', 'Ugyldig leilighet', true, condoId, 1, objDue.nineNine);

  // account Id
  className = '.accountId';
  let accountId = Number(document.querySelector(className).value);
  className = 'accountId';
  const validAccountId = validateInterval(className, '', 'Ugyldig konto', true, accountId, 1, objDue.nineNine);

  // amount
  className = '.amount';
  const amount = Number(formatNorAmountToNumber(document.querySelector(className).value));
  className = 'amount';
  const validAmount = validateInterval(className, '', 'Ugyldig beløp', true, amount, objDue.minusNineNine, objDue.nineNine);

  // kilowatt hour
  className = '.kilowattHour';
  let kilowattHour = Number(formatNorAmountToNumber(document.querySelector(className).value));
  kilowattHour = formatNorAmountToNumber(kilowattHour);
  className = 'kilowattHour';
  const validkilowattHour = validateInterval(className, '', 'Ugyldig kilowattimer', true, kilowattHour, 0, objDue.nineNine);

  // Text
  className = '.text';
  const text = document.querySelector(className).value;
  className = 'text';
  const validText = validateTextNew(className, '', 'Ugyldig tekst', true, text, 3, 45)

  // Validate dues columns
  if (validAccountId && validCondoId && validAmount && validDate && validkilowattHour && validText) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the dues row exist
    rowNumberDue = objDues.arrayDues.findIndex(dues => dues.dueId === dueId);
    if (rowNumberDue !== -1) {

      // update the dues row
      await objDues.updateDuesTable(dueId, objDue.user, condoId, accountId, amount, date, kilowattHour, text);
    } else {

      // Insert the account row in accounts table
      await objDues.insertDuesTable(objDue.condominiumId, objDue.user, condoId, accountId, amount, date, kilowattHour, text);
      await objDues.getHighestDueId(objDue.condominiumId);
      dueId = objDues.arrayDues.at(-1)?.dueId ?? 0;
    }
    await objDues.loadDuesTable(objDue.condominiumId, objDue.nineNine, objDue.nineNine, 20200101, 21000101);

    showFilter(dueId);
    showDue(dueId);
  }
}

// Delete dues row
async function deleteDueRow(dueId) {

  // Check if dues row exist
  rowNumberDue = objDues.arrayDues.findIndex(due => due.dueId === dueId);
  if (rowNumberDue !== -1) {

    // delete dues row
    await objDues.deleteDuesTable(dueId, objDue.user);
  }

  await objDues.loadDuesTable(objDue.condominiumId, objDue.nineNine, objDue.nineNine, 20200101, 21000101);
}

// reset values
function resetValues() {

  document.querySelector('.filterDueId').value = '';

  document.querySelector('.dueDate').value = '';

  document.querySelector('.condoId').value = 0;

  document.querySelector('.accountId').value = 0;

  document.querySelector('.amount').value = '0,00';

  document.querySelector('.kilowattHour').value = '0,00';

  document.querySelector('.text').value = '';

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterDueId', true);
  }

}