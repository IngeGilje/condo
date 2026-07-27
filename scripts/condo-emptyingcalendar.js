// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendars = new EmptyingCalendars('emptyingcalendars');
const objEmptyingCalendar = new EmptyingCalendar('emptyingcalendar');

const enableChanges = (objEmptyingCalendar.securityLevel > 5);
const applicationName = "condo-emptyingcalendar";

// query parameters
const queryParameters = new URLSearchParams(window.location.search);
const paramEmptyingCalendarId = Number(queryParameters.get("emptyingCalendarId"));
const paramDate = Number(queryParameters.get("date"));

// Exit application if no activity for 1 hour
exitIfNoActivity();

// Call main when script loads
main();
async function main() {

  // Check if server is running
  if (await objUser.checkServer()) {

    // Validate LogIn
    if ((objEmptyingCalendar.condominiumId === 0) || (objEmptyingCalendar.user === null)) {

      // LogIn is not valid
      const URL = (objUser.serverStatus === 1)
        ? 'http://ingegilje.no/condo-login.html'
        : 'http://localhost/condo-login.html';
      window.location.href = URL;
    } else {

      // Show main menu
      let html = objEmptyingCalendar.showHorizontalMenu(objEmptyingCalendar.arrayMainMenu);
      document.querySelector('.menuMain').innerHTML = html;

      // Show menu for empty calendar 
      html = objEmptyingCalendar.showHorizontalMenu(objEmptyingCalendar.arrayMenuEmptyingCalendar);
      document.querySelector('.menuEmptyingCalendar').innerHTML = html;
      objEmptyingCalendar.markActivatedApplication(objEmptyingCalendar.arrayMenuEmptyingCalendar, applicationName);

      await objCondo.loadCondoTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);
      const orderBy = "date DESC";
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);

      let emptyingCalendarId = 0;
      let date = String(getCurrentDate());

      emptyingCalendarId = (paramEmptyingCalendarId === 0)
        ? emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars[0].emptyingCalendarId
        : emptyingCalendarId = paramEmptyingCalendarId;

      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);

      /*
      // Show emtyingcalendar
      let currentDate = getCurrentDate();
      currentDate = Number(formatNorDateToNumber(currentDate));
 
      let emptyingCalendarId = (paramEmptyingCalendarId === 0)
        ? getEmptyingCalendarIdMonth(currentDate)
        : paramEmptyingCalendarId;
 
      // Next month ?
      let date = String(currentDate);
      year = date.slice(0, 4);
      month = date.slice(4, 6);
      currentDate = Number(year + month + "01");
      if (emptyingCalendarId === 0) emptyingCalendarId = getEmptyingCalendarIdNextMonth(currentDate + 100);
 
      date = getEmptyingCalendarDate(emptyingCalendarId)
      */
      // Show filter
      showFilter(emptyingCalendarId);

      showEmptyingCalendar(emptyingCalendarId);

      // Events
      events();
    }
  } else {

    showMessageNew('Server er ikke startet.');
  }
}

// Events for emptyingcalendar
async function events() {

  // Filter
  document.addEventListener('change', async (event) => {
    if (event.target.classList.contains('filterEmptyingCalendarId')) {

      const date = Number(document.querySelector('.filterEmptyingCalendarId').value);
      const emptyingCalendarId = getEmptyingCalendarId(date);
      showEmptyingCalendar(emptyingCalendarId);
    };
  });

  // insert a new news row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('insert')) {

      // Insert new news row
      resetValues();
    };
  });

  // return to emptyingcalendars
  document.addEventListener('click', async (event) => {
    if ([...event.target.classList].some(cls => cls.startsWith('back'))) {

      let URL = (objEmptyingCalendars.serverStatus === 1)
        ? 'http://ingegilje.no/'
        : 'http://localhost/';
      URL = `${URL}condo-emptyingCalendars.html?emptyingCalendarsId=${paramEmptyingCalendarId}&date=${paramDate}`;
      window.location.href = URL;
    };
  });

  // update/insert a emptyingcalendars row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('update')) {

      // Update a emptyingcalendars row
      let date = document.querySelector('.emptyingCalendarDate').value;
      date = formatISODateToNumber(date);
      const emptyingCalendarId = getEmptyingCalendarId(date);
      updateEmptyingCalendarRow(emptyingCalendarId);
    };
  });

  // Delete emptyingcalendars row
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete')) {

      let date = Number(document.querySelector('.filterEmptyingCalendarId').value);
      let emptyingCalendarId = getEmptyingCalendarId(date);
      await deleteEmptyingCalendarRow(emptyingCalendarId);

      // Show last row in emptyingCalendars tabel
      await objEmptyingCalendars.getHighestEmptyingCalendarId(objEmptyingCalendar.condominiumId);
      emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars.at(-1)?.emptyingCalendarId ?? 0;
      const orderBy = "date DESC";
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);

      // Show filter
      date = getEmptyingCalendarDate(emptyingCalendarId);
      showFilter(emptyingCalendarId);

      // Show emptyingCalendar
      showEmptyingCalendar(emptyingCalendarId);
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload emptyingcalendars table
      const orderBy = "date DESC";
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);
      await objEmptyingCalendars.getHighestEmptyingCalendarId(objEmptyingCalendar.condominiumId);
      const emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars[0]?.emptyingCalendarId ?? 0;
      const date = objEmptyingCalendars.arrayEmptyingCalendars[0]?.date ?? 0;

      // Show filter
      showFilter(emptyingCalendarId);

      // show emptyingCalendar
      showEmptyingCalendar(emptyingCalendarId);
    };
  });
}

