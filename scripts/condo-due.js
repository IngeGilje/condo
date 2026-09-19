// maintenance of dues

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objAccounts = new Accounts('accounts');
const objProjects = new Projects('projects');
const objDues = new Dues('dues');

// Fixed values
const enableChanges = (objDues.securityLevel > 5);
const applicationName = "condo-due";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramDueId = Number(queryParameters.get("dueId"));
const paramYear = Number(queryParameters.get("year"));
const paramBackApplication = queryParameters.get("backApplication");

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

      // Show vertical menu
      let html = objDues.showMenu(objDues.securityLevel);
      document.querySelector('.menuVertical').innerHTML = html;

      const resident = 'Y';
      await objUser.loadUsersTable(objDues.condominiumId, resident, objDues.nineNine);
      await objCondo.loadCondoTable(objDues.condominiumId, objDues.nineNine);
      await objAccounts.loadAccountsTable(objDues.condominiumId, objAccounts.nineNine);
      await objProjects.loadProjectsTable(objDues.condominiumId);

      await objDues.loadDuesTable(objDues.condominiumId);

      let dueId = 0;
      if (paramDueId === 0) {

        await objDues.getHighestDueId(objDues.condominiumId);
        dueId = objDues.arrayDues.at(-1)?.dueId ?? 0;
        await objDues.loadDuesTable(objDues.condominiumId);
      } else {

        dueId = paramDueId;
      }

      // Show filter
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

