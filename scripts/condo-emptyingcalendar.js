// maintenance of emptying calendar

// Activate classes
const today = new Date();
const objUser = new User('user');
const objCondo = new Condo('condo');
const objEmptyingCalendars = new EmptyingCalendars('emptyingcalendars');
const objEmptyingCalendar = new EmptyingCalendar('emptyingcalendar');

const enableChanges = (objEmptyingCalendar.securityLevel > 5);

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
      let html = showHorizontalMenu(objEmptyingCalendar.arrayMenuMain);
      document.querySelector('.menuMain').innerHTML = html;

      // Show menu for empty calendar 
      html = showHorizontalMenu(objEmptyingCalendar.arrayMenuEmptyingCalendar);
      document.querySelector('.menuEmptyingCalendar').innerHTML = html;

      await objCondo.loadCondoTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

      // Show filter
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

      // Show emtyingcalendar
      let currentDate = getCurrentDate();
      currentDate = Number(formatNorDateToNumber(currentDate));

      let emptyingCalendarId = (paramEmptyingCalendarId === 0)
        ? getEmptyingCalendarIdMonth(currentDate)
        : paramEmptyingCalendarId;

      // Next month ?
      let date = String(currentDate);
      year = date.slice(0,4);
      month = date.slice(4,6);
      currentDate = Number(year + month + "01");
      if (emptyingCalendarId === 0) emptyingCalendarId = getEmptyingCalendarIdNextMonth(currentDate + 100);

      date = getEmptyingCalendarDate(emptyingCalendarId)
      showFilter(date);

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
    if (event.target.classList.contains('filterDate')) {

      const date = Number(document.querySelector('.filterDate').value);
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

      let date = Number(document.querySelector('.filterDate').value);
      let emptyingCalendarId = getEmptyingCalendarId(date);
      await deleteEmptyingCalendarRow(emptyingCalendarId);

      // Show last row in emptyingCalendars tabel
      await objEmptyingCalendars.getHighestEmptyingCalendarId(objEmptyingCalendar.condominiumId);
      emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars.at(-1)?.emptyingCalendarId ?? 0;
      await objEmptyingCalendars.loadEmptyingCalendarsTable(objEmptyingCalendar.condominiumId, objEmptyingCalendars.nineNine);

      // Show filter
      date = getEmptyingCalendarDate(emptyingCalendarId);
      showFilter(date);

      // Show news
      debugger;
      showNews(emptyingCalendarId);
    };
  });

  // Cancel
  document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('cancel')) {

      // Reload emptyingcalendars table
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

      await objEmptyingCalendars.getHighestEmptyingCalendarId(objEmptyingCalendar.condominiumId);
      const emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars[0]?.emptyingCalendarId ?? 0;
      const date = objEmptyingCalendars.arrayEmptyingCalendars[0]?.date ?? 0;

      // Show filter
      showFilter(date);

      // show emptyingCalendar
      showEmptyingCalendar(emptyingCalendarId);
    };
  });
}

// Show filter
function showFilter(date) {

  // Start frame
  let html = startFrame();

  // Show date
  html += objEmptyingCalendars.showSelectedEmptyCalendarsNew('Tømmedato', 'filterDate', '', date, 'Velg Dato', '', true);

  // End filter frame
  html += "</div>";

  document.querySelector('.showFilter').innerHTML = html;
}

// Show emptyingCalendar
function showEmptyingCalendar(emptyingCalendarId) {

  // row number emptyingcalendar array
  const rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
  // Empty line
  let html = emptyLine();

  // userId
  html += startLine();
  const condoId = objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar]?.condoId ?? 0;
  html += objCondo.showSelectedCondosNew('Ansvarlig', 'condoId', '', condoId, 'Velg ansvarlig', '', true);

  // date
  let emptyingCalendarDate = objEmptyingCalendars.arrayEmptyingCalendars[rowNumberEmptyingCalendar]?.date ?? 0;
  emptyingCalendarDate = formatNumberToISODate(emptyingCalendarDate);
  html += showDate('Dato', 'emptyingCalendarDate', emptyingCalendarDate, enableChanges);
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
    disableButton('filterDate', false, 'white');
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

  await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);
}