// Show filter
function showFilter(emptyingCalendarId) {

  // Start frame
  let html = startFrame('showFilter');

  // Show date
  html += objEmptyingCalendars.showSelectedEmptyCalendarsNew('Tømmedato', 'filterEmptyingCalendarId', '', emptyingCalendarId, 'Velg Dato', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;

  // Change frame title
  setFrameTitle("Filter");
}

// Show emptyingCalendar
function showEmptyingCalendar(emptyingCalendarId) {

  // row number emptyingcalendar array
  const rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
  // Empty line
  let html = emptyLine();

  // date
  html += startLine();
  let emptyingCalendarDate = objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar]?.date ?? 0;
  emptyingCalendarDate = formatNumberToISODate(emptyingCalendarDate);
  html += showDate('Dato', 'emptyingCalendarDate', emptyingCalendarDate, enableChanges);

  const condoId = objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('Ansvarlig', 'condoId', '', condoId, 'Velg ansvarlig', '', true);
  html += "</div>";

  // residual waste 
  html += startLine();
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].residualWaste === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].residualWaste === 'N') selected = "Nei";
  className = 'residualWaste';
  html += showSelectedValuesNew('Restavfall', className, '', enableChanges, selected, 'Nei', 'Ja');

  // Paper waste
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].paper === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].paper === 'N') selected = "Nei";
  className = 'paper';
  html += showSelectedValuesNew('Papiravfall', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += "</div>";

  // food waste
  html += startLine();
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].food === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].food === 'N') selected = "Nei";
  className = 'food';
  html += showSelectedValuesNew('Matavfall', className, '', enableChanges, selected, 'Nei', 'Ja');

  // plastic waste
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].plastic === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].plastic === 'N') selected = "Nei";
  className = 'plastic';
  html += showSelectedValuesNew('Plastavfall', className, '', enableChanges, selected, 'Nei', 'Ja');
  html += "</div>";

  // Christmas tree
  html += startLine();
  selected = "Ugyldig verdi";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].christmasTree === 'Y') selected = "Ja";
  if (objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar].christmasTree === 'N') selected = "Nei";
  className = 'christmasTree';
  html += showSelectedValuesNew('Juletre', className, '', enableChanges, selected, 'Nei', 'Ja');
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

  if (paramEmptyingCalendarId !== 0) {
    html += startLine();
    html += showButtonNew('back', 'Tilbake');
    html += "</div>";
  }

  // Show empty calendar
  document.querySelector('.showEmptyCalendar').innerHTML = html;

  // Buttons
  if (enableChanges) {
    disableButton('delete', false);
    disableButton('insert', false);
    disableButton('update', false);
    disableButton('cancel', true);
    disableButton('filterEmptyingCalendarId', false, 'white');
  }
}

// Delete one emtyingcalendar row
async function deleteEmptyingCalendarRow(emptyingCalendarId, className) {

  // Check if emtyingcalendar row exist
  rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emtyingCalendar => emtyingCalendar.emptyingCalendarId === emptyingCalendarId);
  if (rowNumberEmptyingCalendar !== -1) {

    // delete emtyingcalendar row
    await objEmptyingCalendars.deleteEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user);
  }

  const orderBy = "date DESC";
  await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);
}