// Events for dues
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if ((event.target.classList.contains('filterFromdate'))
      || (event.target.classList.contains('filterToDate'))
      || (event.target.classList.contains('filterCondoId'))
      || (event.target.classList.contains('filterProjectId'))) {

      // get first dueId for fromDate, toDate, condoId,projectId
      let fromDate = document.querySelector('.filterFromdate').value;
      fromDate = formatISODateToNumber(fromDate);
      let toDate = document.querySelector('.filterToDate').value;
      toDate = formatISODateToNumber(toDate);
      const condoId = Number(document.querySelector('.filterCondoId').value);
      const projectId = Number(document.querySelector('.filterProjectId').value);

      const dueId = objDues.getFirstDueId(fromDate, toDate, condoId, projectId);
      if (dueId > 0) showDue(dueId);
    };
  });

  // return to bank account transactions
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objDues.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-showdues.html?dueId=${paramDueId}&year=${paramYear}&backApplication=${paramBackApplication}`;
      window.location.href = URL;
    };
  });

  // Delete dues row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      const dueId = Number(document.querySelector('.dueId').value);

      deleteDue(dueId);
    };
  });

  // insert a new dues row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      resetValues();
    };
  });

  // update a dues row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      const dueId = Number(document.querySelector(".dueId").value);
      await updateDueRow(dueId);
    }
  });
}

// Show filter
function showFilter(dueId) {

  // Start filter
  let html = startGridFilter("Forfall");

  const rowNumberDue = objDues.arrayDues.findIndex(due => due.dueId === dueId);

  // from date
  /*
  let fromDate = (objDues.arrayDues[rowNumberDue].date)
    ? objDues.arrayDues[rowNumberDue].date
    : 0;
  */
  let fromDate = objDues.arrayDues[rowNumberDue]?.date ?? 0;
  //html += showSelectedNumbers('filterFromdate', 'Fra dato', 2019, 2029, Number(year), enableChanges);
  fromDate = formatNumberToISODate(fromDate);
  html += inputDate('filterFromdate', 'Fra Dato', fromDate, true);

  // to date
  /*
  let toDate = (objDues.arrayDues[rowNumberDue].date)
    ? objDues.arrayDues[rowNumberDue].date
    : 0;
  */
  let toDate = objDues.arrayDues[rowNumberDue]?.date ?? 0;
  toDate = formatNumberToISODate(toDate);
  html += inputDate('filterToDate', 'Til Dato', toDate, true);

  // condo
  /*
  const condoId = (objDues.arrayDues[rowNumberDue].condoId)
    ? objDues.arrayDues[rowNumberDue].condoId
    : 0;
  */
  const condoId = objDues.arrayDues[rowNumberDue]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('filterCondoId', 'Leilighet', condoId, 'Velg Leilighet', '', true);

  // account
  /*
  const accountId = (objDues.arrayDues[rowNumberDue].accountId)
    ? objDues.arrayDues[rowNumberDue].accountId
    : 0;
  */
  const accountId = objDues.arrayDues[rowNumberDue]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('filterAccountd', 'Konto', accountId, 'Velg Konto', '', true);

  // project
  /*
  const projectId = (objDues.arrayDues[rowNumberDue].projectId)
    ? objDues.arrayDues[rowNumberDue].projectId
    : 0;
  */
  const projectId = objDues.arrayDues[rowNumberDue]?.projectId ?? 0;
  html += objProjects.showSelectedProjectsNew('filterProjectId', 'Prosjekt', projectId, 'Velg Prosjekt', '', true);

  // End filter
  html += endGridFilter();
  document.querySelector(".showFilter").innerHTML = html;
}

// Show dues
function showDue(dueId) {

  const rowNumberDue = objDues.arrayDues.findIndex(due => due.dueId === dueId);

  let html = startGrid('Forfall');

  // due Id
  html += showTextNew('dueId', 'Forfall Id', dueId, false);
  html += "<div></div>";
  //html += "<div></div>";

  // date
  /*
  let dueDate = (objDues.arrayDues[rowNumberDue].date)
    ? objDues.arrayDues[rowNumberDue].date
    : 0;
  */
  let dueDate = objDues.arrayDues[rowNumberDue]?.date ?? 0;
  dueDate = formatNumberToISODate(dueDate);
  html += inputDate('dueDate', 'Dato', dueDate, enableChanges);
  html += "<div></div>";
  //html += "<div></div>";

  // condo Id
  /*
  let condoId = (objDues.arrayDues[rowNumberDue].condoId)
    ? objDues.arrayDues[rowNumberDue].condoId
    : 0;
  */
  let condoId = objDues.arrayDues[rowNumberDue]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('condoId', 'Leilighet', condoId, 'Velg Leilighet', '', enableChanges);

  // account Id
  /*
  let accountId = (objDues.arrayDues[rowNumberDue].accountId)
    ? objDues.arrayDues[rowNumberDue].accountId
    : 0;
  */
  const accountId = objDues.arrayDues[rowNumberDue]?.accountId ?? 0;
  html += objAccounts.showSelectedAccountsNew('accountId', 'Konto', accountId, 'Velg konto', '', enableChanges);

  // project Id
  /*
  let projectId = (objDues.arrayDues[rowNumberDue].projectId)
    ? objDues.arrayDues[rowNumberDue].projectId
    : 0;
  */
  const projectId = objDues.arrayDues[rowNumberDue]?.projectId ?? 0;
  html += objProjects.showSelectedProjectsNew('projectId', 'Prosjekt', projectId, 'Velg Prosjekt', '', enableChanges);

  // kilowattHour
  /*
  let kilowattHour = (objDues.arrayDues[rowNumberDue].kilowattHour)
    ? objDues.arrayDues[rowNumberDue].kilowattHour
    : 0;
  */
  let kilowattHour = objDues.arrayDues[rowNumberDue]?.kilowattHour ?? 0;
  kilowattHour = formatNumberToNorAmount(kilowattHour);
  html += showTextNew('kilowattHour', 'K.timer', kilowattHour, enableChanges, 'Kontonavn');

  // amount
  /*
  let amount = (objDues.arrayDues[rowNumberDue].amount)
    ? objDues.arrayDues[rowNumberDue].amount
    : 0;
  */
  let amount = objDues.arrayDues[rowNumberDue]?.amount ?? 0;
  amount = formatNumberToNorAmount(amount);
  html += showTextNew('amount', 'Beløp', amount, enableChanges, 'Beløp');
  //html += "<div></div>";

  // text
  /*
  let text = (objDues.arrayDues[rowNumberDue].text)
    ? objDues.arrayDues[rowNumberDue].text
    : "";
  */
  const text = objDues.arrayDues[rowNumberDue]?.text ?? "";
  html += showTextNew('text', 'Tekst', text, enableChanges, 'Tekst');
  html += "<div></div>";
  //html += "<div></div>";

  html += endGrid();

  // Buttons
  if (enableChanges) {

    // Start buttons
    html += startButtons();

    html += inputButton("update secondary", "Oppdater", "submit");
    html += inputButton("insert secondary", "Ny", "button");
    //html += inputButton("cancel secondary", "Angre", "reset");

    // check for return back to an application
    if (paramBackApplication) {

      html += inputButton("back secondary", "Tilbake", "button");
    }
    html += inputButton("delete danger", "Slett", "button");
  }


  // End buttons
  html += endButtons();

  document.querySelector('.showDue').innerHTML = html;
}

// Update a dues table row
async function updateDueRow(dueId) {

  dueId = Number(dueId);

  // date
  let dueDate = document.querySelector('.dueDate').value;
  dueDate = formatISODateToNumber(dueDate);
  const validDate = validateIntervalNew('dueDate', 'Ugyldig Dato', true, dueDate, 20150101, 20291231);

  // condoId
  const condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = validateIntervalNew('condoId', 'Ugyldig Leilighet', true, condoId, 0, objDues.nineNine);

  // accountId
  const accountId = Number(document.querySelector('.accountId').value);
  const validAccountId = validateIntervalNew('accountId', 'Ugyldig Konto', true, accountId, 1, objDues.nineNine);

  // projectId
  const projectId = Number(document.querySelector('.projectId').value);
  const validProjectId = validateIntervalNew('projectId', 'Ugyldig Prosjekt', true, projectId, 0, objDues.nineNine);

  // kilowattHour
  let kilowattHour = document.querySelector('.kilowattHour').value;
  kilowattHour = formatNorAmountToNumber(kilowattHour);
  const validkilowattHour = validateIntervalNew('kilowattHour', 'Ugyldig Kilowatttime', true, kilowattHour, 0, objDues.nineNine);

  // amount
  let amount = document.querySelector('.amount').value;
  amount = formatNorAmountToNumber(amount);
  const validAmount = validateIntervalNew('amount', 'Ugyldig beløp', true, amount, 0, objDues.nineNine);

  // text
  const text = document.querySelector('.text').value;
  const validText = validateTextNew('text', 'Ugyldig Tekst', true, text, 0, 45);

  // Validate dues columns
  if (validDate && validCondoId && validkilowattHour && validAmount && validAccountId && validProjectId && validText) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the due id exist
    rowNumberDue = objDues.arrayDues.findIndex(due => due.dueId === dueId);
    if (rowNumberDue !== -1) {

      // update a dues row
      await objDues.updateDuesTable(objDues.user, dueId, condoId, accountId, projectId, amount, dueDate, kilowattHour, text);
    } else {

      // Insert a dues row
      await objDues.insertDuesTable(objDues.condominiumId, objDues.user, condoId, accountId, projectId, amount, dueDate, kilowattHour, text);
      await objDues.getHighestDueId(objDues.condominiumId);
      dueId = objDues.arrayDues[0].dueId;
    }

    await objDues.loadDuesTable(objDues.condominiumId);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      //disableButton('cancel', true);

      // Filter
      disableButton('filterFromdate', false);
      disableButton('filterToDate', false);
      disableButton('filterCondoId', false);
      disableButton('filterProjectId', false);
    }

    // Show filter
    showFilter(dueId);

    // Show a dues row
    showDue(dueId);
  }
}

/*
// Delete a dues row
async function deleteDue(dueId) {

  if (dueId > 0) {
    await objDues.deleteDuesTable(dueId, objDues.user);
    await objDues.loadDuesTable(objDues.condominiumId);
  }

  // Show last dueId
  await objDues.getHighestDueId(objDues.condominiumId);
  dueId = objDues.arrayDues.at(-1)?.dueId ?? 0;
  await objDues.loadDuesTable(objDues.condominiumId);

  showFilter(dueId);
  showDue(dueId);
}
*/

// Delete dues row
async function deleteDuesRow(dueId) {

  // Check if dues row exist
  const rowNumberDues = objDues.arrayDues.findIndex(due => due.dueId === dueId);
  if (rowNumberDues !== -1) {

    // delete dues row
    await objDues.deleteDuesTable(dueId, objDues.user);
    await objDues.getHighestDueId(objDues.condominiumId);
    dueId = objDues.arrayDues[0].dueId;
  }

  await objDues.loadDuesTable(objDues.condominiumId);

  // Show filter
  showFilter(dueId);

  // Show due
  showDue(dueId);
}

// resetValues
function resetValues() {

  // Filter
  document.querySelector('.filterFromdate').value = 0;
  document.querySelector('.filterToDate').value = 0;
  document.querySelector('.filterCondoId').value = 0;
  document.querySelector('.filterProjectId').value = 0;

  // dueId
  document.querySelector('.dueId').value = "";

  // condoId
  document.querySelector('.condoId').value = 0;

  // accountId
  document.querySelector('.accountId').value = 0;

  // projectId
  document.querySelector('.projectId').value = 0;

  // date
  document.querySelector('.dueDate').value = "";

  // Kilowatt hours
  document.querySelector('.kilowattHour').value = "";

  // amount
  document.querySelector('.amount').value = "";

  // Buttons
  removeMessage();

  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    //disableButton('cancel', false);
    disableButton('update', false);

    // Filter
    disableButton('filterFromdate', true);
    disableButton('filterToDate', true);
    disableButton('filterCondoId', true);
    disableButton('filterProjectId', true);
  }
}