// Update a emptyingcalendar table row
async function updateEmptyingCalendarRow(emptyingCalendarId) {

  emptyingCalendarId = Number(emptyingCalendarId);

  // condoId
  className = 'condoId';
  condoId = Number(document.querySelector(`.${className}`).value);
  const validCondoId = validateInterval(className, '', 'Ugyldig ansvarlig', true, condoId, 1, objCondo.nineNine);

  // date
  className = 'emptyingCalendarDate';
  let date = document.querySelector(`.${className}`).value;
  let validDate = validateISODate(className, date, true, 'Ugyldig Dato');
  date = formatISODateToNumber(date);

  // Check for unique date
  await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, date);
  if (objEmptyingCalendars.arrayEmptyingCalendars.length !== 0) validDate = false;
  await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

  className = 'residualWaste';
  let residualWaste = document.querySelector(`.${className}`).value;
  const validResidualWaste = validateValuesNew(className, 'Ugylgig valg', true, residualWaste, 'Nei', 'Ja');
  if (residualWaste === "Ja") residualWaste = 'Y';
  if (residualWaste === "Nei") residualWaste = 'N';

  className = `paper`;
  let paper = document.querySelector(`.${className}`).value;
  const validPaper = validateValuesNew(className, 'Ugylgig valg', true, paper, 'Nei', 'Ja');
  if (paper === "Ja") paper = 'Y';
  if (paper === "Nei") paper = 'N';

  className = `food`;
  let food = document.querySelector(`.${className}`).value;
  const validFood = validateValuesNew(className, 'Ugylgig valg', true, food, 'Nei', 'Ja');
  if (food === "Ja") food = 'Y';
  if (food === "Nei") food = 'N';

  className = `plastic`;
  let plastic = document.querySelector(`.${className}`).value;
  const validPlastic = validateValuesNew(className, 'Ugylgig valg', true, plastic, 'Nei', 'Ja');
  if (plastic === "Ja") plastic = 'Y';
  if (plastic === "Nei") plastic = 'N';

  className = `christmasTree`;
  let christmasTree = document.querySelector(`.${className}`).value;
  const validChristmasTree = validateValuesNew(className, 'Ugylgig valg', true, christmasTree, 'Nei', 'Ja');
  if (christmasTree === "Ja") christmasTree = 'Y';
  if (christmasTree === "Nei") christmasTree = 'N';

  // Validate emptyingcalendar columns
  if (validCondoId && validDate && validPaper && validResidualWaste && validFood && validPlastic && validChristmasTree) {

    document.querySelector('.showMessage').style.display = "none";

    // Check if the emtyingcalendar id exist
    rowNumberEmptyingCalendar = objEmptyingCalendars.arrayEmptyingCalendars.findIndex(emptyingCalendar => emptyingCalendar.emptyingCalendarId === emptyingCalendarId);
    if (rowNumberEmptyingCalendar !== -1) {

      // update the emtyingcalendar row
      await objEmptyingCalendars.updateEmptyingCalendarTable(emptyingCalendarId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);

      // get emptying calendar date
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);
      date = getEmptyingCalendarDate(emptyingCalendarId);
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);

    } else {

      // Insert the emtyingcalendar row
      debugger;
      await objEmptyingCalendars.insertEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.user, condoId, date, residualWaste, paper, food, plastic, christmasTree);
      await objEmptyingCalendars.getHighestEmptyingCalendarId(objEmptyingCalendar.condominiumId);
      emptyingCalendarId = objEmptyingCalendars.arrayEmptyingCalendars.at(-1)?.emptyingCalendarId ?? 0;
      date = getEmptyingCalendarDate(emptyingCalendarId);
      await objEmptyingCalendars.loadEmptyingCalendarTable(objEmptyingCalendar.condominiumId, objEmptyingCalendar.nineNine);
    }

    // Show filter
    showFilter(date);

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

// get first emptying calendar Id for month
function getEmptyingCalendarIdMonth(date) {

  let emptyingCalendarId = 0;
  const year = String(date).slice(0, 4);
  const month = String(date).slice(4, 6);
  const fromDate = Number(year + month + "01");
  const toDate = Number(year + month + "31");
  objEmptyingCalendars.arrayEmptyingCalendars.forEach(emptyingCalendar => {

    if (emptyingCalendar.date >= fromDate && emptyingCalendar.date <= toDate && emptyingCalendarId === 0) emptyingCalendarId = emptyingCalendar.emptyingCalendarId;
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

  document.querySelector('.filterDate').value = '';

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

  document.querySelector('.filterDate').disabled = true;

  // Buttons
  removeMessage();
  if (enableChanges) {
    disableButton('delete', true);
    disableButton('insert', true);
    disableButton('cancel', false);
    disableButton('filterDate', true);
  }
}