// Update a emptyingcalendar table row
async function updateEmptyingCalendarRow(emptyingCalendarId) {

  emptyingCalendarId = Number(emptyingCalendarId);

  // condoId
  condoId = Number(document.querySelector('.condoId').value);
  const validCondoId = validateIntervalNew('condoId', '', 'Ugyldig ansvarlig', true, condoId, 1, objCondo.nineNine);

  // date
  let date = document.querySelector('.emptyingCalendarDate').value;
  let validDate = validateISODate('emptyingCalendarDate', date, true, 'Ugyldig Dato');
  date = formatISODateToNumber(date);

  /*
  // Check if the emtyingcalendar id exist
  const rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
  if (rowNumberEmptyingCalendar === -1) {

    // Check for unique date
    const orderBy = "date DESC";
    await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);
    if (objEmptyingCalendars.arrayEmptyingCalendars.length !== 0) validDate = false;
    await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);
  }
  */

  let residualWaste = document.querySelector('.residualWaste').value;
  const validResidualWaste = validateValuesNew('residualWaste', 'Ugylgig valg', true, residualWaste, 'Nei', 'Ja');
  if (residualWaste === "Ja") residualWaste = 'Y';
  if (residualWaste === "Nei") residualWaste = 'N';

  let paper = document.querySelector('.paper').value;
  const validPaper = validateValuesNew('paper', 'Ugylgig valg', true, paper, 'Nei', 'Ja');
  if (paper === "Ja") paper = 'Y';
  if (paper === "Nei") paper = 'N';

  let food = document.querySelector('.food').value;
  const validFood = validateValuesNew('food', 'Ugylgig valg', true, food, 'Nei', 'Ja');
  if (food === "Ja") food = 'Y';
  if (food === "Nei") food = 'N';

  let plastic = document.querySelector('.plastic').value;
  const validPlastic = validateValuesNew('plastic', 'Ugylgig valg', true, plastic, 'Nei', 'Ja');
  if (plastic === "Ja") plastic = 'Y';
  if (plastic === "Nei") plastic = 'N';

  let christmasTree = document.querySelector('.christmasTree').value;
  const validChristmasTree = validateValuesNew('christmasTree', 'Ugylgig valg', true, christmasTree, 'Nei', 'Ja');
  if (christmasTree === "Ja") christmasTree = 'Y';
  if (christmasTree === "Nei") christmasTree = 'N';

  // Validate emptyingcalendar columns
  if (validCondoId && validDate && validPaper && validResidualWaste && validFood && validPlastic && validChristmasTree) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the emptyingcalendars row exist
    if (rowNumberEmptyingCalendar !== -1) {

      // update a emptyingcalendars row
      await objEmptyingCalendars.updateEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);
    } else {

      // Insert a emptyingcalendars row
      await objEmptyingCalendars.insertEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);
      await objEmptyingCalendars.getHighestEmptyingCalendarId(objEmptyingCalendar.condominiumId);
      emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars.at(-1)?.emptyingCalendarId ?? 0;
    }

    const orderBy = "date DESC";
    await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, orderBy);

    removeMessage();

    if (enableChanges) {
      disableButton('delete', false);
      disableButton('insert', false);
      disableButton('update', false);
      disableButton('cancel', true);
      disableButton('filterEmptyingCalendarId', false);
    }

    // Show filter
    showFilter(emptyingCalendarId);

    // Show emtyingcalendar
    showEmptyingCalendar(emptyingCalendarId);
  }
}

// get emptying calendar date
function getEmptyingCalendarDate(emptyingCalendarId) {

  let date = 0;
  objEmptyingCalendars.arrayEmptyingCalendars.forEach(emptyingCalendar => {

    if (emptyingCalendar.emptyingCalendarId === emptyingCalendarId) date = emptyingCalendar.date;
  });

  return date;
}

// get emptying calendar Id
function getEmptyingCalendarId(date) {

  let emptyingCalendarId = 0;
  objEmptyingCalendars.arrayEmptyingCalendars.forEach(emptyingCalendar => {

    if (emptyingCalendar.date === date) emptyingCalendarId = emptyingCalendar.emptyingCalendarId;
  });

  return emptyingCalendarId;
}

// get emptying calendar Id
function getEmptyingCalendarId(date) {

  let emptyingCalendarId = 0;
  objEmptyingCalendars.arrayEmptyingCalendars.forEach(emptyingCalendar => {

    if (emptyingCalendar.date === date) emptyingCalendarId = emptyingCalendar.emptyingCalendarId;
  });

  return emptyingCalendarId;
}

// resetValues
function resetValues() {

  document.querySelector('.filterEmptyingCalendarId').value = '';

  // condoId
  document.querySelector('.condoId').value = 0;

  // date
  document.querySelector('.emptyingCalendarDate').value = 0;

  //  residualWaste
  document.querySelector('.residualWaste').value = 'Nei';

  // paper
  document.querySelector('.paper').value = 'Nei';

  // food
  document.querySelector('.food').value = 'Nei';

  // plastic
  document.querySelector('.plastic').value = 'Nei';

  // christmasTree
  document.querySelector('.christmasTree').value = 'Nei';

  document.querySelector('.filterEmptyingCalendarId').disabled = true;

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterEmptyingCalendarId', true);
  }
}